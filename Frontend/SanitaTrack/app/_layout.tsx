import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { LogBox, BackHandler } from 'react-native';

// the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested inside plain ScrollViews',
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true 
    );
    return () => backHandler.remove();
  }, []);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <LanguageProvider>
      <GluestackUIProvider config={config}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="createTeam" />
          <Stack.Screen name="createAccount" />
          <Stack.Screen name="workerHomepage" />
          <Stack.Screen name="(manager)" />
          <Stack.Screen name="feedback" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </GluestackUIProvider>
    </LanguageProvider>
  );
}
