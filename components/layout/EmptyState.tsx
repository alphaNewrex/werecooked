import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function EmptyState({
  action,
  body,
  icon,
  title,
}: {
  action?: { label: string; onPress: () => void };
  body: string;
  icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  title: string;
}) {
  return (
    <View className="items-center gap-2 rounded-lg border border-dashed border-border p-5">
      <Icon icon={icon} size="lg" tone="muted" />
      <Text variant="title" className="text-center">{title}</Text>
      <Text variant="body-sm" tone="muted" className="text-center">{body}</Text>
      {action && <Button size="sm" onPress={action.onPress}><Text>{action.label}</Text></Button>}
    </View>
  );
}
