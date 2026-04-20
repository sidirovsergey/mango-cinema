'use client';

import { MOCK_PAYMENTS } from '../../../lib/admin-mock';
import DataTable, { TableRow, TableCell } from '../../../components/admin/DataTable';
import StatusBadge from '../../../components/admin/StatusBadge';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const PROVIDER_LABEL: Record<string, string> = {
  yukassa: 'ЮKassa',
  sbp: 'СБП',
};

const PROVIDER_STYLE: Record<string, string> = {
  yukassa: 'bg-purple-500/20 text-purple-400',
  sbp: 'bg-blue-500/20 text-blue-400',
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-semibold">Платежи</h1>
        <p className="text-zinc-400 text-sm mt-1">{MOCK_PAYMENTS.length} транзакций</p>
      </div>

      <DataTable headers={['ID', 'Пользователь', 'Сумма', 'Провайдер', 'Тип', 'Статус', 'Дата']}>
        {MOCK_PAYMENTS.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <span className="font-mono text-xs text-zinc-400">{p.id.slice(0, 12)}</span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-zinc-400">{p.user_id.slice(0, 12)}</span>
            </TableCell>
            <TableCell>
              <span className="text-white font-medium">{p.amount} ₽</span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  PROVIDER_STYLE[p.provider] ?? 'bg-zinc-700/50 text-zinc-400'
                }`}
              >
                {PROVIDER_LABEL[p.provider] ?? p.provider}
              </span>
            </TableCell>
            <TableCell>
              <StatusBadge status={p.purpose} />
            </TableCell>
            <TableCell>
              <StatusBadge status={p.status} />
            </TableCell>
            <TableCell className="text-zinc-400">{formatDate(p.created_at)}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
