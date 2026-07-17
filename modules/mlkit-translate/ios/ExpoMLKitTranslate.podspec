Pod::Spec.new do |s|
  s.name           = 'ExpoMLKitTranslate'
  s.version        = '1.0.0'
  s.summary        = 'On-device EN<->PL translation via Google ML Kit'
  s.description    = 'Local Expo module wrapping GoogleMLKit/Translate, because @react-native-ml-kit/translate-text has no iOS implementation.'
  s.author         = ''
  s.homepage       = 'https://developers.google.com/ml-kit/language/translation/ios'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '15.5' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleMLKit/Translate', '~> 8.0'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = '**/*.{h,m,swift}'
end
