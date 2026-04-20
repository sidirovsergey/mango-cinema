'use client';

import { useState, useEffect } from 'react';

const KEY = 'mango-watchlist';

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mango-watchlist-update'));
  }
}

export function getWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleWatchlist(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getWatchlist();
    const idx = list.indexOf(slug);
    if (idx === -1) {
      list.push(slug);
    } else {
      list.splice(idx, 1);
    }
    localStorage.setItem(KEY, JSON.stringify(list));
    dispatch();
  } catch {
    // ignore
  }
}

export function isInWatchlist(slug: string): boolean {
  return getWatchlist().includes(slug);
}

export function onWatchlistChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('mango-watchlist-update', cb);
  return () => window.removeEventListener('mango-watchlist-update', cb);
}

export function useWatchlist(): string[] {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(getWatchlist());
    const unsub = onWatchlistChange(() => setList(getWatchlist()));
    return unsub;
  }, []);

  return list;
}
