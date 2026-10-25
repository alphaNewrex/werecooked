import { useTheme } from '@/lib/theme';
import type { ComponentType } from 'react';
import { View } from 'react-native';

import type { TextTone } from './text';
type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export type IconProps = {
  icon: IconComponent;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: TextTone;
  strokeWidth?: number;
  accessibilityLabel?: string;
};

const toneToColor = {
  text: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  primary: 'primary',
  'primary-ink': 'primaryInk',
  success: 'success',
  'success-ink': 'successInk',
  warning: 'warning',
  'warning-ink': 'warningInk',
  danger: 'danger',
  'danger-ink': 'dangerInk',
  info: 'info',
  'info-ink': 'infoInk',
  'on-primary': 'onPrimary',
} as const;

export function Icon({
  accessibilityLabel,
  icon: IconComponent,
  size = 'md',
  strokeWidth = 2,
  tone = 'text',
}: IconProps) {
  const { colors, iconSize } = useTheme();
  return (
    <View accessibilityLabel={accessibilityLabel} accessible={Boolean(accessibilityLabel)}>
      <IconComponent color={colors[toneToColor[tone]]} size={iconSize[size]} strokeWidth={strokeWidth} />
    </View>
  );
}
