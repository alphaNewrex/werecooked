import { useHaptics } from '@/lib/design/motion';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable as RNPressable, type PressableProps as RNPressableProps } from 'react-native';

export type PressableProps = RNPressableProps & {
  haptic?: boolean | 'selection' | 'light' | 'success' | 'warning' | 'error';
};

export function Pressable({ children, haptic = false, onPressIn, onPressOut, style, ...props }: PressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const haptics = useHaptics();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const triggerHaptic = () => {
    if (!haptic) return;
    const kind = haptic === true ? 'light' : haptic;
    void haptics[kind]();
  };
  return (
    <Animated.View style={animatedStyle}>
      <RNPressable
        {...props}
        onPressIn={(event) => {
          scale.value = withSpring(0.97, { damping: 20, stiffness: 300, mass: 1 });
          opacity.value = withSpring(0.9, { damping: 20, stiffness: 300, mass: 1 });
          triggerHaptic();
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.value = withSpring(1, { damping: 20, stiffness: 300, mass: 1 });
          opacity.value = withSpring(1, { damping: 20, stiffness: 300, mass: 1 });
          onPressOut?.(event);
        }}
        style={style}>
        {children}
      </RNPressable>
    </Animated.View>
  );
}
