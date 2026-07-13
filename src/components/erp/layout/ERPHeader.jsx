// src/components/erp/layout/ERPHeader.jsx
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import WorkspaceSwitcher from '@/components/sections/WorkspaceSwitcher';
import { AppSwitcher } from './AppSwitcher';
import { getProfilePicture } from '@/utils/getProfilePicture';

export function ERPHeader({ workspaceName, onSearch, onNotifications }) {
  const { user } = useSelector((state) => state.auth);
  const profilePic = getProfilePicture(user);

  return (
    <header className="h-16 border-b border-white/5 bg-black/80 backdrop-blur-lg flex items-center justify-between px-6 shrink-0">
      {/* Left section: App Switcher + Workspace Switcher */}
      <div className="flex items-center gap-2 flex-1">
        <AppSwitcher />
        <div className="w-px h-6 bg-white/10" />
        <WorkspaceSwitcher />
      </div>

      {/* Center: Search */}
      <div className="relative max-w-md w-full hidden md:block flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <Input
          type="text"
          placeholder="Search in ERP..."
          className="pl-9 bg-[#1E293B] border-white/5 text-white placeholder:text-zinc-500 focus:border-blue-500/50 h-9"
          onFocus={onSearch}
        />
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white relative" onClick={onNotifications}>
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={profilePic} alt={user?.firstName || 'User'} />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {user?.firstName?.[0] || user?.lastName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}