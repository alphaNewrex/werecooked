import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/lib/theme';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export function SyncIndicator({ status }: { status: SyncStatus }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (status !== 'syncing') {
      opacity.value = 1;
      return;
    }
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(withTiming(0.3, { duration: 700 }), -1, true);
    }, 400);
    return () => clearTimeout(timeout);
  }, [opacity, status]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const color = status === 'synced' ? colors.success : status === 'syncing' ? colors.info : status === 'offline' ? colors.textSubtle : colors.danger;
  return <Animated.View className="h-2 w-2 rounded-full" style={[{ backgroundColor: color }, animatedStyle]} />;
}
