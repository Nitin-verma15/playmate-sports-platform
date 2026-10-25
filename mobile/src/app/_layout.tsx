import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="welcome">
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
