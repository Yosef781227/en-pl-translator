// expo-speech-recognition's native module is not bundled in Expo Go, and
// importing the package there throws. Loading it defensively lets the app
// run in Expo Go as a UI-only preview, while the dev-client build gets the
// real functionality.

export interface SttResultEvent {
  results: { transcript: string; confidence?: number }[];
  isFinal: boolean;
}

export interface SttErrorEvent {
  error: string;
  message: string;
}

export interface SttStartOptions {
  lang: string;
  interimResults?: boolean;
  continuous?: boolean;
  requiresOnDeviceRecognition?: boolean;
  addsPunctuation?: boolean;
  iosCategory?: {
    category: string;
    categoryOptions: string[];
    mode?: string;
  };
}

export interface SttModule {
  start(options: SttStartOptions): void;
  stop(): void;
  abort(): void;
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  addListener(event: string, listener: (event: any) => void): { remove(): void };
}

export const SpeechRecognition: SttModule | null = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-speech-recognition').ExpoSpeechRecognitionModule;
  } catch {
    return null;
  }
})();

export const sttAvailable = SpeechRecognition !== null;
