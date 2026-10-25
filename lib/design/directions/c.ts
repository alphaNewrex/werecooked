import type { DirectionTokens } from './a';

export const directionC = {
  id: 'c',
  name: 'Group Chat',
  thesis: 'The app talks like the friend who sent you the reel.',
  colors: {
    light: {
      bg: '#F7F3FF',
      surface: '#FFFFFF',
      ink: '#22142E',
      muted: '#6B5C7A',
      border: '#E4DAF2',
      primary: '#FF4A1C',
      have: '#1E9E5A',
      partial: '#FFB800',
      need: '#FF4A1C',
      danger: '#D1123F',
    },
    dark: {
      bg: '#140B1C',
      surface: '#20142B',
      ink: '#F5EFFC',
      muted: '#B3A3C4',
      border: '#352645',
      primary: '#FF6B42',
      have: '#41C97F',
      partial: '#FFCB3D',
      need: '#FF6B42',
      danger: '#FF4D6D',
    },
  },
  fonts: {
    display: 'Shrikhand_400Regular',
    body: 'PlusJakartaSans_400Regular',
    bodyMedium: 'PlusJakartaSans_500Medium',
    bodyBold: 'PlusJakartaSans_700Bold',
    mono: 'JetBrainsMono_400Regular',
  },
  shape: {
    cardRadius: 24,
    controlRadius: 999,
    stepperRadius: 999,
    squaredCorner: 'bottomLeft',
  },
  motion: {
    bouncy: { damping: 12, stiffness: 180 },
  },
  signature: 'heat',
} satisfies DirectionTokens;
