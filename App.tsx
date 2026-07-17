import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PushToTalkButton } from './src/components/PushToTalkButton';
import { RouteIndicator } from './src/components/RouteIndicator';
import { TranscriptPanel } from './src/components/TranscriptPanel';
import { useConversation } from './src/useConversation';

export default function App() {
  const {
    phase,
    direction,
    entries,
    liveTranscript,
    routeInfo,
    error,
    modelsReady,
    sttAvailable,
    startTurn,
    endTurn,
  } = useConversation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>EN ⇄ PL Translator</Text>
        {!sttAvailable && (
          <Text style={styles.modelNote}>
            Preview mode (Expo Go): UI only — speech and translation need the dev-client build.
          </Text>
        )}
        {sttAvailable && !modelsReady && (
          <Text style={styles.modelNote}>Translation models not downloaded yet — first use needs internet.</Text>
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TranscriptPanel entries={entries} liveTranscript={liveTranscript} liveDirection={direction} />

      <RouteIndicator phase={phase} direction={direction} routeInfo={routeInfo} />

      <View style={styles.buttons}>
        <PushToTalkButton
          title="I speak"
          subtitle="EN → PL · she hears it out loud"
          accentColor="#1d6fc4"
          active={phase === 'listening' && direction === 'EN_TO_PL'}
          disabled={phase === 'listening' && direction !== 'EN_TO_PL'}
          onPressIn={() => void startTurn('EN_TO_PL')}
          onPressOut={endTurn}
        />
        <PushToTalkButton
          title="She speaks"
          subtitle="PL → EN · you hear it in your AirPod"
          accentColor="#7a4fc4"
          active={phase === 'listening' && direction === 'PL_TO_EN'}
          disabled={phase === 'listening' && direction !== 'PL_TO_EN'}
          onPressIn={() => void startTurn('PL_TO_EN')}
          onPressOut={endTurn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101014',
  },
  header: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
    gap: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  modelNote: {
    color: '#d9a24a',
    fontSize: 12,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#5c1d1d',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: '#ffd3d3',
    fontSize: 13,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 4,
  },
});
