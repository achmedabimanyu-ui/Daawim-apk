import { router, useLocalSearchParams } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, HabitIcon, Segmented, Txt } from '@/components/ui';
import { habitIcons, type Habit } from '@/lib/defaults';
import { rangeKeys, todayKey } from '@/lib/date';
import { useT, weekdayShort } from '@/lib/i18n';
import { categoryName, habitName } from '@/lib/labels';
import { isDone } from '@/lib/stats';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

export default function HabitEditor() {
  const th = useTheme();
  const { t, lang } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, categories, logs, upsertHabit, deleteHabit, addCategory } = useApp();
  const existing = habits.find((h) => h.id === id);
  const [h, setH] = useState<Habit>(
    existing
      ? { ...existing, name: habitName(existing, lang) }
      : { id: `h_${Date.now()}`, name: '', category: 'ibadah', icon: 'heart', kind: 'check', target: 1, unit: '', days: [0, 1, 2, 3, 4, 5, 6], active: true },
  );
  const [newCat, setNewCat] = useState<string | null>(null);
  const set = (p: Partial<Habit>) => setH((x) => ({ ...x, ...p }));

  const input = {
    borderWidth: 2, borderColor: th.border, borderRadius: 14, padding: 14, color: th.text,
    fontFamily: lang === 'ar' ? 'Cairo_700Bold' : 'Nunito_700Bold', fontSize: 16, backgroundColor: th.sunk,
  } as const;
  const Label = ({ children }: { children: string }) => (
    <Txt w="black" size={13} color={th.muted} style={{ marginTop: 20, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{children}</Txt>
  );
  const Chip = ({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderBottomWidth: 3, borderColor: on ? th.accent.main : th.border, backgroundColor: on ? th.accent.soft : th.card }}>
      <Txt size={14} color={on ? th.accent.dark : th.muted}>{label}</Txt>
    </Pressable>
  );

  const save = () => {
    if (!h.name.trim()) return;
    const keepBuiltinName = existing?.builtin && h.name === habitName(existing, lang) ? existing.name : h.name.trim();
    upsertHabit({ ...h, name: keepBuiltinName, target: Math.max(1, h.target) });
    router.back();
  };

  const history = rangeKeys(todayKey(), 30);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable hitSlop={10} onPress={() => router.back()}>
          <X color={th.muted} size={26} strokeWidth={3} />
        </Pressable>
        <Txt w="black" size={20} style={{ flex: 1 }}>{existing ? t('editHabit') : t('addHabit')}</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Label>{t('habitName')}</Label>
        <TextInput value={h.name} onChangeText={(v) => set({ name: v })} style={input} placeholder={t('habitName')} placeholderTextColor={th.faint} />

        <Label>{t('category')}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((c) => <Chip key={c.id} on={h.category === c.id} label={categoryName(c, lang)} onPress={() => set({ category: c.id })} />)}
          {newCat === null ? (
            <Pressable onPress={() => setNewCat('')} style={{ padding: 8, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: th.border }}>
              <Plus color={th.muted} size={18} strokeWidth={3} />
            </Pressable>
          ) : (
            <TextInput
              autoFocus
              value={newCat}
              onChangeText={setNewCat}
              onSubmitEditing={() => {
                if (newCat.trim()) set({ category: addCategory(newCat.trim()) });
                setNewCat(null);
              }}
              style={[input, { paddingVertical: 6, minWidth: 140 }]}
            />
          )}
        </View>

        <Label>Icon</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {habitIcons.map((i) => {
            const on = h.icon === i;
            return (
              <Pressable key={i} onPress={() => set({ icon: i })} style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: on ? th.accent.main : th.border, backgroundColor: on ? th.accent.soft : th.card }}>
                <HabitIcon name={i} color={on ? th.accent.dark : th.muted} size={20} />
              </Pressable>
            );
          })}
        </View>

        <Label>{t('type')}</Label>
        <Segmented
          options={[{ key: 'check', label: t('check') }, { key: 'count', label: t('count') }]}
          value={h.kind}
          onChange={(k) => set({ kind: k, target: k === 'check' ? 1 : Math.max(h.target, 5), unit: k === 'check' ? '' : h.unit || 'pages' })}
        />

        {h.kind === 'count' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Label>{t('target')}</Label>
              <TextInput keyboardType="number-pad" value={String(h.target)} onChangeText={(v) => set({ target: Number(v.replace(/\D/g, '')) || 0 })} style={input} />
            </View>
            <View style={{ flex: 2 }}>
              <Label>{t('unit')}</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {(['pages', 'juz', 'surah', 'verses', 'times', 'minutes'] as const).map((u) => <Chip key={u} on={h.unit === u} label={t(u)} onPress={() => set({ unit: u })} />)}
              </View>
            </View>
          </View>
        )}

        <Label>{t('schedule')}</Label>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {weekdayShort[lang].map((d, i) => {
            const on = h.days.includes(i);
            return (
              <Pressable
                key={d}
                onPress={() => set({ days: on ? h.days.filter((x) => x !== i) : [...h.days, i].sort() })}
                style={{ flex: 1, aspectRatio: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: on ? th.accent.main : th.border, backgroundColor: on ? th.accent.main : th.card }}
              >
                <Txt size={12} color={on ? '#fff' : th.muted}>{d}</Txt>
              </Pressable>
            );
          })}
        </View>

        {existing && (
          <>
            <Label>{t('history30')}</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
              {history.map((k) => (
                <View key={k} style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: isDone(existing, logs, k) ? th.accent.main : (logs[k]?.[existing.id]?.value ?? 0) > 0 ? th.accent.soft : th.sunk }} />
              ))}
            </View>
          </>
        )}

        <View style={{ gap: 12, marginTop: 32 }}>
          <Button label={t('save')} onPress={save} disabled={!h.name.trim() || !h.days.length} />
          {existing && (
            <Button
              variant="ghost"
              label={t('delete')}
              onPress={() =>
                Alert.alert(t('delete'), habitName(existing, lang), [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('delete'), style: 'destructive', onPress: () => { deleteHabit(existing.id); router.back(); } },
                ])
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
