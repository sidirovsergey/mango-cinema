// Seeded LCG RNG for reproducibility
function makeLCG(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rng = makeLCG(42);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function randChars(len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

function randPhone(): string {
  const d = () => randInt(0, 9);
  return `+7 9${d()}${d()} ${d()}${d()}${d()} ${d()}${d()} ${d()}${d()}`;
}

function randDate(daysBack: number): string {
  const ms = Date.now() - Math.floor(rng() * daysBack * 86400000);
  return new Date(ms).toISOString();
}

const RUSSIAN_NAMES = [
  'Анна', 'Мария', 'Елена', 'Ольга', 'Наталья',
  'Татьяна', 'Ирина', 'Светлана', 'Юлия', 'Екатерина',
  'Александр', 'Дмитрий', 'Андрей', 'Сергей', 'Михаил',
  'Алексей', 'Иван', 'Николай', 'Владимир', 'Максим',
  'Виктория', 'Полина', 'Дарья', 'Анастасия', 'Ксения',
];

export interface MockUser {
  id: string;
  phone: string;
  display_name: string;
  has_subscription: boolean;
  coin_balance: number;
  created_at: string;
}

export interface MockPayment {
  id: string;
  user_id: string;
  amount: number;
  provider: 'yukassa' | 'sbp';
  purpose: 'subscription' | 'coin_package';
  status: 'succeeded' | 'pending' | 'canceled';
  created_at: string;
}

export const MOCK_USERS: MockUser[] = (() => {
  const users: MockUser[] = [];
  for (let i = 0; i < 50; i++) {
    users.push({
      id: 'usr_' + randChars(8),
      phone: randPhone(),
      display_name: randItem(RUSSIAN_NAMES),
      has_subscription: rng() < 0.6,
      coin_balance: randInt(0, 500),
      created_at: randDate(90),
    });
  }
  return users;
})();

export const MOCK_PAYMENTS: MockPayment[] = (() => {
  const amounts = [99, 299, 499, 999];
  const payments: MockPayment[] = [];
  for (let i = 0; i < 30; i++) {
    const roll = rng();
    const status: MockPayment['status'] =
      roll < 0.8 ? 'succeeded' : roll < 0.95 ? 'pending' : 'canceled';
    payments.push({
      id: 'pay_' + randChars(8),
      user_id: randItem(MOCK_USERS).id,
      amount: randItem(amounts),
      provider: rng() < 0.5 ? 'yukassa' : 'sbp',
      purpose: rng() < 0.5 ? 'subscription' : 'coin_package',
      status,
      created_at: randDate(30),
    });
  }
  // sort by date desc
  return payments.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
})();
