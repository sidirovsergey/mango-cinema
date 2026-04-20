'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthed } from '../../../lib/admin-store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setAuthed(true);
      router.push('/admin');
    }, 400);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="text-[#FF6B35] font-bold text-2xl">Mango Cinema</span>
        <p className="text-zinc-400 text-sm mt-1">Admin Panel</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4"
      >
        <h1 className="text-white text-lg font-semibold">Вход</h1>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@mango.ru"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#FF6B35] transition-colors"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#FF6B35] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF6B35] text-black font-medium rounded-lg px-4 py-2 text-sm hover:bg-[#ff7d4d] transition-colors disabled:opacity-60"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <p className="text-zinc-600 text-xs text-center">
          Любой email и пароль для демо
        </p>
      </form>
    </div>
  );
}
