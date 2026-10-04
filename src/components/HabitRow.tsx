import * as Haptics from 'expo-haptics';
import { Check, Plus } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedProps, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import type { Habit } from '@/lib/defaults';
import { habitName, unitLabel } from '@/lib/labels';
import { useT } from '@/lib/i18n';
import { progressOf } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
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
  const R = 22;
  const C = 2 * Math.PI * R;
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - ring.value) }));

  const tap = () => {
    if (habit.kind === 'count') return onOpen(habit);
    scale.value = withSequence(withTiming(0.8, { duration: 80 }), withSpring(1, { damping: 6, stiffness: 300 }));
    Haptics.notificationAsync(done ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success).catch(() => {});
    setEntry(date, habit.id, done ? null : { value: 1 });
  };

  const detail = [entry?.book, entry?.matan, entry?.surah, entry?.juz && `${t('juz')} ${entry.juz}`].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={() => onOpen(habit)}
      style={{
        flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 14,
        backgroundColor: done ? th.accent.soft : th.card, borderRadius: 18, borderWidth: 2,
        borderColor: done ? th.accent.main : th.border, borderBottomWidth: 4, marginBottom: 10,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: done ? th.accent.main : th.sunk, alignItems: 'center', justifyContent: 'center' }}>
        <HabitIcon name={habit.icon} color={done ? '#fff' : th.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt size={16} style={{ textAlign: rtl ? 'right' : 'left' }}>{habitName(habit, lang)}</Txt>
        <Txt w="regular" size={13} color={th.muted} numberOfLines={1} style={{ textAlign: rtl ? 'right' : 'left' }}>
          {habit.kind === 'count'
            ? `${entry?.value ?? 0} / ${habit.target} ${unitLabel(habit.unit, t)}${detail ? ' · ' + detail : ''}`
            : done ? t('done') : t('notDone')}
        </Txt>
      </View>
      <Pressable hitSlop={8} onPress={tap}>
        <Animated.View style={[{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }, bubble]}>
          <Svg width={50} height={50} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={25} cy={25} r={R} stroke={th.border} strokeWidth={4} fill="none" />
            <ACircle cx={25} cy={25} r={R} stroke={th.accent.main} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={C} animatedProps={ringProps} />
          </Svg>
          <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? th.accent.main : 'transparent' }}>
            {done ? <Check color="#fff" size={22} strokeWidth={4} /> : habit.kind === 'count' ? <Plus color={th.muted} size={20} strokeWidth={3} /> : null}
          </View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}
