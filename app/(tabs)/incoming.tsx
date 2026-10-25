import { Inbox } from 'lucide-react-native';
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

export default function IncomingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { confirm: confirmFeedback } = useFeedback();
  const { incoming, hydrated, cookbookEntryFor, removeIncoming } = useLibrary();

  async function confirmRemove(entry: LibraryEntry) {
    if (await confirmFeedback({ title: 'Remove from Incoming?', message: entry.recipe.title, confirmLabel: 'Remove', destructive: true })) {
      removeIncoming(entry.id);
    }
  }

  function openEntry(entry: LibraryEntry) {
    setCurrentRecipe({
      recipe: entry.recipe,
      source: entry.source,
      entryId: entry.id,
      collection: 'incoming',
    });
    router.push('/recipe');
  }

  return (
    <Screen scroll={false}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-32" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between">
          <View className="gap-1">
            <Text variant="display-xl">Incoming</Text>
            <Text className="font-mono text-sm text-muted-foreground">Your reel recipes, ready when you are.</Text>
          </View>
          <Inbox color={colors.primary} size={28} strokeWidth={2.2} />
        </View>
        {!hydrated ? (
          <Text variant="muted">Loading your recipes…</Text>
        ) : incoming.length === 0 ? (
          <Card testID="incoming-empty" className="gap-2 rounded-2xl border-dashed border-border bg-transparent p-5 shadow-none">
            <Text className="font-sans-bold text-lg">Nothing incoming yet.</Text>
            <Text variant="muted">Send a reel or screenshot to start your cooking queue.</Text>
          </Card>
        ) : (
          <View className="gap-3">
            {incoming.map((entry) => (
              <LibraryEntryCard
                key={entry.id}
                testID="incoming-item"
                entry={entry}
                saved={!!cookbookEntryFor({ originId: entry.id, source: entry.source, recipe: entry.recipe })}
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
