import { BookmarkCheck, Clock, X } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Sticker } from '@/components/ui/sticker';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
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
  if (days < 7) return `${days}d ago`;
  return new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
  const { colors } = useTheme();
  const haveCount = entry.recipe.ingredients.filter((ingredient) => ingredient.haveIt).length;
  const needCount = entry.recipe.ingredients.length - haveCount;
  return (
    <Card testID={testID}>
      <Pressable role="button" onPress={onPress} className="gap-3">
        <View className="flex-row items-center justify-between">
          <Sticker label={sourceLabels[entry.source.kind]} tone="staple" animate={false} />
          <View className="flex-row items-center gap-1">
            <Clock color={colors.textMuted} size={14} />
            <Text variant="numeric-sm" tone="muted">{relativeDate(entry.createdAt)}</Text>
          </View>
        </View>
        <Text variant="display-md">{entry.recipe.title}</Text>
        <Text variant="body-sm" tone="muted" numberOfLines={2}>{entry.recipe.description}</Text>
        <View className="flex-row items-center justify-between">
          <Text variant="numeric-sm" tone="muted">{haveCount} have · {needCount} need</Text>
          {saved && <View className="flex-row items-center gap-1"><BookmarkCheck color={colors.successInk} size={14} /><Text variant="caption" tone="success-ink">Saved</Text></View>}
        </View>
      </Pressable>
      <View className="flex-row items-center justify-between border-t border-border pt-2">
        <Text variant="label" tone="muted">{entry.recipe.timeMinutes} min · {entry.recipe.servings} servings</Text>
        <Button variant="ghost" size="icon" accessibilityLabel={`Remove ${entry.recipe.title}`} onPress={onRemove}>
            <X color={colors.danger} size={17} />
        </Button>
      </View>
    </Card>
  );
}
