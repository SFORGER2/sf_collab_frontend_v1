// src/components/erp/dashboard/ActivityFeed.jsx
import { Clock } from 'lucide-react';

const activities = [
  { user: 'John Doe', action: 'completed task', target: 'Design review', time: '2 min ago' },
  { user: 'Jane Smith', action: 'submitted daily update', target: '', time: '15 min ago' },
  { user: 'Mike Johnson', action: 'uploaded document', target: 'Q3 Report.pdf', time: '1 hour ago' },
];

export function ActivityFeed() {
  return (
    <div className="bg-[#111827] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Clock size={16} className="text-zinc-400" />
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-zinc-300">
              <strong className="text-white">{act.user}</strong> {act.action}
              {act.target && <span className="text-zinc-400"> on <span className="text-blue-400">{act.target}</span></span>}
            </span>
            <span className="ml-auto text-xs text-zinc-500">{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}