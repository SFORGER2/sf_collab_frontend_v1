import React, { useMemo, useState, useCallback } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, UserCheck, Loader2, X } from 'lucide-react';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { useAppSocket, useUserPresence } from '@/context/SocketProvider';

const STATUS_COLORS = {
  online:  'bg-emerald-500',
  idle:    'bg-amber-400',
  offline: 'bg-red-500',
};

const Avatar = ({ src, name, size = 'sm', status = 'offline' }) => {
  const [err, setErr] = useState(false);
  const sizes       = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' };
  const statusSizes = { xs: 'w-2 h-2 border', sm: 'w-2.5 h-2.5 border-[1.5px]', md: 'w-3 h-3 border-2' };
  const initials = (name || '?').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative inline-block flex-shrink-0">
      {src && !err ? (
        <img loading="lazy" src={src} alt={name}
          className={`${sizes[size]} rounded-full object-cover bg-zinc-700`}
          onError={() => setErr(true)} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-semibold text-white`}>
          {initials}
        </div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-zinc-900 ${STATUS_COLORS[status] || STATUS_COLORS.offline}`} />
    </div>
  );
};

const ContactItem = ({ user, onClick }) => {
  const userName   = `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim();
  const profilePic = getProfilePicture(user);
  const { status, statusText } = useUserPresence(user.id);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick?.(user); }}
      className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-zinc-800/50 rounded-lg transition-colors group cursor-pointer"
    >
      <Avatar src={profilePic} name={userName} size="sm" status={status} />
      <div className="flex-1 min-w-0 text-left">
        <span className={`text-sm truncate block ${
          status === 'online'  ? 'text-zinc-200 group-hover:text-white'   :
          status === 'idle'    ? 'text-zinc-400 group-hover:text-zinc-300' :
                                 'text-zinc-500 group-hover:text-zinc-400'
        }`}>
          {userName || 'Unknown User'}
        </span>
        {statusText && (
          <span className={`text-[10px] block ${
            status === 'online' ? 'text-emerald-500' :
            status === 'idle'   ? 'text-amber-400'   : 'text-zinc-600'
          }`}>
            {statusText}
          </span>
        )}
      </div>
    </button>
  );
};

const SectionHeader = ({ title, count, isExpanded, onToggle, statusColor }) => (
  <button type="button" onClick={onToggle}
    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-zinc-800/30 rounded-lg transition-colors">
    <div className="flex items-center gap-2">
      {statusColor && <span className={`w-2 h-2 rounded-full ${statusColor}`} />}
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${count > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-600'}`}>
        {count}
      </span>
    </div>
    {isExpanded
      ? <ChevronDown  size={14} className="text-zinc-500" />
      : <ChevronRight size={14} className="text-zinc-500" />}
  </button>
);

const OnlineContactsSidebar = ({
  friends = [],
  onOpenChat,
  onNewMessage,
  currentUserId,
  isLoading = false,
  className = '',
  isOpen    = false,
  onClose,
}) => {
  const { presenceMap } = useAppSocket();
  const [searchTerm,       setSearchTerm]       = useState('');
  const [expandedSections, setExpandedSections] = useState({ online: true, idle: true, offline: false });

  const myFriends = useMemo(() =>
    (friends || []).filter(f => String(f.id ?? f.user_id) !== String(currentUserId)),
  [friends, currentUserId]);

  const searched = useMemo(() => {
    if (!searchTerm.trim()) return myFriends;
    const q = searchTerm.toLowerCase();
    return myFriends.filter(f => {
      const name = `${f.firstName || f.first_name || ''} ${f.lastName || f.last_name || ''}`.toLowerCase();
      return name.includes(q) || (f.email || '').toLowerCase().includes(q);
    });
  }, [myFriends, searchTerm]);

  const categorised = useMemo(() => {
    const online = [], idle = [], offline = [];
    for (const user of searched) {
      const entry  = presenceMap[String(user.id)];
      const status = !entry?.online ? 'offline'
        : entry.last_active && (Date.now() - Number(entry.last_active)) > 5 * 60 * 1000
          ? 'idle' : 'online';
      if      (status === 'online') online.push(user);
      else if (status === 'idle')   idle.push(user);
      else                          offline.push(user);
    }
    return { online, idle, offline };
  }, [searched, presenceMap]);

  const toggleSection = useCallback((key) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] })), []);

  const totalConnections = myFriends.length;
  const { online, idle, offline } = categorised;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9990] bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <div className={[
        'bg-zinc-950 border-l border-zinc-800 flex flex-col',
        'fixed inset-y-0 right-0 z-[9991] w-72 h-full',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        'lg:static lg:inset-auto lg:z-auto lg:w-60 lg:translate-x-0 lg:h-full',
        className,
      ].join(' ')}>

        {/* Header */}
        <div className="p-3 border-b border-zinc-800/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-amber-500" />
              <h3 className="font-semibold text-zinc-200 text-sm">Connections</h3>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onNewMessage}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
                title="New message">
                <Plus size={16} />
              </button>
              {onClose && (
                <button type="button" onClick={onClose}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors lg:hidden"
                  title="Close">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input type="text" placeholder="Search connections..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-zinc-800/50 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">×</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={24} className="text-amber-500 animate-spin mb-2" />
              <p className="text-xs text-zinc-500">Loading connections...</p>
            </div>
          ) : totalConnections === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <UserCheck size={32} className="text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-500 text-center">No connections yet.</p>
            </div>
          ) : (
            <>
              <div className="p-2">
                <SectionHeader title="Online" count={online.length}
                  isExpanded={expandedSections.online} onToggle={() => toggleSection('online')}
                  statusColor={STATUS_COLORS.online} />
                {expandedSections.online && (
                  <div className="mt-1 space-y-0.5">
                    {online.length === 0
                      ? <p className="text-xs text-zinc-600 px-2 py-2">No connections online</p>
                      : online.map(u => <ContactItem key={u.id} user={u} onClick={onOpenChat} />)
                    }
                  </div>
                )}
              </div>

              {idle.length > 0 && (
                <div className="p-2 border-t border-zinc-800/30">
                  <SectionHeader title="Away" count={idle.length}
                    isExpanded={expandedSections.idle} onToggle={() => toggleSection('idle')}
                    statusColor={STATUS_COLORS.idle} />
                  {expandedSections.idle && (
                    <div className="mt-1 space-y-0.5">
                      {idle.map(u => <ContactItem key={u.id} user={u} onClick={onOpenChat} />)}
                    </div>
                  )}
                </div>
              )}

              <div className="p-2 border-t border-zinc-800/30">
                <SectionHeader title="Offline" count={offline.length}
                  isExpanded={expandedSections.offline} onToggle={() => toggleSection('offline')}
                  statusColor={STATUS_COLORS.offline} />
                {expandedSections.offline && (
                  <div className="mt-1 space-y-0.5">
                    {offline.length === 0
                      ? <p className="text-xs text-zinc-600 px-2 py-2">All connections online!</p>
                      : offline.map(u => <ContactItem key={u.id} user={u} onClick={onOpenChat} />)
                    }
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800/50 flex-shrink-0">
          <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500">
            <div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS.online}`} /><span>{online.length}</span></div>
            <div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS.idle}`}   /><span>{idle.length}</span></div>
            <div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS.offline}`}/><span>{offline.length}</span></div>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] text-zinc-600">{totalConnections} connection{totalConnections !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnlineContactsSidebar;