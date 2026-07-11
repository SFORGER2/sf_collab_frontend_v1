// src/components/erp/dashboard/QuickActions.jsx
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileUp, Users, Clock, ClipboardList } from 'lucide-react';

const actions = [
  { label: 'New Task', icon: PlusCircle, path: '/erp/tasks/new' },
  { label: 'Upload Document', icon: FileUp, path: '/erp/documents/upload' },
  { label: 'Invite Member', icon: Users, path: '/erp/workspace/invite' },
  { label: 'Clock In', icon: Clock, path: '/erp/attendance/clock-in' },
  { label: 'Daily Update', icon: ClipboardList, path: '/erp/updates/new' },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#111827] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {actions.map((act) => (
          <button
            key={act.label}
            onClick={() => navigate(act.path)}
            className="flex flex-col items-center justify-center p-3 bg-[#1E293B] rounded-lg hover:bg-[#2A3A4A] transition-colors group"
          >
            <act.icon size={20} className="text-zinc-400 group-hover:text-white" />
            <span className="text-xs text-zinc-400 group-hover:text-white mt-1">{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}