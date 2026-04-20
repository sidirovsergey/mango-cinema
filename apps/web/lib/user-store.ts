'use client';

import { useState, useEffect } from 'react';
import type { Episode } from '@/lib/catalog';

export type SubscriptionPlan = 'month' | 'quarter' | 'year';

export type UserState = {
  phone: string;
  createdAt: string;
  subscription: {
    active: boolean;
    plan: SubscriptionPlan | null;
    expiresAt: string | null;
  };
  coinBalance: number;
  unlockedEpisodes: string[];
};

const KEY = 'mango-user-state';

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mango-user-update'));
  }
}

export function getUser(): UserState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserState) : null;
  } catch {
    return null;
  }
}

export function setUser(state: UserState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
  dispatch();
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  dispatch();
}

export function isAuthed(): boolean {
  return getUser() !== null;
}

export function hasActiveSubscription(): boolean {
  const user = getUser();
  if (!user) return false;
  if (!user.subscription.active) return false;
  if (!user.subscription.expiresAt) return false;
  return new Date(user.subscription.expiresAt) > new Date();
}

export function hasUnlock(episodeId: string): boolean {
  const user = getUser();
  if (!user) return false;
  return user.unlockedEpisodes.includes(episodeId);
}

export function unlockEpisode(episodeId: string, cost: number): boolean {
  const user = getUser();
  if (!user) return false;
  if (user.coinBalance < cost) return false;
  const updated: UserState = {
    ...user,
    coinBalance: user.coinBalance - cost,
    unlockedEpisodes: [...user.unlockedEpisodes, episodeId],
  };
  setUser(updated);
  return true;
}

export function addCoins(amount: number): void {
  const user = getUser();
  if (!user) return;
  setUser({ ...user, coinBalance: user.coinBalance + amount });
}

export function activateSubscription(plan: SubscriptionPlan): void {
  const user = getUser();
  if (!user) return;
  const now = new Date();
  const durations: Record<SubscriptionPlan, number> = {
    month: 30,
    quarter: 90,
    year: 365,
  };
  const expiresAt = new Date(now.getTime() + durations[plan] * 24 * 60 * 60 * 1000).toISOString();
  setUser({
    ...user,
    subscription: { active: true, plan, expiresAt },
  });
}

export function canWatchEpisode(ep: Episode, user: UserState | null): boolean {
  if (ep.isFree) return true;
  if (!user) return false;
  if (user.subscription.active && user.subscription.expiresAt && new Date(user.subscription.expiresAt) > new Date()) return true;
  return user.unlockedEpisodes.includes(ep.id);
}

export function onUserStateChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('mango-user-update', cb);
  return () => window.removeEventListener('mango-user-update', cb);
}

export function useUser(): UserState | null {
  const [state, setState] = useState<UserState | null>(null);

  useEffect(() => {
    setState(getUser());
    const unsub = onUserStateChange(() => setState(getUser()));
    return unsub;
  }, []);

  return state;
}
