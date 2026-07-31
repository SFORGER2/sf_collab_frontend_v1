import React from 'react';

export function FileCard({ text }) {
  const fileName = text ? text.replace(/^\[(File|Document|Attachment):/i, '').replace(/\]$/, '').trim() : 'File';

  return (
    <div className="my-3 py-3 px-3.5 rounded-2xl bg-[#131925] flex items-center gap-3 text-[13px] text-[#F7F8FA] w-fit max-w-full">
      <div className="w-9 h-9 rounded-xl bg-[#1B2232] flex items-center justify-center text-[#7CA6FF] shrink-0">
        <span className="material-symbols-outlined text-[18px]">description</span>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="font-medium truncate">{fileName}</span>
        <span className="text-[10.5px] text-[#64748B]">Attached document</span>
      </div>
    </div>
  );
}

export default FileCard;
