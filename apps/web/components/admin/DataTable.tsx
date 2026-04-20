'use client';

import React from 'react';

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  emptyMessage?: string;
}

export default function DataTable({ headers, children, emptyMessage = 'Нет данных' }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-zinc-900/50">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-zinc-800">
            {headers.map((h) => (
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
          {React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-sm text-zinc-300 ${className}`}>
      {children}
    </td>
  );
}
