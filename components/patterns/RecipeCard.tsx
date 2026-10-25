import { Clock } from 'lucide-react-native';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { HaveNeedMeter } from './HaveNeedMeter';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { Pressable } from '@/components/ui/pressable';
import type { Recipe } from '@/lib/types';

export function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const { colors } = useTheme();
  const haveCount = recipe.ingredients.filter((ingredient) => ingredient.haveIt).length;
  const needCount = recipe.ingredients.length - haveCount;
  return (
    <Pressable role="button" onPress={onPress}>
      <Card>
        <View className="flex-row items-center justify-between">
          <Text variant="label" tone="success-ink">{haveCount} have</Text>
          <View className="flex-row items-center gap-1">
            <Clock color={colors.textMuted} size={16} />
            <Text variant="numeric-sm" tone="muted">{recipe.timeMinutes} min</Text>
          </View>
        </View>
        <Text variant="display-md">{recipe.title}</Text>
        <Text variant="body-sm" tone="muted" numberOfLines={2}>{recipe.description}</Text>
        <HaveNeedMeter have={haveCount} need={needCount} />
        <View className="flex-row items-center justify-between">
          <Text variant="numeric-sm" tone="muted">{haveCount} have · {needCount} need</Text>
          <Text variant="body-strong" tone="primary">View recipe →</Text>
        </View>
      </Card>
    </Pressable>
  );
}
