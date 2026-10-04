import { Check, ChevronLeft, ChevronRight, Snowflake } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { monthKeys, todayKey, fromKey } from '@/lib/date';
import { monthNames, useT, weekdayShort } from '@/lib/i18n';
import { dayStatus, rangeStats, type DayStatus } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Card, Txt } from './ui';

const CELL = 40;

export function StreakCalendar({ showStats = true }: { showStats?: boolean }) {
  const th = useTheme();
  const { t, lang, rtl } = useT();
  const state = useApp();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const keys = monthKeys(ym.y, ym.m);
  const today = todayKey();

  const statuses = useMemo(
    () => Object.fromEntries(keys.map((k) => [k, dayStatus(state, k)])) as Record<string, DayStatus>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ym.y, ym.m, state.logs, state.habits, state.periods, state.settings.dailyGoal],
  );
  const stats = useMemo(() => rangeStats(state, keys), [statuses]); // eslint-disable-line react-hooks/exhaustive-deps

  const lead = fromKey(keys[0]).getDay();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...keys];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const kept = (k: string | null) => !!k && (statuses[k] === 'goal' || statuses[k] === 'udzur');

  const shift = (d: number) => {
    const n = new Date(ym.y, ym.m + d, 1);
    setYm({ y: n.getFullYear(), m: n.getMonth() });
  };

  return (
    <View>
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Txt w="black" size={22}>
          {monthNames[lang][ym.m]} {ym.y}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <Pressable hitSlop={10} onPress={() => shift(-1)}>
            <ChevronLeft color={th.muted} size={24} strokeWidth={3} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => shift(1)}>
            <ChevronRight color={th.muted} size={24} strokeWidth={3} />
          </Pressable>
        </View>
      </View>

      {showStats && (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <Card style={{ flex: 1 }} pad={12}>
            {stats.activeDays >= 10 && (
              <View style={{ position: 'absolute', top: -12, right: 10, backgroundColor: th.gold, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Txt w="black" size={11} color="#fff">
                  {t('great')}
                </Txt>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: th.flame, alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color="#fff" strokeWidth={4} />
              </View>
              <Txt w="black" size={20}>{stats.activeDays}</Txt>
            </View>
            <Txt w="regular" size={13} color={th.muted}>{t('daysActive')}</Txt>
          </Card>
          <Card style={{ flex: 1 }} pad={12}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: th.ice, alignItems: 'center', justifyContent: 'center' }}>
                <Snowflake size={13} color="#fff" strokeWidth={3} />
              </View>
              <Txt w="black" size={20}>{stats.udzurDays}</Txt>
            </View>
            <Txt w="regular" size={13} color={th.muted}>{t('udzurDays')}</Txt>
          </Card>
        </View>
      )}

      <Card pad={12}>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {weekdayShort[lang].map((d) => (
            <Txt key={d} w="bold" size={13} color={th.muted} style={{ flex: 1, textAlign: 'center' }}>
              {d}
            </Txt>
          ))}
        </View>
        {weeks.map((w, wi) => {
          const full = w.every((k) => k && statuses[k] === 'goal');
          return (
            <Animated.View key={wi} entering={FadeIn.delay(wi * 50)} style={{ flexDirection: 'row', height: CELL + 8, alignItems: 'center' }}>
              {w.map((k, i) => {
                const st = k ? statuses[k] : undefined;
                const band = kept(k) && (kept(w[i - 1] ?? null) || kept(w[i + 1] ?? null));
                const left = band && !kept(w[i - 1] ?? null);
                const right = band && !kept(w[i + 1] ?? null);
                const solo = kept(k) && !band;
                const isToday = k === today;
                const day = k ? Number(k.slice(8)) : '';
                const fg =
                  st === 'future' || !k ? th.faint
                    : full ? '#fff'
                    : st === 'goal' ? th.flame
                    : st === 'udzur' ? th.iceDark
                    : th.muted;
                return (
                  <View key={i} style={{ flex: 1, height: CELL, alignItems: 'center', justifyContent: 'center' }}>
                    {band && (
                      <View
                        style={{
                          position: 'absolute', top: 0, bottom: 0, left: left ? 4 : 0, right: right ? 4 : 0,
                          backgroundColor: full ? th.flame : th.flameSoft,
                          borderTopLeftRadius: left ? CELL : 0, borderBottomLeftRadius: left ? CELL : 0,
                          borderTopRightRadius: right ? CELL : 0, borderBottomRightRadius: right ? CELL : 0,
                        }}
                      />
                    )}
                    {(solo || (isToday && st === 'goal' && !full)) && (
                      <View style={{ position: 'absolute', width: CELL - 2, height: CELL - 2, borderRadius: CELL, backgroundColor: st === 'udzur' ? th.ice : th.flame }} />
                    )}
                    {st === 'udzur' && band && (
                      <View style={{ position: 'absolute', width: CELL - 6, height: CELL - 6, borderRadius: CELL, backgroundColor: th.ice, borderBottomWidth: 3, borderColor: th.iceDark }} />
                    )}
                    {isToday && st !== 'goal' && (
                      <View style={{ position: 'absolute', width: CELL - 4, height: CELL - 4, borderRadius: CELL, borderWidth: 2, borderColor: th.flame }} />
                    )}
                    <Txt w="black" size={15} color={solo || (isToday && st === 'goal') || (st === 'udzur' && band) ? '#fff' : fg}>
                      {day}
                    </Txt>
                  </View>
                );
              })}
            </Animated.View>
          );
        })}
      </Card>
    </View>
  );
}
