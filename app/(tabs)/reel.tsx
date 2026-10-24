import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RecipeCard } from '@/components/RecipeCard';
import { postJson } from '@/lib/api';
import { usePantry } from '@/lib/pantry';
import { setCurrentRecipe } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';

export default function ReelScreen() {
  const router = useRouter();
  const { items } = usePantry();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [sourceNotes, setSourceNotes] = useState('');

  async function readReel() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (!asset?.base64) {
        return;
      }
      setLoading(true);
      const response = await postJson<{ recipe: Recipe; sourceNotes: string }>('/api/reel', {
        imageBase64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
        pantry: items.map((item) => item.name),
      });
      setRecipe(response.recipe);
      setSourceNotes(response.sourceNotes);
    } catch (error) {
      Alert.alert('Could not read this reel', error instanceof Error ? error.message : 'Try another screenshot.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>FROM YOUR SAVED FEED</Text>
        <Text style={styles.title}>Cook the reel</Text>
        <Text style={styles.subtitle}>
          Upload a screenshot from Instagram or TikTok. We’ll turn the clues into a cookable recipe.
        </Text>
        <View style={styles.uploadCard}>
          <Text style={styles.uploadMark}>▧</Text>
          <Text style={styles.uploadTitle}>Have a recipe screenshot?</Text>
          <Text style={styles.uploadText}>Choose a clear frame with the caption or ingredient text visible.</Text>
          <Pressable style={styles.primaryButton} onPress={() => void readReel()} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Reading screenshot…' : 'Choose screenshot'}</Text>
          </Pressable>
        </View>
        {recipe && (
          <View style={styles.result}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Here’s the dish</Text>
              <Text style={styles.count}>Compared with your pantry</Text>
            </View>
            <RecipeCard
              recipe={recipe}
              onPress={() => {
                setCurrentRecipe(recipe);
                router.push('/recipe');
              }}
            />
            <View style={styles.notes}>
              <Text style={styles.notesLabel}>What we could read</Text>
              <Text style={styles.notesText}>{sourceNotes}</Text>
            </View>
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
  title: { color: '#25332D', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: '#70685D', fontSize: 16, lineHeight: 23, marginTop: -8 },
  uploadCard: { backgroundColor: '#25332D', borderRadius: 20, padding: 20, gap: 10 },
  uploadMark: { color: '#F4C6A8', fontSize: 30 },
  uploadTitle: { color: '#FFFDF9', fontSize: 21, fontWeight: '800' },
  uploadText: { color: '#D8DED6', fontSize: 14, lineHeight: 21, marginBottom: 5 },
  primaryButton: { backgroundColor: '#E7683D', borderRadius: 13, padding: 15, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  result: { gap: 12, marginTop: 8 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { color: '#25332D', fontSize: 23, fontWeight: '800' },
  count: { color: '#8C8275', fontSize: 12 },
  notes: { backgroundColor: '#DDE9D5', borderRadius: 14, padding: 15, gap: 5 },
  notesLabel: { color: '#4D7C65', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  notesText: { color: '#55675B', fontSize: 14, lineHeight: 20 },
});
