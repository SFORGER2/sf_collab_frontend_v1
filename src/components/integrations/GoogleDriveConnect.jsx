import React, { useState, useEffect } from "react";
import {
  Cloud,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  File,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const GoogleDriveConnect = () => {
  // States: 'disconnected', 'authorizing', 'connected'
  const [connectionState, setConnectionState] = useState("disconnected");

  // States: 'idle', 'syncing', 'completed'
  const [syncState, setSyncState] = useState("idle");
  const [syncProgress, setSyncProgress] = useState(0);

  // Mock Upload History
  const [history, setHistory] = useState([
    {
      id: 1,
      name: "Q3_Financial_Report.pdf",
      size: "2.4 MB",
      date: "Oct 12, 10:45 AM",
      status: "success",
    },
    {
      id: 2,
      name: "Brand_Assets_v2.zip",
      size: "14.1 MB",
      date: "Oct 10, 02:15 PM",
      status: "success",
    },
    {
      id: 3,
      name: "Client_List_Draft.csv",
      size: "840 KB",
      date: "Oct 09, 09:00 AM",
      status: "error",
    },
  ]);

  // Simulate OAuth Approval Flow
  const handleConnect = () => {
    setConnectionState("authorizing");
    // Simulate a 2-second redirect/approval process
    setTimeout(() => {
      setConnectionState("connected");
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnectionState("disconnected");
    setSyncState("idle");
    setSyncProgress(0);
  };

  // Simulate File Import & Sync Progress
  const handleImport = () => {
    setSyncState("syncing");
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncState("completed");

          // Add a new mock file to history upon completion
          const newFile = {
            id: Date.now(),
            name: `Imported_Data_${Math.floor(Math.random() * 1000)}.xlsx`,
            size: "3.2 MB",
            date: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "success",
          };
          setHistory([newFile, ...history]);

          // Reset sync state after showing completion
          setTimeout(() => setSyncState("idle"), 3000);
          return 100;
        }
        return prev + 15; // Increment progress
      });
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0b10] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                SF Drive Integrations
              </h1>
              <p className="text-sm text-slate-500">
                Connect external cloud storage to your workspace.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Connection & Sync UI */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Card */}
            <div className="bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {/* Decorative top border */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${connectionState === "connected" ? "bg-emerald-500" : "bg-blue-500"}`}
              ></div>

              <h2 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" /> Google Drive
              </h2>

              {/* DISCONNECTED STATE */}
              {connectionState === "disconnected" && (
                <div className="text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-[#11131a] rounded-full border border-slate-700 flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400 mb-6">
                    Link your Google account to directly import and sync files.
                  </p>
                  <button
                    onClick={handleConnect}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Connect Account
                  </button>
                </div>
              )}

              {/* AUTHORIZING STATE */}
              {connectionState === "authorizing" && (
                <div className="text-center animate-in fade-in duration-300 py-4">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-200 mb-1">
                    Awaiting Approval...
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure
                    OAuth Flow
                  </p>
                </div>
              )}

              {/* CONNECTED STATE */}
              {connectionState === "connected" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        Connected
                      </p>
                      <p className="text-xs text-emerald-400">
                        user@company.com
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={syncState === "syncing"}
                    className="w-full py-2.5 mb-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncState === "syncing" ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4" />
                    )}
                    {syncState === "syncing" ? "Importing..." : "Import Files"}
                  </button>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3 h-3" /> Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Sync Progress UI (Only shows when active/recently finished) */}
            {syncState !== "idle" && (
              <div className="bg-[#0d0f17] border border-slate-800 rounded-2xl p-5 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span
                    className={
                      syncState === "completed"
                        ? "text-emerald-400"
                        : "text-cyan-400"
                    }
                  >
                    {syncState === "completed"
                      ? "Sync Complete"
                      : "Syncing from Google Drive..."}
                  </span>
                  <span className="text-slate-400">{syncProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${syncState === "completed" ? "bg-emerald-500" : "bg-cyan-500"}`}
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Upload History */}
          <div className="lg:col-span-2 bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-xl h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-200">
                Upload History
              </h2>
              <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                {history.length} Files Total
              </span>
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <File className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium">
                  No files imported yet.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your account to start syncing.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {history.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-[#0a0b10] border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${file.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {file.status === "success" ? (
                          <File className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors cursor-pointer">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{file.size}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {file.status === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
                      ) : (
                        <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
