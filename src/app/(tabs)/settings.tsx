import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Check, Download, MapPin, RotateCcw, Upload } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ElKisaiCTA } from '@/components/ElKisaiCTA';
import { detectLocation } from '@/components/PrayerCard';
import { Card, Segmented, SectionTitle, Txt } from '@/components/ui';
import { exportData, importData } from '@/lib/backup';
import { useT } from '@/lib/i18n';
import { methods } from '@/lib/prayer';
import { accents, useTheme, type AccentKey } from '@/lib/theme';
import { useApp } from '@/store/app';

function Row({ icon, label, onPress, danger, right }: { icon?: ReactNode; label: string; onPress?: () => void; danger?: boolean; right?: ReactNode }) {
  const th = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      {icon}
      <Txt size={15} color={danger ? th.danger : th.text} style={{ flex: 1 }}>{label}</Txt>
      {right}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const th = useTheme();
  const { t } = useT();
  const { settings, setSettings, setPrayer, reset } = useApp();
  const [showMethods, setShowMethods] = useState(false);
  const [locBusy, setLocBusy] = useState(false);
  const Divider = () => <View style={{ height: 2, backgroundColor: th.border }} />;
  const Sub = ({ children }: { children: string }) => (
    <Txt w="black" size={12} color={th.muted} style={{ marginBottom: 8, marginTop: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{children}</Txt>
  );

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!r.canceled) setSettings({ photo: r.assets[0].uri });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Txt w="black" size={28}>{t('settings')}</Txt>

        <SectionTitle>{t('profile')}</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable onPress={pickPhoto}>
              {settings.photo ? (
                <Image source={{ uri: settings.photo }} style={{ width: 72, height: 72, borderRadius: 36 }} />
              ) : (
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: th.accent.soft, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt w="black" size={28} color={th.accent.dark}>{(settings.name || 'D')[0].toUpperCase()}</Txt>
                </View>
              )}
              <View style={{ position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: th.accent.main, borderWidth: 3, borderColor: th.card, alignItems: 'center', justifyContent: 'center' }}>
                <Camera color="#fff" size={13} strokeWidth={3} />
              </View>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Txt w="bold" size={12} color={th.muted}>{t('name')}</Txt>
              <TextInput
                value={settings.name}
                onChangeText={(v) => setSettings({ name: v })}
                style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: th.text, paddingVertical: 4, borderBottomWidth: 2, borderColor: th.border }}
              />
            </View>
          </View>
          <Sub>{t('gender')}</Sub>
          <Segmented
            options={[{ key: 'muslim', label: t('muslim') }, { key: 'muslimah', label: t('muslimah') }]}
            value={settings.gender}
            onChange={(g) => setSettings({ gender: g })}
          />
        </Card>

        <SectionTitle>{t('language')}</SectionTitle>
        <Segmented
          options={[{ key: 'id', label: 'Indonesia' }, { key: 'en', label: 'English' }, { key: 'ar', label: 'العربية' }]}
          value={settings.lang}
          onChange={(l) => setSettings({ lang: l })}
        />

        <SectionTitle>{t('appearance')}</SectionTitle>
        <Card>
          <Sub>{t('themeMode')}</Sub>
          <Segmented
            options={[{ key: 'system', label: t('system') }, { key: 'light', label: t('light') }, { key: 'dark', label: t('darkMode') }]}
            value={settings.theme}
            onChange={(m) => setSettings({ theme: m })}
          />
          <Sub>{t('accent')}</Sub>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {(Object.keys(accents) as AccentKey[]).map((k) => (
              <Pressable key={k} onPress={() => setSettings({ accent: k })} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: accents[k].main, borderBottomWidth: 4, borderColor: accents[k].dark, alignItems: 'center', justifyContent: 'center' }}>
                {settings.accent === k && <Check color="#fff" strokeWidth={4} size={20} />}
              </Pressable>
            ))}
          </View>
          <Sub>{t('dailyGoal')}</Sub>
          <Segmented
            options={[{ key: '0.5', label: '50%' }, { key: '0.6', label: '60%' }, { key: '0.8', label: '80%' }, { key: '1', label: '100%' }]}
            value={String(settings.dailyGoal) as '0.5'}
            onChange={(v) => setSettings({ dailyGoal: Number(v) })}
          />
        </Card>

        <SectionTitle>{t('prayerSettings')}</SectionTitle>
        <Card pad={12}>
          <Row
            icon={<MapPin color={th.accent.main} size={20} strokeWidth={2.6} />}
            label={settings.prayer.city ?? (settings.prayer.lat != null ? `${settings.prayer.lat.toFixed(2)}, ${settings.prayer.lng?.toFixed(2)}` : t('setLocation'))}
            right={<Txt size={13} color={th.accent.main}>{locBusy ? '...' : t('useLocation')}</Txt>}
            onPress={async () => {
              setLocBusy(true);
              await detectLocation().catch(() => {});
              setLocBusy(false);
            }}
          />
          <Divider />
          <Row label={t('method')} onPress={() => setShowMethods(!showMethods)} right={<Txt w="regular" size={13} color={th.muted} numberOfLines={1} style={{ maxWidth: 170 }}>{methods.find((m) => m.key === settings.prayer.method)?.label}</Txt>} />
          {showMethods &&
            methods.map((m) => (
              <Pressable key={m.key} onPress={() => { setPrayer({ method: m.key }); setShowMethods(false); }} style={{ flexDirection: 'row', paddingVertical: 10, paddingLeft: 12, alignItems: 'center' }}>
                <Txt w="bold" size={14} color={m.key === settings.prayer.method ? th.accent.main : th.text} style={{ flex: 1 }}>{m.label}</Txt>
                {m.key === settings.prayer.method && <Check color={th.accent.main} size={18} strokeWidth={3} />}
              </Pressable>
            ))}
          <Divider />
          <Sub>{t('asrMadhab')}</Sub>
          <Segmented
            options={[{ key: 'shafi', label: t('shafi') }, { key: 'hanafi', label: t('hanafi') }]}
            value={settings.prayer.madhab}
            onChange={(m) => setPrayer({ madhab: m })}
          />
        </Card>

        <SectionTitle>{t('data')}</SectionTitle>
        <Card pad={12}>
          <Row icon={<Download color={th.accent.main} size={20} strokeWidth={2.6} />} label={t('exportData')} onPress={() => exportData().catch((e) => Alert.alert('Error', String(e)))} />
          <Divider />
          <Row
            icon={<Upload color={th.accent.main} size={20} strokeWidth={2.6} />}
            label={t('importData')}
            onPress={async () => {
              const ok = await importData();
              if (ok !== null) Alert.alert(ok ? t('importOk') : t('importFail'));
            }}
          />
          <Divider />
          <Row
            danger
            icon={<RotateCcw color={th.danger} size={20} strokeWidth={2.6} />}
            label={t('resetData')}
            onPress={() =>
              Alert.alert(t('resetData'), t('resetConfirm'), [
                { text: t('cancel'), style: 'cancel' },
                { text: t('delete'), style: 'destructive', onPress: () => { reset(); router.replace('/onboarding'); } },
              ])
            }
          />
        </Card>
        <View style={{ marginTop: 28 }}>
          <ElKisaiCTA />
        </View>
        <Txt w="regular" size={11} color={th.faint} style={{ textAlign: 'center', marginTop: 10 }}>Daawim v1.0 · offline-first</Txt>
      </ScrollView>
    </SafeAreaView>
  );
}
