import * as Haptics from 'expo-haptics';
import { Check, Plus } from 'lucide-react-native';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import type { Habit } from '@/lib/defaults';
import { habitName, unitLabel } from '@/lib/labels';
import { useT } from '@/lib/i18n';
import { progressOf } from '@/lib/stats';
import { pastel, useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { HabitIcon, Txt } from './ui';

const ACircle = Animated.createAnimatedComponent(Circle);

export function HabitRow({ habit, date, onOpen }: { habit: Habit; date: string; onOpen: (h: Habit) => void }) {
  const th = useTheme();
  const { t, lang, rtl } = useT();
  const entry = useApp((s) => s.logs[date]?.[habit.id]);
  const logs = useApp((s) => s.logs);
  const setEntry = useApp((s) => s.setEntry);
  const p = progressOf(habit, logs, date);
  const done = p >= 1;

  const scale = useSharedValue(1);
  const ring = useSharedValue(p);
  useEffect(() => {
    ring.value = withTiming(p, { duration: 450 });
  }, [p, ring]);
  const bubble = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const R = 14.5;
  const C = 2 * Math.PI * R;
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - ring.value) }));

  const tap = () => {
    if (habit.kind === 'count') return onOpen(habit);
    scale.value = withSequence(withTiming(0.9, { duration: 90 }), withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }));
    Haptics.notificationAsync(done ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success).catch(() => {});
    setEntry(date, habit.id, done ? null : { value: 1 });
  };

  const detail = [entry?.book, entry?.matan, entry?.surah, entry?.juz && `${t('juz')} ${entry.juz}`].filter(Boolean).join(' · ');

  const pc = pastel(habit.id, th.isDark);
  const press = useSharedValue(1);
  const card = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  return (
    <Animated.View style={[{ marginBottom: 12 }, card]}>
      <Pressable
        onPress={() => onOpen(habit)}
        onPressIn={() => (press.value = withTiming(0.98, { duration: 90 }))}
        onPressOut={() => (press.value = withSpring(1, { damping: 12 }))}
      >
        <LinearGradient
          colors={[pc.from, pc.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12,
            paddingVertical: 14, paddingHorizontal: 14, borderRadius: 22, opacity: done ? 0.92 : 1,
          }}
        >
          <Pressable hitSlop={10} onPress={tap}>
            <Animated.View style={[{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, bubble]}>
              {done ? (
                <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: pc.fg }}>
                  <Check color="#fff" size={16} strokeWidth={3.6} />
                </View>
              ) : (
                <>
                  <Svg width={32} height={32} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx={16} cy={16} r={R} stroke={`${pc.fg}55`} strokeWidth={2.5} fill={th.isDark ? 'transparent' : 'rgba(255,255,255,0.85)'} />
                    <ACircle cx={16} cy={16} r={R} stroke={pc.fg} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={C} animatedProps={ringProps} />
                  </Svg>
                  {habit.kind === 'count' && <Plus color={pc.fg} size={14} strokeWidth={3} />}
                </>
              )}
            </Animated.View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Txt w="black" size={16} numberOfLines={1} style={{ textAlign: rtl ? 'right' : 'left', textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>
              {habitName(habit, lang)}
            </Txt>
            <Txt w="bold" size={12.5} color={pc.fg} numberOfLines={1} style={{ textAlign: rtl ? 'right' : 'left', marginTop: 2 }}>
              {habit.kind === 'count'
                ? `${entry?.value ?? 0} / ${habit.target} ${unitLabel(habit.unit, t)}${detail ? ' · ' + detail : ''}`
                : done ? t('done') : t('notDone')}
            </Txt>
          </View>
          <View style={{ width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: th.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)' }}>
            <HabitIcon name={habit.icon} size={26} color={pc.fg} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
