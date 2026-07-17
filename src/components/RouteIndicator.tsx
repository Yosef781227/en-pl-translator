import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AudioRouteInfo } from '../services/audioRoute';
import { DIRECTION_META, Direction, Phase } from '../types';

interface Props {
  phase: Phase;
  direction: Direction | null;
  routeInfo: AudioRouteInfo | null;
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Ready',
  listening: 'Listening…',
  translating: 'Translating…',
  speaking: 'Speaking…',
};

export function RouteIndicator({ phase, direction, routeInfo }: Props) {
  const meta = direction ? DIRECTION_META[direction] : null;
  return (
    <View style={styles.container}>
      <Text style={styles.phase}>{PHASE_LABEL[phase]}</Text>
      {meta ? (
        <Text style={styles.output}>
          {meta.outputIcon} {meta.outputLabel}
        </Text>
      ) : (
        <Text style={styles.output}>Hold a button to talk</Text>
      )}
      {routeInfo && (
        <Text style={styles.route}>
          mic: {routeInfo.input} → out: {routeInfo.output}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  phase: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  output: {
    color: '#c8c8d0',
    fontSize: 13,
  },
  route: {
    color: '#6f6f7a',
    fontSize: 11,
  },
});
