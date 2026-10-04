import { Check, TrendingDown, TrendingUp, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame } from '@/components/Flame';
import { StreakCalendar } from '@/components/StreakCalendar';
import { Card, HabitIcon, ProgressBar, SectionTitle, Segmented, Txt } from '@/components/ui';
import { fromKey, monthKeys, rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort, type Dict } from '@/lib/i18n';
import { habitName } from '@/lib/labels';
import { dayRate, isDone, rangeStats, scheduled, streaks } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

function Bar({ value, i, color, label }: { value: number; i: number; color: string; label: string }) {
  const th = useTheme();
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(i * 40, withSpring(value, { damping: 14 }));
  }, [value, i, h]);
  const st = useAnimatedStyle(() => ({ height: `${Math.max(4, h.value * 100)}%` }));
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ height: 120, width: '70%', justifyContent: 'flex-end', backgroundColor: th.sunk, borderRadius: 8 }}>
        <Animated.View style={[{ backgroundColor: value > 0 ? color : 'transparent', borderRadius: 8 }, st]} />
      </View>
      {!!label && <Txt w="bold" size={10} color={th.muted} style={{ marginTop: 4 }}>{label}</Txt>}
    </View>
  );
}

function Stat({ v, l, color }: { v: string; l: string; color?: string }) {
  const th = useTheme();
  return (
    <Card style={{ flex: 1 }} pad={14}>
      <Txt w="black" size={22} color={color ?? th.text}>{v}</Txt>
      <Txt w="regular" size={12} color={th.muted}>{l}</Txt>
    </Card>
  );
}

export default function Insights() {
  const th = useTheme();
  const { t, lang } = useT();
  const state = useApp();
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const today = todayKey();
  const st = streaks(state);
  const name = (id: string) => {
    const h = state.habits.find((x) => x.id === id);
    return h ? habitName(h, lang) : id;
  };
  const prodRows: [string, keyof Dict][] = [['tilawah', 'pages'], ['murojaah', 'pages'], ['book', 'pages'], ['matan', 'verses']];

  const renderTotals = (totals: Record<string, number>) => (
    <Card pad={6}>
      {prodRows.map(([id, unit], i) => (
        <View key={id} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10, borderTopWidth: i ? 2 : 0, borderColor: th.border }}>
          <HabitIcon name={state.habits.find((h) => h.id === id)?.icon ?? 'book-open'} color={th.accent.main} size={20} />
          <Txt size={14} style={{ flex: 1 }}>{name(id)}</Txt>
          <Txt w="black" size={16}>{totals[id] ?? 0} <Txt w="regular" size={12} color={th.muted}>{t(unit)}</Txt></Txt>
        </View>
      ))}
    </Card>
  );

  const renderBestWorst = (s: ReturnType<typeof rangeStats>) => (
    <View style={{ gap: 10 }}>
      {s.best && (
        <Card pad={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TrendingUp color={th.accent.main} strokeWidth={2.6} />
          <View style={{ flex: 1 }}>
            <Txt w="regular" size={12} color={th.muted}>{t('mostConsistent')}</Txt>
            <Txt size={15}>{name(s.best.id)}</Txt>
          </View>
          <Txt w="black" color={th.accent.main}>{Math.round(s.best.rate * 100)}%</Txt>
        </Card>
      )}
      {s.worst && s.worst.rate < 1 && (
        <Card pad={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TrendingDown color={th.danger} strokeWidth={2.6} />
          <View style={{ flex: 1 }}>
            <Txt w="regular" size={12} color={th.muted}>{t('oftenMissed')}</Txt>
            <Txt size={15}>{name(s.worst.id)}</Txt>
          </View>
          <Txt w="black" color={th.danger}>{Math.round(s.worst.rate * 100)}%</Txt>
        </Card>
      )}
    </View>
  );

  let body = null;
  if (tab === 'daily') {
    const list = scheduled(state, today);
    const r = dayRate(state, today);
    const prayers = list.filter((h) => h.prayer);
    body = (
      <>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat v={`${Math.round(r.rate * 100)}%`} l={t('completionRate')} color={th.accent.main} />
          <Stat v={`${r.done}/${r.total}`} l={t('done')} />
          <Stat v={`${st.current}`} l={t('streak')} color={th.flame} />
        </View>
        {prayers.length > 0 && (
          <>
            <SectionTitle>{t('prayers')}</SectionTitle>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {prayers.map((h) => {
                const d = isDone(h, state.logs, today);
                return (
                  <View key={h.id} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: d ? th.accent.main : th.border, backgroundColor: d ? th.accent.soft : th.card }}>
                    {d ? <Check color={th.accent.main} strokeWidth={4} size={20} /> : <X color={th.faint} strokeWidth={3} size={20} />}
                    <Txt size={11} color={th.muted} style={{ marginTop: 4 }}>{t(h.prayer!)}</Txt>
                  </View>
                );
              })}
            </View>
          </>
        )}
        <SectionTitle>{t('habits')}</SectionTitle>
        <Card pad={6}>
          {list.map((h, i) => {
            const d = isDone(h, state.logs, today);
            return (
              <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderTopWidth: i ? 2 : 0, borderColor: th.border }}>
                <HabitIcon name={h.icon} color={d ? th.accent.main : th.faint} size={20} />
                <Txt size={14} style={{ flex: 1 }} color={d ? th.text : th.muted}>{habitName(h, lang)}</Txt>
                <Txt w="black" size={13} color={d ? th.accent.main : th.faint}>{d ? t('done') : t('notDone')}</Txt>
              </View>
            );
          })}
        </Card>
        <SectionTitle>{t('productivity')}</SectionTitle>
        {renderTotals(Object.fromEntries(Object.entries(state.logs[today] ?? {}).map(([k, v]) => [k, v.value])))}
      </>
    );
  } else if (tab === 'weekly') {
    const keys = rangeKeys(today, 7);
    const s = rangeStats(state, keys);
    body = (
      <>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat v={`${Math.round(s.rate * 100)}%`} l={t('completionRate')} color={th.accent.main} />
          <Stat v={`${s.done}`} l={t('totalDone')} />
          <Stat v={`${st.current}`} l={t('streak')} color={th.flame} />
        </View>
        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row' }}>
            {keys.map((k, i) => {
              const r = dayRate(state, k).rate;
              return <Bar key={k} i={i} value={r} color={r >= state.settings.dailyGoal ? th.flame : th.accent.main} label={weekdayShort[lang][fromKey(k).getDay()]} />;
            })}
          </View>
        </Card>
        <SectionTitle>{t('habits')}</SectionTitle>
        {renderBestWorst(s)}
        <SectionTitle>{t('productivity')}</SectionTitle>
        {renderTotals(s.totals)}
      </>
    );
  } else {
    const d = new Date();
    const keys = monthKeys(d.getFullYear(), d.getMonth());
    const prevKeys = monthKeys(d.getMonth() ? d.getFullYear() : d.getFullYear() - 1, (d.getMonth() + 11) % 12);
    const s = rangeStats(state, keys);
    const p = rangeStats(state, prevKeys);
    const delta = Math.round((s.rate - p.rate) * 100);
    body = (
      <>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat v={`${Math.round(s.rate * 100)}%`} l={t('completionRate')} color={th.accent.main} />
          <Stat v={p.total ? `${delta >= 0 ? '+' : ''}${delta}%` : '—'} l={t('vsLastMonth')} color={!p.total ? th.muted : delta >= 0 ? th.accent.main : th.danger} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Stat v={`${s.done}`} l={t('totalDone')} />
          <Stat v={`${s.activeDays}`} l={t('daysActive')} />
          <Stat v={`${st.best}`} l={t('bestStreak')} color={th.flame} />
        </View>
        <Card style={{ marginTop: 14 }} pad={10}>
          <View style={{ flexDirection: 'row' }}>
            {keys.map((k, i) => {
              const r = k <= today ? dayRate(state, k).rate : 0;
              return <Bar key={k} i={i} value={r} color={r >= state.settings.dailyGoal ? th.flame : th.accent.main} label={(i + 1) % 5 === 0 ? String(i + 1) : ''} />;
            })}
          </View>
        </Card>
        <View style={{ marginTop: 20 }}>
          <StreakCalendar showStats />
        </View>
        <SectionTitle>{t('habits')}</SectionTitle>
        {renderBestWorst(s)}
        <SectionTitle>{t('productivity')}</SectionTitle>
        {renderTotals(s.totals)}
        <View style={{ marginTop: 14 }}>
          <ProgressBar value={s.rate} color={th.accent.main} />
        </View>
      </>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
        <Txt w="black" size={28} style={{ flex: 1 }}>{t('insights')}</Txt>
        <Flame size={28} lit={st.todayDone} animate={false} />
        <Txt w="black" size={18} color={st.todayDone ? th.flame : th.muted}>{st.current}</Txt>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Segmented
          options={[{ key: 'daily', label: t('daily') }, { key: 'weekly', label: t('weekly') }, { key: 'monthly', label: t('monthly') }]}
          value={tab}
          onChange={setTab}
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Animated.View key={tab} entering={FadeIn.duration(250)}>{body}</Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
