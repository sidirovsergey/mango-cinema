'use client';

interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6">
      <p className="text-zinc-400 text-sm mb-2">{label}</p>
      <p className="text-white text-2xl font-semibold">{value}</p>
    </div>
  );
}
