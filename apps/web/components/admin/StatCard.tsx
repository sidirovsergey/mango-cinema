'use client';

interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 md:p-6">
      <p className="text-zinc-400 text-xs md:text-sm mb-1 md:mb-2 leading-tight">{label}</p>
      <p className="text-white text-2xl md:text-3xl font-semibold whitespace-nowrap">{value}</p>
    </div>
  );
}
