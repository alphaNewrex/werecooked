import { Check, Circle, ShoppingBasket } from 'lucide-react-native';
import { View } from 'react-native';

import { Sticker } from '@/components/ui/sticker';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

export type IngredientState = 'have' | 'partial' | 'need' | 'staple';

export function IngredientRow({
  amount,
  name,
  note,
  state,
}: {
  amount: string;
  name: string;
  note?: string;
  state: IngredientState;
}) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-3 border-b border-border py-3">
      {state === 'have' ? <Check color={colors.success} size={18} /> : state === 'need' ? <ShoppingBasket color={colors.primary} size={18} /> : <Circle color={colors.textMuted} size={18} />}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="body-strong">{name}</Text>
        <Text variant="numeric-sm" tone="muted">{amount}</Text>
        {note && <Text variant="caption" tone="muted">{note}</Text>}
      </View>
      <Sticker label={state === 'have' ? 'HAVE' : state === 'partial' ? 'PARTIAL' : state === 'need' ? 'NEED' : 'STAPLE'} tone={state} animate={false} />
    </View>
  );
}
