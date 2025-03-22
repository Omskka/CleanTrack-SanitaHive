import { Stack, Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { i18n } from '@/hooks/i18n';
import { Card, Heading, LinkText, Text } from '@gluestack-ui/themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: i18n.t('greeting') }}  />

      <Card size="md" variant="elevated" m="$3">
        <Heading mb="$1" size="md">
          Quick Start
        </Heading>
        <Text size="sm">Start building your next project in minutes</Text>
      </Card>

        <Heading>This screen doesn't exist.</Heading>
        <Link href="/createTeam" style={styles.link}>
          <LinkText >Go to create team</LinkText>
        </Link>
        <Link href="/workerHomepage" style={styles.link}>
          <LinkText >Go to worker app</LinkText>
        </Link>
        <Link href="/createAccount/melike" style={styles.link}>
          <LinkText >Go to create account</LinkText>
        </Link>
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
