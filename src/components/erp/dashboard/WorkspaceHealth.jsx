// src/components/erp/dashboard/WorkspaceHealth.jsx
import { Activity, Users, CheckCircle } from 'lucide-react';

export function WorkspaceHealth() {
  return (
    <div className="bg-[#111827] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Activity size={16} className="text-zinc-400" />
        Workspace Health
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Active Members</span>
          <span className="text-white font-semibold">12</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Tasks Completed</span>
          <span className="text-green-400 font-semibold">85%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Attendance Rate</span>
          <span className="text-blue-400 font-semibold">92%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Pending Approvals</span>
          <span className="text-yellow-400 font-semibold">3</span>
        </div>
      </div>
    </div>
  );
}