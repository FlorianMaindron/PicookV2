import AsyncStorage from '@react-native-async-storage/async-storage';

const QUOTA_KEY = 'picook_daily_quota';
const DAILY_LIMIT = 3;

interface QuotaData {
  date: string;
  count: number;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getQuota(): Promise<QuotaData> {
  const raw = await AsyncStorage.getItem(QUOTA_KEY);
  const today = todayString();
  if (!raw) return { date: today, count: 0 };
  const data = JSON.parse(raw) as QuotaData;
  if (data.date !== today) return { date: today, count: 0 };
  return data;
}

export async function consumeGeneration(): Promise<boolean> {
  const data = await getQuota();
  if (data.count >= DAILY_LIMIT) return false;
  data.count += 1;
  await AsyncStorage.setItem(QUOTA_KEY, JSON.stringify(data));
  return true;
}

export async function getRemainingGenerations(): Promise<number> {
  const data = await getQuota();
  return Math.max(0, DAILY_LIMIT - data.count);
}

export async function resetQuota(): Promise<void> {
  await AsyncStorage.removeItem(QUOTA_KEY);
}
