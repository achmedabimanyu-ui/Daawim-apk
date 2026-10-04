import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { fromKey, rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort } from '@/lib/i18n';
import { dayStatus } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Flame } from './Flame';
import { Button, Txt } from './ui';

const ease = Easing.out(Easing.cubic);

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
      <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1, backgroundColor: 'rgba(10,14,20,0.35)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          entering={SlideInDown.duration(300).easing(ease)}
          style={{ backgroundColor: th.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 34 }}
        >
          <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: th.border, marginBottom: 18 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: th.flameSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={40} />
            </View>
            <View style={{ flex: 1 }}>
              <Animated.View entering={FadeIn.delay(150).duration(400)}>
                <Txt w="black" size={30} color={th.flame} style={{ letterSpacing: -0.5 }}>
                  {streak} <Txt w="black" size={18} color={th.text}>{t('dayStreak')}</Txt>
                </Txt>
              </Animated.View>
              <Txt w="regular" size={14} color={th.muted}>{t('congrats')} {t('keepGoing')}</Txt>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, marginBottom: 24, padding: 12, borderRadius: 18, backgroundColor: th.sunk }}>
            {week.map((k, i) => {
              const st = dayStatus(state, k);
              const on = st === 'goal' || st === 'udzur';
              return (
                <View key={k} style={{ alignItems: 'center', gap: 6 }}>
                  <Txt w="bold" size={11} color={th.muted}>{weekdayShort[lang][fromKey(k).getDay()]}</Txt>
                  <Animated.View
                    entering={FadeIn.delay(150 + i * 40).duration(250)}
                    style={{
                      width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: on ? (st === 'udzur' ? th.ice : th.flame) : th.card,
                      borderWidth: on ? 0 : 1.5, borderColor: th.border,
                    }}
                  >
                    {on && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                  </Animated.View>
                </View>
              );
            })}
          </View>

          <Button label={t('continue')} variant="flame" onPress={onClose} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
