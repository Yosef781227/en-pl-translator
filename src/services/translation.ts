import MLKitTranslate from '../../modules/mlkit-translate';

/**
 * Swappable translator interface. To add a cloud fallback later (e.g. Azure
 * Speech Translation), implement this interface and call setTranslator() —
 * no other code changes needed.
 */
export interface Translator {
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>;
  prepare?(sourceLang: string, targetLang: string): Promise<void>;
}

// On-device Google ML Kit translation, via the local native module in
// modules/mlkit-translate. Free, offline after the one-time model download.
const mlKitTranslator: Translator = {
  async translate(text, sourceLang, targetLang) {
    if (!MLKitTranslate) {
      throw new Error(
        'Translation needs the dev-client build — the native ML Kit module is not available in Expo Go.'
      );
    }
    return MLKitTranslate.translate(text, sourceLang, targetLang);
  },
  async prepare(sourceLang, targetLang) {
    if (!MLKitTranslate) {
      return;
    }
    await MLKitTranslate.downloadModel(sourceLang, targetLang);
  },
};

let activeTranslator: Translator = mlKitTranslator;

export function setTranslator(translator: Translator): void {
  activeTranslator = translator;
}

export function translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  return activeTranslator.translate(text, sourceLang, targetLang);
}

/**
 * Pre-downloads the EN→PL and PL→EN models (~30 MB each) so everything works
 * offline afterwards. Needs internet the first time it succeeds.
 */
export async function prepareTranslationModels(): Promise<void> {
  await activeTranslator.prepare?.('en', 'pl');
  await activeTranslator.prepare?.('pl', 'en');
}
