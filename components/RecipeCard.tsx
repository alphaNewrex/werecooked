import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Recipe } from '@/lib/types';

export function RecipeCard({
  recipe,
  onPress,
}: {
  recipe: Recipe;
  onPress: () => void;
}) {
  const haveCount = recipe.ingredients.filter((ingredient) => ingredient.haveIt).length;
  return (
    <Pressable onPress={onPress}>
      <Card className="gap-2 rounded-2xl p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Badge variant="secondary">
            <Text>{haveCount}/{recipe.ingredients.length} on hand</Text>
          </Badge>
          <Text variant="muted">{recipe.timeMinutes} min</Text>
        </View>
        <Text className="text-2xl font-extrabold">{recipe.title}</Text>
        <Text variant="muted" numberOfLines={2} className="leading-5">
          {recipe.description}
        </Text>
        <Text className="mt-1 font-extrabold text-primary">View recipe →</Text>
      </Card>
    </Pressable>
  );
}
