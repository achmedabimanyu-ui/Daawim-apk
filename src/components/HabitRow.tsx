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
  const R = 14.5;
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
        flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12,
        backgroundColor: done ? th.accent.soft : th.card, borderRadius: 20, marginBottom: 10,
        borderWidth: 1.5, borderBottomWidth: 4, borderColor: done ? th.accent.main : th.border,
      }}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: done ? th.card : th.accent.soft, alignItems: 'center', justifyContent: 'center' }}>
        <HabitIcon name={habit.icon} size={19} color={th.accent.main} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt size={15} style={{ textAlign: rtl ? 'right' : 'left' }}>{habitName(habit, lang)}</Txt>
        <Txt w="regular" size={13} color={th.muted} numberOfLines={1} style={{ textAlign: rtl ? 'right' : 'left' }}>
          {habit.kind === 'count'
            ? `${entry?.value ?? 0} / ${habit.target} ${unitLabel(habit.unit, t)}${detail ? ' · ' + detail : ''}`
            : done ? t('done') : t('notDone')}
        </Txt>
      </View>
      <Pressable hitSlop={10} onPress={tap}>
        <Animated.View style={[{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }, bubble]}>
          {done ? (
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: th.accent.main }}>
              <Check color="#fff" size={17} strokeWidth={3.6} />
            </View>
          ) : (
            <>
              <Svg width={34} height={34} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={17} cy={17} r={R} stroke={th.border} strokeWidth={3} fill="none" />
                <ACircle cx={17} cy={17} r={R} stroke={th.accent.main} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={C} animatedProps={ringProps} />
              </Svg>
              {habit.kind === 'count' && <Plus color={th.muted} size={14} strokeWidth={3} />}
            </>
          )}
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}
