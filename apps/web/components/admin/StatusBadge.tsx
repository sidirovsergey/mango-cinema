'use client';

interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, string> = {
  succeeded: 'bg-emerald-500/20 text-emerald-400',
  published: 'bg-emerald-500/20 text-emerald-400',
  active: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-amber-500/20 text-amber-400',
  canceled: 'bg-rose-500/20 text-rose-400',
  draft: 'bg-zinc-700/50 text-zinc-400',
  sbp: 'bg-blue-500/20 text-blue-400',
  yukassa: 'bg-purple-500/20 text-purple-400',
  subscription: 'bg-teal-500/20 text-teal-400',
  coin_package: 'bg-yellow-500/20 text-yellow-400',
};

const LABEL_MAP: Record<string, string> = {
  succeeded: 'Успешно',
  pending: 'В обработке',
  canceled: 'Отменён',
  published: 'Опубликовано',
  draft: 'Черновик',
  subscription: 'Подписка',
  coin_package: 'Монеты',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cls = STATUS_MAP[status] ?? 'bg-zinc-700/50 text-zinc-400';
  const label = LABEL_MAP[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
