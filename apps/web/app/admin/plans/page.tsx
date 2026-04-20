'use client';

import { useState, useEffect, useCallback } from 'react';
import { SUBSCRIPTION_PLANS, COIN_PACKAGES } from '@/lib/plans';
import {
  getPlanOverrides,
  setPlanOverride,
  deletePlanOverride,
  getCoinPackOverrides,
  setCoinPackOverride,
  deleteCoinPackOverride,
} from '@/lib/admin-plans-store';
import { logAudit } from '@/lib/admin-audit-store';

type PlanRow = {
  id: string;
  title: string;
  priceRub: number;
  period: string;
  savings: string | null;
  badge: string | null;
  // editable fields
  editPrice: string;
  editSavings: string;
  editBadge: string;
  dirty: boolean;
};

type CoinRow = {
  id: string;
  title: string;
  coins: number;
  bonus: number;
  priceRub: number;
  badge: string | null;
  editCoins: string;
  editBonus: string;
  editPrice: string;
  editBadge: string;
  dirty: boolean;
};

function buildPlanRows(): PlanRow[] {
  const overrides = getPlanOverrides();
  return SUBSCRIPTION_PLANS.map((p) => {
    const ov = overrides[p.id] ?? {};
    const priceRub = ov.priceRub ?? p.priceRub;
    const savings = ov.savings !== undefined ? ov.savings : p.savings;
    const badge = ov.badge !== undefined ? ov.badge : p.badge;
    return {
      id: p.id,
      title: p.title,
      priceRub,
      period: p.period,
      savings,
      badge,
      editPrice: String(priceRub),
      editSavings: savings ?? '',
      editBadge: badge ?? '',
      dirty: false,
    };
  });
}

function buildCoinRows(): CoinRow[] {
  const overrides = getCoinPackOverrides();
  return COIN_PACKAGES.map((p) => {
    const ov = overrides[p.id] ?? {};
    const coins = ov.coins ?? p.coins;
    const bonus = ov.bonus ?? p.bonus;
    const priceRub = ov.priceRub ?? p.priceRub;
    const badge = ov.badge !== undefined ? ov.badge : p.badge;
    return {
      id: p.id,
      title: p.title,
      coins,
      bonus,
      priceRub,
      badge,
      editCoins: String(coins),
      editBonus: String(bonus),
      editPrice: String(priceRub),
      editBadge: badge ?? '',
      dirty: false,
    };
  });
}

export default function PlansPage() {
  const [planRows, setPlanRows] = useState<PlanRow[]>([]);
  const [coinRows, setCoinRows] = useState<CoinRow[]>([]);

  const reload = useCallback(() => {
    setPlanRows(buildPlanRows());
    setCoinRows(buildCoinRows());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // ---- Plan handlers ----
  function updatePlanField(id: string, field: keyof PlanRow, value: string) {
    setPlanRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value, dirty: true } : r))
    );
  }

  function savePlan(id: string) {
    const row = planRows.find((r) => r.id === id);
    if (!row) return;
    const base = SUBSCRIPTION_PLANS.find((p) => p.id === id)!;
    const newPrice = parseInt(row.editPrice, 10) || base.priceRub;
    const newSavings = row.editSavings.trim() || null;
    const newBadge = row.editBadge.trim() || null;
    logAudit('plan.update', `plan:${id}`, {
      priceRub: { from: base.priceRub, to: newPrice },
      savings: { from: base.savings, to: newSavings },
      badge: { from: base.badge, to: newBadge },
    });
    setPlanOverride(id, { priceRub: newPrice, savings: newSavings, badge: newBadge });
    reload();
  }

  function resetPlan(id: string) {
    deletePlanOverride(id);
    reload();
  }

  // ---- Coin pack handlers ----
  function updateCoinField(id: string, field: keyof CoinRow, value: string) {
    setCoinRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value, dirty: true } : r))
    );
  }

  function saveCoinPack(id: string) {
    const row = coinRows.find((r) => r.id === id);
    if (!row) return;
    const base = COIN_PACKAGES.find((p) => p.id === id)!;
    const newCoins = parseInt(row.editCoins, 10) || base.coins;
    const newBonus = parseInt(row.editBonus, 10) || 0;
    const newPrice = parseInt(row.editPrice, 10) || base.priceRub;
    const newBadge = row.editBadge.trim() || null;
    logAudit('coin_pack.update', `coin_pack:${id}`, {
      coins: { from: base.coins, to: newCoins },
      bonus: { from: base.bonus, to: newBonus },
      priceRub: { from: base.priceRub, to: newPrice },
      badge: { from: base.badge, to: newBadge },
    });
    setCoinPackOverride(id, { coins: newCoins, bonus: newBonus, priceRub: newPrice, badge: newBadge });
    reload();
  }

  function resetCoinPack(id: string) {
    deleteCoinPackOverride(id);
    reload();
  }

  const inputCls =
    'bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:border-[#FF6B35]';

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-white text-2xl font-semibold">Планы и монеты</h1>
        <p className="text-zinc-400 text-sm mt-1">Редактирование подписок и пакетов монет</p>
      </div>

      {/* Subscriptions */}
      <section className="space-y-3">
        <h2 className="text-white text-base font-medium">Подписки</h2>
        <div className="overflow-x-auto rounded-xl bg-zinc-900/50">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800">
                {['ID', 'Название', 'Цена (₽)', 'Период', 'Скидка', 'Бейдж', 'Действия'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {planRows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 text-xs text-zinc-500 font-mono">{row.id}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300">{row.title}</td>
                  <td className="px-4 py-3 w-28">
                    <input
                      className={inputCls}
                      value={row.editPrice}
                      onChange={(e) => updatePlanField(row.id, 'editPrice', e.target.value)}
                      onBlur={() => row.dirty && savePlan(row.id)}
                      type="number"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{row.period}</td>
                  <td className="px-4 py-3 w-36">
                    <input
                      className={inputCls}
                      value={row.editSavings}
                      onChange={(e) => updatePlanField(row.id, 'editSavings', e.target.value)}
                      onBlur={() => row.dirty && savePlan(row.id)}
                      placeholder="Экономия 33%"
                    />
                  </td>
                  <td className="px-4 py-3 w-36">
                    <input
                      className={inputCls}
                      value={row.editBadge}
                      onChange={(e) => updatePlanField(row.id, 'editBadge', e.target.value)}
                      onBlur={() => row.dirty && savePlan(row.id)}
                      placeholder="Лучшая цена"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => savePlan(row.id)}
                        className="text-xs bg-[#FF6B35] text-black font-medium rounded px-2 py-1 hover:bg-[#ff7d4d] transition-colors"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => resetPlan(row.id)}
                        className="text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-1 hover:bg-zinc-700 transition-colors"
                      >
                        Сброс
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coin packages */}
      <section className="space-y-3">
        <h2 className="text-white text-base font-medium">Пакеты монет</h2>
        <div className="overflow-x-auto rounded-xl bg-zinc-900/50">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b border-zinc-800">
                {['ID', 'Название', 'Монеты', 'Бонус', 'Цена (₽)', 'Бейдж', 'Действия'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {coinRows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 text-xs text-zinc-500 font-mono">{row.id}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300">{row.title}</td>
                  <td className="px-4 py-3 w-24">
                    <input
                      className={inputCls}
                      value={row.editCoins}
                      onChange={(e) => updateCoinField(row.id, 'editCoins', e.target.value)}
                      onBlur={() => row.dirty && saveCoinPack(row.id)}
                      type="number"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-3 w-24">
                    <input
                      className={inputCls}
                      value={row.editBonus}
                      onChange={(e) => updateCoinField(row.id, 'editBonus', e.target.value)}
                      onBlur={() => row.dirty && saveCoinPack(row.id)}
                      type="number"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-3 w-28">
                    <input
                      className={inputCls}
                      value={row.editPrice}
                      onChange={(e) => updateCoinField(row.id, 'editPrice', e.target.value)}
                      onBlur={() => row.dirty && saveCoinPack(row.id)}
                      type="number"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-3 w-32">
                    <input
                      className={inputCls}
                      value={row.editBadge}
                      onChange={(e) => updateCoinField(row.id, 'editBadge', e.target.value)}
                      onBlur={() => row.dirty && saveCoinPack(row.id)}
                      placeholder="Популярный"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveCoinPack(row.id)}
                        className="text-xs bg-[#FF6B35] text-black font-medium rounded px-2 py-1 hover:bg-[#ff7d4d] transition-colors"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => resetCoinPack(row.id)}
                        className="text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-1 hover:bg-zinc-700 transition-colors"
                      >
                        Сброс
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
