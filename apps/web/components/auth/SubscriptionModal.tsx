'use client';

import { useEffect, useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/plans';
import { activateSubscription, isAuthed } from '@/lib/user-store';
import type { SubscriptionPlan } from '@/lib/user-store';
import { openAuthModal } from '@/lib/modal-store';

interface Props {
  open: boolean;
  onClose(): void;
}

type PaymentState = 'idle' | 'paying' | 'success';

export default function SubscriptionModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState<SubscriptionPlan>('year');
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

  // Listen for auth-then-reopen
  useEffect(() => {
    const handler = () => {
      // reopen is handled by GlobalModals
    };
    window.addEventListener('mango-reopen-subscription', handler);
    return () => window.removeEventListener('mango-reopen-subscription', handler);
  }, []);

  if (!open) return null;

  const handlePay = () => {
    if (!isAuthed()) {
      onClose();
      openAuthModal('mango-modal-open-subscription');
      return;
    }
    setPayState('paying');
    setTimeout(() => {
      setPayState('success');
      activateSubscription(selected);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 2000);
  };

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selected)!;

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

        <h2 className="text-xl font-bold text-white mb-6">Оформить подписку Mango</h2>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {SUBSCRIPTION_PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`relative rounded-xl border p-5 text-left transition-all ${
                selected === p.id
                  ? 'border-mango ring-2 ring-mango bg-zinc-800'
                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-mango px-2 py-0.5 text-xs font-bold text-white">
                  {p.badge}
                </span>
              )}
              <p className="text-sm font-semibold text-white mb-1">{p.title}</p>
              <p className="text-2xl font-bold text-white">
                {p.priceRub.toLocaleString('ru-RU')}
                <span className="text-base font-normal text-zinc-400"> ₽</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">{p.period}</p>
              {p.savings && (
                <p className="text-xs text-mango mt-1">{p.savings}</p>
              )}
            </button>
          ))}
        </div>

        {/* Included */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-white mb-3">Что включено:</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            {[
              'Все сериалы и эпизоды',
              'Ранний доступ к новым сезонам',
              'Без рекламы',
              'Отмена в любой момент',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-mango text-base">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Pay button with states */}
        <button
          onClick={handlePay}
          disabled={payState !== 'idle'}
          className="relative w-full rounded-xl bg-mango py-3.5 text-sm font-bold text-white hover:bg-orange-500 active:scale-[0.98] transition-all disabled:cursor-not-allowed overflow-hidden"
        >
          {payState === 'idle' && (
            <span>Оплатить через ЮKassa · {plan.priceRub.toLocaleString('ru-RU')} ₽</span>
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
