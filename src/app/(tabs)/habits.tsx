import { router } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitRow } from '@/components/HabitRow';
import { LogSheet } from '@/components/LogSheet';
import { StreakCalendar } from '@/components/StreakCalendar';
import { WeekStrip } from '@/components/WeekStrip';
import { SectionTitle, Txt, softShadow } from '@/components/ui';
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt w="black" size={28}>{t('habits')}</Txt>
          <Pressable
            onPress={() => router.push('/manage')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, backgroundColor: th.card, ...softShadow(th.isDark) }}
          >
            <SlidersHorizontal color={th.accent.main} size={16} strokeWidth={2.8} />
            <Txt size={13} color={th.accent.main}>{t('manage')}</Txt>
          </Pressable>
        </View>

        <View style={{ marginTop: 16 }}>
          <WeekStrip value={date} onChange={setDate} />
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
