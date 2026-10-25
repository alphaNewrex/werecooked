import { View } from 'react-native';

import { Pressable } from './pressable';
import { Text } from './text';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export function Notice({
  action,
  body,
  dismiss,
  title,
  tone = 'info',
}: {
  action?: { label: string; onPress: () => void };
  body: string;
  dismiss?: () => void;
  title: string;
  tone?: NoticeTone;
}) {
  const toneClass = {
    info: 'border-info-soft bg-info-soft',
    success: 'border-success-soft bg-success-soft',
    warning: 'border-warning-soft bg-warning-soft',
    danger: 'border-danger-soft bg-danger-soft',
  }[tone];
  const inkTone = `${tone}-ink` as const;
  return (
    <View className={`gap-1 rounded-md border p-3 ${toneClass}`}>
      <View className="flex-row items-center justify-between">
        <Text variant="body-strong" tone={inkTone}>{title}</Text>
        {dismiss && <Pressable accessibilityLabel="Dismiss notice" onPress={dismiss}><Text tone={inkTone}>×</Text></Pressable>}
      </View>
      <Text variant="body-sm" tone={inkTone}>{body}</Text>
      {action && <Pressable className="self-start pt-1" onPress={action.onPress}><Text variant="caption" tone={inkTone}>{action.label}</Text></Pressable>}
    </View>
  );
}
