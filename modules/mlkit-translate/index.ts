import { requireNativeModule } from 'expo-modules-core';

export interface MLKitTranslateNativeModule {
  /** Translates text between ISO-639-1 language codes (e.g. 'en', 'pl'). */
  translate(text: string, source: string, target: string): Promise<string>;
  /** Pre-downloads the on-device model for a language pair (~30 MB). */
  downloadModel(source: string, target: string): Promise<boolean>;
}

let nativeModule: MLKitTranslateNativeModule | null = null;
try {
  nativeModule = requireNativeModule<MLKitTranslateNativeModule>('MLKitTranslate');
} catch {
  // Not available in Expo Go or on web — the app needs the dev-client build.
  nativeModule = null;
}

export default nativeModule;
