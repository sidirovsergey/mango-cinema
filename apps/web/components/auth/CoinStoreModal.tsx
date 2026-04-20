'use client';

import { useEffect, useState } from 'react';
import { COIN_PACKAGES } from '@/lib/plans';
import { addCoins, isAuthed, useUser } from '@/lib/user-store';
import { openAuthModal } from '@/lib/modal-store';

interface Props {
  open: boolean;
  onClose(): void;
}

type PaymentState = 'idle' | 'paying' | 'success';

export default function CoinStoreModal({ open, onClose }: Props) {
  const user = useUser();
  const [selected, setSelected] = useState('large');
  const [payState, setPayState] = useState<PaymentState>('idle');

  useEffect(() => {
    if (open) setPayState('idle');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && payState === 'idle') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, payState]);

  if (!open) return null;

  const selectedPack = COIN_PACKAGES.find((p) => p.id === selected)!;

  const handlePay = () => {
    if (!isAuthed()) {
      onClose();
      openAuthModal('mango-modal-open-coins');
      return;
    }
    setPayState('paying');
    setTimeout(() => {
      setPayState('success');
      addCoins(selectedPack.coins + selectedPack.bonus);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget && payState === 'idle') onClose(); }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        {payState === 'idle' && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
            aria-label="Закрыть"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <h2 className="text-xl font-bold text-white mb-1">Магазин монет</h2>
        {user && (
          <p className="text-sm text-zinc-400 mb-6">
            У вас{' '}
            <span className="font-semibold text-white">{user.coinBalance}</span>{' '}
            {user.coinBalance === 1 ? 'монета' : user.coinBalance < 5 ? 'монеты' : 'монет'}
          </p>
        )}
        {!user && <p className="text-sm text-zinc-400 mb-6">Купите монеты для разблокировки эпизодов</p>}

        {/* Packages grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {COIN_PACKAGES.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelected(pack.id)}
              className={`relative rounded-xl border p-5 text-left transition-all ${
                selected === pack.id
                  ? 'border-mango ring-2 ring-mango bg-zinc-800'
                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50'
              }`}
            >
              {pack.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-mango px-2 py-0.5 text-xs font-bold text-white">
                  {pack.badge}
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-lg">🪙</span>
                <span className="text-base font-bold text-white">{pack.coins}</span>
              </div>
              {pack.bonus > 0 && (
                <p className="text-xs text-emerald-400 font-semibold mb-2">+{pack.bonus} бонус</p>
              )}
              <p className="text-xl font-bold text-white">
                {pack.priceRub}
                <span className="text-sm font-normal text-zinc-400"> ₽</span>
              </p>
            </button>
          ))}
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={payState !== 'idle'}
          className="relative w-full rounded-xl bg-mango py-3.5 text-sm font-bold text-white hover:bg-orange-500 active:scale-[0.98] transition-all disabled:cursor-not-allowed overflow-hidden"
        >
          {payState === 'idle' && (
            <span>Купить пакет · {selectedPack.priceRub} ₽</span>
          )}
          {payState === 'paying' && (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Создаём платёж...
            </span>
          )}
          {payState === 'success' && (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Успешно!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
