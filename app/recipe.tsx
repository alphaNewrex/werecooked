import { Clock, Check, ShoppingBasket, Users, Plus, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, SafeAreaView, ScrollView, Share, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ErrorNotice } from '@/components/ErrorNotice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { postJson } from '@/lib/api';
import { getCurrentRecipe } from '@/lib/recipe-store';
import type { KrogerPriceResult, Recipe } from '@/lib/types';

const tornPath =
  'M0 0 L10 10 L20 0 L30 10 L40 0 L50 10 L60 0 L70 10 L80 0 L90 10 L100 0 L110 10 L120 0 L130 10 L140 0 L150 10 L160 0 L170 10 L180 0 L190 10 L200 0 L210 10 L220 0 L230 10 L240 0 L250 10 L260 0 L270 10 L280 0 L290 10 L300 0 L310 10 L320 0 L330 10 L340 0 L350 10 L360 0 L370 10 L380 0 L390 10 V16 H0 Z';

export default function RecipeScreen() {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [krogerLoading, setKrogerLoading] = useState(false);
  const [krogerPricing, setKrogerPricing] = useState<KrogerPriceResult | null>(null);
  const [groceryUrl, setGroceryUrl] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<string | null>(null);
  const [groceryError, setGroceryError] = useState<string | null>(null);

  useEffect(() => {
    const currentRecipe = getCurrentRecipe();
    setRecipe(currentRecipe);
    const missingItems = currentRecipe?.ingredients.filter((ingredient) => !ingredient.haveIt) ?? [];
    if (missingItems.length === 0) return;
    setKrogerLoading(true);
    void postJson<KrogerPriceResult>('/api/prices', {
      items: missingItems.map((ingredient) => ({ name: ingredient.name })),
    })
      .then(setKrogerPricing)
      .catch(() => undefined)
      .finally(() => setKrogerLoading(false));
  }, []);

  const missing = useMemo(() => recipe?.ingredients.filter((ingredient) => !ingredient.haveIt) ?? [], [recipe]);
  const krogerMatches = useMemo(
    () => new Map((krogerPricing?.results ?? []).map((result) => [result.name.trim().toLowerCase(), result.match])),
    [krogerPricing],
  );
  const pricedMissing = missing.map((ingredient) => ({
    ingredient,
    match: krogerMatches.get(ingredient.name.trim().toLowerCase()) ?? null,
  }));
  const krogerCount = pricedMissing.filter(({ match }) => match !== null).length;
  const estimateCount = pricedMissing.length - krogerCount;
  const total = pricedMissing.reduce(
    (sum, { ingredient, match }) => sum + (match?.priceUsd ?? ingredient.estPriceUsd ?? 0),
    0,
  );

  async function openGroceryUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      if (Platform.OS !== 'web') setGroceryError(error instanceof Error ? error.message : 'Could not open Instacart.');
    }
  }

  async function getGroceries() {
    if (!recipe) return;
    setGroceryLoading(true);
    setGroceryError(null);
    setGroceryUrl(null);
    setShoppingList(null);
    try {
      const response = await postJson<{ url: string | null }>('/api/grocery-link', {
        title: recipe.title,
        items: missing.map(({ name, amount }) => ({ name, amount })),
      });
      if (response.url) {
        setGroceryUrl(response.url);
        await openGroceryUrl(response.url);
      } else {
        const message = `${recipe.title} shopping list\n\n${missing
          .map((item) => {
            const match = krogerMatches.get(item.name.trim().toLowerCase());
            const price = match ? `$${match.priceUsd.toFixed(2)} at Kroger` : `~$${(item.estPriceUsd ?? 0).toFixed(2)} est.`;
            return `• ${item.amount} ${item.name} — ${price}`;
          })
          .join('\n')}\n\nEstimated total: $${total.toFixed(2)}`;
        setShoppingList(message);
        await Share.share({ title: `${recipe.title} shopping list`, message }).catch(() => undefined);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again.';
      setGroceryError(message);
      Alert.alert('Could not make a shopping list', message);
    } finally {
      setGroceryLoading(false);
    }
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-3 p-8">
          <Text className="font-display text-2xl">No recipe selected</Text>
          <Button variant="ghost" onPress={() => router.back()}><Text>Go back</Text></Button>
        </View>
      </SafeAreaView>
    );
  }

  const have = recipe.ingredients.filter((item) => item.haveIt);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 p-5 pb-32" showsVerticalScrollIndicator={false}>
        <Text className="font-mono-medium text-xs uppercase tracking-widest text-tomato">
          {recipe.timeMinutes} min · serves {recipe.servings}
        </Text>
        <Text className="font-display text-4xl leading-[1.05]">{recipe.title}</Text>
        <Text className="-mt-2 text-base leading-6 text-muted-foreground">{recipe.description}</Text>

        <Card className="flex-row items-center gap-3 rounded-2xl border-0 bg-leaf-soft p-4 shadow-none">
          <Text className="font-display text-4xl text-leaf">{have.length}</Text>
          <View><Text className="font-sans-bold">ingredients</Text><Text variant="muted">already in your pantry</Text></View>
        </Card>

        <Text className="font-display text-2xl">Ingredients</Text>
        <Card className="gap-3 rounded-2xl border-border bg-card p-4">
          <Text className="font-mono-medium text-xs uppercase tracking-widest text-leaf">You have</Text>
          {have.length === 0 && <Text variant="muted">Nothing from your pantry yet.</Text>}
          {have.map((item, index) => (
            <View className="flex-row items-center gap-2" key={`have-${index}-${item.name}`}>
              <Badge variant="secondary" className="border-0 bg-leaf-soft"><Check color="#2F8F4E" size={14} /></Badge>
              <Text className="flex-1">{item.amount} {item.name}</Text>
            </View>
          ))}
        </Card>

        <View className="gap-0">
          <Card className="gap-3 rounded-t-2xl rounded-b-none border-border bg-card p-4 pb-5">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono-medium text-xs uppercase tracking-widest text-tomato">You need</Text>
              {krogerPricing?.store && <Text testID="kroger-store" className="max-w-[55%] text-right font-mono text-[10px] text-muted-foreground">{krogerPricing.store.name} · {krogerPricing.store.address}</Text>}
            </View>
            {krogerLoading && <Text variant="muted" className="font-mono text-xs">Checking Kroger prices…</Text>}
            {missing.length === 0 && <Text variant="muted">Nothing extra — you’re all set.</Text>}
            {pricedMissing.map(({ ingredient, match }, index) => (
              <View className="flex-row items-end gap-2" key={`need-${index}-${ingredient.name}`}>
                <Text className="shrink">{ingredient.name}</Text>
                <View className="mb-1 flex-1 border-b border-dotted border-border" />
                <Text className="font-mono text-xs">{ingredient.amount}</Text>
                {match ? (
                  <View className="items-end">
                    <Badge testID="kroger-price" className="border-0 bg-butter-soft"><Text className="font-mono text-xs text-foreground">${match.priceUsd.toFixed(2)} <Text className="text-[9px]">Kroger</Text></Text></Badge>
                    {match.onSale && <Text className="font-mono text-[10px] text-muted-foreground line-through">${match.regularUsd.toFixed(2)}</Text>}
                  </View>
                ) : (
                  <Badge className="border-0 bg-tomato-soft"><Text className="font-mono text-xs text-tomato">~${(ingredient.estPriceUsd ?? 0).toFixed(2)} <Text className="text-[9px]">est.</Text></Text></Badge>
                )}
              </View>
            ))}
            <Separator className="my-1" />
            <View className="flex-row items-center justify-between gap-2">
              <Text className="font-mono-medium text-sm">TOTAL ${total.toFixed(2)}</Text>
              <Text variant="muted" className="font-mono text-[10px]">{krogerCount} Kroger prices, {estimateCount} estimates</Text>
            </View>
          </Card>
          <Svg height={16} width="100%" viewBox="0 0 390 16" preserveAspectRatio="none">
            <Path d={tornPath} fill="#FFFFFF" />
          </Svg>
        </View>

        {missing.length > 0 && (
          <Button onPress={() => void getGroceries()} disabled={groceryLoading} className="-mt-2">
            <ShoppingBasket color="#FFFFFF" size={18} />
            <Text>{groceryLoading ? 'Preparing list…' : 'Get groceries'}</Text>
          </Button>
        )}
        <ErrorNotice title="Could not make a shopping list" message={groceryError} />
        {groceryUrl && (
          <Card className="gap-3 rounded-2xl border-border bg-card p-4">
            <Text className="font-sans-bold text-lg">Your Instacart list is ready</Text>
            <Button variant="outline" onPress={() => void openGroceryUrl(groceryUrl)}><ExternalLink color="#18201B" size={16} /><Text>Open Instacart list</Text></Button>
          </Card>
        )}
        {shoppingList && (
          <Card className="gap-2 rounded-2xl border-border bg-card p-4">
            <Text className="font-sans-bold text-lg">Shopping list</Text>
            <Text selectable testID="shopping-list" className="text-sm leading-5 text-muted-foreground">{shoppingList}</Text>
          </Card>
        )}

        <Text className="font-display text-2xl">Method</Text>
        <View className="gap-3">
          {recipe.steps.map((step, index) => (
            <View className="flex-row items-start gap-3" key={`${index}-${step}`} testID="method-step">
              <Text className="w-6 font-mono-medium text-leaf">{String(index + 1).padStart(2, '0')}</Text>
              <Text className="flex-1 leading-6 text-muted-foreground">{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
