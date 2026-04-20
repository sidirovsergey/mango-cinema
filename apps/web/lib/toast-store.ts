'use client';

import { useState, useEffect } from 'react';

const TOAST_EVENT = 'mango-toast-show';

export function showToast(message: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message } }));
}

export function useToast(): { message: string; visible: boolean } {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message: string }>).detail.message;
      setMessage(msg);
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 2000);
    };

    window.addEventListener(TOAST_EVENT, handler);
    return () => {
      window.removeEventListener(TOAST_EVENT, handler);
      clearTimeout(timer);
    };
  }, []);

  return { message, visible };
}
