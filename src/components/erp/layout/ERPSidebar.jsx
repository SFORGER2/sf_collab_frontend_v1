// src/components/erp/layout/ERPSidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight,
  LayoutDashboard, CalendarClock, ClipboardList, FileStack,
  BarChart3, FileText, Bell, Building2, Settings, BarChart2,
  Award, DollarSign, AlertTriangle, FileTerminal, TrendingUp,
  Coins, CreditCard, Flag, Users, UserCog, CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map of icon component names to actual components
const iconMap = {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  FileStack,
  BarChart3,
  FileText,
  Bell,
  Building2,
  Settings,
  BarChart2,
  Award,
  DollarSign,
  AlertTriangle,
  FileTerminal,
  TrendingUp,
  Coins,
  CreditCard,
  Flag,
  Users,
  UserCog,
  CheckCircle,
};

const FallbackIcon = LayoutDashboard;

export function ERPSidebar({ modules, workspaceName, collapsed, setCollapsed }) {
  const location = useLocation();

  // Group modules by functional area
  const grouped = modules.reduce((acc, mod) => {
    let group = 'General';
    if (mod.id?.includes('attendance') || mod.label === 'My Attendance' || mod.label === 'Workspace Attendance') group = 'People';
    else if (mod.id?.includes('task') || mod.label === 'Task Board' || mod.label === 'Task Approval') group = 'Work';
    else if (mod.id?.includes('update') || mod.label === 'Daily Updates') group = 'Work';
    else if (mod.id?.includes('analytics') || mod.label === 'Analytics' || mod.label === 'My Analytics' || mod.label === 'Admin Analytics') group = 'Insights';
    else if (mod.id?.includes('document') || mod.label === 'Documents') group = 'Resources';
    else if (mod.id?.includes('alert') || mod.label === 'Alerts' || mod.label === 'Warnings' || mod.label === 'Flags' || mod.label === 'Audit Logs') group = 'Administration';
    else if (mod.id?.includes('payout') || mod.label === 'Payouts' || mod.label === 'Admin Payouts' || mod.label === 'Revenue Pools') group = 'Financial';
    else if (mod.id?.includes('settings') || mod.label === 'Admin Settings') group = 'Administration';
    else if (mod.id?.includes('workspace') || mod.label === 'Workspace Dashboard') group = 'Workspace';
    else if (mod.id?.includes('member') || mod.label === 'Member Dashboard') group = 'Workspace';

    if (!acc[group]) acc[group] = [];
    acc[group].push(mod);
    return acc;
  }, {});

  const groupOrder = ['Workspace', 'People', 'Work', 'Insights', 'Resources', 'Financial', 'Administration', 'General'];
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    const ia = groupOrder.indexOf(a) === -1 ? 999 : groupOrder.indexOf(a);
    const ib = groupOrder.indexOf(b) === -1 ? 999 : groupOrder.indexOf(b);
    return ia - ib;
  });

  return (
    <div className={cn(
      "h-full bg-[#111827] border-r border-white/5 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Workspace header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {workspaceName?.[0] || 'W'}
            </div>
            <span className="text-white font-semibold text-sm truncate">{workspaceName || 'Workspace'}</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-zinc-400 hover:text-white transition-colors">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {sortedGroups.map((groupKey) => (
          <div key={groupKey}>
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {groupKey}
              </div>
            )}
            <div className="space-y-1">
              {grouped[groupKey].map((module) => {
                const active = location.pathname === module.href || (module.href === '/erp' && location.pathname === '/erp');
                let IconComponent = FallbackIcon;
                if (module.icon && module.icon.type) {
                  const iconName = module.icon.type.name || module.icon.type.displayName;
                  if (iconName && iconMap[iconName]) {
                    IconComponent = iconMap[iconName];
                  }
                }
                const iconElement = module.icon || <FallbackIcon size={18} />;

                return (
                  <Link
                    key={module.id}
                    to={module.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5",
                      active ? "bg-blue-600/20 text-blue-400" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">
                      {IconComponent ? <IconComponent size={18} /> : iconElement}
                    </span>
                    {!collapsed && <span className="truncate">{module.label}</span>}
                    {collapsed && <span className="sr-only">{module.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}