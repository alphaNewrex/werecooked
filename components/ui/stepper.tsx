import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { View } from 'react-native';

import { tokens } from '@/lib/design';
import { useTheme } from '@/lib/theme';

export function Stepper({ count, current }: { count: number; current: number }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: count }, (_, index) => (
        <View
          className="h-1.5 flex-1 overflow-hidden rounded-full"
          key={index}
          style={{ backgroundColor: colors.border }}>
          <Animated.View
            className="h-full rounded-full"
            style={{
              backgroundColor: index < current ? colors.primary : 'transparent',
              width: index < current ? '100%' : '0%',
            }}
          />
        </View>
      ))}
    </View>
  );
}

export function NumberStepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement?: () => void;
  onIncrement?: () => void;
}) {
  const { colors } = useTheme();
  const numberScale = useSharedValue(1);
  const numberStyle = useAnimatedStyle(() => ({ transform: [{ scale: numberScale.value }] }));
  const bump = (callback?: () => void) => {
    numberScale.value = withSpring(1.15, tokens.motion.springs.snappy);
    callback?.();
    numberScale.value = withSpring(1, tokens.motion.springs.snappy);
  };
  return (
    <View className="flex-row items-center gap-3 rounded-full border border-border-strong bg-surface-muted p-1">
      <AnimatedPressButton label="−" onPress={() => bump(onDecrement)} color={colors.text} />
      <Animated.Text className="font-numeric text-numeric text-text" style={numberStyle}>{value}</Animated.Text>
      <AnimatedPressButton label="+" onPress={() => bump(onIncrement)} color={colors.text} />
    </View>
  );
}

function AnimatedPressButton({ color, label, onPress }: { color: string; label: string; onPress?: () => void }) {
  return (
    <View
      accessibilityLabel={`${label} servings`}
      accessibilityRole="button"
      className="h-8 w-8 items-center justify-center rounded-full bg-surface"
      onTouchEnd={onPress}>
      <Animated.Text style={{ color, fontSize: 18 }}>{label}</Animated.Text>
    </View>
  );
}
