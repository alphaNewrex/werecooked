import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

import { tokens } from '@/lib/design';
import { useTheme } from '@/lib/theme';
import { Text } from './text';

function rotationFor(label: string) {
  let hash = 0;
  for (const character of label) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return tokens.signature.stickerRotation.min + (Math.abs(hash) % 401) / 100;
}

export type StickerTone = 'have' | 'partial' | 'need' | 'price' | 'staple' | 'success' | 'warning' | 'danger' | 'primary';

export type StickerProps = {
  label: string;
  tone?: StickerTone;
  numeric?: boolean;
  className?: string;
  animate?: boolean;
};

const toneToColor = {
  have: 'success',
  partial: 'warning',
  need: 'primary',
  price: 'warning',
  staple: 'surfaceMuted',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
} as const;

const toneToInk = {
  have: 'successInk',
  partial: 'warningInk',
  need: 'primaryInk',
  price: 'warningInk',
  staple: 'textMuted',
  success: 'successInk',
  warning: 'warningInk',
  danger: 'dangerInk',
  primary: 'primaryInk',
} as const;

export function Sticker({ animate = true, className, label, numeric = false, tone = 'staple' }: StickerProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(animate ? tokens.signature.stickerScale.from : tokens.signature.stickerScale.to);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationFor(label)}deg` }, { scale: scale.value }],
  }));

  useEffect(() => {
    if (animate) scale.value = withSpring(tokens.signature.stickerScale.to, tokens.motion.springs.bouncy);
  }, [animate, scale]);

  return (
    <Animated.View
      className={`self-start rounded-full px-2.5 py-1 ${className ?? ''}`}
      style={[{ backgroundColor: colors[toneToColor[tone]] }, animatedStyle]}>
      <Text
        numberOfLines={1}
        tone={toneToInk[tone] === 'textMuted' ? 'muted' : toneToInk[tone] === 'warningInk' ? 'warning-ink' : toneToInk[tone] === 'dangerInk' ? 'danger-ink' : toneToInk[tone] === 'primaryInk' ? 'primary-ink' : 'success-ink'}
        variant={numeric ? 'numeric-sm' : 'label'}>
        {label}
      </Text>
    </Animated.View>
  );
}
