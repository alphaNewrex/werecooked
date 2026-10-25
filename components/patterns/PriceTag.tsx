import { View } from 'react-native';

import { Sticker } from '@/components/ui/sticker';
import { Text } from '@/components/ui/text';

export function PriceTag({
  onSale,
  price,
  regular,
  source,
}: {
  onSale?: boolean;
  price: number;
  regular?: number;
  source: 'Kroger' | 'est.';
}) {
  return (
    <View className="items-end gap-0.5">
      <View className="flex-row items-center gap-1">
        {onSale && regular !== undefined && <Text variant="numeric-sm" tone="muted" className="line-through">${regular.toFixed(2)}</Text>}
        <Sticker label={`$${price.toFixed(2)}`} tone={source === 'Kroger' ? 'price' : 'need'} numeric />
      </View>
      <Text variant="numeric-sm" tone={source === 'Kroger' ? 'success-ink' : 'primary-ink'}>{source}</Text>
    </View>
  );
}
