import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import { fromKey, rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort } from '@/lib/i18n';
import { dayStatus } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Txt, softShadow } from './ui';

export function WeekStrip({ value, onChange }: { value?: string; onChange?: (k: string) => void }) {
  const th = useTheme();
  const { lang } = useT();
  const state = useApp();
  const today = todayKey();
  const keys = rangeKeys(today, 7);

  return (
    <View style={{ flexDirection: 'row', gap: 7 }}>
      {keys.map((k) => {
        const on = k === (value ?? today);
        const dow = fromKey(k).getDay();
        const st = dayStatus(state, k);
        const friday = dow === 5;
        const band = on ? th.accent.main : friday ? '#E9F7EF' : th.isDark ? th.sunk : '#ECEFFA';
        const bandText = on ? '#fff' : friday ? '#1BA672' : th.accent.main;
        const dot = st === 'goal' ? th.flame : st === 'udzur' ? th.ice : st === 'partial' ? th.accent.main : 'transparent';
        return (
          <Pressable
            key={k}
            disabled={!onChange}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange?.(k);
            }}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 14, overflow: 'hidden', backgroundColor: on ? th.accent.soft : th.card,
                borderWidth: th.isDark ? 1 : 0, borderColor: on ? th.accent.main : th.border,
                transform: [{ translateY: on ? -3 : 0 }],
                ...softShadow(th.isDark, on ? th.accent.main : '#20264A'),
              }}
            >
              <View style={{ backgroundColor: band, paddingVertical: 3, alignItems: 'center' }}>
                <Txt w="bold" size={11} color={bandText}>{weekdayShort[lang][dow]}</Txt>
              </View>
              <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 5 }}>
                <Txt w="black" size={19} color={on ? th.accent.main : th.text}>{Number(k.slice(8))}</Txt>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: dot, marginTop: 3 }} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
