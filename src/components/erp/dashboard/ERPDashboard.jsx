// src/components/erp/dashboard/ERPDashboard.jsx
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { StatsWidget } from './StatsWidget';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { WorkspaceHealth } from './WorkspaceHealth';
import { RecentAlerts } from './RecentAlert';

export function ERPDashboard() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Mock data – replace with real data later
  const stats = [
    { label: 'Today\'s Attendance', value: '12/15', icon: Calendar, trend: '+8%', color: 'blue' },
    { label: 'Open Tasks', value: '8', icon: CheckCircle, trend: '+2', color: 'yellow' },
    { label: 'Pending Approvals', value: '3', icon: AlertCircle, trend: 'Urgent', color: 'red' },
    { label: 'Today\'s Updates', value: '5', icon: Activity, trend: 'Submitted', color: 'green' },
  ];

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatsWidget key={i} {...stat} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed />
          <QuickActions />
        </div>
        <div className="space-y-6">
          <WorkspaceHealth />
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
}