import { ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useFeedback } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { RecipeCard } from '@/components/patterns/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Notice } from '@/components/ui/notice';
import { Text } from '@/components/ui/text';
import { postJson } from '@/lib/api';
import { usePantry } from '@/lib/pantry';
import { useTheme } from '@/lib/theme';
import { setCurrentRecipe } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';

export default function CookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { items, hydrated } = usePantry();
  const { toast } = useFeedback();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggest() {
    setLoading(true);
    setError(null);
    try {
      const response = await postJson<{ recipes: Recipe[] }>('/api/suggest', { pantry: items.map((item) => item.name) });
      setRecipes(response.recipes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again.';
      setError(message);
      toast({ message: `Could not find recipes: ${message}`, tone: 'danger' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-28" showsVerticalScrollIndicator={false}>
        <Text variant="display-xl">What can I make?</Text>
        <Text className="-mt-2 font-mono text-sm text-muted-foreground">
          {hydrated ? `${items.length} ingredient${items.length === 1 ? '' : 's'} on hand` : 'Loading pantry…'}
        </Text>
        <Button onPress={() => void suggest()} disabled={loading || !hydrated}>
          <ChefHat color={colors.onPrimary} size={18} />
          <Text>{loading ? 'Thinking…' : 'Suggest recipes'}</Text>
        </Button>
        {error && <Notice tone="danger" title="Could not find recipes" body={error} />}
        {recipes.length > 0 && (
          <View className="gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text variant="display-md">Best matches</Text>
              <Text className="font-mono text-xs text-muted-foreground">Ranked for you</Text>
            </View>
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={`${index}-${recipe.title}`}
                recipe={recipe}
                onPress={() => {
                  setCurrentRecipe({ recipe, source: { kind: 'suggestion' } });
                  router.push('/recipe');
                }}
              />
            ))}
          </View>
        )}
        {!loading && !error && recipes.length === 0 && (
          <Card className="gap-2 rounded-2xl border-border bg-card p-5 shadow-none">
            <Text className="font-sans-bold text-lg">Add ingredients, then let’s get cooking.</Text>
            <Text variant="muted">We’ll rank recipes by what you already have.</Text>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
