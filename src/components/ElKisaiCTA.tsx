import { Image, Linking, Pressable } from 'react-native';
import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Txt } from './ui';

const IG_URL = 'https://instagram.com/elkisai.education';

export function ElKisaiCTA() {
  const th = useTheme();
  const { t } = useT();
  return (
    <Pressable
      hitSlop={8}
      onPress={() => Linking.openURL(IG_URL).catch(() => {})}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
    >
      <Txt w="regular" size={12} color={th.muted}>{t('presentedBy')}</Txt>
      <Image source={require('../../assets/elkisai-logo.png')} style={{ width: 20, height: 20, borderRadius: 5 }} />
      <Txt w="black" size={12} color={th.text}>@elkisai.education</Txt>
    </Pressable>
  );
}
