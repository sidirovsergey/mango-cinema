'use client';

import { useToast } from '@/lib/toast-store';

export default function Toast() {
  const { message, visible } = useToast();

  return (
    <div
      aria-live="polite"
      className={[
        'fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 rounded-xl bg-zinc-800 px-5 py-3 text-sm font-medium text-white shadow-xl transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
