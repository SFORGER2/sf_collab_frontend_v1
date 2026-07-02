// src/components/erp/dashboard/StatsWidget.jsx
import { cn } from '@/lib/utils';

const colorMap = {
  blue: 'border-blue-500',
  yellow: 'border-yellow-500',
  red: 'border-red-500',
  green: 'border-green-500',
};

export function StatsWidget({ label, value, icon: Icon, trend, color = 'blue' }) {
  return (
    <div className={cn(
      "bg-[#111827] border-l-4 rounded-lg p-4 flex justify-between items-center",
      colorMap[color] || 'border-blue-500'
    )}>
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500 mt-1">{trend}</p>
      </div>
      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
        <Icon size={20} className="text-zinc-400" />
      </div>
    </div>
  );
}