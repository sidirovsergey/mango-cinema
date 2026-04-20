'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useComments,
  addComment,
  toggleCommentLike,
  hasLikedComment,
} from '@/lib/social-store';
import { useUser } from '@/lib/user-store';
import { openAuthModal } from '@/lib/modal-store';
import type { Comment } from '@/lib/social-store';

// ── Helpers ──────────────────────────────────────────────────────────────

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${pluralize(diffHr, 'час', 'часа', 'часов')} назад`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} ${pluralize(diffDay, 'день', 'дня', 'дней')} назад`;
  const diffMo = Math.floor(diffDay / 30);
  return `${diffMo} ${pluralize(diffMo, 'месяц', 'месяца', 'месяцев')} назад`;
}

function avatarColors(seed: string): [string, string] {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < seed.length; i++) {
    h1 = (h1 * 31 + seed.charCodeAt(i)) >>> 0;
    h2 = (h2 * 37 + seed.charCodeAt(i)) >>> 0;
  }
  const c1 = `hsl(${h1 % 360}, 65%, 50%)`;
  const c2 = `hsl(${h2 % 360}, 65%, 60%)`;
  return [c1, c2];
}

function formatLikes(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return Math.round(n / 1000) + 'K';
}

// ── Avatar ────────────────────────────────────────────────────────────────

function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const [c1, c2] = avatarColors(seed);
  return (
    <div
      className="shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    />
  );
}

// ── CommentRow ─────────────────────────────────────────────────────────────

function CommentRow({ comment }: { comment: Comment }) {
  const [liked, setLiked] = useState(() => hasLikedComment(comment.id));
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    toggleCommentLike(comment.id);
    const nowLiked = !liked;
    setLiked(nowLiked);
    setLikeCount((n) => n + (nowLiked ? 1 : -1));
  };

  const isLong = comment.text.length > 120;
  const displayText =
    isLong && !expanded ? comment.text.slice(0, 120) + '…' : comment.text;

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar seed={comment.avatarSeed} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{comment.author}</span>
          {comment.fromCurrentUser && (
            <span className="rounded-full bg-mango/20 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-mango">
              вы
            </span>
          )}
          <span className="ml-auto text-xs text-white/30">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-sm leading-snug text-white/80 break-words">
          {displayText}
          {isLong && !expanded && (
            <button
              className="ml-1 text-xs text-white/50 hover:text-white/80"
              onClick={() => setExpanded(true)}
            >
              Читать полностью
            </button>
          )}
        </p>
        <button
          className="mt-1.5 flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          onClick={handleLike}
          aria-label="Нравится комментарий"
        >
          <svg
            className={['h-3.5 w-3.5', liked ? 'text-[#FF3B5C]' : ''].join(' ')}
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className={liked ? 'text-[#FF3B5C]' : ''}>{formatLikes(likeCount)}</span>
        </button>
      </div>
    </div>
  );
}

// ── CommentsSheet ─────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose(): void;
  episodeId: string;
  seriesTitle: string;
  episodeTitle: string;
}

export default function CommentsSheet({
  open,
  onClose,
  episodeId,
  seriesTitle,
  episodeTitle,
}: Props) {
  const user = useUser();
  const comments = useComments(episodeId);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(episodeId, trimmed);
    setText('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl bg-zinc-950 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-lg md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-white/8">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-zinc-600" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Комментарии{' '}
                <span className="text-sm font-normal text-zinc-400">{comments.length}</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-px">
                {seriesTitle} · {episodeTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white/60 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {comments.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">Будьте первым!</p>
          ) : (
            <div className="divide-y divide-white/5">
              {comments.map((c) => (
                <CommentRow key={c.id} comment={c} />
              ))}
            </div>
          )}
        </div>

        {/* Footer: input or auth prompt */}
        <div className="flex-shrink-0 border-t border-white/8 px-4 py-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar seed={user.phone.slice(-6)} size={36} />
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите комментарий..."
                maxLength={300}
                className="flex-1 rounded-xl bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-mango"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mango text-white transition-opacity disabled:opacity-40"
                aria-label="Отправить"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { openAuthModal(); onClose(); }}
              className="w-full rounded-xl bg-mango/10 py-3 text-sm font-semibold text-mango hover:bg-mango/20 transition-colors"
            >
              Войдите, чтобы комментировать
            </button>
          )}
        </div>
      </div>
    </>
  );
}
