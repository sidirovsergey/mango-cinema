'use client';

import { useEffect, useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import SubscriptionModal from '@/components/auth/SubscriptionModal';
import CoinStoreModal from '@/components/auth/CoinStoreModal';

export default function GlobalModals() {
  const [authOpen, setAuthOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [coinsOpen, setCoinsOpen] = useState(false);
  // After auth success, re-fire this event
  const [pendingAfterAuth, setPendingAfterAuth] = useState<string | null>(null);

  useEffect(() => {
    const openAuth = (e: Event) => {
      const detail = (e as CustomEvent<{ afterAuthEvent?: string }>).detail;
      setPendingAfterAuth(detail?.afterAuthEvent ?? null);
      setSubOpen(false);
      setCoinsOpen(false);
      setAuthOpen(true);
    };
    const openSub = () => {
      setAuthOpen(false);
      setCoinsOpen(false);
      setSubOpen(true);
    };
    const openCoins = () => {
      setAuthOpen(false);
      setSubOpen(false);
      setCoinsOpen(true);
    };
    const closeAll = () => {
      setAuthOpen(false);
      setSubOpen(false);
      setCoinsOpen(false);
    };

    window.addEventListener('mango-modal-open-auth', openAuth);
    window.addEventListener('mango-modal-open-subscription', openSub);
    window.addEventListener('mango-modal-open-coins', openCoins);
    window.addEventListener('mango-modal-close-all', closeAll);

    return () => {
      window.removeEventListener('mango-modal-open-auth', openAuth);
      window.removeEventListener('mango-modal-open-subscription', openSub);
      window.removeEventListener('mango-modal-open-coins', openCoins);
      window.removeEventListener('mango-modal-close-all', closeAll);
    };
  }, []);

  const handleAuthSuccess = () => {
    if (pendingAfterAuth) {
      window.dispatchEvent(new Event(pendingAfterAuth));
      setPendingAfterAuth(null);
    }
  };

  return (
    <>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <SubscriptionModal
        open={subOpen}
        onClose={() => setSubOpen(false)}
      />
      <CoinStoreModal
        open={coinsOpen}
        onClose={() => setCoinsOpen(false)}
      />
    </>
  );
}
