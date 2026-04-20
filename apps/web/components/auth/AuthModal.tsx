'use client';

import { useEffect, useRef, useState } from 'react';
import { setUser } from '@/lib/user-store';

interface Props {
  open: boolean;
  onClose(): void;
  onAuthSuccess?(): void;
}

export default function AuthModal({ open, onClose, onAuthSuccess }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep('phone');
      setPhone('');
      setOtp('');
      setPhoneError('');
      setOtpError('');
      setTimeout(() => phoneRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRef.current?.focus(), 50);
    }
  }, [step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePhoneSubmit = () => {
    const cleaned = phone.trim();
    if (!cleaned.startsWith('+7') || cleaned.replace(/\D/g, '').length !== 11) {
      setPhoneError('Введите номер формата +7 999 123 45 67');
      return;
    }
    setPhoneError('');
    setStep('otp');
  };

  const handleOtpSubmit = () => {
    const cleaned = otp.trim();
    if (!/^\d{6}$/.test(cleaned)) {
      setOtpError('Введите 6 цифр');
      return;
    }
    setOtpError('');
    setUser({
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
      subscription: { active: false, plan: null, expiresAt: null },
      coinBalance: 0,
      unlockedEpisodes: [],
    });
    onAuthSuccess?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Закрыть"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'phone' ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Вход в Mango Cinema</h2>
              <p className="mt-1 text-sm text-zinc-400">Отправим код на ваш номер</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  ref={phoneRef}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handlePhoneSubmit(); }}
                  placeholder="+7 999 123 45 67"
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white placeholder-zinc-500 focus:border-mango focus:outline-none focus:ring-1 focus:ring-mango transition-colors"
                />
                {phoneError && <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>}
              </div>

              <button
                onClick={handlePhoneSubmit}
                className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-100 active:scale-[0.98] transition-all"
              >
                Получить код
              </button>

              <p className="text-center text-xs text-zinc-400">
                Для демо код — любой 6-значный
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Введите код</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Отправили SMS на {phone}{' '}
                <button
                  onClick={() => setStep('phone')}
                  className="text-mango hover:underline"
                >
                  Изменить
                </button>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleOtpSubmit(); }}
                  placeholder="000000"
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-zinc-600 focus:border-mango focus:outline-none focus:ring-1 focus:ring-mango transition-colors"
                />
                {otpError && <p className="mt-1.5 text-xs text-red-400 text-center">{otpError}</p>}
              </div>

              <button
                onClick={handleOtpSubmit}
                className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-100 active:scale-[0.98] transition-all"
              >
                Войти
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
