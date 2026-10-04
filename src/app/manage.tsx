import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, HabitIcon, Press3D, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { categoryName, habitName, unitLabel } from '@/lib/labels';
import { habitStreak } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

export default function ManageHabits() {
  const th = useTheme();
  const { t, lang } = useT();
  const state = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable hitSlop={10} onPress={() => router.back()}>
          <ChevronLeft color={th.muted} size={28} strokeWidth={3} />
        </Pressable>
        <Txt w="black" size={22}>{t('manageHabits')}</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {state.categories.map((c) => {
          const items = state.habits.filter((h) => h.category === c.id);
          if (!items.length) return null;
          return (
            <View key={c.id} style={{ marginBottom: 18 }}>
              <Txt w="black" size={12} color={th.muted} style={{ marginBottom: 8, marginLeft: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
                {categoryName(c, lang)}
              </Txt>
              <Card pad={4}>
                {items.map((h, i) => (
                  <Pressable
                    key={h.id}
                    onPress={() => router.push({ pathname: '/habit/[id]', params: { id: h.id } })}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderTopWidth: i ? 1 : 0, borderColor: th.border }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: h.active ? th.accent.soft : th.sunk, alignItems: 'center', justifyContent: 'center' }}>
                      <HabitIcon name={h.icon} size={18} color={h.active ? th.accent.main : th.faint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt size={15} color={h.active ? th.text : th.muted}>{habitName(h, lang)}</Txt>
                      <Txt w="regular" size={12} color={th.muted}>
                        {h.kind === 'count' ? `${h.target} ${unitLabel(h.unit, t)} · ` : ''}
                        {habitStreak(h, state.logs)} {t('days')}
                      </Txt>
                    </View>
                    <Switch
                      value={h.active}
                      onValueChange={(v) => state.upsertHabit({ ...h, active: v })}
                      trackColor={{ true: th.accent.main, false: th.border }}
                      thumbColor="#fff"
                    />
                    <ChevronRight color={th.faint} size={18} />
                  </Pressable>
                ))}
              </Card>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 28 }}>
        <Press3D color={th.accent.main} edge={th.accent.dark} radius={18} onPress={() => router.push({ pathname: '/habit/[id]', params: { id: 'new' } })}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Plus color="#fff" size={20} strokeWidth={3.2} />
            <Txt w="black" size={15} color="#fff" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{t('addHabit')}</Txt>
          </View>
        </Press3D>
      </View>
    </SafeAreaView>
  );
}
