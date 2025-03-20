import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }}  />
      <ThemedView style={styles.container}>
        <ThemedText type="title" className='text-green-600'>This screen doesn't exist.</ThemedText>
        <Link href="/createTeam" style={styles.link}>
          <ThemedText type="link">Go to create team</ThemedText>
        </Link>
        <Link href="/workerHomepage" style={styles.link}>
          <ThemedText type="link">Go to worker app</ThemedText>
        </Link>
        <Link href="/createAccount/melike" style={styles.link}>
          <ThemedText type="link">Go to create account</ThemedText>
        </Link>
      </ThemedView>
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
