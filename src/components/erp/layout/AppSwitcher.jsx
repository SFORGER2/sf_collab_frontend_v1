// src/components/erp/layout/AppSwitcher.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LayoutDashboard, FolderOpen, MessageSquare, Bell, BriefcaseBusiness, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const APP_ITEMS = [
  { id: 'home', label: 'Homepage', icon: Home, path: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/chat' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'erp', label: 'ERP Workspace', icon: BriefcaseBusiness, path: '/erp' },
];

export function AppSwitcher() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Find the active item
  const activeItem = APP_ITEMS.find(item => currentPath.startsWith(item.path)) || APP_ITEMS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors text-white font-medium text-sm">
  <span className="font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
    SFCollab
  </span>
  <ChevronDown size={16} className="text-zinc-400" />
</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl"
        align="start"
        sideOffset={8}
      >
        {APP_ITEMS.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-blue-400" : "text-zinc-500")} />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}