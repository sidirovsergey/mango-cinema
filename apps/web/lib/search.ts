import { CATALOG, type Series, type Episode } from '@/lib/catalog';

export type SearchResultSeries = {
  type: 'series';
  series: Series;
  matchedField: 'title' | 'tagline' | 'description' | 'genre';
  snippet: string;
};

export type SearchResultEpisode = {
  type: 'episode';
  series: Series;
  episode: Episode;
  snippet: string;
};

export type SearchResult = SearchResultSeries | SearchResultEpisode;

export function searchCatalog(query: string, limit = 20): SearchResult[] {
  const q = query.trim().toLocaleLowerCase('ru');
  if (q.length < 1) return [];
  const results: SearchResult[] = [];
  for (const s of CATALOG) {
    if (s.title.toLocaleLowerCase('ru').includes(q)) {
      results.push({ type: 'series', series: s, matchedField: 'title', snippet: s.title });
      continue;
    }
    if (s.tagline.toLocaleLowerCase('ru').includes(q)) {
      results.push({ type: 'series', series: s, matchedField: 'tagline', snippet: s.tagline });
      continue;
    }
    if (s.description.toLocaleLowerCase('ru').includes(q)) {
      results.push({ type: 'series', series: s, matchedField: 'description', snippet: s.description });
      continue;
    }
    const genre = s.genres.find((g) => g.toLocaleLowerCase('ru').includes(q));
    if (genre) {
      results.push({ type: 'series', series: s, matchedField: 'genre', snippet: genre });
      continue;
    }
    for (const e of s.episodes) {
      if (e.title.toLocaleLowerCase('ru').includes(q)) {
        results.push({ type: 'episode', series: s, episode: e, snippet: `${s.title} · Эп. ${e.number}` });
      }
    }
  }
  return results.slice(0, limit);
}
