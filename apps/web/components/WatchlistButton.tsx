'use client';

import { useEffect, useState } from 'react';
import { toggleWatchlist, isInWatchlist, onWatchlistChange } from '@/lib/watchlist-store';

interface Props {
  slug: string;
}

export default function WatchlistButton({ slug }: Props) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isInWatchlist(slug));
    const unsub = onWatchlistChange(() => setInList(isInWatchlist(slug)));
    return unsub;
  }, [slug]);

  return (
    <button
      onClick={() => toggleWatchlist(slug)}
      className="flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-base font-bold transition-all active:scale-95"
      style={{
        borderColor: inList ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
        color: inList ? 'rgba(255,255,255,0.6)' : 'white',
        background: 'transparent',
      }}
    >
      {inList ? '✓ В списке' : '+ В список'}
    </button>
  );
}
