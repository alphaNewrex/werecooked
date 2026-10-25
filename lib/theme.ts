import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { tokens, type ColorScheme } from '@/lib/design';

export const THEME = {
  light: {
    background: tokens.colors.light.bg,
    foreground: tokens.colors.light.text,
    card: tokens.colors.light.surface,
    cardForeground: tokens.colors.light.text,
    popover: tokens.colors.light.surfaceRaised,
    popoverForeground: tokens.colors.light.text,
    primary: tokens.colors.light.primary,
    primaryForeground: tokens.colors.light.onPrimary,
    secondary: tokens.colors.light.surfaceMuted,
    secondaryForeground: tokens.colors.light.text,
    muted: tokens.colors.light.surfaceMuted,
    mutedForeground: tokens.colors.light.textMuted,
    accent: tokens.colors.light.surfaceMuted,
    accentForeground: tokens.colors.light.text,
    destructive: tokens.colors.light.danger,
    border: tokens.colors.light.border,
    input: tokens.colors.light.borderStrong,
    ring: tokens.colors.light.primary,
    radius: `${tokens.radius.md}px`,
  },
  dark: {
    background: tokens.colors.dark.bg,
    foreground: tokens.colors.dark.text,
    card: tokens.colors.dark.surface,
    cardForeground: tokens.colors.dark.text,
    popover: tokens.colors.dark.surfaceRaised,
    popoverForeground: tokens.colors.dark.text,
    primary: tokens.colors.dark.primary,
    primaryForeground: tokens.colors.dark.onPrimary,
    secondary: tokens.colors.dark.surfaceMuted,
    secondaryForeground: tokens.colors.dark.text,
    muted: tokens.colors.dark.surfaceMuted,
    mutedForeground: tokens.colors.dark.textMuted,
    accent: tokens.colors.dark.surfaceMuted,
    accentForeground: tokens.colors.dark.text,
    destructive: tokens.colors.dark.danger,
    border: tokens.colors.dark.border,
    input: tokens.colors.dark.borderStrong,
    ring: tokens.colors.dark.primary,
    radius: `${tokens.radius.md}px`,
  },
};

export const NAV_THEME: Record<ColorScheme, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

export function useResolvedScheme(): ColorScheme {
  const { colorScheme } = useColorScheme();
  const [scheme, setScheme] = useState<ColorScheme>(
    Platform.OS === 'web' ? 'light' : colorScheme === 'dark' ? 'dark' : 'light'
  );
  useEffect(() => {
    const resolved: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    setScheme(resolved);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    }
  }, [colorScheme]);
  return scheme;
}

export function useTheme() {
  const scheme = useResolvedScheme();
  return {
    scheme,
    colors: tokens.colors[scheme],
    type: tokens.type,
    radius: tokens.radius,
    iconSize: tokens.iconSize,
    elevation: tokens.elevation,
    motion: tokens.motion,
  };
}
