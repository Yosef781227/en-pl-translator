import * as Speech from 'expo-speech';

/**
 * Speaks text and resolves when playback finishes, is stopped, or errors —
 * so callers can await the end of the utterance before resetting UI state.
 * Note: on iPhone, expo-speech is silent while the ringer is in silent mode.
 */
export function speak(text: string, language: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, {
      language,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
