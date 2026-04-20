'use client';

import { useState, useEffect, useRef, FormEvent, DragEvent } from 'react';
import { useParams } from 'next/navigation';
import { CATALOG, Episode } from '../../../../lib/catalog';
import { getSeriesOverrides, setSeriesOverride } from '../../../../lib/admin-store';
import { logAudit } from '../../../../lib/admin-audit-store';

const ORDER_KEY_PREFIX = 'mango-admin-episode-order-';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseDuration(str: string): number {
  const parts = str.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]!, 10) * 60 + parseInt(parts[1]!, 10);
  }
  return 0;
}

function loadEpisodeOrder(slug: string): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ORDER_KEY_PREFIX + slug);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function saveEpisodeOrder(slug: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDER_KEY_PREFIX + slug, JSON.stringify(ids));
}

function applyOrder(episodes: Episode[], order: string[] | null): Episode[] {
  if (!order || order.length === 0) return episodes;
  const map = new Map(episodes.map((ep) => [ep.id, ep]));
  const sorted: Episode[] = [];
  for (const id of order) {
    const ep = map.get(id);
    if (ep) sorted.push(ep);
    map.delete(id);
  }
  // append any episodes not in saved order
  for (const ep of map.values()) sorted.push(ep);
  return sorted.map((ep, i) => ({ ...ep, number: i + 1 }));
}

export default function SeriesEditorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const base = CATALOG.find((s) => s.slug === slug);

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [toast, setToast] = useState(false);

  // Drag state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!base) return;
    const overrides = getSeriesOverrides();
    const merged = { ...base, ...overrides[slug] };
    setTitle(merged.title);
    setTagline(merged.tagline);
    setDescription(merged.description);
    setGenres(merged.genres.join(', '));
    setPosterUrl(merged.posterUrl);
    setBannerUrl(merged.bannerUrl);
    const rawEps = overrides[slug]?.episodes ?? base.episodes;
    const savedOrder = loadEpisodeOrder(slug);
    setEpisodes(applyOrder(rawEps, savedOrder));
  }, [base, slug]);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setSeriesOverride(slug, {
      title,
      tagline,
      description,
      genres: genres.split(',').map((g) => g.trim()).filter(Boolean),
      posterUrl,
      bannerUrl,
      episodes,
    });
    logAudit('series.update', slug, {
      fields: ['title', 'tagline', 'description', 'genres', 'posterUrl', 'bannerUrl'],
    });
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  function handleDeleteEpisode(id: string) {
    setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
    logAudit('episode.delete', id);
  }

  function handleAddEpisode() {
    const newId = `${slug}-ep-new-${Date.now()}`;
    const newEp: Episode = {
      id: newId,
      number: episodes.length + 1,
      title: 'Новый эпизод',
      duration: 180,
      videoUrl: '',
      isFree: false,
    };
    setEpisodes((prev) => [...prev, newEp]);
    logAudit('episode.create', newId);
  }

  function handleEpisodeChange(id: string, field: keyof Episode, value: string | boolean | number) {
    setEpisodes((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, [field]: value } : ep))
    );
  }

  // ---- Drag handlers ----
  function handleDragStart(e: DragEvent<HTMLTableRowElement>, index: number) {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: DragEvent<HTMLTableRowElement>, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e: DragEvent<HTMLTableRowElement>, dropIndex: number) {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    setEpisodes((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(dropIndex, 0, moved!);
      const numbered = reordered.map((ep, i) => ({ ...ep, number: i + 1 }));
      const newOrder = numbered.map((ep) => ep.id);
      saveEpisodeOrder(slug, newOrder);
      logAudit('episode.reorder', slug, { order: newOrder });
      return numbered;
    });
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  if (!base) {
    return <div className="text-zinc-400">Серия не найдена</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {toast && (
        <div className="fixed top-6 right-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm z-50">
          Сохранено
        </div>
      )}

      <div>
        <h1 className="text-white text-2xl font-semibold">Редактор серии</h1>
        <p className="text-zinc-400 text-sm mt-1">{base.title}</p>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900/50 rounded-xl p-6 space-y-4">
        <h2 className="text-white text-base font-medium mb-2">Метаданные</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">Название</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">Слоган</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35] resize-none"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">Жанры (через запятую)</label>
          <input
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            placeholder="драма, романтика"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">URL постера</label>
            <input
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">URL баннера</label>
            <input
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#FF6B35] text-black font-medium rounded-lg px-4 py-2 text-sm hover:bg-[#ff7d4d] transition-colors"
        >
          Сохранить
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-base font-medium">Эпизоды</h2>
          <button
            onClick={handleAddEpisode}
            className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 hover:bg-zinc-700 transition-colors"
          >
            + Добавить эпизод
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-zinc-900/50">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800">
                {['', '№', 'Название', 'Длит.', 'Бесплатный', 'Video URL', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {episodes.map((ep, index) => (
                <tr
                  key={ep.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-zinc-800 last:border-0 transition-opacity ${
                    dragIndexRef.current === index ? 'opacity-50' : 'opacity-100'
                  } ${
                    dragOverIndex === index && dragIndexRef.current !== index
                      ? 'border-t-2 border-t-[#FF6B35]'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3 w-8">
                    <span
                      className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-grab active:cursor-grabbing select-none text-base"
                      title="Перетащить для переупорядочивания"
                    >
                      ≡
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{ep.number}</td>
                  <td className="px-4 py-3">
                    <input
                      value={ep.title}
                      onChange={(e) => handleEpisodeChange(ep.id, 'title', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white text-sm w-40 focus:outline-none focus:border-[#FF6B35]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={formatDuration(ep.duration)}
                      onChange={(e) => handleEpisodeChange(ep.id, 'duration', parseDuration(e.target.value))}
                      placeholder="3:05"
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white text-sm w-20 focus:outline-none focus:border-[#FF6B35]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={ep.isFree}
                      onChange={(e) => handleEpisodeChange(ep.id, 'isFree', e.target.checked)}
                      className="accent-[#FF6B35]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 max-w-xs truncate">
                    {ep.videoUrl || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteEpisode(ep.id)}
                      className="text-rose-400 hover:text-rose-300 transition-colors text-base"
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
              {episodes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 text-sm">
                    Нет эпизодов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
