import { router } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitRow } from '@/components/HabitRow';
import { LogSheet } from '@/components/LogSheet';
import { StreakCalendar } from '@/components/StreakCalendar';
import { Card, HabitIcon, Press3D, SectionTitle, Txt } from '@/components/ui';
import type { Habit } from '@/lib/defaults';
import { fromKey, rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort } from '@/lib/i18n';
import { categoryName, habitName } from '@/lib/labels';
import { dayStatus, habitStreak, scheduled } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

export default function Habits() {
  const th = useTheme();
  const { t, lang } = useT();
  const state = useApp();
  const [date, setDate] = useState(todayKey());
  const [open, setOpen] = useState<Habit | null>(null);
  const week = rangeKeys(todayKey(), 7);
  const list = scheduled(state, date);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Txt w="black" size={28}>{t('habits')}</Txt>

        <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
          {week.map((k) => {
            const on = k === date;
            const st = dayStatus(state, k);
            const dot = st === 'goal' ? th.flame : st === 'udzur' ? th.ice : st === 'partial' ? th.accent.main : 'transparent';
            return (
              <Pressable key={k} onPress={() => setDate(k)} style={{ flex: 1 }}>
                <View style={{ alignItems: 'center', paddingVertical: 10, borderRadius: 14, borderWidth: 2, borderBottomWidth: on ? 4 : 2, borderColor: on ? th.accent.main : th.border, backgroundColor: on ? th.accent.soft : th.card }}>
                  <Txt w="bold" size={11} color={on ? th.accent.dark : th.muted}>{weekdayShort[lang][fromKey(k).getDay()]}</Txt>
                  <Txt w="black" size={17} color={on ? th.accent.dark : th.text}>{Number(k.slice(8))}</Txt>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot, marginTop: 3 }} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <Animated.View key={date} entering={FadeIn} style={{ marginTop: 16 }}>
          {list.length === 0 && <Txt w="regular" color={th.muted}>{t('nothingYet')}</Txt>}
          {list.map((h) => <HabitRow key={h.id} habit={h} date={date} onOpen={setOpen} />)}
        </Animated.View>

        <SectionTitle>{t('streak')}</SectionTitle>
        <StreakCalendar />

        <SectionTitle>{t('manageHabits')}</SectionTitle>
        {state.categories.map((c) => {
          const items = state.habits.filter((h) => h.category === c.id);
          if (!items.length) return null;
          return (
            <View key={c.id} style={{ marginBottom: 12 }}>
              <Txt w="black" size={13} color={th.muted} style={{ marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{categoryName(c, lang)}</Txt>
              <Card pad={4}>
                {items.map((h, i) => (
                  <Pressable
                    key={h.id}
                    onPress={() => router.push({ pathname: '/habit/[id]', params: { id: h.id } })}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderTopWidth: i ? 2 : 0, borderColor: th.border }}
                  >
                    <HabitIcon name={h.icon} color={h.active ? th.accent.main : th.faint} />
                    <View style={{ flex: 1 }}>
                      <Txt size={15} color={h.active ? th.text : th.muted}>{habitName(h, lang)}</Txt>
                      <Txt w="regular" size={12} color={th.muted}>{habitStreak(h, state.logs)} {t('days')} {t('streak').toLowerCase()}</Txt>
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

      <View style={{ position: 'absolute', right: 20, bottom: 20 }}>
        <Press3D color={th.accent.main} edge={th.accent.dark} radius={30} onPress={() => router.push({ pathname: '/habit/[id]', params: { id: 'new' } })}>
          <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
            <Plus color="#fff" size={28} strokeWidth={3.2} />
          </View>
        </Press3D>
      </View>
      <LogSheet habit={open} date={date} onClose={() => setOpen(null)} />
    </SafeAreaView>
  );
}
