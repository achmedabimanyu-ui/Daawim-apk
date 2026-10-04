import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing, FadeIn, FadeInDown, ZoomIn, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Flame } from './Flame';
import { Button, Txt } from './ui';

function Ribbon({ i, color, width }: { i: number; color: string; width: number }) {
  const p = useSharedValue(0);
  const x = ((i * 37) % 100) / 100 * width - width / 2;
  const sway = (i % 2 ? 1 : -1) * (10 + (i % 3) * 6);
  useEffect(() => {
    p.value = withDelay(150 + i * 70, withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }));
  }, [p, i]);
  const st = useAnimatedStyle(() => ({
    opacity: p.value < 0.15 ? p.value / 0.15 * 0.55 : 0.55 * (1 - p.value),
    transform: [
      { translateX: x + Math.sin(p.value * Math.PI * 2) * sway },
      { translateY: -140 + p.value * 260 },
      { rotate: `${(i % 2 ? 1 : -1) * (20 + p.value * 40)}deg` },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', width: 2.5, height: 14, borderRadius: 2, backgroundColor: color }, st]} />;
}

function Glow({ color }: { color: string }) {
  const g = useSharedValue(0);
  useEffect(() => {
    g.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [g]);
  const glow = useAnimatedStyle(() => ({ opacity: g.value * 0.5, transform: [{ scale: 0.8 + g.value * 0.2 }] }));
  return <Animated.View style={[{ position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: color }, glow]} />;
}

function CountUp({ to, color }: { to: number; color: string }) {
  const [n, setN] = useState(Math.max(0, to - 1));
  useEffect(() => {
    const id = setTimeout(() => setN(to), 650);
    return () => clearTimeout(id);
  }, [to]);
  return (
    <Animated.View key={n} entering={FadeIn.duration(400)}>
      <Txt w="black" size={72} color={color} style={{ lineHeight: 80 }}>{n}</Txt>
    </Animated.View>
  );
}

export function Celebration({ visible, streak, onClose }: { visible: boolean; streak: number; onClose: () => void }) {
  const th = useTheme();
  const { t } = useT();
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (visible) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [visible]);
  if (!visible) return null;
  const colors = [th.flame, th.gold, th.accent.main, th.ice, '#FF5A4E'];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} style={{ flex: 1, backgroundColor: th.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <LinearGradient colors={[th.isDark ? 'rgba(255,138,61,0.10)' : '#FFF4EA', th.bg]} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ alignItems: 'center', justifyContent: 'center', width, height: 220 }}>
          <Glow color={th.isDark ? 'rgba(255,138,61,0.18)' : 'rgba(255,190,130,0.35)'} />
          {Array.from({ length: 14 }, (_, i) => <Ribbon key={i} i={i} width={width * 0.8} color={colors[i % colors.length]} />)}
          <Animated.View entering={ZoomIn.duration(500).easing(Easing.out(Easing.cubic))}>
            <Flame size={124} />
          </Animated.View>
        </View>
        <CountUp to={streak} color={th.flame} />
        <Animated.View entering={FadeInDown.delay(500)}>
          <Txt w="black" size={26} color={th.flame} style={{ textAlign: 'center' }}>{t('dayStreak')}</Txt>
          <Txt w="regular" size={16} color={th.muted} style={{ textAlign: 'center', marginTop: 8 }}>{t('keepGoing')}</Txt>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800)} style={{ position: 'absolute', bottom: 48, left: 24, right: 24 }}>
          <Button label={t('continue')} variant="flame" onPress={onClose} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
