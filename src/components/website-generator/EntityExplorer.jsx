import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, Key, Link as LinkIcon, Database, Hash, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EntityExplorer({ entities = [] }) {
  const [selectedTable, setSelectedTable] = useState(
    entities.length > 0 ? entities[0].table : ""
  );

  useEffect(() => {
    if (entities.length > 0) {
      if (!selectedTable || !entities.some((e) => e.table === selectedTable)) {
        setSelectedTable(entities[0].table);
      }
    } else {
      setSelectedTable("");
    }
  }, [entities, selectedTable]);

  const currentEntity = entities.find((e) => e.table === selectedTable) || entities[0];

  if (!entities || entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/[0.08] rounded-xl bg-zinc-950/40 min-h-[300px]">
        <Database className="w-10 h-10 text-zinc-600 mb-3 animate-pulse" />
        <p className="text-[14px] font-semibold text-zinc-400">No entities proposed yet</p>
        <p className="text-[12px] text-zinc-600 mt-1 text-center max-w-xs leading-relaxed">
          The database schema proposal will be available once the reference URLs are successfully harvested.
        </p>
      </div>
    );
  }

  // Helper to determine if a field is Primary Key
  const isPrimaryKey = (field) => {
    return (
      field.name.toLowerCase() === "id" ||
      (field.sql_type && field.sql_type.toUpperCase().includes("PRIMARY KEY"))
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Entity Cards Selector */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1 px-1">
          <Database size={14} className="text-violet-400" />
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Proposed Entities</span>
          <span className="ml-auto text-[10px] font-mono bg-zinc-900 border border-white/[0.06] text-zinc-500 px-2 py-0.5 rounded-md">
            {entities.length} tables
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {entities.map((ent) => {
            const isSelected = ent.table === selectedTable;
            const primaryKeyField = ent.fields.find(f => isPrimaryKey(f));
            const foreignKeysCount = ent.fields.filter(f => f.fk).length;

            return (
              <button
                key={ent.table}
                onClick={() => setSelectedTable(ent.table)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-300 relative group overflow-hidden flex flex-col gap-2",
                  isSelected
                    ? "bg-gradient-to-r from-violet-600/10 to-violet-700/5 border-violet-500/30 text-white shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                    : "bg-zinc-900/40 border-white/[0.05] hover:border-white/[0.12] text-zinc-400 hover:text-zinc-200"
                )}
              >
                {/* Visual Active Bar */}
                {isSelected && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-violet-500 rounded-l-xl" />
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border",
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                          : "bg-zinc-950 border-white/[0.06] text-zinc-500 group-hover:text-zinc-400"
                      )}
                    >
                      <Table size={14} />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold tracking-tight">{ent.table}</p>
                      <p className="text-[10.5px] text-zinc-500 font-medium">
                        {ent.fields.length} fields
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-black/40 border border-white/[0.04] text-zinc-400">
                    {ent.seed_rows} rows
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 pl-9">
                  {primaryKeyField && (
                    <span className="flex items-center gap-1 text-yellow-500/80">
                      <Key size={10} />
                      <span>pk: {primaryKeyField.name}</span>
                    </span>
                  )}
                  {foreignKeysCount > 0 && (
                    <span className="flex items-center gap-1 text-violet-400/80">
                      <LinkIcon size={10} />
                      <span>{foreignKeysCount} fk</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Entity details */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEntity.table}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-white/[0.07] rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden"
          >
            {/* Edge glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Table size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white tracking-tight">{currentEntity.table}</h3>
                  <p className="text-[12px] text-zinc-500 mt-0.5">Database Entity Structure</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-black/40 border border-white/[0.05] rounded-lg text-center">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-600">Rows</span>
                  <span className="text-[13px] font-mono font-bold text-zinc-300">{currentEntity.seed_rows}</span>
                </div>
                <div className="px-3 py-1 bg-black/40 border border-white/[0.05] rounded-lg text-center">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-600">Indices</span>
                  <span className="text-[13px] font-mono font-bold text-zinc-300">{(currentEntity.indexes || []).length}</span>
                </div>
              </div>
            </div>

            {/* Fields table */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">Fields Definitions</span>
              
              <div className="overflow-x-auto border border-white/[0.05] bg-black/20 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Column Name</th>
                      <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">SQL Type</th>
                      <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Nullable</th>
                      <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Key Constraints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {currentEntity.fields.map((f) => {
                      const isPk = isPrimaryKey(f);
                      const isFk = !!f.fk;

                      return (
                        <tr key={f.name} className="hover:bg-white/[0.01] transition-colors">
                          {/* Name */}
                          <td className="py-3 px-4 font-mono text-[12.5px] font-semibold text-zinc-200">
                            <div className="flex items-center gap-1.5">
                              {isPk && <Key size={12} className="text-yellow-500 flex-shrink-0" />}
                              {isFk && <LinkIcon size={11} className="text-violet-400 flex-shrink-0" />}
                              <span>{f.name}</span>
                            </div>
                          </td>
                          
                          {/* SQL Type */}
                          <td className="py-3 px-4 font-mono text-[12px] text-zinc-400">
                            {f.sql_type}
                          </td>
                          
                          {/* Nullable */}
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                f.nullable
                                  ? "bg-zinc-800 text-zinc-500"
                                  : "bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15"
                              )}
                            >
                              {f.nullable ? "null" : "not null"}
                            </span>
                          </td>
                          
                          {/* Key Constraints */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {isPk && (
                                <span className="text-[10.5px] font-bold font-sans bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <Key size={10} />
                                  <span>Primary Key</span>
                                </span>
                              )}
                              {isFk && (
                                <span className="text-[10.5px] font-bold font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <LinkIcon size={10} />
                                  <span>fk: {f.fk}</span>
                                </span>
                              )}
                              {!isPk && !isFk && (
                                <span className="text-[11px] text-zinc-600">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indexes */}
            {currentEntity.indexes && currentEntity.indexes.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-2 border-t border-white/[0.05]">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">Performance Indexes</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentEntity.indexes.map((idx, i) => (
                    <div
                      key={i}
                      className="bg-black/35 border border-white/[0.05] rounded-xl px-4 py-3 flex items-start gap-3 hover:border-white/[0.1] transition-all"
                    >
                      <div className="w-6 h-6 rounded-lg bg-zinc-950 border border-white/[0.06] flex items-center justify-center text-zinc-500 flex-shrink-0 mt-0.5">
                        <Hash size={11} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-zinc-400">INDEX_{i + 1}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {idx.map((col) => (
                            <span
                              key={col}
                              className="font-mono text-[10.5px] bg-zinc-900 border border-white/[0.04] text-zinc-500 px-1.5 py-0.5 rounded"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
