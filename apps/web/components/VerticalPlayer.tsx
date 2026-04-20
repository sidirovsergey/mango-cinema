'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Episode } from '@/lib/episodes';

interface Props {
  episodes: Episode[];
}

export default function VerticalPlayer({ episodes }: Props) {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const touchStartY = useRef(0);
  const wheelCooldown = useRef(false);

  const episode = episodes[index]!;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(episodes.length - 1, next));
      if (clamped !== index) {
        setIndex(clamped);
        setLoading(true);
        setProgress(0);
      }
    },
    [index, episodes.length],
  );

  const nextEpisode = useCallback(() => goTo(index + 1), [index, goTo]);
  const prevEpisode = useCallback(() => goTo(index - 1), [index, goTo]);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);

    let hls: import('hls.js').default | null = null;

    const initHls = async () => {
      const Hls = (await import('hls.js')).default;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hlsRef.current = hls;
        hls.loadSource(episode.hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => {
            // Autoplay blocked — user must tap
          });
        });
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) setLoading(false);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = episode.hlsUrl;
        video.addEventListener(
          'loadedmetadata',
          () => {
            setLoading(false);
            video.play().catch(() => {});
          },
          { once: true },
        );
      }
    };

    initHls();

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [episode.hlsUrl]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress(video.currentTime / video.duration);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  // Wheel navigation (desktop)
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelCooldown.current) return;
      wheelCooldown.current = true;
      setTimeout(() => {
        wheelCooldown.current = false;
      }, 600);

      if (e.deltaY > 0) nextEpisode();
      else if (e.deltaY < 0) prevEpisode();
    },
    [nextEpisode, prevEpisode],
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') nextEpisode();
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') prevEpisode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextEpisode, prevEpisode]);

  // Touch navigation
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]!.clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0]!.clientY - touchStartY.current;
      if (deltaY < -50) nextEpisode();
      else if (deltaY > 50) prevEpisode();
    },
    [nextEpisode, prevEpisode],
  );

  // Tap to play/pause (center) or seek (left/right thirds)
  const onTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      // Left third — seek back 10s
      video.currentTime = Math.max(0, video.currentTime - 10);
    } else if (x > third * 2) {
      // Right third — seek forward 10s
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    } else {
      // Center — toggle play/pause
      if (video.paused) {
        video.play().catch(() => {});
        setPaused(false);
      } else {
        video.pause();
        setPaused(true);
      }
    }
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* 9:16 video frame */}
      <div
        className="relative overflow-hidden bg-black"
        style={{
          aspectRatio: '9 / 16',
          height: '100%',
          maxHeight: '100dvh',
          maxWidth: 'min(100vw, calc(100dvh * 9 / 16))',
          width: 'auto',
        }}
        onClick={onTap}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          autoPlay
          muted
          loop
        />

        {/* Progress bar — top of frame */}
        <div className="absolute left-0 right-0 top-0 z-20 h-0.5 bg-white/20">
          <div
            className="h-full bg-orange-400 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-orange-400" />
          </div>
        )}

        {/* Paused indicator */}
        {paused && !loading && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-full bg-black/50 p-4">
              <svg
                className="h-10 w-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Top-left wordmark */}
        <div className="absolute left-4 top-4 z-20">
          <span
            className="text-sm font-bold tracking-wider"
            style={{ color: '#FF6B35' }}
          >
            MANGO CINEMA
          </span>
        </div>

        {/* Right-side action icons (non-functional) */}
        <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-5">
          {/* Heart */}
          <button
            className="flex flex-col items-center gap-1 text-white"
            aria-label="Нравится"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-xs font-semibold">12K</span>
          </button>

          {/* Comment */}
          <button
            className="flex flex-col items-center gap-1 text-white"
            aria-label="Комментарии"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs font-semibold">348</span>
          </button>

          {/* Share */}
          <button
            className="flex flex-col items-center gap-1 text-white"
            aria-label="Поделиться"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span className="text-xs font-semibold">Поделиться</span>
          </button>

          {/* Episode dots */}
          <div className="mt-2 flex flex-col items-center gap-1.5">
            {episodes.map((ep, i) => (
              <button
                key={ep.id}
                aria-label={ep.title}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                className="rounded-full transition-all"
                style={{
                  width: i === index ? 6 : 4,
                  height: i === index ? 6 : 4,
                  background: i === index ? '#FF6B35' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom overlay: series + episode title */}
        <div className="absolute bottom-6 left-4 right-16 z-20 select-none">
          <p
            className="text-sm font-semibold tracking-wide"
            style={{ color: '#FF6B35' }}
          >
            {episode.seriesTitle}
          </p>
          <p className="mt-0.5 text-base font-medium leading-snug text-white drop-shadow">
            {episode.title}
          </p>

          {/* Swipe hint */}
          <p className="mt-2 text-xs text-white/40">
            Свайп вверх — следующий эпизод
          </p>
        </div>
      </div>
    </div>
  );
}
