import { ReactNode } from 'react';
import { View } from 'react-native';

import { Pressable } from '@/components/ui/pressable';

export function ListRow({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const content = <View className="min-w-0 flex-1 flex-row items-center gap-3">{children}</View>;
  return onPress ? <Pressable className="flex-row items-center gap-3 py-3" onPress={onPress}>{content}</Pressable> : <View className="flex-row items-center gap-3 py-3">{content}</View>;
}
