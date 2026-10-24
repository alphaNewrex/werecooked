import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/**
 * Inline error message. React Native Web's `Alert.alert` is a no-op, so screens render
 * failures inline as well to keep them visible on every platform.
 */
export function ErrorNotice({ title, message }: { title: string; message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <View role="alert" className="gap-1 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <Text className="font-extrabold text-destructive">{title}</Text>
      <Text className="text-sm leading-5 text-destructive">{message}</Text>
    </View>
  );
}
