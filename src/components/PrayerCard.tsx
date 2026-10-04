import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { fmtTime, pad } from '@/lib/date';
import { useT } from '@/lib/i18n';
import { nextPrayer, PRAYERS } from '@/lib/prayer';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Button, Card, Txt } from './ui';

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

  if (p.lat == null || p.lng == null) {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <MapPin color={th.accent.main} strokeWidth={2.6} />
          <Txt size={15} style={{ flex: 1 }}>{t('setLocation')}</Txt>
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
      </Card>
    );
  }

  const np = nextPrayer(p.lat, p.lng, p.method, p.madhab, now);
  const left = Math.max(0, Math.floor((np.at.getTime() - now.getTime()) / 1000));
  const cd = `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;

  return (
    <View style={{ borderRadius: 24, backgroundColor: th.accent.main, padding: 16 }}>
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Txt w="bold" size={13} color="rgba(255,255,255,0.85)">{t('nextPrayer')}</Txt>
          <Txt w="black" size={22} color="#fff">{t(np.name)}</Txt>
          <Txt w="bold" size={14} color="rgba(255,255,255,0.9)">{fmtTime(np.at)} · {t('in')} {cd}</Txt>
        </View>
        {p.city && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <MapPin color="#fff" size={12} strokeWidth={3} />
            <Txt w="bold" size={12} color="#fff">{p.city}</Txt>
          </View>
        )}
      </View>
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', justifyContent: 'space-between', marginTop: 12, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 14, padding: 10 }}>
        {PRAYERS.map((k) => {
          const on = k === np.name;
          return (
            <View key={k} style={{ alignItems: 'center', opacity: on ? 1 : 0.8 }}>
              <Txt w={on ? 'black' : 'bold'} size={11} color="#fff">{t(k)}</Txt>
              <Txt w={on ? 'black' : 'bold'} size={13} color="#fff">{fmtTime(np.today[k])}</Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}
