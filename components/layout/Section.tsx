import { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function Section({ action, children, title }: { action?: ReactNode; children: ReactNode; title?: string }) {
  return (
    <View className="gap-3">
      {title && (
        <View className="flex-row items-center justify-between">
          <Text variant="label" tone="muted">{title}</Text>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
