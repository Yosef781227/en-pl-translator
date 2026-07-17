# EN ⇄ PL Live Conversation Translator

Personal live translator between **you (English)** and **one other person (Polish)**.
Fully on-device translation (Google ML Kit), free Apple speech recognition, no paid APIs.
Built on Windows, deployed to an iPhone with **EAS Build** (cloud iOS build — no Mac needed).

## How it works (fixed roles, explicit audio routing)

| | She speaks (PL → EN) | You speak (EN → PL) |
|---|---|---|
| Mic input | Phone's **built-in mic** | **AirPod mic** (you're wearing it) |
| Transcribed as | `pl-PL` | `en-US` |
| Translated to | English | Polish |
| Audio output | Your **AirPod** (private) | **Phone speaker** (out loud for her) |

v1 is **push-to-talk**: hold "I speak" while you talk, hold "She speaks" while she talks.
Automatic turn-taking is a v2 TODO (see below).

## Project structure

```
App.tsx                          UI shell
src/useConversation.ts           Turn orchestration: route → STT → translate → TTS
src/services/audioRoute.ts       Wrapper over the native routing module
src/services/translation.ts      Translator interface + ML Kit impl (swap point for cloud fallback)
src/services/tts.ts              expo-speech wrapper
src/components/                  Push-to-talk buttons, transcript, route indicator
modules/audio-route/             Native iOS module: AVAudioSession input/output selection
modules/mlkit-translate/         Native iOS module: Google ML Kit on-device translation
```

Why a custom ML Kit module: `@react-native-ml-kit/translate-text` ships an **empty iOS
stub** (Android-only). `modules/mlkit-translate` wraps the official `GoogleMLKit/Translate`
pod directly instead.

## Build & install on your iPhone (from Windows)

### Prerequisites

- Free [Expo account](https://expo.dev/signup)
- **Apple Developer Program membership ($99/year).** This is required: EAS cloud
  builds that install on a real iPhone must be signed with a registered device
  (ad hoc) profile, and only paid accounts can create those. A free Apple ID
  only works with local Xcode signing on a Mac (and those installs expire every
  7 days) — it cannot be used for this Windows/EAS flow.

### Steps

```powershell
npm install -g eas-cli
cd translator
eas login                                # your Expo account
eas init                                 # links the project (accept defaults)
eas device:create                        # register your iPhone: open the QR on the phone,
                                         # install the provisioning profile it offers
eas build --platform ios --profile development
```

During the first build, EAS asks you to sign in with your Apple Developer
account and then creates the certificate + provisioning profile automatically.
The build runs in the cloud (~10–20 min).

When it finishes:

1. Open the build page link (or scan its QR) **on the iPhone** → tap **Install**.
2. If iOS blocks the app: Settings → General → VPN & Device Management → trust the profile.
3. Back on the PC: `npx expo start --dev-client` (add `--tunnel` if the phone can't connect over Wi-Fi).
4. Open the installed **EN-PL Translator** app — it connects to Metro and hot-reloads while you develop.

You only need to rebuild with EAS when native code changes (the `modules/` folder,
plugins, or new native packages). Pure JS/TS changes hot-reload through Metro.

### First run on the phone

- Grant **microphone** and **speech recognition** permissions when prompted.
- The EN↔PL translation models (~30 MB each way) download automatically on
  first launch — needs internet once, then translation is fully offline.
- Speech recognition uses Apple's free speech service (network-based by default).
  For fully offline STT set `REQUIRE_ON_DEVICE_STT = true` in
  `src/useConversation.ts` and make sure English and Polish dictation are
  downloaded on the phone (Settings → General → Keyboard → Dictation).
- **The phone's silent-mode switch mutes TTS** (expo-speech). Keep the ringer on.

## Audio routing — must be tested on the real device

Simulators cannot test Bluetooth. With your AirPod connected, verify both
directions using the small route line in the app (`mic: … → out: …`):

- Hold **She speaks** → route should show `mic: iPhone Microphone → out: AirPods`.
- Hold **I speak** → route should show `mic: AirPods → out: Speaker`.

The trickiest combination is AirPod (HFP) mic + phone-speaker output in the
"I speak" direction — iOS sometimes insists on keeping output on the headset.
If that happens, adjust the options in
`modules/audio-route/ios/AudioRouteModule.swift` (e.g. drop
`overrideOutputAudioPort(.speaker)` during recognition and only force it for
the TTS phase). This is a known-finicky area of AVAudioSession, flagged for
device testing by design.

## v2 TODOs

- **Automatic turn detection** (no buttons): voice-activity detection plus the
  `languagedetection` event from `expo-speech-recognition` to infer who is
  speaking. Entry point: replace `startTurn`/`endTurn` wiring in
  `src/useConversation.ts`.
- **Cloud fallback** (e.g. Azure Speech Translation): implement the
  `Translator` interface in `src/services/translation.ts` and call
  `setTranslator()` — nothing else changes.
