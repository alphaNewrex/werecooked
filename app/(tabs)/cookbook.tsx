import { BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Alert, Platform, SafeAreaView, ScrollView, View } from 'react-native';

import { LibraryEntryCard } from '@/components/LibraryEntryCard';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useLibrary } from '@/lib/library';
import { setCurrentRecipe } from '@/lib/recipe-store';
import type { LibraryEntry } from '@/lib/types';

export default function CookbookScreen() {
  const router = useRouter();
  const { cookbook, hydrated, removeFromCookbook } = useLibrary();

  function confirmRemove(entry: LibraryEntry) {
    const remove = () => removeFromCookbook(entry.id);
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Remove ${entry.recipe.title} from Cookbook?`) ?? true) remove();
      return;
    }
    Alert.alert('Remove from Cookbook?', entry.recipe.title, [
      { text: 'Keep' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-32" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between">
          <View className="gap-1">
            <Text className="font-display text-5xl leading-[1.05]">Cookbook</Text>
            <Text className="font-mono text-sm text-muted-foreground">Keep the recipes worth making twice.</Text>
          </View>
          <BookOpen color="#F0532F" size={28} strokeWidth={2.2} />
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
    </SafeAreaView>
  );
}
