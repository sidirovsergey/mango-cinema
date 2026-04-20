'use client';

import type { Series } from './catalog';

const OVERRIDES_KEY = 'mango-series-overrides';
const AUTH_KEY = 'mango-admin-auth';

export function getSeriesOverrides(): Record<string, Partial<Series>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Partial<Series>>) : {};
  } catch {
    return {};
  }
}

export function setSeriesOverride(slug: string, override: Partial<Series>): void {
  const overrides = getSeriesOverrides();
  overrides[slug] = override;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === '1';
}

export function setAuthed(v: boolean): void {
  if (v) {
    localStorage.setItem(AUTH_KEY, '1');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}
