import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConversationEntry, DIRECTION_META, Direction } from '../types';

interface Props {
  entries: ConversationEntry[];
  liveTranscript: string;
  liveDirection: Direction | null;
}

export function TranscriptPanel({ entries, liveTranscript, liveDirection }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [entries.length, liveTranscript]);

  return (
    <ScrollView ref={scrollRef} style={styles.panel} contentContainerStyle={styles.content}>
      {entries.length === 0 && !liveTranscript && (
        <Text style={styles.empty}>
          Hold one of the buttons below and speak.{'\n'}The transcript appears here.
        </Text>
      )}
      {entries.map((entry) => (
        <View
          key={entry.id}
          style={[styles.bubble, entry.direction === 'EN_TO_PL' ? styles.mine : styles.hers]}
        >
          <Text style={styles.speaker}>{DIRECTION_META[entry.direction].speakerLabel}</Text>
          <Text style={styles.original}>{entry.original}</Text>
          <Text style={styles.translated}>{entry.translated}</Text>
        </View>
      ))}
      {liveTranscript !== '' && liveDirection && (
        <View
          style={[
            styles.bubble,
            styles.live,
            liveDirection === 'EN_TO_PL' ? styles.mine : styles.hers,
          ]}
        >
          <Text style={styles.speaker}>{DIRECTION_META[liveDirection].speakerLabel}</Text>
          <Text style={styles.original}>{liveTranscript}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  empty: {
    color: '#8a8a95',
    textAlign: 'center',
    marginTop: 48,
    lineHeight: 22,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 14,
    padding: 12,
    gap: 3,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#12395c',
  },
  hers: {
    alignSelf: 'flex-start',
    backgroundColor: '#3c2a52',
  },
  live: {
    opacity: 0.7,
  },
  speaker: {
    color: '#9db4c8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  original: {
    color: '#e6e6ea',
    fontSize: 15,
  },
  translated: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});
