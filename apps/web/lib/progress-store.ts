'use client';

import { useState, useEffect } from 'react';
import type { Series, Episode } from '@/lib/catalog';
import { CATALOG } from '@/lib/catalog';

export type EpisodeProgress = {
  episodeId: string;
  seriesSlug: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  lastWatchedAt: string; // ISO
};

const KEY = 'mango-progress';

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mango-progress-update'));
  }
}

export function getAllProgress(): Record<string, EpisodeProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, EpisodeProgress>) : {};
  } catch {
    return {};
  }
}

export function getEpisodeProgress(episodeId: string): EpisodeProgress | null {
  const all = getAllProgress();
  return all[episodeId] ?? null;
}

export function saveEpisodeProgress(p: EpisodeProgress): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllProgress();
    all[p.episodeId] = p;
    localStorage.setItem(KEY, JSON.stringify(all));
    dispatch();
  } catch {
    // localStorage full — ignore
  }
}

export function clearProgress(episodeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllProgress();
    delete all[episodeId];
    localStorage.setItem(KEY, JSON.stringify(all));
    dispatch();
  } catch {
    // ignore
  }
}

export function getResumeFor(seriesSlug: string): EpisodeProgress | null {
  const all = getAllProgress();
  const entries = Object.values(all)
    .filter((p) => p.seriesSlug === seriesSlug && !p.completed)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());
  return entries[0] ?? null;
}

export function getContinueWatching(): Array<{
  series: Series;
  episode: Episode;
  progress: EpisodeProgress;
}> {
  const all = getAllProgress();
  const entries = Object.values(all)
    .filter((p) => !p.completed)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .slice(0, 10);

  const result: Array<{ series: Series; episode: Episode; progress: EpisodeProgress }> = [];

  for (const p of entries) {
    const series = CATALOG.find((s) => s.slug === p.seriesSlug);
    if (!series) continue;
    const episode = series.episodes.find((e) => e.id === p.episodeId);
    if (!episode) continue;
    result.push({ series, episode, progress: p });
  }

  return result;
}

export function onProgressChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('mango-progress-update', cb);
  return () => window.removeEventListener('mango-progress-update', cb);
}

export function useProgress(): Record<string, EpisodeProgress> {
  const [state, setState] = useState<Record<string, EpisodeProgress>>({});

  useEffect(() => {
    setState(getAllProgress());
    const unsub = onProgressChange(() => setState(getAllProgress()));
    return unsub;
  }, []);

  return state;
}
