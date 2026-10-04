import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, todayKey } from './date';
import { dicts } from './i18n';
import { timesFor } from './prayer';
import type { Settings } from '@/store/app';

export const notifyDefaults = { prayer: false, daily: false, dailyHour: 20 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function askPermission() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Daawim',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function syncNotifications(settings: Settings) {
  if (Platform.OS === 'web') return;
  const n = { ...notifyDefaults, ...settings.notify };
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!n.prayer && !n.daily) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  const d = dicts[settings.lang];
  const { lat, lng, method, madhab } = settings.prayer;

  if (n.prayer && lat != null && lng != null) {
    const now = Date.now();
    for (const day of Array.from({ length: 7 }, (_, i) => addDays(todayKey(), i))) {
      const pt = timesFor(lat, lng, method, madhab, day);
      for (const p of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
        if (pt[p].getTime() <= now) continue;
        await Notifications.scheduleNotificationAsync({
          content: { title: d[p], body: d.prayerNow },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: pt[p], channelId: 'default' },
        });
      }
    }
  }

  if (n.daily) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Daawim', body: d.dailyReminderBody },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: n.dailyHour, minute: 0, channelId: 'default' },
    });
  }
}
