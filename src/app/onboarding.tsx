import { router } from 'expo-router';
import { ChevronLeft, Moon, Sparkles } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame } from '@/components/Flame';
import { Button, ProgressBar, Press3D, Txt } from '@/components/ui';
import { todayKey } from '@/lib/date';
import { useT, type Lang } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

function Choice({ on, onPress, children }: { on: boolean; onPress: () => void; children: ReactNode }) {
  const th = useTheme();
  return (
    <Press3D onPress={onPress} color={on ? th.accent.soft : th.card} edge={on ? th.accent.main : th.border} radius={18}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderWidth: 2, borderRadius: 18, borderColor: on ? th.accent.main : th.border }}>
        {children}
      </View>
    </Press3D>
  );
}

export default function Onboarding() {
  const th = useTheme();
  const { t } = useT();
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(settings.name);

  const next = () => {
    if (step < 3) return setStep(step + 1);
    setSettings({ name: name.trim(), onboarded: true, startedAt: settings.startedAt ?? todayKey() });
    router.replace('/(tabs)');
  };

  if (step === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: th.bg, padding: 24 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View entering={ZoomIn.springify().damping(9)}>
            <Flame size={140} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(250)}>
            <Txt w="black" size={46} color={th.accent.main} style={{ textAlign: 'center', marginTop: 16, letterSpacing: -1 }}>daawim</Txt>
            <Txt w="bold" size={17} color={th.muted} style={{ textAlign: 'center', marginTop: 6 }}>{t('appTagline')}</Txt>
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(500)}>
          <Button label={t('getStarted')} onPress={next} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  const langs: { key: Lang; label: string; sub: string }[] = [
    { key: 'id', label: 'Bahasa Indonesia', sub: 'ID' },
    { key: 'en', label: 'English', sub: 'EN' },
    { key: 'ar', label: 'العربية', sub: 'AR' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <Pressable hitSlop={10} onPress={() => setStep(step - 1)}>
            <ChevronLeft color={th.muted} size={28} strokeWidth={3} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ProgressBar value={step / 3} color={th.accent.main} />
          </View>
        </View>

        <Animated.View key={step} entering={FadeInRight.springify().damping(16)} style={{ flex: 1, gap: 12 }}>
          {step === 1 && (
            <>
              <Txt w="black" size={26} style={{ marginBottom: 12 }}>{t('chooseLang')}</Txt>
              {langs.map((l) => (
                <Choice key={l.key} on={settings.lang === l.key} onPress={() => setSettings({ lang: l.key })}>
                  <View style={{ width: 44, height: 32, borderRadius: 8, backgroundColor: th.sunk, alignItems: 'center', justifyContent: 'center' }}>
                    <Txt w="black" size={13} color={th.muted}>{l.sub}</Txt>
                  </View>
                  <Txt size={17}>{l.label}</Txt>
                </Choice>
              ))}
            </>
          )}
          {step === 2 && (
            <>
              <Txt w="black" size={26} style={{ marginBottom: 12 }}>{t('yourName')}</Txt>
              <TextInput
                autoFocus
                value={name}
                onChangeText={setName}
                placeholder={t('namePlaceholder')}
                placeholderTextColor={th.faint}
                style={{
                  borderWidth: 2, borderColor: th.border, borderRadius: 16, padding: 16, fontSize: 18,
                  fontFamily: 'Nunito_700Bold', color: th.text, backgroundColor: th.sunk,
                }}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Txt w="black" size={26} style={{ marginBottom: 12 }}>{t('chooseMode')}</Txt>
              {(['muslim', 'muslimah'] as const).map((g) => (
                <Choice key={g} on={settings.gender === g} onPress={() => setSettings({ gender: g })}>
                  <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: g === 'muslim' ? th.accent.soft : '#FCE3EC', alignItems: 'center', justifyContent: 'center' }}>
                    {g === 'muslim' ? <Moon color={th.accent.dark} strokeWidth={2.6} /> : <Sparkles color="#C9406F" strokeWidth={2.6} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size={18}>{t(g)}</Txt>
                    {g === 'muslimah' && <Txt w="regular" size={13} color={th.muted}>{t('muslimahHint')}</Txt>}
                  </View>
                </Choice>
              ))}
            </>
          )}
        </Animated.View>
        <Button label={t('continue')} onPress={next} disabled={step === 2 && !name.trim()} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
