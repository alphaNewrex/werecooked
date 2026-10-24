import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View } from 'react-native';

import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-12"
        showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-extrabold tracking-widest text-primary">FROM YOUR SAVED FEED</Text>
        <Text className="text-4xl font-extrabold tracking-tight">Cook the reel</Text>
        <Text className="-mt-2 text-base leading-6 text-muted-foreground">
          Share an Instagram link or upload a screenshot. We’ll turn the clues into a cookable recipe.
        </Text>

        <Card className="gap-3 rounded-2xl p-4">
          <Text className="text-lg font-extrabold">Paste an Instagram link</Text>
          <Input
            value={linkInput}
            onChangeText={setLinkInput}
            placeholder="https://instagram.com/reel/…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="bg-muted"
          />
          <Button onPress={() => void readReelLink(linkInput)} disabled={loading}>
            <Text>{loading ? 'Reading caption…' : 'Read reel link'}</Text>
          </Button>
          <Text variant="muted" className="mt-1 text-xs font-bold uppercase tracking-widest">
            Shortcut link
          </Text>
          <Text selectable variant="muted" className="text-xs">
            {shortcutLink}
          </Text>
        </Card>

        <Card className="gap-3 rounded-2xl border-0 bg-foreground p-5 shadow-none">
          <Text className="text-3xl text-primary-foreground">▧</Text>
          <Text className="text-xl font-extrabold text-background">Have a recipe screenshot?</Text>
          <Text className="text-sm leading-5 text-background/80">
            If Instagram hides the caption, choose a clear frame with the caption or ingredient text visible.
          </Text>
          <Button variant="secondary" onPress={() => void readScreenshot()} disabled={loading}>
            <Text>Choose screenshot</Text>
          </Button>
        </Card>
        {recipe && (
          <View className="mt-2 gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-2xl font-extrabold">Here’s the dish</Text>
              <Text variant="muted">Compared with your pantry</Text>
            </View>
            <RecipeCard
              recipe={recipe}
              onPress={() => {
                setCurrentRecipe(recipe);
                router.push('/recipe');
              }}
            />
            <Card className="gap-1 rounded-xl border-0 bg-secondary p-4 shadow-none">
              <Text className="text-xs font-extrabold uppercase tracking-widest text-secondary-foreground">
                What we could read
              </Text>
              <Text className="text-sm leading-5 text-secondary-foreground">{sourceNotes}</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
