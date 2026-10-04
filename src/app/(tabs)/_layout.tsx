import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router/js-tabs';
import { ChartColumn, Droplets, House, ListChecks, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

const ICONS = { index: House, habits: ListChecks, insights: ChartColumn, haidh: Droplets, settings: Settings } as const;

function TabButton({ name, label, focused, onPress }: { name: keyof typeof ICONS; label: string; focused: boolean; onPress: () => void }) {
  const th = useTheme();
  const I = ICONS[name];
  const color = name === 'haidh' && focused ? '#EC5B8F' : focused ? th.accent.main : th.muted;
  const style = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(focused ? 1.08 : 1, { damping: 10 }) }] }));
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingTop: 8 }}>
      <Animated.View
        style={[
          { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 2, borderColor: focused ? color : 'transparent', backgroundColor: focused ? `${color}1A` : 'transparent' },
          style,
        ]}
      >
        <I color={color} size={22} strokeWidth={2.6} />
      </Animated.View>
      <Txt w="bold" size={11} color={color} style={{ marginTop: 3 }}>{label}</Txt>
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
        <View style={{ flexDirection: 'row', backgroundColor: th.bg, borderTopWidth: 2, borderTopColor: th.border, paddingBottom: Math.max(insets.bottom, 10) }}>
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
