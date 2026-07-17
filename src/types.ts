export type Direction = 'EN_TO_PL' | 'PL_TO_EN';

export type Phase = 'idle' | 'listening' | 'translating' | 'speaking';

export interface ConversationEntry {
  id: number;
  direction: Direction;
  original: string;
  translated: string;
}

export interface DirectionMeta {
  sttLocale: string;
  ttsLocale: string;
  sourceLang: string;
  targetLang: string;
  speakerLabel: string;
  outputLabel: string;
  outputIcon: string;
}

export const DIRECTION_META: Record<Direction, DirectionMeta> = {
  // I speak English → translated to Polish → played OUT LOUD on the phone
  // speaker so she can hear it. My mic is the AirPod mic (I'm wearing it).
  EN_TO_PL: {
    sttLocale: 'en-US',
    ttsLocale: 'pl-PL',
    sourceLang: 'en',
    targetLang: 'pl',
    speakerLabel: 'You · English',
    outputLabel: 'Out loud on phone speaker',
    outputIcon: '🔊',
  },
  // She speaks Polish → translated to English → played PRIVATELY into my
  // AirPod. Her voice is captured by the phone's built-in mic.
  PL_TO_EN: {
    sttLocale: 'pl-PL',
    ttsLocale: 'en-US',
    sourceLang: 'pl',
    targetLang: 'en',
    speakerLabel: 'Her · Polish',
    outputLabel: 'Private to your AirPod',
    outputIcon: '🎧',
  },
};
