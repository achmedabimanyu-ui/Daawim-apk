import { ChevronLeft, ChevronRight, Droplets, Minus, Plus, UtensilsCrossed } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ProgressBar, Press3D, SectionTitle, Txt } from '@/components/ui';
import { addDays, diffDays, fromKey, monthKeys, todayKey } from '@/lib/date';
import { monthNames, useT, weekdayShort } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

const ROSE = '#EC5B8F';
const ROSE_D = '#C9406F';
const ROSE_S = '#FCE3EC';

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (n: number) => void; min?: number }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable hitSlop={8} onPress={() => onChange(Math.max(min, value - 1))} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: th.border, alignItems: 'center', justifyContent: 'center' }}>
        <Minus size={16} color={th.text} strokeWidth={3} />
      </Pressable>
      <Txt w="black" size={18} style={{ minWidth: 28, textAlign: 'center' }}>{value}</Txt>
      <Pressable hitSlop={8} onPress={() => onChange(value + 1)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: ROSE, alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={16} color="#fff" strokeWidth={3} />
      </Pressable>
    </View>
  );
}

export default function Haidh() {
  const th = useTheme();
  const { t, lang } = useT();
  const { periods, cycle, fastDebt, startPeriod, endPeriod, setCycle, setDebtTotal, payDebt, unpayDebt } = useApp();
  const today = todayKey();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const current = periods.find((p) => !p.end);
  const done = periods.filter((p) => p.end);
  const starts = periods.map((p) => p.start);
  const gaps = starts.slice(1).map((s, i) => diffDays(starts[i], s)).filter((g) => g > 10 && g < 60);
  const avgCycle = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : cycle.cycleLen;
  const durs = done.map((p) => diffDays(p.start, p.end!) + 1);
  const avgDur = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : cycle.periodLen;
  const last = starts[starts.length - 1];
  let next = last ? addDays(last, avgCycle) : undefined;
  while (next && next < today && !current) next = addDays(next, avgCycle);
  const inDays = next ? diffDays(today, next) : undefined;

  const isPeriod = (k: string) => periods.some((p) => k >= p.start && k <= (p.end ?? today));
  const isPredicted = (k: string) => !!next && k >= next && k < addDays(next, avgDur) && !isPeriod(k);

  const keys = monthKeys(ym.y, ym.m);
  const cells: (string | null)[] = [...Array(fromKey(keys[0]).getDay()).fill(null), ...keys];
  while (cells.length % 7) cells.push(null);
  const shift = (d: number) => {
    const n = new Date(ym.y, ym.m + d, 1);
    setYm({ y: n.getFullYear(), m: n.getMonth() });
  };

  const remaining = fastDebt.total - fastDebt.paid.length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Txt w="black" size={28}>{t('haidhTracker')}</Txt>

        <Animated.View entering={FadeInDown.springify().damping(16)} style={{ marginTop: 16, borderRadius: 24, backgroundColor: ROSE, borderBottomWidth: 5, borderColor: ROSE_D, padding: 20, alignItems: 'center' }}>
          <Animated.View entering={ZoomIn.delay(150).springify()} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets color="#fff" size={32} strokeWidth={2.6} />
          </Animated.View>
          {current ? (
            <>
              <Txt w="black" size={30} color="#fff" style={{ marginTop: 10 }}>{t('dayN', { n: diffDays(current.start, today) + 1 })}</Txt>
              <Txt w="bold" size={14} color="rgba(255,255,255,0.9)">{t('onPeriod')}</Txt>
            </>
          ) : (
            <>
              <Txt w="black" size={30} color="#fff" style={{ marginTop: 10 }}>{inDays != null ? `${inDays} ${t('days')}` : '—'}</Txt>
              <Txt w="bold" size={14} color="rgba(255,255,255,0.9)">{t('nextPeriod')}</Txt>
            </>
          )}
          <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
            <Press3D color="#fff" edge="#F2C4D5" onPress={() => (current ? endPeriod(today) : startPeriod(today))}>
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Txt w="black" size={15} color={ROSE_D} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{current ? t('endPeriod') : t('startPeriod')}</Txt>
              </View>
            </Press3D>
          </View>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Card style={{ flex: 1 }} pad={14}>
            <Txt w="black" size={22} color={ROSE}>{avgCycle} <Txt w="bold" size={13} color={th.muted}>{t('days')}</Txt></Txt>
            <Txt w="regular" size={12} color={th.muted}>{t('avgCycle')}</Txt>
          </Card>
          <Card style={{ flex: 1 }} pad={14}>
            <Txt w="black" size={22} color={ROSE}>{avgDur} <Txt w="bold" size={13} color={th.muted}>{t('days')}</Txt></Txt>
            <Txt w="regular" size={12} color={th.muted}>{t('avgDuration')}</Txt>
          </Card>
        </View>

        <Card style={{ marginTop: 14 }} pad={12}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
            <Txt w="black" size={18}>{monthNames[lang][ym.m]} {ym.y}</Txt>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable hitSlop={10} onPress={() => shift(-1)}><ChevronLeft color={th.muted} strokeWidth={3} /></Pressable>
              <Pressable hitSlop={10} onPress={() => shift(1)}><ChevronRight color={th.muted} strokeWidth={3} /></Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {weekdayShort[lang].map((d) => <Txt key={d} size={12} color={th.muted} style={{ flex: 1, textAlign: 'center' }}>{d}</Txt>)}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((k, i) => {
              const p = k && isPeriod(k);
              const pr = k && isPredicted(k);
              return (
                <View key={i} style={{ width: `${100 / 7}%`, height: 42, alignItems: 'center', justifyContent: 'center' }}>
                  {k && (
                    <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: p ? ROSE : pr ? ROSE_S : 'transparent', borderWidth: k === today ? 2 : pr ? 2 : 0, borderStyle: pr ? 'dashed' : 'solid', borderColor: k === today ? th.text : ROSE }}>
                      <Txt w="black" size={14} color={p ? '#fff' : pr ? ROSE_D : th.text}>{Number(k.slice(8))}</Txt>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Card>

        <SectionTitle>{t('cycleSettings')}</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Txt size={15}>{t('cycleLength')}</Txt>
            <Stepper value={cycle.cycleLen} min={15} onChange={(n) => setCycle({ cycleLen: n })} />
          </View>
          <View style={{ height: 2, backgroundColor: th.border, marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Txt size={15}>{t('periodLength')}</Txt>
            <Stepper value={cycle.periodLen} min={1} onChange={(n) => setCycle({ periodLen: n })} />
          </View>
        </Card>

        <SectionTitle>{t('fastDebt')}</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: ROSE_S, alignItems: 'center', justifyContent: 'center' }}>
              <UtensilsCrossed color={ROSE} strokeWidth={2.6} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="black" size={26}>{remaining}</Txt>
              <Txt w="regular" size={13} color={th.muted}>{t('days')} {t('remaining')}</Txt>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt w="bold" size={12} color={th.muted}>{t('totalDebt')}</Txt>
              <Stepper value={fastDebt.total} min={fastDebt.paid.length} onChange={setDebtTotal} />
            </View>
          </View>
          <View style={{ marginVertical: 16 }}>
            <ProgressBar value={fastDebt.total ? fastDebt.paid.length / fastDebt.total : 0} color={ROSE} />
            <Txt w="bold" size={12} color={th.muted} style={{ marginTop: 6 }}>{fastDebt.paid.length} {t('paid')}</Txt>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {Array.from({ length: fastDebt.total }, (_, i) => (
              <View key={i} style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: i < fastDebt.paid.length ? ROSE : th.sunk, borderWidth: 2, borderColor: i < fastDebt.paid.length ? ROSE_D : th.border }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button style={{ flex: 1 }} variant="ghost" label={t('undo')} disabled={!fastDebt.paid.length} onPress={unpayDebt} />
            <Button style={{ flex: 2 }} label={t('payToday')} disabled={remaining <= 0} onPress={() => payDebt(today)} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
