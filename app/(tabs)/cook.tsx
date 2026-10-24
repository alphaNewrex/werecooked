import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View } from 'react-native';

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

  async function suggest() {
    setLoading(true);
    try {
      const response = await postJson<{ recipes: Recipe[] }>('/api/suggest', {
        pantry: items.map((item) => item.name),
      });
      setRecipes(response.recipes);
    } catch (error) {
      Alert.alert('Could not find recipes', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-12"
        showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-extrabold tracking-widest text-primary">DINNER, DECIDED</Text>
        <Text className="text-4xl font-extrabold tracking-tight">What can I make?</Text>
        <Text className="-mt-2 text-base leading-6 text-muted-foreground">
          {hydrated
            ? `${items.length} pantry ${items.length === 1 ? 'item' : 'items'} ready to turn into dinner.`
            : 'Loading your pantry…'}
        </Text>
        <Button onPress={() => void suggest()} disabled={loading || !hydrated}>
          <Text>{loading ? 'Thinking…' : 'Suggest recipes'}</Text>
        </Button>

        {recipes.length > 0 && (
          <View className="mt-2 gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-2xl font-extrabold">Best matches</Text>
              <Text variant="muted">Ranked for you</Text>
            </View>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.title}
                recipe={recipe}
                onPress={() => {
                  setCurrentRecipe(recipe);
                  router.push('/recipe');
                }}
              />
            ))}
          </View>
        )}
        {!loading && recipes.length === 0 && (
          <Card className="mt-2 gap-2 rounded-2xl border-0 bg-secondary p-5 shadow-none">
            <Text className="text-2xl text-primary">✦</Text>
            <Text className="text-lg font-extrabold">A little inspiration goes a long way.</Text>
            <Text className="text-sm leading-5 text-secondary-foreground">
              Add a few pantry staples, then we’ll find three recipes that make the most of them.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
