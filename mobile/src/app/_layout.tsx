import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding-profile" />
        <Stack.Screen name="onboarding-sports" />
        <Stack.Screen name="onboarding-skill" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game-details" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-search" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </ThemeProvider>
  );
}
