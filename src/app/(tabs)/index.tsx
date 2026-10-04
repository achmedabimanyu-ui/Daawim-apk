import { router } from 'expo-router';
import { ArrowRight, BookOpen, Library, Quote, Repeat, ScrollText, UtensilsCrossed } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Celebration } from '@/components/Celebration';
import { ElKisaiCTA } from '@/components/ElKisaiCTA';
import { Flame } from '@/components/Flame';
import { HabitRow } from '@/components/HabitRow';
import { LogSheet } from '@/components/LogSheet';
import { PrayerCard } from '@/components/PrayerCard';
import { Button, Card, ProgressBar, SectionTitle, Txt } from '@/components/ui';
import { quotes, type Habit } from '@/lib/defaults';
import { todayKey } from '@/lib/date';
import { useT } from '@/lib/i18n';
import { dayRate, inPeriod, scheduled, streaks } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

function RichLine({ text, color, accent }: { text: string; color: string; accent: string }) {
  const parts = text.split(/\{b\}|\{\/b\}/);
  return (
    <Txt w="bold" size={15} color={color} style={{ lineHeight: 22 }}>
      {parts.map((p, i) => (i % 2 ? <Txt key={i} w="black" size={15} color={accent}>{p}</Txt> : p))}
    </Txt>
  );
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
  const { done, total, rate } = dayRate(state, today);
  const st = useMemo(() => streaks(state), [logs, state.habits, state.periods, settings.dailyGoal]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useRef(st.todayDone);
  useEffect(() => {
    if (!prev.current && st.todayDone) setCelebrate(true);
    prev.current = st.todayDone;
  }, [st.todayDone]);

  const q = quotes[lang][Math.floor(Date.now() / 86400000) % quotes[lang].length];
  const prod = [
    { id: 'tilawah', icon: BookOpen, unit: t('pages') },
    { id: 'murojaah', icon: Repeat, unit: t('pages') },
    { id: 'book', icon: Library, unit: t('pages') },
    { id: 'matan', icon: ScrollText, unit: t('verses') },
  ].filter((p) => state.habits.some((h) => h.id === p.id && h.active));
  const prodName = { tilawah: 'Tilawah', murojaah: lang === 'ar' ? 'المراجعة' : 'Murojaah', book: lang === 'id' ? 'Buku' : lang === 'ar' ? 'كتاب' : 'Book', matan: lang === 'ar' ? 'المتن' : 'Matan' } as Record<string, string>;
  const groups = state.categories
    .map((c) => ({ c, items: list.filter((h) => h.category === c.id) }))
    .filter((g) => g.items.length);
  const muslimah = settings.gender === 'muslimah';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
          {settings.photo ? (
            <Image source={{ uri: settings.photo }} style={{ width: 44, height: 44, borderRadius: 22 }} />
          ) : (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: th.accent.soft, alignItems: 'center', justifyContent: 'center' }}>
              <Txt w="black" size={18} color={th.accent.dark}>{(settings.name || 'D')[0].toUpperCase()}</Txt>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Txt w="regular" size={13} color={th.muted} style={{ textAlign: rtl ? 'right' : 'left' }}>{t('greeting')},</Txt>
            <Txt w="black" size={20} style={{ textAlign: rtl ? 'right' : 'left' }}>{settings.name || 'Daawim'}</Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 2, borderColor: th.border }}>
            <Flame size={22} lit={st.todayDone} animate={false} />
            <Txt w="black" size={16} color={st.todayDone ? th.flame : th.muted}>{st.current}</Txt>
          </View>
        </View>

        <Animated.View entering={FadeInDown.springify().damping(16)} style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 20 }}>
          <View style={{ flex: 1 }}>
            <Txt w="black" size={64} color={st.todayDone ? th.flame : th.faint} style={{ lineHeight: 70 }}>{st.current}</Txt>
            <Txt w="black" size={20} color={st.todayDone ? th.flame : th.muted}>{t('dayStreak')}</Txt>
            <Txt w="bold" size={13} color={th.muted} style={{ marginTop: 2 }}>{t('bestStreak')}: {st.best}</Txt>
          </View>
          <Flame size={96} lit={st.todayDone} />
        </Animated.View>

        <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Flame size={36} lit={st.todayDone} animate={false} />
          <View style={{ flex: 1 }}>
            <RichLine text={st.todayDone ? t('streakDone') : t('streakKeep')} color={th.muted} accent={th.flame} />
          </View>
        </Card>

        <SectionTitle right={<Txt w="black" size={14} color={th.accent.main}>{done}/{total} {t('ofDone')}</Txt>}>
          {t('todayHabits')}
        </SectionTitle>
        <ProgressBar value={rate} color={rate >= settings.dailyGoal ? th.flame : th.accent.main} />
        {muslimah && inPeriod(state.periods, today) && (
          <View style={{ marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: th.iceSoft }}>
            <Txt w="bold" size={13} color={th.iceDark}>{t('onPeriod')} · {t('udzurDays')}</Txt>
          </View>
        )}
        {groups.map(({ c, items }, gi) => (
          <Animated.View key={c.id} entering={FadeInDown.delay(80 * gi)}>
            <Txt w="black" size={13} color={th.muted} style={{ marginTop: 16, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
              {c.builtin ? t(c.builtin === 'ibadah' ? 'ibadah' : 'productivity') : c.name}
            </Txt>
            {items.map((h) => <HabitRow key={h.id} habit={h} date={today} onOpen={setOpen} />)}
          </Animated.View>
        ))}

        <SectionTitle>{t('prayers')}</SectionTitle>
        <PrayerCard />

        {prod.length > 0 && (
          <>
            <SectionTitle>{t('productivity')}</SectionTitle>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {prod.map((p) => {
                const I = p.icon;
                return (
                  <Card key={p.id} style={{ width: '48%', flexGrow: 1 }} pad={14}>
                    <I color={th.accent.main} size={22} strokeWidth={2.6} />
                    <Txt w="black" size={24} style={{ marginTop: 6 }}>{logs[today]?.[p.id]?.value ?? 0}</Txt>
                    <Txt w="regular" size={13} color={th.muted}>{prodName[p.id]} · {p.unit}</Txt>
                  </Card>
                );
              })}
            </View>
          </>
        )}

        {muslimah && fastDebt.total > 0 && (
          <>
            <SectionTitle>{t('fastDebt')}</SectionTitle>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <UtensilsCrossed color="#EC5B8F" strokeWidth={2.6} />
                <Txt w="black" size={18} style={{ flex: 1 }}>
                  {fastDebt.total - fastDebt.paid.length} {t('days')} {t('remaining')}
                </Txt>
                <Txt w="bold" size={13} color={th.muted}>{fastDebt.paid.length}/{fastDebt.total}</Txt>
              </View>
              <ProgressBar value={fastDebt.paid.length / fastDebt.total} color="#EC5B8F" />
            </Card>
          </>
        )}

        <SectionTitle>{t('summary')}</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            {[
              [`${Math.round(rate * 100)}%`, t('completionRate')],
              [`${done}`, t('done')],
              [`${st.best}`, t('bestStreak')],
            ].map(([v, l]) => (
              <View key={l} style={{ alignItems: 'center' }}>
                <Txt w="black" size={22} color={th.accent.main}>{v}</Txt>
                <Txt w="regular" size={12} color={th.muted}>{l}</Txt>
              </View>
            ))}
          </View>
          <Button
            variant="ghost"
            label={t('seeInsights')}
            icon={<ArrowRight color={th.accent.main} size={18} strokeWidth={3} />}
            onPress={() => router.push('/insights')}
          />
        </Card>

        <SectionTitle>{t('quote')}</SectionTitle>
        <Card style={{ backgroundColor: th.sunk, borderColor: th.sunk }}>
          <Quote color={th.accent.main} size={22} strokeWidth={2.6} />
          <Txt w="bold" size={16} style={{ marginTop: 8, lineHeight: 24 }}>{q.text}</Txt>
          <Txt w="regular" size={13} color={th.muted} style={{ marginTop: 6 }}>— {q.src}</Txt>
        </Card>
        <View style={{ marginTop: 24 }}>
          <ElKisaiCTA />
        </View>
      </ScrollView>
      <LogSheet habit={open} date={today} onClose={() => setOpen(null)} />
      <Celebration visible={celebrate} streak={st.current} onClose={() => setCelebrate(false)} />
    </SafeAreaView>
  );
}
