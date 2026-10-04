import { Image, Linking, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useT } from '@/lib/i18n';
import { Press3D, Txt } from './ui';

const NAVY = '#222462';
const NAVY_EDGE = '#14163F';
function IgIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6}>
      <Rect x={3} y={3} width={18} height={18} rx={5} />
      <Circle cx={12} cy={12} r={4} />
      <Circle cx={17.5} cy={6.5} r={0.6} fill={color} />
    </Svg>
  );
}

const IG_URL = 'https://instagram.com/elkisai.education';

const copy = {
  id: { title: 'Belajar Al-Qur\'an lebih dalam', sub: 'Ikuti El-Kisai Education di Instagram', cta: 'Follow @elkisai.education' },
  en: { title: 'Go deeper with the Qur\'an', sub: 'Follow El-Kisai Education on Instagram', cta: 'Follow @elkisai.education' },
  ar: { title: 'تعمّق في دراسة القرآن', sub: 'تابع El-Kisai Education على إنستغرام', cta: 'تابع @elkisai.education' },
};

export function ElKisaiCTA() {
  const { lang } = useT();
  const c = copy[lang];
  return (
    <Press3D color={NAVY} edge={NAVY_EDGE} radius={22} depth={5} onPress={() => Linking.openURL(IG_URL).catch(() => {})}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
        <Image source={require('../../assets/elkisai-logo.png')} style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: '#fff' }} />
        <View style={{ flex: 1 }}>
          <Txt w="black" size={16} color="#fff">{c.title}</Txt>
          <Txt w="regular" size={13} color="#B9C8F0" style={{ marginTop: 2 }}>{c.sub}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#EDC16D', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <IgIcon color={NAVY} />
            <Txt w="black" size={12} color={NAVY}>{c.cta}</Txt>
          </View>
        </View>
      </View>
    </Press3D>
  );
}
