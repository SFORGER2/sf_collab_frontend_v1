// src/components/erp/dashboard/RecentAlerts.jsx
import { AlertCircle, Bell } from 'lucide-react';

const alerts = [
  { type: 'critical', message: 'Server downtime detected', time: '5 min ago' },
  { type: 'warning', message: 'Task overdue: Review Q3', time: '1 hour ago' },
  { type: 'info', message: 'New member joined', time: '2 hours ago' },
];

const alertColors = {
  critical: 'text-red-400 bg-red-500/10',
  warning: 'text-yellow-400 bg-yellow-500/10',
  info: 'text-blue-400 bg-blue-500/10',
};

export function RecentAlerts() {
  return (
    <div className="bg-[#111827] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Bell size={16} className="text-zinc-400" />
        Recent Alerts
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className={cn(
            "flex items-center gap-3 p-2 rounded-lg text-sm",
            alertColors[alert.type] || 'bg-zinc-800'
          )}>
            <AlertCircle size={14} />
            <span className="flex-1">{alert.message}</span>
            <span className="text-xs text-zinc-500">{alert.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}