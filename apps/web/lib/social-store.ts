'use client';

import { useState, useEffect } from 'react';
import { CATALOG } from '@/lib/catalog';
import { getUser } from '@/lib/user-store';

// ── Types ──────────────────────────────────────────────────────────────────

export type Comment = {
  id: string;
  episodeId: string;
  author: string;
  avatarSeed: string;
  text: string;
  createdAt: string;
  likes: number;
  fromCurrentUser: boolean;
};

export type EpisodeStats = {
  episodeId: string;
  views: number;
  likes: number;
  commentCount: number;
};

// ── LCG seeded RNG (same pattern as admin-mock.ts) ────────────────────────

function makeLCG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// One shared seeded RNG — deterministic for the whole module
const rng = makeLCG(0xdeadbeef);

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

// ── Seed data ─────────────────────────────────────────────────────────────

const NAMES = [
  'Анна','Мария','София','Елена','Ольга','Виктория','Екатерина','Алина',
  'Дарья','Наталья','Иван','Дмитрий','Александр','Артём','Максим',
  'Никита','Сергей','Андрей',
];

const COMMENT_TEXTS = [
  '🔥🔥🔥',
  'это невозможно смотреть без эмоций',
  'когда следующий эпизод?!',
  'плачу уже 10 минут 😭',
  'актёры топ',
  'Мангодоставка когда?',
  'а где подписка?',
  'лучший сериал на сервисе',
  'вау вау вау',
  'финал огонь',
  'до сих пор в шоке',
  'не могу оторваться',
  '💔💔💔',
  'жду следующую серию как ребёнок',
  'Запретная школа — новый сезон когда?',
  'великолепно просто',
  'серия пушка',
  'хочу ещё',
  'боже мой',
  '😍😍😍',
];

// Collect all episode ids from catalog
const ALL_EPISODE_IDS: string[] = CATALOG.flatMap((s) => s.episodes.map((e) => e.id));

// Seeded baseline per episode — computed once at module load
type SeededEpisodeData = {
  views: number;
  likes: number;
  comments: Comment[];
};

const SEED_DATA: Record<string, SeededEpisodeData> = (() => {
  const result: Record<string, SeededEpisodeData> = {};
  const now = Date.now();

  for (const epId of ALL_EPISODE_IDS) {
    const views = randInt(1000, 50000);
    const likePct = rng() * 0.10 + 0.05; // 5-15%
    const likes = Math.round(views * likePct);
    const commentCount = randInt(3, 8);

    const comments: Comment[] = [];
    for (let i = 0; i < commentCount; i++) {
      const daysAgo = rng() * 30;
      const msAgo = daysAgo * 86400000;
      comments.push({
        id: 'cmt_' + randChars(8),
        episodeId: epId,
        author: randItem(NAMES),
        avatarSeed: randChars(6),
        text: randItem(COMMENT_TEXTS),
        createdAt: new Date(now - msAgo).toISOString(),
        likes: randInt(0, 50),
        fromCurrentUser: false,
      });
    }

    // Sort newest first
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    result[epId] = { views, likes, comments };
  }

  return result;
})();

// ── localStorage helpers (SSR-safe) ───────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const LS_USER_LIKES = 'mango-social-user-likes';
const LS_USER_COMMENTS = 'mango-social-user-comments';
const LS_COMMENT_LIKES = 'mango-social-comment-likes';
const LS_VIEW_BONUS = 'mango-social-view-bonus';
const LS_ADDED_COMMENT_LIKES = 'mango-social-added-comment-likes';

// ── Event bus ─────────────────────────────────────────────────────────────

const SOCIAL_EVENT = 'mango-social-update';

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SOCIAL_EVENT));
  }
}

export function onSocialChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SOCIAL_EVENT, cb);
  return () => window.removeEventListener(SOCIAL_EVENT, cb);
}

// ── Stats ─────────────────────────────────────────────────────────────────

export function getEpisodeStats(episodeId: string): EpisodeStats {
  const seed = SEED_DATA[episodeId];
  if (!seed) return { episodeId, views: 0, likes: 0, commentCount: 0 };

  const userLikes = lsGet<string[]>(LS_USER_LIKES, []);
  const viewBonus = lsGet<Record<string, number>>(LS_VIEW_BONUS, {});
  const userComments = lsGet<Comment[]>(LS_USER_COMMENTS, []).filter(
    (c) => c.episodeId === episodeId,
  );
  const addedCommentLikes = lsGet<Record<string, number>>(LS_ADDED_COMMENT_LIKES, {});

  const likedByUser = userLikes.includes(episodeId) ? 1 : 0;
  const views = seed.views + (viewBonus[episodeId] ?? 0);
  const likes = seed.likes + likedByUser;
  const commentCount = seed.comments.length + userComments.length;

  // Suppress TS unused warning
  void addedCommentLikes;

  return { episodeId, views, likes, commentCount };
}

export function getAllEpisodeStats(): Record<string, EpisodeStats> {
  const result: Record<string, EpisodeStats> = {};
  for (const id of ALL_EPISODE_IDS) {
    result[id] = getEpisodeStats(id);
  }
  return result;
}

// ── Likes ─────────────────────────────────────────────────────────────────

export function hasLiked(episodeId: string): boolean {
  return lsGet<string[]>(LS_USER_LIKES, []).includes(episodeId);
}

export function toggleLike(episodeId: string): boolean {
  const current = lsGet<string[]>(LS_USER_LIKES, []);
  let next: string[];
  if (current.includes(episodeId)) {
    next = current.filter((id) => id !== episodeId);
  } else {
    next = [...current, episodeId];
  }
  lsSet(LS_USER_LIKES, next);
  dispatch();
  return next.includes(episodeId);
}

// ── Comments ──────────────────────────────────────────────────────────────

export function getComments(episodeId: string): Comment[] {
  const seed = SEED_DATA[episodeId];
  const seeded: Comment[] = seed ? seed.comments : [];

  const addedLikes = lsGet<Record<string, number>>(LS_ADDED_COMMENT_LIKES, {});
  const commentLikedIds = lsGet<string[]>(LS_COMMENT_LIKES, []);

  // Merge seeded comments with any extra likes added by user
  const seededMerged = seeded.map((c) => ({
    ...c,
    likes: c.likes + (addedLikes[c.id] ?? 0),
  }));

  const userComments = lsGet<Comment[]>(LS_USER_COMMENTS, [])
    .filter((c) => c.episodeId === episodeId)
    .map((c) => ({
      ...c,
      likes: c.likes + (addedLikes[c.id] ?? 0),
    }));

  void commentLikedIds; // used in hasLikedComment

  return [...userComments, ...seededMerged];
}

export function addComment(episodeId: string, text: string): Comment | null {
  const user = getUser();
  if (!user) return null;

  const comment: Comment = {
    id: 'cmt_' + Math.random().toString(36).slice(2, 10),
    episodeId,
    author: user.phone.slice(-4), // last 4 digits as display name
    avatarSeed: user.phone.slice(-6),
    text: text.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
    fromCurrentUser: true,
  };

  const existing = lsGet<Comment[]>(LS_USER_COMMENTS, []);
  lsSet(LS_USER_COMMENTS, [comment, ...existing]);
  dispatch();
  return comment;
}

export function toggleCommentLike(commentId: string): void {
  const liked = lsGet<string[]>(LS_COMMENT_LIKES, []);
  const addedLikes = lsGet<Record<string, number>>(LS_ADDED_COMMENT_LIKES, {});

  if (liked.includes(commentId)) {
    lsSet(LS_COMMENT_LIKES, liked.filter((id) => id !== commentId));
    lsSet(LS_ADDED_COMMENT_LIKES, {
      ...addedLikes,
      [commentId]: Math.max(0, (addedLikes[commentId] ?? 0) - 1),
    });
  } else {
    lsSet(LS_COMMENT_LIKES, [...liked, commentId]);
    lsSet(LS_ADDED_COMMENT_LIKES, {
      ...addedLikes,
      [commentId]: (addedLikes[commentId] ?? 0) + 1,
    });
  }
  dispatch();
}

export function hasLikedComment(commentId: string): boolean {
  return lsGet<string[]>(LS_COMMENT_LIKES, []).includes(commentId);
}

// ── Views ─────────────────────────────────────────────────────────────────

export function incrementView(episodeId: string): void {
  const bonus = lsGet<Record<string, number>>(LS_VIEW_BONUS, {});
  lsSet(LS_VIEW_BONUS, { ...bonus, [episodeId]: (bonus[episodeId] ?? 0) + 1 });
  dispatch();
}

// ── React hooks ───────────────────────────────────────────────────────────

export function useEpisodeStats(episodeId: string): EpisodeStats {
  const [stats, setStats] = useState<EpisodeStats>(() => getEpisodeStats(episodeId));

  useEffect(() => {
    setStats(getEpisodeStats(episodeId));
    return onSocialChange(() => setStats(getEpisodeStats(episodeId)));
  }, [episodeId]);

  return stats;
}

export function useComments(episodeId: string): Comment[] {
  const [comments, setComments] = useState<Comment[]>(() => getComments(episodeId));

  useEffect(() => {
    setComments(getComments(episodeId));
    return onSocialChange(() => setComments(getComments(episodeId)));
  }, [episodeId]);

  return comments;
}
