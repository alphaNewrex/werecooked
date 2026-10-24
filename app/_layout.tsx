import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { PantryProvider } from '@/lib/pantry';
import { NAV_THEME } from '@/lib/theme';
import '../global.css';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PantryProvider>
      <RootLayoutNav />
    </PantryProvider>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={NAV_THEME.light}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe" options={{ title: 'Recipe' }} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
