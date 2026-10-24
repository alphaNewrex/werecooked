import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RecipeCard } from '@/components/RecipeCard';
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>DINNER, DECIDED</Text>
        <Text style={styles.title}>What can I make?</Text>
        <Text style={styles.subtitle}>
          {hydrated
            ? `${items.length} pantry ${items.length === 1 ? 'item' : 'items'} ready to turn into dinner.`
            : 'Loading your pantry…'}
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => void suggest()} disabled={loading || !hydrated}>
          <Text style={styles.primaryButtonText}>{loading ? 'Thinking…' : 'Suggest recipes'}</Text>
        </Pressable>
        {recipes.length > 0 && (
          <View style={styles.results}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Best matches</Text>
              <Text style={styles.count}>Ranked for you</Text>
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
          <View style={styles.empty}>
            <Text style={styles.emptyMark}>✦</Text>
            <Text style={styles.emptyTitle}>A little inspiration goes a long way.</Text>
            <Text style={styles.emptyText}>
              Add a few pantry staples, then we’ll find three recipes that make the most of them.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EA' },
  content: { padding: 22, paddingBottom: 48, gap: 16 },
  eyebrow: { color: '#B8613B', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#25332D', fontSize: 39, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: '#70685D', fontSize: 16, lineHeight: 23, marginTop: -8 },
  primaryButton: { backgroundColor: '#E7683D', borderRadius: 13, padding: 15, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  results: { gap: 12, marginTop: 8 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { color: '#25332D', fontSize: 23, fontWeight: '800' },
  count: { color: '#8C8275', fontSize: 12 },
  empty: { backgroundColor: '#DDE9D5', borderRadius: 18, padding: 20, gap: 8, marginTop: 8 },
  emptyMark: { color: '#B8613B', fontSize: 26 },
  emptyTitle: { color: '#25332D', fontSize: 19, fontWeight: '800' },
  emptyText: { color: '#55675B', lineHeight: 21, fontSize: 14 },
});
