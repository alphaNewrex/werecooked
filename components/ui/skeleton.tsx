import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function Skeleton({ className, ...props }: React.ComponentProps<typeof View>) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [progress, reducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0.65 : interpolate(progress.value, [0, 1], [0.5, 1], Extrapolation.CLAMP),
  }));
  return <Animated.View className={`rounded-md bg-surface-muted ${className ?? ''}`} style={animatedStyle} {...props} />;
}
