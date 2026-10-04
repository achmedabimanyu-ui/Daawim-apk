import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { addDays, fromKey, monthKeys, rangeKeys, todayKey } from '@/lib/date';
import { monthNames, useT, weekdayShort } from '@/lib/i18n';
import { dayRate, dayStatus } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Card, Segmented, Txt } from './ui';

const ACircle = Animated.createAnimatedComponent(Circle);

export function ProgressHero({ value, label }: { value: number; label: string }) {
  const th = useTheme();
  const size = 168;
  const R = 74;
  const C = 2 * Math.PI * R;
  const p = useSharedValue(0);
  const pop = useSharedValue(0.85);
  useEffect(() => {
    p.value = withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [value, p]);
  useEffect(() => {
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
  }, [pop]);
  const ring = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - Math.max(0.02, p.value)) }));
  const scale = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Animated.View style={[{ width: size, height: size, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }, scale]}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={R} stroke={th.accent.soft} strokeWidth={12} fill="none" />
        <ACircle cx={size / 2} cy={size / 2} r={R} stroke={th.accent.main} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={C} animatedProps={ring} />
      </Svg>
      <View style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: th.accent.main, alignItems: 'center', justifyContent: 'center' }}>
        <Txt w="black" size={38} color="#fff">{Math.round(value * 100)}%</Txt>
        <Txt w="black" size={11} color="rgba(255,255,255,0.9)" style={{ letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center', maxWidth: 96 }}>{label}</Txt>
      </View>
    </Animated.View>
  );
}

function Bar({ value, i, color, label, top }: { value: number; i: number; color: string; label: string; top?: string }) {
  const th = useTheme();
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(i * 50, withSpring(value, { damping: 14 }));
  }, [value, i, h]);
  const st = useAnimatedStyle(() => ({ height: Math.max(value > 0 ? 8 : 0, h.value * 96) }));
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ height: 112, justifyContent: 'flex-end', alignItems: 'center' }}>
        {!!top && value > 0 && <Txt w="black" size={11} color={color} style={{ marginBottom: 3 }}>{top}</Txt>}
        <Animated.View style={[{ width: 18, borderRadius: 9, backgroundColor: color }, st]} />
      </View>
      <Txt w="bold" size={11} color={th.faint} style={{ marginTop: 8 }}>{label}</Txt>
    </View>
  );
}

export function ProgressChart() {
  const th = useTheme();
  const { t, lang } = useT();
  const state = useApp();
  const [mode, setMode] = useState<'days' | 'weeks' | 'months'>('days');
  const today = todayKey();

  const data = useMemo(() => {
    const avg = (keys: string[]) => {
      const past = keys.filter((k) => k <= today && k >= (state.settings.startedAt ?? '0000'));
      if (!past.length) return 0;
      return past.reduce((a, k) => a + dayRate(state, k).rate, 0) / past.length;
    };
    if (mode === 'days') {
      return rangeKeys(today, 7).map((k) => ({ v: dayRate(state, k).rate, l: weekdayShort[lang][fromKey(k).getDay()] }));
    }
    if (mode === 'weeks') {
      return Array.from({ length: 6 }, (_, i) => {
        const end = addDays(today, -7 * (5 - i));
        return { v: avg(rangeKeys(end, 7)), l: `${Number(end.slice(8))}/${Number(end.slice(5, 7))}` };
      });
    }
    const d = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = new Date(d.getFullYear(), d.getMonth() - (5 - i), 1);
      return { v: avg(monthKeys(m.getFullYear(), m.getMonth())), l: monthNames[lang][m.getMonth()].slice(0, 3) };
    });
  }, [mode, state, lang, today]);

  const title = { days: t('history7'), weeks: t('weekly'), months: t('monthly') }[mode];

  return (
    <Card pad={16}>
      <Segmented
        options={[{ key: 'days', label: t('daily') }, { key: 'weeks', label: t('weekly') }, { key: 'months', label: t('monthly') }]}
        value={mode}
        onChange={setMode}
      />
      <Txt w="black" size={17} style={{ textAlign: 'center', marginTop: 14 }}>{title}</Txt>
      <View key={mode} style={{ flexDirection: 'row', marginTop: 6 }}>
        {data.map((d, i) => (
          <Bar
            key={i}
            i={i}
            value={d.v}
            label={d.l}
            top={i === data.length - 1 ? `${Math.round(d.v * 100)}%` : undefined}
            color={d.v >= state.settings.dailyGoal ? th.flame : th.accent.main}
          />
        ))}
      </View>
    </Card>
  );
}

export function MonthDots() {
  const th = useTheme();
  const { lang, t } = useT();
  const state = useApp();
  const now = new Date();
  const keys = monthKeys(now.getFullYear(), now.getMonth());
  const cells: (string | null)[] = [...Array(fromKey(keys[0]).getDay()).fill(null), ...keys];
  while (cells.length % 7) cells.push(null);
  const today = todayKey();
  return (
    <View>
      <Txt w="black" size={24} style={{ textAlign: 'center', marginBottom: 12 }}>{monthNames[lang][now.getMonth()]}</Txt>
      <View style={{ flexDirection: 'row' }}>
        {weekdayShort[lang].map((d) => (
          <Txt key={d} w="black" size={13} color={th.accent.main} style={{ flex: 1, textAlign: 'center' }}>{d.slice(0, lang === 'ar' ? 3 : 1)}</Txt>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {cells.map((k, i) => {
          const st = k ? dayStatus(state, k) : 'future';
          const color = st === 'goal' ? th.flame : st === 'udzur' ? th.ice : st === 'partial' ? th.accent.main : th.border;
          const big = st === 'goal' || st === 'udzur' || st === 'partial';
          return (
            <View key={i} style={{ width: `${100 / 7}%`, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              {k && (
                <View
                  style={{
                    width: big ? 22 : 10, height: big ? 22 : 10, borderRadius: 11, backgroundColor: color,
                    borderWidth: k === today ? 2 : 0, borderColor: th.text, alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {big && <Txt w="black" size={10} color="#fff">{Number(k.slice(8))}</Txt>}
                </View>
              )}
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 8 }}>
        {[
          [th.flame, t('done')],
          [th.accent.main, t('partial')],
          [th.ice, t('udzurDays')],
        ].map(([c, l]) => (
          <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
            <Txt w="bold" size={11} color={th.muted}>{l}</Txt>
          </View>
        ))}
      </View>
    </View>
  );
}
