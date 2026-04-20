'use client';

export type PlanOverride = {
  priceRub?: number;
  savings?: string | null;
  badge?: string | null;
};

export type CoinPackOverride = {
  priceRub?: number;
  coins?: number;
  bonus?: number;
  badge?: string | null;
};

const PLANS_KEY = 'mango-admin-plan-overrides';
const COIN_PACKS_KEY = 'mango-admin-coinpack-overrides';

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mango-admin-plans-update'));
  }
}

export function getPlanOverrides(): Record<string, PlanOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PlanOverride>) : {};
  } catch {
    return {};
  }
}

export function setPlanOverride(id: string, o: PlanOverride): void {
  if (typeof window === 'undefined') return;
  const overrides = getPlanOverrides();
  overrides[id] = o;
  localStorage.setItem(PLANS_KEY, JSON.stringify(overrides));
  dispatch();
}

export function deletePlanOverride(id: string): void {
  if (typeof window === 'undefined') return;
  const overrides = getPlanOverrides();
  delete overrides[id];
  localStorage.setItem(PLANS_KEY, JSON.stringify(overrides));
  dispatch();
}

export function getCoinPackOverrides(): Record<string, CoinPackOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(COIN_PACKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CoinPackOverride>) : {};
  } catch {
    return {};
  }
}

export function setCoinPackOverride(id: string, o: CoinPackOverride): void {
  if (typeof window === 'undefined') return;
  const overrides = getCoinPackOverrides();
  overrides[id] = o;
  localStorage.setItem(COIN_PACKS_KEY, JSON.stringify(overrides));
  dispatch();
}

export function deleteCoinPackOverride(id: string): void {
  if (typeof window === 'undefined') return;
  const overrides = getCoinPackOverrides();
  delete overrides[id];
  localStorage.setItem(COIN_PACKS_KEY, JSON.stringify(overrides));
  dispatch();
}
