import React from 'react';

export default function ConversationRow({
  conv,
  activeConvId,
  contextMenuData,
  editingConvId,
  editingTitle,
  setEditingTitle,
  handleSelectConversation,
  handleSaveRename,
  setEditingConvId,
  togglePin,
  openContextMenu
}) {
  const isActive = activeConvId === conv.id;
  const isEditing = editingConvId === conv.id;

  return (
    <div
      onClick={() => handleSelectConversation(conv)}
      onContextMenu={(e) => openContextMenu(conv, e)}
      title={conv.title}
      className={`group relative flex items-center justify-between h-9 px-3 rounded-xl text-xs cursor-pointer transition-colors duration-150 ease-out overflow-hidden ${
        isActive
          ? 'bg-[#161C28] text-[#F7F8FA]'
          : 'text-[#94A0B4] hover:bg-[#12161F] hover:text-[#F7F8FA]'
      }`}
    >
      <div className="min-w-0 flex-1 pr-1 group-hover:pr-12 transition-[padding] duration-150">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(conv.id);
              if (e.key === 'Escape') setEditingConvId(null);
            }}
            onBlur={() => handleSaveRename(conv.id)}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#0D1118] text-[#F7F8FA] border border-[#7CA6FF] rounded px-1.5 py-0.5 text-xs focus:outline-none"
          />
        ) : (
          <span
            title={conv.title}
            className={`block truncate w-full ${
              isActive ? 'font-medium text-[#F7F8FA]' : 'font-normal text-[#94A0B4] group-hover:text-[#F7F8FA]'
            }`}
          >
            {conv.title}
          </span>
        )}
      </div>

      {/* Absolutely positioned action buttons: Zero layout shift */}
      <div
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1 py-0.5 rounded-lg shadow-sm z-10 ${
          isActive ? 'bg-[#161C28]' : 'bg-[#12161F]'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePin(conv.id);
          }}
          title={conv.isPinned ? 'Unpin conversation' : 'Pin conversation'}
          className="p-0.5 text-[#6F7B90] hover:text-[#7CA6FF] rounded transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[10px]">
            {conv.isPinned ? 'keep_off' : 'push_pin'}
          </span>
        </button>
        <button
          type="button"
          onClick={(e) => openContextMenu(conv, e)}
          title="More options"
          className="p-0.5 text-[#6F7B90] hover:text-[#7CA6FF] rounded transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[10px]">more_vert</span>
        </button>
      </div>
    </div>
  );
}
