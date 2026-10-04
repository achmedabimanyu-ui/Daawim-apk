import * as Location from 'expo-location';
import { MapPin, Moon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { fmtTime, pad } from '@/lib/date';
import { useT } from '@/lib/i18n';
import { nextPrayer, PRAYERS } from '@/lib/prayer';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Button, Txt, softShadow } from './ui';

export async function detectLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  let city: string | undefined;
  try {
    const [r] = await Location.reverseGeocodeAsync(pos.coords);
    city = r?.city ?? r?.subregion ?? r?.region ?? undefined;
  } catch {}
  useApp.getState().setPrayer({ lat: pos.coords.latitude, lng: pos.coords.longitude, city });
}

export function PrayerCard() {
  const th = useTheme();
  const { t, rtl } = useT();
  const p = useApp((s) => s.settings.prayer);
  const [now, setNow] = useState(new Date());
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const DARK = th.isDark ? '#232B33' : '#16191F';
  if (p.lat == null || p.lng == null) {
    return (
      <View style={{ backgroundColor: DARK, borderRadius: 24, padding: 16, ...softShadow(th.isDark, '#000') }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin color="#fff" size={20} strokeWidth={2.4} />
          </View>
          <Txt size={15} color="#fff" style={{ flex: 1 }}>{t('setLocation')}</Txt>
        </View>
        <Button
          label={t('useLocation')}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            await detectLocation().catch(() => {});
            setBusy(false);
          }}
        />
      </View>
    );
  }

  const np = nextPrayer(p.lat, p.lng, p.method, p.madhab, now);
  const left = Math.max(0, Math.floor((np.at.getTime() - now.getTime()) / 1000));
  const cd = `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  const row = rtl ? 'row-reverse' : 'row';

  return (
    <View style={{ backgroundColor: DARK, borderRadius: 24, padding: 16, ...softShadow(th.isDark, '#000') }}>
      <View style={{ flexDirection: row, alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: th.accent.main, alignItems: 'center', justifyContent: 'center' }}>
          <Moon color="#fff" size={22} strokeWidth={2.4} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt w="black" size={20} color="#fff">{t(np.name)} · {fmtTime(np.at)}</Txt>
          <Txt w="regular" size={13} color="rgba(255,255,255,0.65)">
            {t('nextPrayer')}{p.city ? ` · ${p.city}` : ''}
          </Txt>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
          <Txt w="black" size={13} color="#fff" style={{ fontVariant: ['tabular-nums'] }}>{cd}</Txt>
        </View>
      </View>
      <View style={{ flexDirection: row, justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        {PRAYERS.map((k) => {
          const on = k === np.name;
          return (
            <View key={k} style={{ alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 10, backgroundColor: on ? 'rgba(255,255,255,0.12)' : 'transparent' }}>
              <Txt w="bold" size={11} color={on ? '#fff' : 'rgba(255,255,255,0.55)'}>{t(k)}</Txt>
              <Txt w="black" size={13} color={on ? '#fff' : 'rgba(255,255,255,0.8)'}>{fmtTime(np.today[k])}</Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}
