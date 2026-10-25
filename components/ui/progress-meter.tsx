import { View } from 'react-native';

import { useTheme } from '@/lib/theme';

export type ProgressTone = 'have' | 'partial' | 'need';

export function ProgressMeter({
  values,
  total,
  size = 'md',
}: {
  values: Partial<Record<ProgressTone, number>>;
  total: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { colors } = useTheme();
  const height = size === 'sm' ? 5 : size === 'lg' ? 10 : 7;
  const segments: ProgressTone[] = ['have', 'partial', 'need'];
  return (
    <View className="w-full flex-row gap-1">
      {segments.map((tone) => (
        <View
          className="rounded-full"
          key={tone}
          style={{
            backgroundColor: colors[tone === 'have' ? 'success' : tone === 'partial' ? 'warning' : 'primary'],
            flex: Math.max(values[tone] ?? 0, 0.1),
            height,
          }}
        />
      ))}
    </View>
  );
}
