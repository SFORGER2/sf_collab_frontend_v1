import React, { useState, useMemo } from 'react';
import { X, Search, Users, Radio } from 'lucide-react';
import { useChatContacts } from '@/context/ChatContactsProvider';
import Avatar from './Avatar';

const AddMemberModal = ({
  isOpen,
  onClose,
  onAdd,
  conversationId,
  conversationType,
  currentUserId,
}) => {
  const { friends, isLoadingFriends } = useChatContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [visibility, setVisibility] = useState('show');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return friends;
    return friends.filter(f =>
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  const handleAdd = () => {
    if (!selectedUser) return;
    onAdd(conversationId, selectedUser.id, visibility);
    setSelectedUser(null);
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Add Member</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* User list */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {isLoadingFriends ? (
              <div className="text-zinc-500 text-sm py-4 text-center">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-zinc-500 text-sm py-4 text-center">No friends found</div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-indigo-500/20 border border-indigo-500/30'
                      : 'hover:bg-zinc-800'
                  }`}
                >
                  <Avatar src={user.profilePicture} name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <Radio size={16} className="text-indigo-400" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Visibility options */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="text-sm font-medium text-zinc-300 block mb-2">
              Chat History Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="historyVisibility"
                  value="show"
                  checked={visibility === 'show'}
                  onChange={() => setVisibility('show')}
                  className="text-indigo-500"
                />
                <div>
                  <p className="text-white text-sm">Show History</p>
                  <p className="text-zinc-500 text-xs">New member can view all previous messages</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="historyVisibility"
                  value="hide"
                  checked={visibility === 'hide'}
                  onChange={() => setVisibility('hide')}
                  className="text-indigo-500"
                />
                <div>
                  <p className="text-white text-sm">Hide History</p>
                  <p className="text-zinc-500 text-xs">New member can only see messages sent after joining</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedUser}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white text-sm font-medium"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;