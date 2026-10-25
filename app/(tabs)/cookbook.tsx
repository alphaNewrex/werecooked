import { BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { useFeedback } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { LibraryEntryCard } from '@/components/patterns/LibraryEntryCard';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useLibrary } from '@/lib/library';
import { setCurrentRecipe } from '@/lib/recipe-store';
import { useTheme } from '@/lib/theme';
import type { LibraryEntry } from '@/lib/types';

export default function CookbookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { confirm: confirmFeedback } = useFeedback();
  const { cookbook, hydrated, removeFromCookbook } = useLibrary();

  async function confirmRemove(entry: LibraryEntry) {
    if (await confirmFeedback({ title: 'Remove from Cookbook?', message: entry.recipe.title, confirmLabel: 'Remove', destructive: true })) {
      removeFromCookbook(entry.id);
    }
  }

  function openEntry(entry: LibraryEntry) {
    setCurrentRecipe({
      recipe: entry.recipe,
      source: entry.source,
      entryId: entry.id,
      collection: 'cookbook',
    });
    router.push('/recipe');
  }

  return (
    <Screen scroll={false}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-32" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between">
          <View className="gap-1">
            <Text variant="display-xl">Cookbook</Text>
            <Text className="font-mono text-sm text-muted-foreground">Keep the recipes worth making twice.</Text>
          </View>
          <BookOpen color={colors.primary} size={28} strokeWidth={2.2} />
        </View>
        {!hydrated ? (
          <Text variant="muted">Loading your cookbook…</Text>
        ) : cookbook.length === 0 ? (
          <Card testID="cookbook-empty" className="gap-2 rounded-2xl border-dashed border-border bg-transparent p-5 shadow-none">
            <Text className="font-sans-bold text-lg">Your cookbook is waiting.</Text>
            <Text variant="muted">Save a favorite from Incoming or Cook when you find it.</Text>
          </Card>
        ) : (
          <View className="gap-3">
            {cookbook.map((entry) => (
              <LibraryEntryCard
                key={entry.id}
                testID="cookbook-item"
                entry={entry}
                onPress={() => openEntry(entry)}
                onRemove={() => confirmRemove(entry)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
