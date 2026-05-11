import React, { useState } from "react"
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Radio as RecordIcon, MessageSquare, PhoneMissed,
  Settings, ChevronRight, ChevronLeft, MoreHorizontal,
  FileText, CheckSquare, BrainCircuit, HardDrive, Edit3, Save,
  Plus, CheckCircle2, Circle, Send, Search, Paperclip,
  Users, Clock, Play
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_PARTICIPANTS = [
  { id: 1, name: "Alex Rivera", role: "Founder", initials: "AR", color: "bg-violet-500/20 text-violet-300", mic: true, cam: true, speaking: true, isMe: false },
  { id: 2, name: "Sarah Chen", role: "Lead Architect", initials: "SC", color: "bg-cyan-500/20 text-cyan-300", mic: false, cam: true, speaking: false, isMe: false },
  { id: 3, name: "Marcus Bell", role: "PM", initials: "MB", color: "bg-amber-500/20 text-amber-300", mic: false, cam: false, speaking: false, isMe: false },
  { id: 4, name: "Priya Nair", role: "Designer", initials: "PN", color: "bg-pink-500/20 text-pink-300", mic: true, cam: true, speaking: false, isMe: false },
  { id: 5, name: "You", role: "Engineer", initials: "Y", color: "bg-emerald-500/20 text-emerald-300", mic: true, cam: true, speaking: false, isMe: true },
]

const MOCK_NOTES = `## Vision Review Notes
- Q2 milestones generally hit, but architecture node is lagging.
- Need to align on GTM strategy by next week.
- Marcus: Please review the auth service implementation.

*Live edit by Sarah Chen at 10:14 AM*`

const MOCK_TASKS = [
  { id: 1, title: "Finalize Architecture Node spec", assignee: "Sarah", priority: "P0", done: false },
  { id: 2, title: "Draft GTM strategy doc", assignee: "Alex", priority: "P1", done: false },
  { id: 3, title: "Review auth_service.js", assignee: "Marcus", priority: "P2", done: true },
]

const MOCK_DECISIONS = [
  { id: 1, title: "Use WebSockets for real-time collaboration", rationale: "Lowest latency for live editing, easily scales with Redis.", owner: "Sarah" },
  { id: 2, title: "Delay public beta to Q4", rationale: "Need more time to polish the AI extraction pipelines.", owner: "Alex" },
]

const MOCK_AI_CHAT = [
  { role: "system", text: "I've analyzed the current discussion. It seems you're debating WebSockets vs Server-Sent Events." },
  { role: "user", text: "What did we decide about this last month?" },
  { role: "assistant", text: "In the 'Tech Stack Review' on April 12th, the team tentatively agreed on WebSockets due to the bidirectional requirement for live annotations." },
]

const MOCK_FILES = [
  { name: "Q3_Roadmap_Draft.pdf", type: "document", size: "2.4 MB" },
  { name: "Architecture_Overview.pdf", type: "document", size: "1.8 MB" },
  { name: "Hero_Section_V2.png", type: "image", size: "4.1 MB" },
]

const TABS = [
  { id: "notes", label: "Notes", icon: Edit3 },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "decisions", label: "Decisions", icon: FileText },
  { id: "ai", label: "AI", icon: BrainCircuit },
  { id: "drive", label: "Drive", icon: HardDrive },
]

// ── Main Component ─────────────────────────────────────────────────────────

export default function MeetingRoom() {
  const [activeTab, setActiveTab] = useState("notes")
  const [panelOpen, setPanelOpen] = useState(true)
  
  // Local state for toolbar toggles
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [isRecording, setIsRecording] = useState(true)
  
  // ── Render Helpers ───────────────────────────────────────────────────────

  const renderVideoGrid = () => {
    return (
      <div className="flex-1 p-4 overflow-hidden relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full w-full auto-rows-fr">
          {MOCK_PARTICIPANTS.map((p) => (
            <div 
              key={p.id} 
              className={cn(
                "relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center group transition-all",
                p.speaking && "ring-2 ring-cyan-400/80 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
              )}
            >
              {/* Video Placeholder (Avatar) */}
              {!p.cam ? (
                <Avatar className="size-24 border-2 border-white/5 shadow-xl">
                  <AvatarFallback className={cn("text-2xl font-bold", p.color)}>
                    {p.initials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                // Simulate video feed with a subtle gradient matching their color
                <div className={cn("absolute inset-0 opacity-20", p.color.split(" ")[0])} />
              )}

              {/* Name Plate */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-white truncate">
                    {p.name}
                  </span>
                  {p.isMe && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-white/10 border-white/20 text-zinc-300">
                      YOU
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.speaking && <div className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  {!p.mic && <MicOff className="size-3.5 text-red-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSidePanel = () => {
    if (!panelOpen) return null

    return (
      <div className="w-[380px] shrink-0 border-l border-white/10 bg-zinc-950 flex flex-col transition-all duration-300 relative z-10">
        
        {/* Tab Header */}
        <div className="flex items-center gap-1 p-2 border-b border-white/10 overflow-x-auto scrollbar-hide shrink-0">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-cyan-400" : "")} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="h-full flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Live Notes</h3>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20">
                  <Save className="size-3 mr-1" /> Save to Drive
                </Button>
              </div>
              <textarea 
                className="flex-1 w-full bg-transparent border border-white/10 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono"
                defaultValue={MOCK_NOTES}
              />
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Action Items</h3>
                <Badge variant="outline" className="bg-white/5 border-white/10">{MOCK_TASKS.length}</Badge>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a task..." className="bg-zinc-900 border-white/10 h-8" />
                <Button size="sm" className="h-8 shrink-0 bg-white/10 hover:bg-white/20 text-white"><Plus className="size-4" /></Button>
              </div>
              <div className="space-y-2 pt-2">
                {MOCK_TASKS.map(task => (
                  <Card key={task.id} className="bg-zinc-900 border-white/10">
                    <CardContent className="p-3 flex gap-3">
                      <button className="mt-0.5 shrink-0">
                        {task.done ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Circle className="size-4 text-zinc-500" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm text-zinc-200", task.done && "line-through text-zinc-500")}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-white/5 border-white/10">{task.priority}</Badge>
                          <span className="text-[10px] text-zinc-500">@{task.assignee}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* DECISIONS TAB */}
          {activeTab === "decisions" && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Decisions Log</h3>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-zinc-400 hover:text-white"><Plus className="size-3 mr-1" /> Log</Button>
              </div>
              <div className="space-y-3">
                {MOCK_DECISIONS.map(dec => (
                  <Card key={dec.id} className="bg-zinc-900 border-white/10">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                         <div className="mt-0.5 size-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                            <div className="size-1.5 rounded-full bg-violet-400" />
                         </div>
                         <p className="text-sm font-medium text-zinc-200 leading-snug">{dec.title}</p>
                      </div>
                      <p className="text-xs text-zinc-500 pl-6 border-l-2 border-white/5 ml-2 py-1 italic">
                        "{dec.rationale}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === "ai" && (
            <div className="h-full flex flex-col space-y-4">
              <h3 className="font-semibold text-white shrink-0">SF Assistant</h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {MOCK_AI_CHAT.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3 text-sm", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "size-6 rounded-full flex items-center justify-center shrink-0 text-xs",
                      msg.role === "user" ? "bg-cyan-500/20 text-cyan-300" : 
                      msg.role === "system" ? "bg-zinc-800 text-zinc-400" : "bg-violet-500/20 text-violet-300"
                    )}>
                      {msg.role === "user" ? "Y" : msg.role === "system" ? "⚙" : "SF"}
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg max-w-[85%]",
                      msg.role === "user" ? "bg-cyan-500/10 border border-cyan-500/20 text-zinc-200" : 
                      msg.role === "system" ? "bg-white/5 text-zinc-400 italic text-xs" :
                      "bg-zinc-900 border border-white/10 text-zinc-300"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="shrink-0 relative">
                <Input placeholder="Ask about this meeting..." className="bg-zinc-900 border-white/10 pr-10 text-sm h-10" />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-zinc-400 hover:text-white">
                  <Send className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Badge variant="outline" className="text-[10px] bg-white/5 hover:bg-white/10 cursor-pointer border-white/10">Summarize</Badge>
                <Badge variant="outline" className="text-[10px] bg-white/5 hover:bg-white/10 cursor-pointer border-white/10">Extract Tasks</Badge>
              </div>
            </div>
          )}

          {/* DRIVE TAB */}
          {activeTab === "drive" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Linked Files</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-white"><Plus className="size-4" /></Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search drive..." className="bg-zinc-900 border-white/10 pl-9 h-9" />
              </div>
              <div className="space-y-1 mt-4">
                {MOCK_FILES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer group transition-colors">
                    <div className={cn(
                      "size-8 rounded flex items-center justify-center shrink-0",
                      f.type === "document" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {f.type === "document" ? <FileText className="size-4" /> : <MonitorUp className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-cyan-400 transition-colors">{f.name}</p>
                      <p className="text-[10px] text-zinc-500">{f.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black text-zinc-100 flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/10 bg-zinc-950 relative z-20">
        
        {/* Left: Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 px-1.5 py-0 rounded">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
              Live
            </Badge>
            <Badge variant="outline" className="bg-white/5 text-zinc-400 border-white/10 px-1.5 py-0 rounded font-normal">
              Vision Review
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          <h1 className="text-sm font-semibold truncate max-w-[300px]">Quarterly Vision Alignment</h1>
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono text-zinc-300">
            <Clock className="size-3.5" />
            00:12:34
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 text-red-400">
              <RecordIcon className="size-3.5 animate-pulse" />
              <span className="text-xs">REC</span>
            </div>
          )}
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-zinc-400">
            <Settings className="size-4" />
          </Button>
        </div>
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {renderVideoGrid()}
        
        {/* Panel Toggle Button (Absolute, positioned on the edge) */}
        <button 
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-zinc-800 border-y border-l border-white/10 rounded-l-md p-1 text-zinc-400 hover:text-white transition-all shadow-lg"
          style={{ right: panelOpen ? 380 : 0 }}
        >
          {panelOpen ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {renderSidePanel()}

      </main>

      {/* ── BOTTOM TOOLBAR ────────────────────────────────────────────────── */}
      <footer className="h-20 shrink-0 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 relative z-20">
        
        {/* Left: Quick Meta */}
        <div className="flex items-center gap-3 w-[200px]">
           <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
             <Users className="size-4" />
             <span className="font-medium">5</span>
           </div>
        </div>

        {/* Center: Primary Controls */}
        <div className="flex items-center gap-3">
          
          {/* Mic */}
          <div className="flex flex-col items-center gap-1 group">
            <Button 
              size="icon" 
              onClick={() => setMicOn(!micOn)}
              className={cn(
                "size-12 rounded-full transition-all duration-300 hover:scale-105 shadow-lg",
                micOn ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400 ring-1 ring-red-500/50"
              )}
            >
              {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
            </Button>
            <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300">⌘ D</span>
          </div>

          {/* Camera */}
          <div className="flex flex-col items-center gap-1 group">
             <Button 
              size="icon" 
              onClick={() => setCamOn(!camOn)}
              className={cn(
                "size-12 rounded-full transition-all duration-300 hover:scale-105 shadow-lg",
                camOn ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400 ring-1 ring-red-500/50"
              )}
            >
              {camOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
            </Button>
            <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300">⌘ E</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1 group">
             <Button 
              size="icon" 
              className="size-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <MonitorUp className="size-5" />
            </Button>
            <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300">Share</span>
          </div>

          {/* Record Toggle */}
          <div className="flex flex-col items-center gap-1 group">
             <Button 
              size="icon" 
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "size-12 rounded-full transition-all duration-300 hover:scale-105 shadow-lg",
                isRecording ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50" : "bg-zinc-800 hover:bg-zinc-700 text-white"
              )}
            >
              <RecordIcon className={cn("size-5", isRecording && "animate-pulse")} />
            </Button>
            <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300">Record</span>
          </div>

          {/* More */}
           <div className="flex flex-col items-center gap-1 group">
             <Button 
              size="icon" 
              className="size-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <MoreHorizontal className="size-5" />
            </Button>
            <span className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-300">More</span>
          </div>

        </div>

        {/* Right: End Call */}
        <div className="flex items-center justify-end w-[200px]">
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 h-10 px-6 rounded-full hover:scale-105 transition-all"
          >
            End Call
          </Button>
        </div>

      </footer>
    </div>
  )
}
