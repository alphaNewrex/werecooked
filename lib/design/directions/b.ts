import type { DirectionTokens } from './a';

export const directionB = {
  id: 'b',
  name: 'Enamel Kitchen',
  thesis: 'Tactile enamel cookware and appliance dials; quantities and timers are first-class.',
  colors: {
    light: {
      bg: '#F2F4F8',
      surface: '#FFFFFF',
      ink: '#121A2E',
      muted: '#5A6378',
      border: '#D9DEE8',
      primary: '#2446C8',
      have: '#1F9D6B',
      partial: '#F2A516',
      need: '#EF6A3A',
      danger: '#C21F4A',
    },
    dark: {
      bg: '#0D1220',
      surface: '#161D30',
      ink: '#EEF1F8',
      muted: '#9AA3B8',
      border: '#263049',
      primary: '#6F8BFF',
      have: '#3FCB93',
      partial: '#FFC247',
      need: '#FF8A5C',
      danger: '#FF5A7E',
    },
  },
  fonts: {
    display: 'Unbounded_700Bold',
    body: 'Figtree_400Regular',
    bodyMedium: 'Figtree_500Medium',
    bodyBold: 'Figtree_700Bold',
    mono: 'JetBrainsMono_400Regular',
  },
  shape: {
    cardRadius: 20,
    controlRadius: 14,
    stepperRadius: 999,
  },
  motion: {
    snappy: { damping: 20, stiffness: 300 },
  },
  signature: 'burner',
} satisfies DirectionTokens;
