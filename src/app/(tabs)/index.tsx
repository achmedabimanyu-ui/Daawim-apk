import { router } from 'expo-router';
import { ChevronRight, Moon, Sun, Sunrise, Sunset } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Celebration } from '@/components/Celebration';
import { MonthDots, ProgressChart, ProgressHero, StatTile } from '@/components/DashboardParts';
import { Flame } from '@/components/Flame';
import { HabitRow } from '@/components/HabitRow';
import { LogSheet } from '@/components/LogSheet';
import { PrayerCard } from '@/components/PrayerCard';
import { Card, Txt, softShadow } from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { quotes, type Habit } from '@/lib/defaults';
import { todayKey } from '@/lib/date';
import { useT } from '@/lib/i18n';
import { dayRate, isDone, scheduled, streaks } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

function TimeIcon() {
  const h = new Date().getHours();
  if (h < 6) return <Moon color="#7C6CF0" size={24} strokeWidth={2.4} />;
  if (h < 11) return <Sunrise color="#F5A524" size={24} strokeWidth={2.4} />;
  if (h < 17) return <Sun color="#F5A524" size={24} strokeWidth={2.4} />;
  if (h < 19) return <Sunset color="#F07A2E" size={24} strokeWidth={2.4} />;
  return <Moon color="#7C6CF0" size={24} strokeWidth={2.4} />;
}

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
  const { rate, done, total } = dayRate(state, today);
  const st = useMemo(() => streaks(state), [logs, state.habits, state.periods, settings.dailyGoal]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useRef(st.todayDone);
  useEffect(() => {
    if (!prev.current && st.todayDone) setCelebrate(true);
    prev.current = st.todayDone;
  }, [st.todayDone]);

  const prayers = list.filter((h) => h.prayer);
  const prayersDone = prayers.filter((h) => isDone(h, logs, today)).length;
  const tilawah = state.habits.find((h) => h.id === 'tilawah');
  const tilawahVal = logs[today]?.tilawah?.value ?? 0;

  const q = quotes[lang][Math.floor(Date.now() / 86400000) % quotes[lang].length];
  const muslimah = settings.gender === 'muslimah';
  const row = rtl ? 'row-reverse' : 'row';
  const align = rtl ? 'right' : 'left';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: row, alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Txt w="bold" size={14} color={th.muted} style={{ textAlign: align }}>{t('greeting')},</Txt>
            <View style={{ flexDirection: row, alignItems: 'center', gap: 8 }}>
              <Txt w="black" size={28} style={{ letterSpacing: -0.6 }} numberOfLines={1}>{settings.name || 'Daawim'}</Txt>
              <TimeIcon />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 44, borderRadius: 16, backgroundColor: th.card, ...softShadow(th.isDark) }}>
            <Flame size={22} lit={st.todayDone} animate={st.todayDone} />
            <Txt w="black" size={16} color={st.todayDone ? th.flame : th.muted}>{st.current}</Txt>
          </View>
          <Pressable onPress={() => router.navigate('/(tabs)/settings')}>
            {settings.photo ? (
              <Image source={{ uri: settings.photo }} style={{ width: 44, height: 44, borderRadius: 16 }} />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: th.accent.main, alignItems: 'center', justifyContent: 'center' }}>
                <Txt w="black" size={17} color="#fff">{(settings.name || 'D')[0].toUpperCase()}</Txt>
              </View>
            )}
          </Pressable>
        </View>

        <View style={{ marginTop: 18 }}>
          <WeekStrip onChange={() => router.navigate('/(tabs)/habits')} />
        </View>

        <Animated.View entering={FadeInDown.springify().damping(16)}>
          <Card pad={18} style={{ marginTop: 18, borderRadius: 28 }}>
            <View style={{ flexDirection: row, alignItems: 'center', gap: 14 }}>
              <View style={{ flex: 1 }}>
                <Txt w="black" size={22} style={{ textAlign: align }}>{t('today')}</Txt>
                <Txt w="regular" size={13.5} color={th.muted} style={{ marginTop: 4, textAlign: align }}>
                  {t('completedOf', { done, total })}
                </Txt>
                <View style={{ flexDirection: row, alignItems: 'center', gap: 6, marginTop: 12 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, backgroundColor: st.todayDone ? th.flameSoft : th.sunk }}>
                    <Txt w="bold" size={12} color={st.todayDone ? th.flame : th.muted}>
                      {st.todayDone ? t('congrats') : `${t('dailyGoal')} ${Math.round(settings.dailyGoal * 100)}%`}
                    </Txt>
                  </View>
                </View>
              </View>
              <Pressable onPress={() => router.navigate('/(tabs)/habits')}>
                <ProgressHero value={rate} label="" size={118} />
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <StatTile
            label={t('streak')}
            value={`${st.current}`}
            caption={`${t('bestStreak')} ${st.best} ${t('days')}`}
            progress={st.best ? st.current / st.best : 0}
            color={th.flame}
          />
          <StatTile
            label={t('prayers')}
            value={`${prayersDone}/${prayers.length || 5}`}
            caption={t('fardhu')}
            progress={prayers.length ? prayersDone / prayers.length : 0}
            color={th.accent.main}
          />
        </View>
        {tilawah?.active && (
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <StatTile
              label="Tilawah"
              value={`${Math.round((tilawahVal / Math.max(1, tilawah.target)) * 100)}%`}
              caption={`${tilawahVal} / ${tilawah.target} ${t('pages')}`}
              progress={tilawahVal / Math.max(1, tilawah.target)}
              color="#8B5CF6"
            />
            {muslimah && fastDebt.total > 0 ? (
              <StatTile
                label={t('fastDebt')}
                value={`${fastDebt.total - fastDebt.paid.length}`}
                caption={`${fastDebt.paid.length} ${t('paid')}`}
                progress={fastDebt.paid.length / fastDebt.total}
                color="#EC5B8F"
              />
            ) : (
              <StatTile
                label={t('completionRate')}
                value={`${Math.round(rate * 100)}%`}
                caption={`${done} / ${total} ${t('ofDone')}`}
                progress={rate}
                color="#0FA3B1"
              />
            )}
          </View>
        )}

        <View style={{ marginTop: 12 }}>
          <PrayerCard />
        </View>

        <View style={{ flexDirection: row, alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 }}>
          <Txt w="black" size={20} style={{ textAlign: align }}>{t('remainingToday')}</Txt>
          <Pressable hitSlop={8} onPress={() => router.navigate('/(tabs)/habits')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, backgroundColor: th.card, ...softShadow(th.isDark) }}>
            <Txt size={13} color={th.accent.main}>{t('seeAll')}</Txt>
            <ChevronRight color={th.accent.main} size={16} strokeWidth={3} />
          </Pressable>
        </View>
        {next.length ? (
          next.map((h, i) => (
            <Animated.View key={h.id} entering={FadeInDown.delay(i * 60).springify().damping(16)}>
              <HabitRow habit={h} date={today} onOpen={setOpen} />
            </Animated.View>
          ))
        ) : (
          <Card pad={16} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Flame size={30} />
            <Txt size={15} style={{ flex: 1 }}>{t('allDone')}</Txt>
          </Card>
        )}

        <View style={{ marginTop: 14 }}>
          <ProgressChart />
        </View>

        <Card pad={16} style={{ marginTop: 14 }}>
          <MonthDots />
        </Card>

        <Card pad={18} style={{ marginTop: 14 }}>
          <Txt w="black" size={13} color={th.accent.main} style={{ textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>{t('quote')}</Txt>
          <Txt w="bold" size={15.5} style={{ lineHeight: 24, textAlign: 'center', marginTop: 8 }}>“{q.text}”</Txt>
          <Txt w="regular" size={12.5} color={th.muted} style={{ marginTop: 6, textAlign: 'center' }}>{q.src}</Txt>
        </Card>
      </ScrollView>
      <LogSheet habit={open} date={today} onClose={() => setOpen(null)} />
      <Celebration visible={celebrate} streak={st.current} onClose={() => setCelebrate(false)} />
    </SafeAreaView>
  );
}
