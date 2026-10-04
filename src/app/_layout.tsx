import { Cairo_500Medium, Cairo_700Bold, Cairo_800ExtraBold } from '@expo-google-fonts/cairo';
import {
  Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black, useFonts,
} from '@expo-google-fonts/nunito';
import {
  PlusJakartaSans_500Medium, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { syncNotifications } from '@/lib/notify';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fonts] = useFonts({
    Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black,
    PlusJakartaSans_500Medium, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    Cairo_500Medium, Cairo_700Bold, Cairo_800ExtraBold,
  });
  const [hydrated, setHydrated] = useState(useApp.persist.hasHydrated());
  useEffect(() => useApp.persist.onFinishHydration(() => setHydrated(true)), []);
  const th = useTheme();
  const ready = fonts && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const settings = useApp((s) => s.settings);
  useEffect(() => {
    if (hydrated) syncNotifications(settings).catch(() => {});
  }, [hydrated, settings.notify, settings.prayer, settings.lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: th.bg }}>
      <StatusBar style={th.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: th.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="habit/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
