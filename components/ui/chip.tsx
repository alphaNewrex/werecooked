import { Check } from 'lucide-react-native';

import { useHaptics } from '@/lib/design/motion';
import { useTheme } from '@/lib/theme';
import { Pressable } from './pressable';
import { Sticker, type StickerTone } from './sticker';
import { Text } from './text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: StickerTone;
};

export function Chip({ label, onPress, selected = false, tone = 'staple' }: ChipProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  if (selected) {
    return (
      <Pressable
        className="flex-row items-center gap-1 rounded-full border border-success-soft bg-success-soft px-2.5 py-1"
        haptic="selection"
        onPress={() => {
          void haptics.selection();
          onPress?.();
        }}>
        <Check color={colors.successInk} size={14} strokeWidth={2} />
        <Text tone="success-ink" variant="caption">{label}</Text>
      </Pressable>
    );
  }
  return onPress ? (
    <Pressable onPress={onPress}>
      <Sticker label={label} tone={tone} animate={false} />
    </Pressable>
  ) : (
    <Sticker label={label} tone={tone} animate={false} />
  );
}
