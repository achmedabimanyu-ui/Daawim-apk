import { Image, Linking, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useT } from '@/lib/i18n';
import { Press3D, Txt } from './ui';

const NAVY = '#222462';
const NAVY_EDGE = '#14163F';
const IG_URL = 'https://instagram.com/elkisai.education';

function IgIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6}>
      <Rect x={3} y={3} width={18} height={18} rx={5} />
      <Circle cx={12} cy={12} r={4} />
      <Circle cx={17.5} cy={6.5} r={0.6} fill={color} />
    </Svg>
  );
}

export function ElKisaiCTA() {
  const { lang } = useT();
  return (
    <Press3D color={NAVY} edge={NAVY_EDGE} radius={22} depth={5} onPress={() => Linking.openURL(IG_URL).catch(() => {})}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
        <Image source={require('../../assets/elkisai-logo.png')} style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff' }} />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EDC16D', paddingVertical: 12, borderRadius: 14 }}>
          <IgIcon color={NAVY} />
          <Txt w="black" size={14} color={NAVY}>{lang === 'ar' ? 'تابع' : 'Follow'} @elkisai.education</Txt>
        </View>
      </View>
    </Press3D>
  );
}
