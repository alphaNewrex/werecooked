import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

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
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No recipe selected</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{recipe.timeMinutes} MINUTES · SERVES {recipe.servings}</Text>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        <View style={styles.summary}>
          <Text style={styles.summaryBig}>{recipe.ingredients.filter((item) => item.haveIt).length}</Text>
          <View>
            <Text style={styles.summaryLabel}>ingredients</Text>
            <Text style={styles.summaryText}>already in your pantry</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientCard}>
          <Text style={styles.groupLabel}>YOU HAVE</Text>
          {recipe.ingredients.filter((item) => item.haveIt).map((item) => (
            <View style={styles.ingredientRow} key={`have-${item.name}`}>
              <Text style={styles.dot}>✓</Text>
              <Text style={styles.ingredient}>{item.amount} {item.name}</Text>
            </View>
          ))}
          {missing.length > 0 && (
            <>
              <Text style={[styles.groupLabel, styles.needLabel]}>YOU NEED</Text>
              {missing.map((item) => (
                <View style={styles.ingredientRow} key={`need-${item.name}`}>
                  <Text style={[styles.dot, styles.needDot]}>+</Text>
                  <Text style={styles.ingredient}>{item.amount} {item.name}</Text>
                  <Text style={styles.price}>${(item.estPriceUsd ?? 0).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Estimated missing items</Text>
                <Text style={styles.total}>${total.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Method</Text>
        <View style={styles.steps}>
          {recipe.steps.map((step, index) => (
            <View style={styles.step} key={`${index}-${step}`}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {missing.length > 0 && (
          <Pressable style={styles.primaryButton} onPress={() => void getGroceries()} disabled={groceryLoading}>
            <Text style={styles.primaryButtonText}>
              {groceryLoading ? 'Preparing list…' : 'Get groceries'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EA' },
  content: { padding: 22, paddingBottom: 48, gap: 16 },
  eyebrow: { color: '#B8613B', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: '#25332D', fontSize: 39, fontWeight: '800', letterSpacing: -1, marginTop: -3 },
  description: { color: '#70685D', fontSize: 16, lineHeight: 23, marginTop: -7 },
  summary: { backgroundColor: '#DDE9D5', borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 3 },
  summaryBig: { color: '#4D7C65', fontSize: 36, fontWeight: '900' },
  summaryLabel: { color: '#25332D', fontWeight: '800', fontSize: 15 },
  summaryText: { color: '#55675B', fontSize: 13 },
  sectionTitle: { color: '#25332D', fontSize: 23, fontWeight: '800', marginTop: 4 },
  ingredientCard: { backgroundColor: '#FFFDF9', borderRadius: 16, padding: 16, gap: 10 },
  groupLabel: { color: '#4D7C65', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 2 },
  needLabel: { color: '#B8613B', marginTop: 9 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dot: { color: '#FFF', backgroundColor: '#4D7C65', width: 22, height: 22, lineHeight: 22, textAlign: 'center', borderRadius: 7, fontWeight: '900', overflow: 'hidden' },
  needDot: { backgroundColor: '#E8B092', color: '#7E452C' },
  ingredient: { color: '#25332D', flex: 1, fontSize: 15 },
  price: { color: '#B8613B', fontWeight: '800', fontSize: 13 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#EEE4D7', marginTop: 7, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: '#70685D', fontSize: 13 },
  total: { color: '#25332D', fontWeight: '900', fontSize: 16 },
  steps: { gap: 12 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: { color: '#B8613B', fontWeight: '900', fontSize: 16, width: 24 },
  stepText: { color: '#4E514B', fontSize: 15, lineHeight: 22, flex: 1 },
  primaryButton: { backgroundColor: '#E7683D', borderRadius: 13, padding: 15, alignItems: 'center', marginTop: 5 },
  primaryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 30 },
  emptyTitle: { color: '#25332D', fontWeight: '800', fontSize: 22 },
  back: { color: '#B8613B', fontWeight: '800' },
});
