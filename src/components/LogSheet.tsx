import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Minus, Pencil, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';
import Animated, { Easing, SlideInDown, FadeIn } from 'react-native-reanimated';
import type { Habit } from '@/lib/defaults';
import { habitName, unitLabel } from '@/lib/labels';
import { useT, type Dict } from '@/lib/i18n';
import { habitStreak } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp, type Entry } from '@/store/app';
import { Flame } from './Flame';
import { Button, HabitIcon, Press3D, Txt } from './ui';

export function LogSheet({ habit, date, onClose }: { habit: Habit | null; date: string; onClose: () => void }) {
  const th = useTheme();
  const { t, lang } = useT();
  const logs = useApp((s) => s.logs);
  const setEntry = useApp((s) => s.setEntry);
  const [e, setE] = useState<Entry>({ value: 0 });

  useEffect(() => {
    if (habit) setE(logs[date]?.[habit.id] ?? { value: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit?.id, date]);

  if (!habit) return null;
  const step = (d: number) => {
    Haptics.selectionAsync().catch(() => {});
    setE((x) => ({ ...x, value: Math.max(0, x.value + d) }));
  };
  const save = () => {
    setEntry(date, habit.id, habit.kind === 'check' ? (e.value ? { value: 1 } : null) : e);
    onClose();
  };
  const fieldLabel: Record<string, keyof Dict> = { book: 'bookName', matan: 'matanName', juz: 'juz', surah: 'surah' };
  const streak = habitStreak(habit, logs);

  const input = {
    borderWidth: 2, borderColor: th.border, borderRadius: 14, padding: 12, color: th.text,
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, backgroundColor: th.sunk,
  } as const;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Animated.View entering={FadeIn} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <Animated.View
            entering={SlideInDown.duration(280).easing(Easing.out(Easing.cubic))}
            style={{ backgroundColor: th.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 }}
          >
            <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: th.border, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: th.accent.soft, alignItems: 'center', justifyContent: 'center' }}>
                <HabitIcon name={habit.icon} color={th.accent.dark} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="black" size={20}>{habitName(habit, lang)}</Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Flame size={16} lit={streak > 0} animate={false} />
                  <Txt w="bold" size={13} color={th.muted}>{streak} {t('days')}</Txt>
                </View>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => {
                  onClose();
                  router.push({ pathname: '/habit/[id]', params: { id: habit.id } });
                }}
              >
                <Pencil color={th.muted} size={20} strokeWidth={2.6} />
              </Pressable>
            </View>

            {habit.kind === 'count' ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginVertical: 24 }}>
                  <Press3D color={th.card} edge={th.border} radius={30} onPress={() => step(-1)}>
                    <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: th.border, borderRadius: 30 }}>
                      <Minus color={th.text} strokeWidth={3} />
                    </View>
                  </Press3D>
                  <View style={{ alignItems: 'center', minWidth: 90 }}>
                    <TextInput
                      value={String(e.value)}
                      keyboardType="number-pad"
                      onChangeText={(v) => setE((x) => ({ ...x, value: Number(v.replace(/\D/g, '')) || 0 }))}
                      style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 44, color: th.accent.main, textAlign: 'center', padding: 0 }}
                    />
                    <Txt w="bold" size={13} color={th.muted}>/ {habit.target} {unitLabel(habit.unit, t)}</Txt>
                  </View>
                  <Press3D color={th.accent.main} edge={th.accent.dark} radius={30} onPress={() => step(1)}>
                    <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                      <Plus color="#fff" strokeWidth={3} />
                    </View>
                  </Press3D>
                </View>
                <View style={{ gap: 10, marginBottom: 18 }}>
                  {habit.fields?.map((f) => (
                    <TextInput
                      key={f}
                      placeholder={t(fieldLabel[f])}
                      placeholderTextColor={th.muted}
                      value={(e[f as keyof Entry] as string) ?? ''}
                      onChangeText={(v) => setE((x) => ({ ...x, [f]: v }))}
                      style={input}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={{ marginVertical: 24 }}>
                <Button
                  variant={e.value ? 'ghost' : 'primary'}
                  label={e.value ? t('undo') : t('done')}
                  onPress={() => setE({ value: e.value ? 0 : 1 })}
                />
              </View>
            )}
            <Button label={t('save')} onPress={save} />
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
