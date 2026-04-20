import { CATALOG, type Series } from '@/lib/catalog';

/**
 * Jaccard similarity on genre sets. Returns up to `count` most similar series
 * to `current`, excluding `current` itself. Fills up to `count` with remaining
 * series if similarity pool is too small.
 */
export function getSimilarSeries(currentSlug: string, count = 4): Series[] {
  const current = CATALOG.find((s) => s.slug === currentSlug);
  if (!current) return [];
  const currentGenres = new Set(current.genres);
  const scored = CATALOG.filter((s) => s.slug !== currentSlug).map((s) => {
    const other = new Set(s.genres);
    const intersection = [...currentGenres].filter((g) => other.has(g)).length;
    const union = new Set([...currentGenres, ...s.genres]).size;
    const jaccard = union === 0 ? 0 : intersection / union;
    return { series: s, score: jaccard };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, count).map((x) => x.series);
  // Pad if fewer than count
  if (top.length < count) {
    for (const s of CATALOG) {
      if (s.slug === currentSlug) continue;
      if (top.find((t) => t.slug === s.slug)) continue;
      top.push(s);
      if (top.length === count) break;
    }
  }
  return top;
}
