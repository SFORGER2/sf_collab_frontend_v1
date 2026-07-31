import React from 'react';

function getSemanticCellColor(cellText) {
  if (!cellText) return "text-[#D1D5DB]";
  const lower = cellText.trim().toLowerCase();

  // 1. Success status
  if (/^(active|passed|success|completed|online|approved|enabled|true|100%)$/.test(lower)) {
    return "text-[#4ADE80] font-medium";
  }

  // 2. Warning status
  if (/^(pending|warning|warn|medium|in_progress|partially)$/.test(lower)) {
    return "text-[#FBBF24] font-medium";
  }

  // 3. Error / Negative status
  if (/^(failed|error|inactive|disabled|blocked|critical|false|0%)$/.test(lower)) {
    return "text-[#F87171] font-medium";
  }

  return "text-[#D1D5DB]";
}

export function CsvViewer({ content = '' }) {
  const rows = content ? content.trim().split('\n').map(row => row.split(',')) : [];
  if (!rows.length) return null;

  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div className="my-4 rounded-2xl bg-[#131925] overflow-hidden text-[13px]">
      <div className="px-4 py-2.5 text-[#8592A6] font-mono text-[11px] font-medium tracking-wide">
        CSV
      </div>
      <div className="overflow-x-auto px-1 pb-1">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#1F2736]">
              {header.map((col, idx) => (
                <th key={idx} className="py-3 px-3.5 font-semibold text-[#F7F8FA]">
                  {col.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2736]/60">
            {body.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#1A2232]/40 transition-colors">
                {row.map((cell, cIdx) => {
                  const val = cell.trim();
                  return (
                    <td key={cIdx} className={`py-3 px-3.5 ${getSemanticCellColor(val)}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CsvViewer;
