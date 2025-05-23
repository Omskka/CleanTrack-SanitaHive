import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LogBox, BackHandler } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Ignore specific warning logs in development
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested inside plain ScrollViews',
  ]);

  useEffect(() => {
    // Disable hardware back button on Android (prevents navigating back)
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true // Returning true disables the default back action
    );
    return () => backHandler.remove();
  }, []);

  // Load custom fonts before rendering the app
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Hide splash screen once fonts are loaded
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // If fonts are not loaded, render nothing (keep splash screen)
  if (!loaded) {
    return null;
  }

  return (
    // Provide language context to the whole app
    <LanguageProvider>
      {/* Provide Gluestack UI theme to the app */}
      <GluestackUIProvider config={config}>
        {/* Define navigation stack and hide default headers */}
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
        {/* Set status bar style */}
        <StatusBar style="light" />
      </GluestackUIProvider>
    </LanguageProvider>
  );
}