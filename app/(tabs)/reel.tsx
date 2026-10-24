import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { RecipeCard } from '@/components/RecipeCard';
import { ApiError, postJson } from '@/lib/api';
import { usePantry } from '@/lib/pantry';
import { setCurrentRecipe } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';

export default function ReelScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url?: string | string[] }>();
  const { items, hydrated } = usePantry();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [sourceNotes, setSourceNotes] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const processedLink = useRef<string | null>(null);
  const incomingUrl = Array.isArray(url) ? url[0] : url;
  const shortcutLink = Linking.createURL('reel');

  const readReelLink = useCallback(
    async (reelUrl: string) => {
      const trimmedUrl = reelUrl.trim();
      if (!trimmedUrl) {
        Alert.alert('Paste a reel link', 'Add a public Instagram URL to read its caption.');
        return;
      }
      setLoading(true);
      try {
        const response = await postJson<{ recipe: Recipe; sourceNotes: string }>('/api/reel-link', {
          url: trimmedUrl,
          pantry: items.map((item) => item.name),
        });
        setRecipe(response.recipe);
        setSourceNotes(response.sourceNotes);
      } catch (error) {
        if (error instanceof ApiError && error.needScreenshot) {
          Alert.alert(
            "Couldn't read this reel's caption",
            'Add a screenshot instead and we’ll read the text from the image.',
          );
        } else {
          Alert.alert(
            'Could not read this reel',
            error instanceof Error ? error.message : 'Try another link.',
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [items],
  );

  useEffect(() => {
    if (hydrated && incomingUrl && incomingUrl !== processedLink.current) {
      processedLink.current = incomingUrl;
      setLinkInput(incomingUrl);
      void readReelLink(incomingUrl);
    }
  }, [hydrated, incomingUrl, readReelLink]);

  async function readScreenshot() {
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
          Share an Instagram link or upload a screenshot. We’ll turn the clues into a cookable recipe.
        </Text>

        <View style={styles.linkCard}>
          <Text style={styles.cardTitle}>Paste an Instagram link</Text>
          <TextInput
            value={linkInput}
            onChangeText={setLinkInput}
            placeholder="https://instagram.com/reel/…"
            placeholderTextColor="#9B9184"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={() => void readReelLink(linkInput)} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Reading caption…' : 'Read reel link'}</Text>
          </Pressable>
          <Text style={styles.shortcutLabel}>Shortcut link</Text>
          <Text selectable style={styles.shortcutLink}>
            {shortcutLink}
          </Text>
        </View>

        <View style={styles.uploadCard}>
          <Text style={styles.uploadMark}>▧</Text>
          <Text style={styles.uploadTitle}>Have a recipe screenshot?</Text>
          <Text style={styles.uploadText}>
            If Instagram hides the caption, choose a clear frame with the caption or ingredient text visible.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={() => void readScreenshot()} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Choose screenshot</Text>
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
  linkCard: { backgroundColor: '#FFFDF9', borderRadius: 17, padding: 17, gap: 11 },
  cardTitle: { color: '#25332D', fontSize: 18, fontWeight: '800' },
  input: { backgroundColor: '#F3EDE3', borderRadius: 11, padding: 13, color: '#25332D', fontSize: 14 },
  primaryButton: { backgroundColor: '#E7683D', borderRadius: 13, padding: 14, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  shortcutLabel: { color: '#8C8275', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  shortcutLink: { color: '#4D7C65', fontSize: 12 },
  uploadCard: { backgroundColor: '#25332D', borderRadius: 20, padding: 20, gap: 10 },
  uploadMark: { color: '#F4C6A8', fontSize: 30 },
  uploadTitle: { color: '#FFFDF9', fontSize: 21, fontWeight: '800' },
  uploadText: { color: '#D8DED6', fontSize: 14, lineHeight: 21, marginBottom: 5 },
  secondaryButton: { backgroundColor: '#DDE9D5', borderRadius: 13, padding: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#25332D', fontWeight: '800', fontSize: 14 },
  result: { gap: 12, marginTop: 8 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { color: '#25332D', fontSize: 23, fontWeight: '800' },
  count: { color: '#8C8275', fontSize: 12 },
  notes: { backgroundColor: '#DDE9D5', borderRadius: 14, padding: 15, gap: 5 },
  notesLabel: { color: '#4D7C65', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  notesText: { color: '#55675B', fontSize: 14, lineHeight: 20 },
});
