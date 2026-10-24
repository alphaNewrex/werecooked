import { Clock } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Recipe } from '@/lib/types';

export function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const haveCount = recipe.ingredients.filter((ingredient) => ingredient.haveIt).length;
  const needCount = recipe.ingredients.length - haveCount;
  const havePercent = recipe.ingredients.length ? (haveCount / recipe.ingredients.length) * 100 : 0;
  return (
    <Pressable role="button" onPress={onPress}>
      <Card className="gap-3 rounded-2xl border-border bg-card p-4">
        <View className="flex-row items-center justify-between">
          <Badge variant="secondary"><Text className="font-mono text-xs text-leaf">{haveCount} have</Text></Badge>
          <View className="flex-row items-center gap-1">
            <Clock color="#5E6B62" size={15} />
            <Text className="font-mono text-xs text-muted-foreground">{recipe.timeMinutes} min</Text>
          </View>
        </View>
        <Text className="font-display text-2xl">{recipe.title}</Text>
        <Text variant="muted" numberOfLines={2} className="leading-5">{recipe.description}</Text>
        <View className="h-2 flex-row overflow-hidden rounded-full bg-tomato-soft">
          <View className="bg-leaf" style={{ width: `${havePercent}%` }} />
          <View className="flex-1 bg-tomato" />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-muted-foreground">{haveCount} have · {needCount} need</Text>
          <Text className="font-sans-bold text-tomato">View recipe →</Text>
        </View>
      </Card>
    </Pressable>
  );
}
