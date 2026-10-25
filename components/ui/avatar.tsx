import { View } from 'react-native';

import { Text } from './text';

export function Avatar({ label, size = 40 }: { label: string; size?: number }) {
  return (
    <View className="items-center justify-center rounded-full bg-success-soft" style={{ height: size, width: size }}>
      <Text tone="success-ink" variant="body-strong">{label.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}
