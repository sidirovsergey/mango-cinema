'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchCatalog, type SearchResult } from '@/lib/search';

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setResults(searchCatalog(query));
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Esc
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Enter' && query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
    },
    [query, router]
  );

  const seriesResults = results.filter((r) => r.type === 'series');
  const episodeResults = results.filter((r) => r.type === 'episode');
  const hasResults = results.length > 0;
  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Search icon button — only shown when closed */}
      {!open && (
        <button
          aria-label="Поиск"
          onClick={() => setOpen(true)}
          className="p-2 text-white hover:text-mango transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      )}

      {/* Expanded search container */}
      {open && (
        <div className="flex items-center gap-2">
          {/* Desktop: rounded pill; mobile handled via responsive widths */}
          <div className="relative flex items-center bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-full px-3 py-1.5 w-[220px] sm:w-[320px] transition-all duration-200 ease-out">
            <svg
              className="w-4 h-4 text-zinc-400 shrink-0 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Поиск сериалов и эпизодов..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="ml-1 text-zinc-500 hover:text-white transition-colors"
                aria-label="Очистить"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white text-xs transition-colors shrink-0"
          >
            Отмена
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-[340px] sm:w-[400px] max-h-96 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50">
          {!hasResults ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">
              Ничего не найдено
            </div>
          ) : (
            <>
              {seriesResults.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Сериалы
                  </div>
                  {seriesResults.map((r) => {
                    if (r.type !== 'series') return null;
                    return (
                      <Link
                        key={r.series.slug}
                        href={`/series/${r.series.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors"
                      >
                        <img
                          src={r.series.posterUrl}
                          alt={r.series.title}
                          width={48}
                          height={72}
                          className="rounded object-cover shrink-0"
                          style={{ width: 48, height: 72 }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white line-clamp-1">{r.series.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{r.snippet}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {episodeResults.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Эпизоды
                  </div>
                  {episodeResults.map((r) => {
                    if (r.type !== 'episode') return null;
                    return (
                      <Link
                        key={`${r.series.slug}-ep-${r.episode.number}`}
                        href={`/watch/${r.series.slug}?ep=${r.episode.number}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors"
                      >
                        <img
                          src={r.series.posterUrl}
                          alt={r.series.title}
                          width={48}
                          height={72}
                          className="rounded object-cover shrink-0"
                          style={{ width: 48, height: 72 }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white line-clamp-1">{r.episode.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{r.snippet}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-zinc-800 px-4 py-2.5">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setOpen(false)}
                  className="block text-xs text-center text-mango hover:text-white transition-colors"
                >
                  Показать все результаты
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
