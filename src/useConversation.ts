import { useEffect, useRef, useState } from 'react';
import { AudioRouteInfo, configureAudioRoute } from './services/audioRoute';
import {
  SpeechRecognition,
  SttErrorEvent,
  SttResultEvent,
  sttAvailable,
} from './services/stt';
import { prepareTranslationModels, translate } from './services/translation';
import { speak, stopSpeaking } from './services/tts';
import { ConversationEntry, DIRECTION_META, Direction, Phase } from './types';

// Apple's speech service is free but server-based by default. Set this to
// true for fully offline STT — then the recognition languages must be
// downloaded on the iPhone (Settings → General → Keyboard → Dictation), and
// pl-PL on-device availability varies by device/iOS version.
const REQUIRE_ON_DEVICE_STT = false;

let nextEntryId = 1;

export function useConversation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [direction, setDirection] = useState<Direction | null>(null);
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [routeInfo, setRouteInfo] = useState<AudioRouteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(false);

  // Event handlers close over renders; refs carry the turn state reliably.
  const directionRef = useRef<Direction | null>(null);
  const transcriptRef = useRef('');
  const turnIdRef = useRef(0);

  useEffect(() => {
    if (SpeechRecognition) {
      SpeechRecognition.requestPermissionsAsync().then((result) => {
        if (!result.granted) {
          setError('Microphone / speech recognition permission was denied.');
        }
      });
    }
    prepareTranslationModels()
      .then(() => setModelsReady(true))
      .catch(() => {
        // Offline on first launch — models will download with the first
        // translation attempt instead.
        setModelsReady(false);
      });
  }, []);

  async function finishTurn(): Promise<void> {
    const dir = directionRef.current;
    const text = transcriptRef.current.trim();
    const myTurn = turnIdRef.current;
    directionRef.current = null;
    transcriptRef.current = '';
    setLiveTranscript('');

    const resetIfCurrent = () => {
      if (turnIdRef.current === myTurn) {
        setPhase('idle');
        setDirection(null);
      }
    };

    if (!dir || !text) {
      resetIfCurrent();
      return;
    }

    const meta = DIRECTION_META[dir];
    try {
      setPhase('translating');
      const translated = await translate(text, meta.sourceLang, meta.targetLang);
      setEntries((prev) => [
        ...prev,
        { id: nextEntryId++, direction: dir, original: text, translated },
      ]);
      if (turnIdRef.current !== myTurn) {
        return; // A new turn already started; don't speak over it.
      }
      setPhase('speaking');
      // Re-assert the route right before TTS — stopping recognition can
      // reconfigure the audio session.
      const route = await configureAudioRoute(dir);
      if (route) {
        setRouteInfo(route);
      }
      await speak(translated, meta.ttsLocale);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      resetIfCurrent();
    }
  }

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }
    const subscriptions = [
      SpeechRecognition.addListener('result', (event: SttResultEvent) => {
        // On iOS the transcript is cumulative for the whole utterance.
        const transcript = event.results[0]?.transcript ?? '';
        transcriptRef.current = transcript;
        setLiveTranscript(transcript);
      }),
      SpeechRecognition.addListener('error', (event: SttErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(event.message || event.error);
        }
        // 'end' still fires afterwards and resets the turn.
      }),
      SpeechRecognition.addListener('end', () => {
        void finishTurn();
      }),
    ];
    return () => subscriptions.forEach((s) => s.remove());
    // finishTurn only touches refs, state setters and module-level functions,
    // so the first-render closure stays valid for the app's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Hold-to-talk press: routes audio and starts recognition for one turn. */
  async function startTurn(dir: Direction): Promise<void> {
    if (!SpeechRecognition) {
      setError(
        'Preview mode: speech recognition needs the dev-client build (see README) — Expo Go can only show the UI.'
      );
      return;
    }
    if (phase === 'listening' || phase === 'translating') {
      return; // One speaker at a time. TODO(v2): automatic turn-taking.
    }
    if (phase === 'speaking') {
      stopSpeaking(); // Interrupting the playback with a new turn is allowed.
    }
    turnIdRef.current += 1;
    setError(null);
    directionRef.current = dir;
    transcriptRef.current = '';
    setLiveTranscript('');
    setDirection(dir);
    setPhase('listening');

    const meta = DIRECTION_META[dir];
    const route = await configureAudioRoute(dir);
    setRouteInfo(route);

    SpeechRecognition.start({
      lang: meta.sttLocale,
      interimResults: true,
      continuous: true, // We stop manually when the button is released.
      requiresOnDeviceRecognition: REQUIRE_ON_DEVICE_STT,
      addsPunctuation: true,
      // Without this, the library forces its own category (playAndRecord +
      // defaultToSpeaker + measurement mode), which breaks per-direction routing.
      iosCategory: {
        category: 'playAndRecord',
        categoryOptions:
          dir === 'EN_TO_PL'
            ? ['allowBluetooth', 'defaultToSpeaker']
            : ['allowBluetooth', 'allowBluetoothA2DP'],
        mode: 'default',
      },
    });

    // The recognizer activates the session on start; re-assert the preferred
    // input afterwards so the right mic wins. Needs real-device validation.
    const routeAfterStart = await configureAudioRoute(dir);
    if (routeAfterStart) {
      setRouteInfo(routeAfterStart);
    }
  }

  /** Hold-to-talk release: stops recognition; the 'end' event finishes the turn. */
  function endTurn(): void {
    if (phase === 'listening') {
      setPhase('translating');
      SpeechRecognition?.stop();
    }
  }

  return {
    phase,
    direction,
    entries,
    liveTranscript,
    routeInfo,
    error,
    modelsReady,
    sttAvailable,
    startTurn,
    endTurn,
  };
}
