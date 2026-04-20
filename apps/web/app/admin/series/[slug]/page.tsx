'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { CATALOG, Episode } from '../../../../lib/catalog';
import { getSeriesOverrides, setSeriesOverride } from '../../../../lib/admin-store';

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
    setEpisodes(overrides[slug]?.episodes ?? base.episodes);
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
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  function handleDeleteEpisode(id: string) {
    setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
  }

  function handleAddEpisode() {
    const newEp: Episode = {
      id: `${slug}-ep-new-${Date.now()}`,
      number: episodes.length + 1,
      title: 'Новый эпизод',
      duration: 180,
      videoUrl: '',
      isFree: false,
    };
    setEpisodes((prev) => [...prev, newEp]);
  }

  function handleEpisodeChange(id: string, field: keyof Episode, value: string | boolean | number) {
    setEpisodes((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, [field]: value } : ep))
    );
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
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-800">
                {['№', 'Название', 'Длит.', 'Бесплатный', 'Video URL', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {episodes.map((ep) => (
                <tr key={ep.id} className="border-b border-zinc-800 last:border-0">
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
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 text-sm">
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
