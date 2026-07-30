import React from 'react';

export const Table = ({ headers, rows, className }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-sm">
      <thead className="text-zinc-400 border-b border-zinc-800">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="text-left py-3 px-4 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="py-3 px-4">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);