import { requireNativeModule } from 'expo-modules-core';

export interface AudioRouteInfo {
  input: string;
  inputType: string;
  output: string;
  outputType: string;
}

export interface AudioRouteNativeModule {
  /** I speak English: AirPod mic in, phone speaker out. */
  routeForEnglishSpeaker(): Promise<AudioRouteInfo>;
  /** She speaks Polish: built-in mic in, AirPod out (private). */
  routeForPolishSpeaker(): Promise<AudioRouteInfo>;
  getCurrentRoute(): Promise<AudioRouteInfo>;
}

let nativeModule: AudioRouteNativeModule | null = null;
try {
  nativeModule = requireNativeModule<AudioRouteNativeModule>('AudioRoute');
} catch {
  // Not available in Expo Go, on Android, or on web — callers fall back to
  // the OS default routing.
  nativeModule = null;
}

export default nativeModule;
