import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { todayKey } from './date';
import { exportable, useApp, type State } from '@/store/app';

export async function exportData() {
  const file = new File(Paths.cache, `daawim-backup-${todayKey()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify({ app: 'daawim', version: 1, data: exportable() }, null, 2));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Daawim backup' });
}

export async function importData(): Promise<boolean | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
  if (res.canceled) return null;
  try {
    const json = JSON.parse(await new File(res.assets[0].uri).text());
    const data = json?.data as State | undefined;
    if (json?.app !== 'daawim' || !data?.habits || !data?.settings) return false;
    useApp.getState().importState(data);
    return true;
  } catch {
    return false;
  }
}
