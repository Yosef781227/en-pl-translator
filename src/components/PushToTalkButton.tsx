import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  title: string;
  subtitle: string;
  accentColor: string;
  active: boolean;
  disabled?: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export function PushToTalkButton({
  title,
  subtitle,
  accentColor,
  active,
  disabled,
  onPressIn,
  onPressOut,
}: Props) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { borderColor: accentColor },
        (pressed || active) && { backgroundColor: accentColor },
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.hint}>{active ? 'Listening… release when done' : 'Hold to talk'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c22',
    gap: 4,
  },
  disabled: {
    opacity: 0.4,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#c8c8d0',
    fontSize: 13,
  },
  hint: {
    color: '#8a8a95',
    fontSize: 11,
    marginTop: 6,
  },
});
