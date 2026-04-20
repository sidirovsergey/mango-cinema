'use client';

export type Studio = {
  id: string;
  name: string;
  logoUrl?: string;
  contact?: string;
};

const KEY = 'mango-admin-studios';

const DEFAULTS: Studio[] = [
  { id: 'mango-production', name: 'Mango Production', contact: 'hello@mango-production.ru' },
];

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mango-admin-studios-update'));
  }
}

export function getStudios(): Studio[] {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Studio[]) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveStudios(studios: Studio[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(studios));
  dispatch();
}

export function addStudio(s: Omit<Studio, 'id'>): Studio {
  const studio: Studio = {
    ...s,
    id: 'studio_' + Math.random().toString(36).slice(2),
  };
  const studios = getStudios();
  saveStudios([...studios, studio]);
  return studio;
}

export function updateStudio(id: string, patch: Partial<Studio>): void {
  const studios = getStudios().map((s) =>
    s.id === id ? { ...s, ...patch } : s
  );
  saveStudios(studios);
}

export function deleteStudio(id: string): void {
  const studios = getStudios().filter((s) => s.id !== id);
  saveStudios(studios);
}
