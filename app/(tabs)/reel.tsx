import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImagePlus, Link as LinkIcon, Smartphone } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useFeedback } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { RecipeCard } from '@/components/patterns/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { Text } from '@/components/ui/text';
import { ApiError, postJson } from '@/lib/api';
import { useLibrary } from '@/lib/library';
import { usePantry } from '@/lib/pantry';
import { useTheme } from '@/lib/theme';
import { setCurrentRecipe } from '@/lib/recipe-store';
import type { LibraryEntry, Recipe } from '@/lib/types';

export default function ReelScreen() {
  const router = useRouter();
  const { toast } = useFeedback();
  const { colors } = useTheme();
  const { url } = useLocalSearchParams<{ url?: string | string[] }>();
  const { items, hydrated } = usePantry();
  const { addIncoming, findIncomingByUrl, hydrated: libraryHydrated } = useLibrary();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [sourceNotes, setSourceNotes] = useState('');
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [addedToIncoming, setAddedToIncoming] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const linkInputRef = useRef('');
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const processedLink = useRef<string | null>(null);
  const incomingUrl = Array.isArray(url) ? url[0] : url;
  const shortcutLink = Linking.createURL('reel');

  const readReelLink = useCallback(
    async (reelUrl: string) => {
      const trimmedUrl = reelUrl.trim();
      if (!trimmedUrl) {
        setError({ title: 'Paste a reel link', message: 'Add a public Instagram URL to read its caption.' });
        toast({ message: 'Paste a reel link: Add a public Instagram URL to read its caption.', tone: 'warning' });
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const existing = findIncomingByUrl(trimmedUrl);
        if (existing) {
          const bumped = addIncoming(existing.recipe, existing.source);
          setEntry(bumped);
          setRecipe(bumped.recipe);
          setSourceNotes(bumped.source.notes ?? '');
          setAddedToIncoming(true);
          return;
        }
        const response = await postJson<{ recipe: Recipe; sourceNotes: string }>('/api/reel-link', {
          url: trimmedUrl,
          pantry: items.map((item) => item.name),
        });
        const incoming = addIncoming(response.recipe, {
          kind: 'reel-link',
          url: trimmedUrl,
          notes: response.sourceNotes,
        });
        setEntry(incoming);
        setRecipe(incoming.recipe);
        setSourceNotes(response.sourceNotes);
        setAddedToIncoming(true);
      } catch (error) {
        if (error instanceof ApiError && error.needScreenshot) {
          const message = 'Add a screenshot instead and we’ll read the text from the image.';
          setError({ title: "Couldn't read this reel's caption", message });
          toast({ message: `Couldn't read this reel's caption: ${message}`, tone: 'danger' });
        } else {
          const message = error instanceof Error ? error.message : 'Try another link.';
          setError({ title: 'Could not read this reel', message });
          toast({ message: `Could not read this reel: ${message}`, tone: 'danger' });
        }
      } finally {
        setLoading(false);
      }
    },
    [addIncoming, findIncomingByUrl, items, toast],
  );

  useEffect(() => {
    if (hydrated && libraryHydrated && incomingUrl && incomingUrl !== processedLink.current) {
      processedLink.current = incomingUrl;
      setLinkInput(incomingUrl);
      linkInputRef.current = incomingUrl;
      void readReelLink(incomingUrl);
    }
  }, [hydrated, incomingUrl, libraryHydrated, readReelLink]);

  async function readScreenshot() {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (!asset?.base64) return;
      setLoading(true);
      const response = await postJson<{ recipe: Recipe; sourceNotes: string }>('/api/reel', {
        imageBase64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
        pantry: items.map((item) => item.name),
      });
      const incoming = addIncoming(response.recipe, {
        kind: 'reel-screenshot',
        notes: response.sourceNotes,
      });
      setEntry(incoming);
      setRecipe(incoming.recipe);
      setSourceNotes(response.sourceNotes);
      setAddedToIncoming(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try another screenshot.';
      setError({ title: 'Could not read this reel', message });
      toast({ message: `Could not read this reel: ${message}`, tone: 'danger' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-28" showsVerticalScrollIndicator={false}>
        <Text variant="display-xl">Cook the reel</Text>
        <Text className="-mt-2 text-base leading-6 text-muted-foreground">
          Paste a link or bring a screenshot. We’ll pull out the dish.
        </Text>

        <Card className="gap-3 rounded-2xl border-border bg-card p-4">
          <Text className="font-sans-bold text-lg">Instagram link</Text>
          <Input
            leadingIcon={LinkIcon}
            value={linkInput}
            onChangeText={(value) => {
              linkInputRef.current = value;
              setLinkInput(value);
            }}
            placeholder="https://instagram.com/reel/…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="flex-1"
          />
          <Button onPress={() => void readReelLink(linkInputRef.current || linkInput)} disabled={loading}>
            <LinkIcon color={colors.onPrimary} size={17} />
            <Text>{loading ? 'Reading caption…' : 'Read reel link'}</Text>
          </Button>
          <Text className="mt-1 font-mono-medium text-xs uppercase tracking-widest text-muted-foreground">Shortcut link</Text>
          <Text selectable className="font-mono text-xs text-muted-foreground">{shortcutLink}</Text>
        </Card>

        <Card className="min-h-80 items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/50 p-7">
          <Smartphone color={colors.text} size={34} strokeWidth={1.7} />
          <ImagePlus color={colors.primary} size={42} strokeWidth={1.7} />
          <Text variant="display-md" className="text-center">Have a recipe screenshot?</Text>
          <Text variant="muted" className="text-center leading-5">
            Choose a clear frame with the caption or ingredient text visible.
          </Text>
          <Button variant="secondary" onPress={() => void readScreenshot()} disabled={loading}>
            <ImagePlus color={colors.text} size={17} />
            <Text>Choose screenshot</Text>
          </Button>
          {loading && <Text className="font-mono text-xs text-muted-foreground">Reading your reel…</Text>}
        </Card>
        {error && <Notice tone="danger" title={error.title} body={error.message} />}
        {recipe && (
          <View className="gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text variant="display-md">Here’s the dish</Text>
              <Text variant="muted">Compared with your pantry</Text>
            </View>
            <RecipeCard
              recipe={recipe}
              onPress={() => {
                if (!entry) return;
                setCurrentRecipe({
                  recipe: entry.recipe,
                  source: entry.source,
                  entryId: entry.id,
                  collection: 'incoming',
                });
                router.push('/recipe');
              }}
            />
            {addedToIncoming && (
              <Text className="font-mono text-xs uppercase tracking-widest text-success">
                Added to Incoming
              </Text>
            )}
            <Card className="gap-1 rounded-xl border-success-soft bg-success-soft p-4 shadow-none">
              <Text className="font-mono-medium text-xs uppercase tracking-widest text-success">What we could read</Text>
              <Text className="leading-5 text-foreground">{sourceNotes}</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
