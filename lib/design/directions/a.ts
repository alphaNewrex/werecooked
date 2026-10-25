export type SpringConfig = {
  damping: number;
  stiffness: number;
};

export type DirectionColors = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  border: string;
  primary: string;
  have: string;
  partial: string;
  need: string;
  danger: string;
};

export type DirectionTokens = {
  id: 'a' | 'b' | 'c';
  name: string;
  thesis: string;
  colors: {
    light: DirectionColors;
    dark: DirectionColors;
  };
  fonts: {
    display: string;
    body: string;
    bodyMedium: string;
    bodyBold: string;
    mono: string;
  };
  shape: {
    cardRadius: number;
    controlRadius: number;
    stepperRadius: number;
    squaredCorner?: 'bottomLeft' | 'bottomRight';
  };
  motion: Record<string, SpringConfig>;
  signature: 'stickers' | 'burner' | 'heat';
};

export const directionA = {
  id: 'a',
  name: 'Market Stall',
  thesis: 'A farmers-market stall: fresh produce colors, produce-sticker labels.',
  colors: {
    light: {
      bg: '#F6F7F1',
      surface: '#FFFFFF',
      ink: '#16211A',
      muted: '#5D6B61',
      border: '#DCE3D8',
      primary: '#E8482A',
      have: '#2F8F4E',
      partial: '#F4C842',
      need: '#E8482A',
      danger: '#C8243B',
    },
    dark: {
      bg: '#101712',
      surface: '#18221B',
      ink: '#EEF2EA',
      muted: '#9DAA9F',
      border: '#2A362D',
      primary: '#FF6A4D',
      have: '#5BC27C',
      partial: '#F7D560',
      need: '#FF6A4D',
      danger: '#FF5C77',
    },
  },
  fonts: {
    display: 'BricolageGrotesque_800ExtraBold',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyBold: 'DMSans_700Bold',
    mono: 'IBMPlexMono_400Regular',
  },
  shape: {
    cardRadius: 16,
    controlRadius: 999,
    stepperRadius: 999,
  },
  motion: {
    smooth: { damping: 26, stiffness: 180 },
    bouncy: { damping: 12, stiffness: 180 },
  },
  signature: 'stickers',
} satisfies DirectionTokens;
