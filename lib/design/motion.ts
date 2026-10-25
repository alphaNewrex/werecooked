import * as Haptics from 'expo-haptics';
import {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
  withSpring,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { tokens } from '@/lib/design';

export type MotionDuration = keyof typeof tokens.motion.durations;
export type MotionCurve = keyof typeof tokens.motion.curves;
export type MotionSpring = keyof typeof tokens.motion.springs;

export function timing(
  duration: MotionDuration = 'base',
  curve: MotionCurve = 'standard',
  reducedMotion = false
) {
  return {
    duration: reducedMotion ? tokens.motion.reducedMotion.maxDuration : tokens.motion.durations[duration],
    easing: Easing.bezier(...tokens.motion.curves[curve]),
    reduceMotion: ReduceMotion.System,
  };
}

export function spring(name: MotionSpring = 'smooth', reducedMotion = false) {
  const config = tokens.motion.springs[name];
  return {
    ...config,
    duration: reducedMotion ? tokens.motion.reducedMotion.maxDuration : undefined,
    reduceMotion: ReduceMotion.System,
  };
}

export function enterAnimation(reducedMotion = false) {
  return FadeIn.duration(reducedMotion ? tokens.motion.reducedMotion.maxDuration : tokens.motion.durations.base)
    .easing(Easing.bezier(...tokens.motion.curves.enter))
    .reduceMotion(ReduceMotion.System);
}

export function exitAnimation(reducedMotion = false) {
  return FadeOut.duration(reducedMotion ? tokens.motion.reducedMotion.maxDuration : Math.round(tokens.motion.durations.base * 0.7))
    .easing(Easing.bezier(...tokens.motion.curves.exit))
    .reduceMotion(ReduceMotion.System);
}

export function layoutTransition(reducedMotion = false) {
  return LinearTransition.duration(reducedMotion ? tokens.motion.reducedMotion.maxDuration : tokens.motion.durations.base)
    .easing(Easing.bezier(...tokens.motion.curves.standard))
    .reduceMotion(ReduceMotion.System);
}

export function useMotionPreferences() {
  return { reducedMotion: useReducedMotion() };
}

export function useHaptics() {
  return {
    selection: () => Haptics.selectionAsync(),
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  };
}

export { withSpring, withTiming };
export type { AnimatedStyle };
