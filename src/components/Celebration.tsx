import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Modal, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fromKey, rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort } from '@/lib/i18n';
import { dayStatus } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Flame } from './Flame';
import { Button, Txt } from './ui';

const ease = Easing.out(Easing.cubic);

function Hero({ glow }: { glow: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withTiming(1, { duration: 700, easing: ease });
  }, [v]);
  const halo = useAnimatedStyle(() => ({ opacity: v.value * 0.6, transform: [{ scale: 0.9 + v.value * 0.1 }] }));
  const flame = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.94 + v.value * 0.06 }] }));
  return (
    <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: glow }, halo]} />
      <Animated.View style={flame}>
        <Flame size={112} />
      </Animated.View>
    </View>
  );
}

function Rise({ delay, children }: { delay: number; children: React.ReactNode }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 500, easing: ease }));
  }, [v, delay]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 8 }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

export function Celebration({ visible, streak, onClose }: { visible: boolean; streak: number; onClose: () => void }) {
  const th = useTheme();
  const { t, lang } = useT();
  const state = useApp();
  useEffect(() => {
    if (visible) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [visible]);
  if (!visible) return null;
  const week = rangeKeys(todayKey(), 7);

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, backgroundColor: th.bg }}>
        <LinearGradient
          colors={[th.isDark ? 'rgba(255,138,61,0.12)' : '#FFF3E8', th.bg]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Hero glow={th.isDark ? 'rgba(255,138,61,0.16)' : 'rgba(255,190,140,0.35)'} />
            <Rise delay={250}>
              <Txt w="black" size={64} color={th.flame} style={{ textAlign: 'center', lineHeight: 72, letterSpacing: -1 }}>{streak}</Txt>
              <Txt w="black" size={22} style={{ textAlign: 'center' }}>{t('dayStreak')}</Txt>
            </Rise>
            <Rise delay={400}>
              <Txt w="regular" size={15} color={th.muted} style={{ textAlign: 'center', marginTop: 8 }}>
                {t('congrats')} {t('keepGoing')}
              </Txt>
            </Rise>
            <Rise delay={550}>
              <View style={{ flexDirection: 'row', gap: 14, marginTop: 28, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 22, backgroundColor: th.card }}>
                {week.map((k) => {
                  const st = dayStatus(state, k);
                  const on = st === 'goal' || st === 'udzur';
                  return (
                    <View key={k} style={{ alignItems: 'center', gap: 6 }}>
                      <Txt w="bold" size={11} color={th.muted}>{weekdayShort[lang][fromKey(k).getDay()]}</Txt>
                      <View
                        style={{
                          width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                          backgroundColor: on ? (st === 'udzur' ? th.ice : th.flame) : th.sunk,
                        }}
                      >
                        {on && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' }} />}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Rise>
          </View>
          <Rise delay={700}>
            <View style={{ paddingBottom: 16 }}>
              <Button label={t('continue')} variant="flame" onPress={onClose} />
            </View>
          </Rise>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}
