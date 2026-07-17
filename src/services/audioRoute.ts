import AudioRoute, { AudioRouteInfo } from '../../modules/audio-route';
import { Direction } from '../types';

/**
 * Forces the audio route for a turn:
 * - EN_TO_PL (I speak):    input = AirPod mic (Bluetooth HFP), output = phone speaker
 * - PL_TO_EN (she speaks): input = phone built-in mic,         output = AirPod (or speaker if none)
 *
 * Returns the resulting route, or null when the native module is unavailable
 * (Expo Go / Android / web) — in that case the OS default routing applies and
 * the app still works, just without the explicit device selection.
 */
export async function configureAudioRoute(direction: Direction): Promise<AudioRouteInfo | null> {
  if (!AudioRoute) {
    return null;
  }
  try {
    return direction === 'EN_TO_PL'
      ? await AudioRoute.routeForEnglishSpeaker()
      : await AudioRoute.routeForPolishSpeaker();
  } catch {
    // Routing is best-effort; recognition and TTS still work on the default route.
    return null;
  }
}

export type { AudioRouteInfo };
