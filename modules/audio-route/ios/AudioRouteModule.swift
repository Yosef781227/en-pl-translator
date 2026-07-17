import AVFoundation
import ExpoModulesCore

// Explicit audio routing per conversation direction. iOS default routing would
// use the AirPod for BOTH input and output whenever it is connected, which is
// wrong for this app — each direction needs a different input/output pair.
//
// NOTE: AVAudioSession routing (especially Bluetooth HFP mic + speaker output
// in the same session) MUST be validated on a real device with AirPods paired.
// Simulators cannot test Bluetooth routing at all.
public class AudioRouteModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AudioRoute")

    // She speaks Polish: input = phone's built-in mic, output = AirPod
    // (A2DP high quality) so the English translation stays private to me.
    // Falls back to whatever output is active (speaker) if no AirPod.
    AsyncFunction("routeForPolishSpeaker") { () -> [String: String] in
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(
        .playAndRecord,
        mode: .default,
        options: [.allowBluetooth, .allowBluetoothA2DP]
      )
      try session.setActive(true)
      if let builtInMic = session.availableInputs?.first(where: { $0.portType == .builtInMic }) {
        try session.setPreferredInput(builtInMic)
      }
      // Do not force the speaker — leave output on the Bluetooth route.
      try session.overrideOutputAudioPort(.none)
      return Self.describeRoute()
    }

    // I speak English: input = AirPod mic (Bluetooth HFP), output = phone
    // speaker so she hears the Polish translation out loud. Speaker is forced
    // regardless of the AirPod being connected.
    AsyncFunction("routeForEnglishSpeaker") { () -> [String: String] in
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(
        .playAndRecord,
        mode: .default,
        options: [.allowBluetooth, .defaultToSpeaker]
      )
      try session.setActive(true)
      if let bluetoothMic = session.availableInputs?.first(where: { $0.portType == .bluetoothHFP }) {
        try session.setPreferredInput(bluetoothMic)
      }
      try session.overrideOutputAudioPort(.speaker)
      return Self.describeRoute()
    }

    AsyncFunction("getCurrentRoute") { () -> [String: String] in
      Self.describeRoute()
    }
  }

  private static func describeRoute() -> [String: String] {
    let route = AVAudioSession.sharedInstance().currentRoute
    return [
      "input": route.inputs.first?.portName ?? "unknown",
      "inputType": route.inputs.first?.portType.rawValue ?? "unknown",
      "output": route.outputs.first?.portName ?? "unknown",
      "outputType": route.outputs.first?.portType.rawValue ?? "unknown",
    ]
  }
}
