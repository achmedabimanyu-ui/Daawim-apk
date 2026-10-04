import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router/js-tabs';
import { ChartColumn, Droplets, House, ListChecks, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

const ICONS = { index: House, habits: ListChecks, insights: ChartColumn, haidh: Droplets, settings: Settings } as const;

function TabButton({ name, label, focused, onPress }: { name: keyof typeof ICONS; label: string; focused: boolean; onPress: () => void }) {
  const th = useTheme();
  const I = ICONS[name];
  const color = name === 'haidh' ? '#EC5B8F' : th.accent.main;
  return (
    <Pressable onPress={onPress} style={{ flex: focused ? 2.2 : 1, alignItems: 'center', paddingVertical: 8 }}>
      <Animated.View
        layout={LinearTransition.springify().damping(16)}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, borderRadius: 100,
          paddingHorizontal: focused ? 14 : 10, backgroundColor: focused ? `${color}22` : 'transparent',
        }}
      >
        <I color={focused ? color : th.muted} size={21} strokeWidth={2.4} />
        {focused && (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(80)}>
            <Txt w="bold" size={14} color={color} numberOfLines={1}>{label}</Txt>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const th = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const muslimah = useApp((s) => s.settings.gender === 'muslimah');
  const labels = { index: t('dashboard'), habits: t('habits'), insights: t('insights'), haidh: t('haidh'), settings: t('settings') };

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: th.bg } }}
      tabBar={({ state, navigation }) => (
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 10),
            backgroundColor: th.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderWidth: th.isDark ? 1 : 0, borderColor: th.border,
            shadowColor: '#1C2A3A', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12,
          }}
        >
          {state.routes
            .filter((r) => r.name !== 'haidh' || muslimah)
            .map((r) => {
              const focused = state.routes[state.index].key === r.key;
              return (
                <TabButton
                  key={r.key}
                  name={r.name as keyof typeof ICONS}
                  label={labels[r.name as keyof typeof labels]}
                  focused={focused}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    if (!focused) navigation.navigate(r.name);
                  }}
                />
              );
            })}
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="habits" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="haidh" options={{ href: muslimah ? undefined : null }} />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
