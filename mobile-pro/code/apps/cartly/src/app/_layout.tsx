import { SessionProvider, useSession } from '@pro/api';
import { ThemeProvider, ToastProvider, useProFonts, useTheme } from '@pro/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const TOKEN_KEY = 'cartly.token';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const { colors, scheme } = useTheme();
  const { ready, signedIn } = useSession();
  const [fontsLoaded, fontError] = useProFonts();
  const loaded = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" options={{ animation: 'fade' }} />
          <Stack.Screen name="products" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="reviews/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="order-confirmed/[id]" options={{ gestureEnabled: false }} />
          <Stack.Screen name="orders" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="return/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notifications" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider brand="cartly">
          <SessionProvider storageKey={TOKEN_KEY} storage={AsyncStorage}>
            <ToastProvider bottomOffset={120}>
              <RootStack />
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
