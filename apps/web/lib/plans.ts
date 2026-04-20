import type { SubscriptionPlan } from '@/lib/user-store';

export const SUBSCRIPTION_PLANS: {
  id: SubscriptionPlan;
  title: string;
  priceRub: number;
  period: string;
  badge: string | null;
  savings: string | null;
}[] = [
  { id: 'month', title: 'Месяц', priceRub: 249, period: '1 мес', badge: null, savings: null },
  { id: 'quarter', title: 'Квартал', priceRub: 699, period: '3 мес', badge: null, savings: 'Экономия 6%' },
  { id: 'year', title: 'Год', priceRub: 1990, period: '12 мес', badge: 'Лучшая цена', savings: 'Экономия 33%' },
];

export const COIN_PACKAGES: {
  id: string;
  coins: number;
  bonus: number;
  priceRub: number;
  title: string;
  badge: string | null;
}[] = [
  { id: 'small', coins: 100, bonus: 0, priceRub: 99, title: '100 монет', badge: null },
  { id: 'medium', coins: 350, bonus: 50, priceRub: 299, title: '350 + 50', badge: null },
  { id: 'large', coins: 700, bonus: 150, priceRub: 499, title: '700 + 150', badge: 'Популярный' },
  { id: 'xl', coins: 1500, bonus: 500, priceRub: 999, title: '1500 + 500', badge: 'Максимум' },
];

export const EPISODE_UNLOCK_COST = 50;
