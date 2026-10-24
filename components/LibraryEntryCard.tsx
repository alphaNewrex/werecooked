import { BookmarkCheck, Clock, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { LibraryEntry } from '@/lib/types';

const sourceLabels = {
  'reel-link': 'Reel link',
  'reel-screenshot': 'Screenshot',
  suggestion: 'Suggestion',
} as const;

function relativeDate(createdAt: number) {
  const minutes = Math.floor((Date.now() - createdAt) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LibraryEntryCard({
  entry,
  saved,
  onPress,
  onRemove,
  testID,
}: {
  entry: LibraryEntry;
  saved?: boolean;
  onPress: () => void;
  onRemove: () => void;
  testID: string;
}) {
  const haveCount = entry.recipe.ingredients.filter((ingredient) => ingredient.haveIt).length;
  const needCount = entry.recipe.ingredients.length - haveCount;

  return (
    <Card testID={testID} className="gap-3 rounded-2xl border-border bg-card p-4">
      <Pressable role="button" onPress={onPress} className="gap-3">
        <View className="flex-row items-center justify-between">
          <Badge variant="secondary">
            <Text className="font-mono text-xs">{sourceLabels[entry.source.kind]}</Text>
          </Badge>
          <View className="flex-row items-center gap-1">
            <Clock color="#5E6B62" size={14} />
            <Text className="font-mono text-xs text-muted-foreground">{relativeDate(entry.createdAt)}</Text>
          </View>
        </View>
        <Text className="font-display text-2xl">{entry.recipe.title}</Text>
        <Text variant="muted" numberOfLines={2} className="leading-5">
          {entry.recipe.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-muted-foreground">
            {haveCount} have · {needCount} need
          </Text>
          {saved && (
            <Badge variant="secondary" className="gap-1 border-0 bg-leaf-soft">
              <BookmarkCheck color="#2F8F4E" size={13} />
              <Text className="font-mono text-xs text-leaf">Saved</Text>
            </Badge>
          )}
        </View>
      </Pressable>
      <View className="flex-row items-center justify-between border-t border-border pt-2">
        <Text variant="muted" className="font-mono text-xs uppercase tracking-widest">
          {entry.recipe.timeMinutes} min · {entry.recipe.servings} servings
        </Text>
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel={`Remove ${entry.recipe.title}`}
          onPress={onRemove}>
          <X color="#F0532F" size={17} />
        </Button>
      </View>
    </Card>
  );
}
