import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Celebration } from '@/components/Celebration';
import { MonthDots, ProgressChart, ProgressHero } from '@/components/DashboardParts';
import { Flame } from '@/components/Flame';
import { HabitRow } from '@/components/HabitRow';
import { LogSheet } from '@/components/LogSheet';
import { PrayerCard } from '@/components/PrayerCard';
import { Card, SectionTitle, Txt } from '@/components/ui';
import { quotes, type Habit } from '@/lib/defaults';
import { todayKey } from '@/lib/date';
import { useT } from '@/lib/i18n';
import { dayRate, isDone, scheduled, streaks } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

export default function Dashboard() {
  const th = useTheme();
  const { t, lang, rtl } = useT();
  const state = useApp();
  const { settings, logs, fastDebt } = state;
  const today = todayKey();
  const [open, setOpen] = useState<Habit | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const list = scheduled(state, today);
  const next = list.filter((h) => !isDone(h, logs, today)).slice(0, 3);
  const { rate } = dayRate(state, today);
  const st = useMemo(() => streaks(state), [logs, state.habits, state.periods, settings.dailyGoal]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useRef(st.todayDone);
  useEffect(() => {
    if (!prev.current && st.todayDone) setCelebrate(true);
    prev.current = st.todayDone;
  }, [st.todayDone]);

  const q = quotes[lang][Math.floor(Date.now() / 86400000) % quotes[lang].length];
  const muslimah = settings.gender === 'muslimah';
  const row = rtl ? 'row-reverse' : 'row';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: row, alignItems: 'center', gap: 10 }}>
          {settings.photo ? (
            <Image source={{ uri: settings.photo }} style={{ width: 38, height: 38, borderRadius: 19 }} />
          ) : (
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: th.accent.soft, alignItems: 'center', justifyContent: 'center' }}>
              <Txt w="black" size={16} color={th.accent.main}>{(settings.name || 'D')[0].toUpperCase()}</Txt>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Txt w="regular" size={13} color={th.muted} style={{ textAlign: rtl ? 'right' : 'left' }}>{t('greeting')},</Txt>
            <Txt w="black" size={18} style={{ textAlign: rtl ? 'right' : 'left' }}>{settings.name || 'Daawim'}</Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: st.todayDone ? th.flameSoft : th.sunk }}>
            <Flame size={20} lit={st.todayDone} animate={false} />
            <Txt w="black" size={15} color={st.todayDone ? th.flame : th.muted}>{st.current}</Txt>
          </View>
        </View>

        <Animated.View entering={FadeInDown.springify().damping(16)} style={{ marginTop: 18 }}>
          <Pressable onPress={() => router.navigate('/(tabs)/habits')}>
            <ProgressHero value={rate} label={t('todayProgress')} />
          </Pressable>
          <Txt w="bold" size={14} color={th.muted} style={{ textAlign: 'center', marginTop: 10 }}>
            {st.current} {t('dayStreak')} · {t('bestStreak')} {st.best}
          </Txt>
        </Animated.View>

        <SectionTitle
          right={
            <Pressable hitSlop={8} onPress={() => router.navigate('/(tabs)/habits')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Txt size={13} color={th.accent.main}>{t('seeAll')}</Txt>
              <ChevronRight color={th.accent.main} size={16} strokeWidth={3} />
            </Pressable>
          }
        >
          {t('remainingToday')}
        </SectionTitle>
        {next.length ? (
          next.map((h) => <HabitRow key={h.id} habit={h} date={today} onOpen={setOpen} />)
        ) : (
          <Card pad={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Flame size={24} lit animate={false} />
            <Txt size={14}>{t('allDone')}</Txt>
          </Card>
        )}

        <View style={{ marginTop: 14 }}>
          <PrayerCard />
        </View>

        {muslimah && fastDebt.total > 0 && (
          <Pressable onPress={() => router.navigate('/(tabs)/haidh')}>
            <Card pad={14} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
              <Txt size={14} style={{ flex: 1 }}>{t('fastDebt')}</Txt>
              <Txt w="black" size={14} color="#EC5B8F">{fastDebt.total - fastDebt.paid.length} {t('days')} {t('remaining')}</Txt>
            </Card>
          </Pressable>
        )}

        <View style={{ marginTop: 22 }}>
          <ProgressChart />
        </View>

        <View style={{ marginTop: 26 }}>
          <MonthDots />
        </View>

        <Card pad={16} style={{ marginTop: 24 }}>
          <Txt w="bold" size={15} style={{ lineHeight: 22, textAlign: 'center' }}>“{q.text}”</Txt>
          <Txt w="regular" size={12} color={th.muted} style={{ marginTop: 6, textAlign: 'center' }}>{q.src}</Txt>
        </Card>
      </ScrollView>
      <LogSheet habit={open} date={today} onClose={() => setOpen(null)} />
      <Celebration visible={celebrate} streak={st.current} onClose={() => setCelebrate(false)} />
    </SafeAreaView>
  );
}
