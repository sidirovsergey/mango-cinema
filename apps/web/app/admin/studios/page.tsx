'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getStudios,
  addStudio,
  updateStudio,
  deleteStudio,
  type Studio,
} from '@/lib/admin-studios-store';
import { logAudit } from '@/lib/admin-audit-store';

type DrawerMode = 'add' | 'edit';

type DrawerState = {
  open: boolean;
  mode: DrawerMode;
  id: string;
  name: string;
  logoUrl: string;
  contact: string;
};

const CLOSED: DrawerState = {
  open: false,
  mode: 'add',
  id: '',
  name: '',
  logoUrl: '',
  contact: '',
};

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>(CLOSED);

  const reload = useCallback(() => {
    setStudios(getStudios());
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener('mango-admin-studios-update', onUpdate);
    return () => window.removeEventListener('mango-admin-studios-update', onUpdate);
  }, [reload]);

  function openAdd() {
    setDrawer({ open: true, mode: 'add', id: '', name: '', logoUrl: '', contact: '' });
  }

  function openEdit(s: Studio) {
    setDrawer({
      open: true,
      mode: 'edit',
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl ?? '',
      contact: s.contact ?? '',
    });
  }

  function handleSave() {
    if (!drawer.name.trim()) return;
    if (drawer.mode === 'add') {
      const created = addStudio({
        name: drawer.name.trim(),
        logoUrl: drawer.logoUrl.trim() || undefined,
        contact: drawer.contact.trim() || undefined,
      });
      logAudit('studio.create', `studio:${created.id}`, { name: created.name });
    } else {
      updateStudio(drawer.id, {
        name: drawer.name.trim(),
        logoUrl: drawer.logoUrl.trim() || undefined,
        contact: drawer.contact.trim() || undefined,
      });
      logAudit('studio.update', `studio:${drawer.id}`, { name: drawer.name.trim() });
    }
    setDrawer(CLOSED);
    reload();
  }

  function handleDelete(s: Studio) {
    if (!confirm('Удалить студию?')) return;
    deleteStudio(s.id);
    logAudit('studio.delete', `studio:${s.id}`, { name: s.name });
    reload();
  }

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35] transition-colors';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold">Студии</h1>
          <p className="text-zinc-400 text-sm mt-1">Управление производственными студиями</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#FF6B35] text-black font-medium rounded-lg px-4 py-2 text-sm hover:bg-[#ff7d4d] transition-colors"
        >
          + Добавить студию
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-zinc-900/50">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Название', 'Контакт', 'Действия'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {studios.map((s) => (
              <tr key={s.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logoUrl}
                        alt={s.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs flex-shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{s.contact || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-1 hover:bg-zinc-700 transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="text-xs bg-rose-900/50 text-rose-400 rounded px-2 py-1 hover:bg-rose-900 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {studios.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-sm">
                  Нет студий
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawer.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawer(CLOSED)}
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm space-y-4 z-10">
            <h2 className="text-white font-semibold">
              {drawer.mode === 'add' ? 'Добавить студию' : 'Редактировать студию'}
            </h2>

            <div>
              <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">
                Название *
              </label>
              <input
                className={inputCls}
                value={drawer.name}
                onChange={(e) => setDrawer((d) => ({ ...d, name: e.target.value }))}
                placeholder="Mango Production"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">
                Logo URL
              </label>
              <input
                className={inputCls}
                value={drawer.logoUrl}
                onChange={(e) => setDrawer((d) => ({ ...d, logoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">
                Контакт
              </label>
              <input
                className={inputCls}
                value={drawer.contact}
                onChange={(e) => setDrawer((d) => ({ ...d, contact: e.target.value }))}
                placeholder="hello@studio.ru"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#FF6B35] text-black font-medium rounded-lg px-4 py-2 text-sm hover:bg-[#ff7d4d] transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => setDrawer(CLOSED)}
                className="flex-1 bg-zinc-800 text-zinc-300 rounded-lg px-4 py-2 text-sm hover:bg-zinc-700 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
