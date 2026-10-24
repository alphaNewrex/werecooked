import { ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View } from 'react-native';

import { ErrorNotice } from '@/components/ErrorNotice';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { postJson } from '@/lib/api';
import { usePantry } from '@/lib/pantry';
import { setCurrentRecipe } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';

export default function CookScreen() {
  const router = useRouter();
  const { items, hydrated } = usePantry();
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
      Alert.alert('Could not find recipes', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-28" showsVerticalScrollIndicator={false}>
        <Text className="font-display text-5xl leading-[1.05]">What can I make?</Text>
        <Text className="-mt-2 font-mono text-sm text-muted-foreground">
          {hydrated ? `${items.length} ingredient${items.length === 1 ? '' : 's'} on hand` : 'Loading pantry…'}
        </Text>
        <Button onPress={() => void suggest()} disabled={loading || !hydrated}>
          <ChefHat color="#FFFFFF" size={18} />
          <Text>{loading ? 'Thinking…' : 'Suggest recipes'}</Text>
        </Button>
        <ErrorNotice title="Could not find recipes" message={error} />
        {recipes.length > 0 && (
          <View className="gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="font-display text-2xl">Best matches</Text>
              <Text className="font-mono text-xs text-muted-foreground">Ranked for you</Text>
            </View>
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={`${index}-${recipe.title}`}
                recipe={recipe}
                onPress={() => {
                  setCurrentRecipe(recipe);
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
    </SafeAreaView>
  );
}
