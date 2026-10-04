import { router } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitRow } from '@/components/HabitRow';
import { LogSheet } from '@/components/LogSheet';
import { StreakCalendar } from '@/components/StreakCalendar';
import { SectionTitle, Txt } from '@/components/ui';
import type { Habit } from '@/lib/defaults';
import { fromKey, rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort } from '@/lib/i18n';
import { dayStatus, scheduled } from '@/lib/stats';
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt w="black" size={28}>{t('habits')}</Txt>
          <Pressable
            onPress={() => router.push('/manage')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, backgroundColor: th.accent.soft }}
          >
            <SlidersHorizontal color={th.accent.main} size={16} strokeWidth={2.8} />
            <Txt size={13} color={th.accent.main}>{t('manage')}</Txt>
          </Pressable>
        </View>

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

      </ScrollView>

      <LogSheet habit={open} date={date} onClose={() => setOpen(null)} />
    </SafeAreaView>
  );
}
