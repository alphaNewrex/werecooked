import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen scroll={false}>
        <View style={styles.container}>
        <Text variant="title">This screen doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text variant="body" tone="primary">Go to home screen!</Text>
        </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
