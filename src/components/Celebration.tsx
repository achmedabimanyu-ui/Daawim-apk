import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing, FadeIn, FadeInDown, ZoomIn, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Flame } from './Flame';
import { Button, Txt } from './ui';

function Particle({ i, color }: { i: number; color: string }) {
  const p = useSharedValue(0);
  const angle = (i / 24) * Math.PI * 2 + (i % 3) * 0.2;
  const dist = 110 + (i % 4) * 30;
  useEffect(() => {
    p.value = withDelay(250, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [p]);
  const st = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value + 40 * p.value * p.value },
      { rotate: `${p.value * 360}deg` },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', width: 10, height: 14, borderRadius: 3, backgroundColor: color }, st]} />;
}

function Glow({ color }: { color: string }) {
  const g = useSharedValue(0);
  const r = useSharedValue(0);
  useEffect(() => {
    g.value = withRepeat(withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 1100 })), -1);
    r.value = withDelay(200, withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1));
  }, [g, r]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.35 + g.value * 0.3, transform: [{ scale: 1 + g.value * 0.12 }] }));
  const ring = useAnimatedStyle(() => ({ opacity: 1 - r.value, transform: [{ scale: 0.7 + r.value * 0.9 }] }));
  return (
    <>
      <Animated.View style={[{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: color }, glow]} />
      <Animated.View style={[{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: color }, ring]} />
    </>
  );
}

function CountUp({ to, color }: { to: number; color: string }) {
  const [n, setN] = useState(Math.max(0, to - 1));
  useEffect(() => {
    const id = setTimeout(() => setN(to), 650);
    return () => clearTimeout(id);
  }, [to]);
  return (
    <Animated.View key={n} entering={ZoomIn.springify().damping(8)}>
      <Txt w="black" size={96} color={color} style={{ lineHeight: 104 }}>{n}</Txt>
    </Animated.View>
  );
}

export function Celebration({ visible, streak, onClose }: { visible: boolean; streak: number; onClose: () => void }) {
  const th = useTheme();
  const { t } = useT();
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (visible) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [visible]);
  if (!visible) return null;
  const colors = [th.flame, th.gold, th.accent.main, th.ice, '#FF5A4E'];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} style={{ flex: 1, backgroundColor: th.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <LinearGradient colors={[th.isDark ? 'rgba(255,138,61,0.22)' : '#FFE9D6', th.bg]} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ alignItems: 'center', justifyContent: 'center', width, height: 220 }}>
          <Glow color={th.isDark ? 'rgba(255,138,61,0.35)' : 'rgba(255,170,90,0.45)'} />
          {Array.from({ length: 24 }, (_, i) => <Particle key={i} i={i} color={colors[i % colors.length]} />)}
          <Animated.View entering={ZoomIn.springify().damping(7).stiffness(140)}>
            <Flame size={150} />
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
