// src/components/erp/layout/ERPHeader.jsx
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="flex items-center gap-3 flex-1">
        <AppSwitcher />
        <div className="w-px h-6 bg-white/10" />
        <WorkspaceSwitcher />
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full relative transition-colors"
          onClick={onNotifications}
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-zinc-800 hover:ring-zinc-600 transition-all">
          <AvatarImage src={profilePic} alt={user?.firstName || 'User'} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
            {user?.firstName?.[0] || user?.lastName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}