import ExpoModulesCore
import MLKitTranslate

public class MLKitTranslateModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MLKitTranslate")

    // Downloads the translation model for a language pair (~30 MB) so later
    // translations work fully offline. Safe to call repeatedly.
    AsyncFunction("downloadModel") { (source: String, target: String, promise: Promise) in
      guard let translator = Self.translator(source: source, target: target) else {
        promise.reject("UNSUPPORTED_LANGUAGE", "Unsupported language pair \(source) -> \(target)")
        return
      }
      let conditions = ModelDownloadConditions(
        allowsCellularAccess: true,
        allowsBackgroundDownloading: true
      )
      translator.downloadModelIfNeeded(with: conditions) { error in
        if let error = error {
          promise.reject("MODEL_DOWNLOAD_FAILED", error.localizedDescription)
        } else {
          promise.resolve(true)
        }
      }
    }

    AsyncFunction("translate") { (text: String, source: String, target: String, promise: Promise) in
      guard let translator = Self.translator(source: source, target: target) else {
        promise.reject("UNSUPPORTED_LANGUAGE", "Unsupported language pair \(source) -> \(target)")
        return
      }
      let conditions = ModelDownloadConditions(
        allowsCellularAccess: true,
        allowsBackgroundDownloading: true
      )
      translator.downloadModelIfNeeded(with: conditions) { error in
        if let error = error {
          promise.reject("MODEL_DOWNLOAD_FAILED", error.localizedDescription)
          return
        }
        translator.translate(text) { translated, error in
          if let error = error {
            promise.reject("TRANSLATE_FAILED", error.localizedDescription)
          } else {
            promise.resolve(translated ?? "")
          }
        }
      }
    }
  }

  // ML Kit caches translator instances internally, so recreating per call is cheap.
  private static func translator(source: String, target: String) -> Translator? {
    guard let from = Self.language(source), let to = Self.language(target) else {
      return nil
    }
    let options = TranslatorOptions(sourceLanguage: from, targetLanguage: to)
    return Translator.translator(options: options)
  }

  private static func language(_ code: String) -> TranslateLanguage? {
    switch code {
    case "en": return .english
    case "pl": return .polish
    default: return nil
    }
  }
}
