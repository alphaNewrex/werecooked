import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, Share, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { postJson } from '@/lib/api';
import { getCurrentRecipe } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';

export default function RecipeScreen() {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [groceryLoading, setGroceryLoading] = useState(false);

  useEffect(() => {
    setRecipe(getCurrentRecipe());
  }, []);

  const missing = useMemo(
    () => recipe?.ingredients.filter((ingredient) => !ingredient.haveIt) ?? [],
    [recipe],
  );
  const total = missing.reduce((sum, ingredient) => sum + (ingredient.estPriceUsd ?? 0), 0);

  async function getGroceries() {
    if (!recipe) {
      return;
    }
    setGroceryLoading(true);
    try {
      const response = await postJson<{ url: string | null }>('/api/grocery-link', {
        title: recipe.title,
        items: missing.map(({ name, amount }) => ({ name, amount })),
      });
      if (response.url) {
        await Linking.openURL(response.url);
      } else {
        await Share.share({
          title: `${recipe.title} shopping list`,
          message: `${recipe.title} shopping list\n\n${missing
            .map((item) => `• ${item.amount} ${item.name}`)
            .join('\n')}\n\nEstimated total: $${total.toFixed(2)}`,
        });
      }
    } catch (error) {
      Alert.alert('Could not make a shopping list', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setGroceryLoading(false);
    }
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-3 p-8">
          <Text className="text-2xl font-extrabold">No recipe selected</Text>
          <Button variant="ghost" onPress={() => router.back()}>
            <Text>Go back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const have = recipe.ingredients.filter((item) => item.haveIt);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-12"
        showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-extrabold tracking-widest text-primary">
          {recipe.timeMinutes} MINUTES · SERVES {recipe.servings}
        </Text>
        <Text className="text-4xl font-extrabold tracking-tight">{recipe.title}</Text>
        <Text className="-mt-2 text-base leading-6 text-muted-foreground">{recipe.description}</Text>

        <Card className="flex-row items-center gap-3 rounded-2xl border-0 bg-secondary p-4 shadow-none">
          <Text className="text-4xl font-black text-secondary-foreground">{have.length}</Text>
          <View>
            <Text className="font-extrabold">ingredients</Text>
            <Text variant="muted">already in your pantry</Text>
          </View>
        </Card>

        <Text className="mt-1 text-2xl font-extrabold">Ingredients</Text>
        <Card className="gap-3 rounded-2xl p-4">
          <Text className="text-xs font-black uppercase tracking-widest text-secondary-foreground">You have</Text>
          {have.map((item) => (
            <View className="flex-row items-center gap-2" key={`have-${item.name}`}>
              <Badge variant="secondary">
                <Text>✓</Text>
              </Badge>
              <Text className="flex-1">{item.amount} {item.name}</Text>
            </View>
          ))}
          {missing.length > 0 && (
            <>
              <Separator className="my-1" />
              <Text className="text-xs font-black uppercase tracking-widest text-primary">You need</Text>
              {missing.map((item) => (
                <View className="flex-row items-center gap-2" key={`need-${item.name}`}>
                  <Badge variant="outline">
                    <Text className="text-primary">+</Text>
                  </Badge>
                  <Text className="flex-1">{item.amount} {item.name}</Text>
                  <Badge>
                    <Text>${(item.estPriceUsd ?? 0).toFixed(2)}</Text>
                  </Badge>
                </View>
              ))}
              <Separator className="my-1" />
              <View className="flex-row items-center justify-between">
                <Text variant="muted">Estimated missing items</Text>
                <Text className="text-lg font-black">${total.toFixed(2)}</Text>
              </View>
            </>
          )}
        </Card>

        <Text className="mt-1 text-2xl font-extrabold">Method</Text>
        <View className="gap-3">
          {recipe.steps.map((step, index) => (
            <View className="flex-row items-start gap-3" key={`${index}-${step}`}>
              <Badge variant="secondary">
                <Text>{index + 1}</Text>
              </Badge>
              <Text className="flex-1 leading-6 text-muted-foreground">{step}</Text>
            </View>
          ))}
        </View>

        {missing.length > 0 && (
          <Button onPress={() => void getGroceries()} disabled={groceryLoading} className="mt-1">
            <Text>{groceryLoading ? 'Preparing list…' : 'Get groceries'}</Text>
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
