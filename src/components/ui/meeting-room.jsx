import React, { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  Radio as RecordIcon, Settings, ChevronRight, ChevronLeft,
  FileText, CheckSquare, BrainCircuit, HardDrive, Edit3, Save,
  Plus, CheckCircle2, Circle, Send, Search, Users, Clock, X,
  Share2, MessageSquare, MoreHorizontal, PhoneOff, Maximize2,
  Volume2, VolumeX, Smile
} from "lucide-react"
import { cn } from "@/lib/utils"
import { meetAPI } from "@/utils/APIs/meetAPI"
import { useSelector as useReduxSelector } from "react-redux"

const COLORS = [
  "bg-violet-500/20 text-violet-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-amber-500/20 text-amber-300",
  "bg-pink-500/20 text-pink-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-blue-500/20 text-blue-300",
]

const TABS = [
  { id: "notes",     label: "Notes",     icon: Edit3 },
  { id: "tasks",     label: "Tasks",     icon: CheckSquare },
  { id: "decisions", label: "Decisions", icon: FileText },
  { id: "ai",        label: "AI",        icon: BrainCircuit },
  { id: "files",     label: "Files",     icon: HardDrive },
]

// ── Elapsed timer ────────────────────────────────────────────────────────────
function useElapsed(startAt) {
  const [elapsed, setElapsed] = useState("00:00")
  useEffect(() => {
    const base = startAt ? new Date(startAt) : new Date()
    const id = setInterval(() => {
      const secs = Math.max(0, Math.floor((Date.now() - base.getTime()) / 1000))
      const m = String(Math.floor(secs / 60)).padStart(2, "0")
      const s = String(secs % 60).padStart(2, "0")
      setElapsed(`${m}:${s}`)
    }, 1000)
    return () => clearInterval(id)
  }, [startAt])
  return elapsed
}

// ── Screen share hook ────────────────────────────────────────────────────────
function useScreenShare() {
  const [sharing, setSharing] = useState(false)
  const streamRef = useRef(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      streamRef.current = stream
      setSharing(true)
      stream.getVideoTracks()[0].onended = () => { setSharing(false); streamRef.current = null }
    } catch (e) {
      if (e.name !== "NotAllowedError") console.error("Screen share failed:", e)
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setSharing(false)
  }, [])

  return { sharing, start, stop, toggle: sharing ? stop : start }
}

// ── Settings modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose }) {
  const [inputVol,  setInputVol]  = useState(80)
  const [outputVol, setOutputVol] = useState(80)
  const [devices,   setDevices]   = useState({ mic: [], speaker: [], camera: [] })
  const [selected,  setSelected]  = useState({ mic: "", speaker: "", camera: "" })

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(list => {
      setDevices({
        mic:     list.filter(d => d.kind === "audioinput"),
        speaker: list.filter(d => d.kind === "audiooutput"),
        camera:  list.filter(d => d.kind === "videoinput"),
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-semibold text-white">Audio & Video Settings</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Microphone */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Microphone</label>
            <select value={selected.mic} onChange={e => setSelected(s => ({ ...s, mic: e.target.value }))}
              className="w-full bg-zinc-800 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
              {devices.mic.length === 0 && <option value="">Default microphone</option>}
              {devices.mic.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Microphone"}</option>)}
            </select>
            <div className="flex items-center gap-3 mt-2">
              <Mic className="size-3.5 text-zinc-500 shrink-0" />
              <input type="range" min={0} max={100} value={inputVol} onChange={e => setInputVol(+e.target.value)}
                className="flex-1 accent-cyan-500" />
              <span className="text-xs text-zinc-500 w-8 text-right">{inputVol}%</span>
            </div>
          </div>
          {/* Speaker */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Speaker</label>
            <select value={selected.speaker} onChange={e => setSelected(s => ({ ...s, speaker: e.target.value }))}
              className="w-full bg-zinc-800 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
              {devices.speaker.length === 0 && <option value="">Default speaker</option>}
              {devices.speaker.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Speaker"}</option>)}
            </select>
            <div className="flex items-center gap-3 mt-2">
              <Volume2 className="size-3.5 text-zinc-500 shrink-0" />
              <input type="range" min={0} max={100} value={outputVol} onChange={e => setOutputVol(+e.target.value)}
                className="flex-1 accent-cyan-500" />
              <span className="text-xs text-zinc-500 w-8 text-right">{outputVol}%</span>
            </div>
          </div>
          {/* Camera */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Camera</label>
            <select value={selected.camera} onChange={e => setSelected(s => ({ ...s, camera: e.target.value }))}
              className="w-full bg-zinc-800 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
              {devices.camera.length === 0 && <option value="">Default camera</option>}
              {devices.camera.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Camera"}</option>)}
            </select>
          </div>
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ── More menu ────────────────────────────────────────────────────────────────
function MoreMenu({ onClose, onToggleChat, onToggleFullscreen, onOpenSettings, onLeave }) {
  const ref = React.useRef(null)

  // Close on outside click — no overlay needed
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    // Small delay so the button click that opened the menu doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 10)
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler) }
  }, [onClose])

  const items = [
    { icon: MessageSquare, label: "Chat",              action: onToggleChat },
    { icon: Maximize2,     label: "Toggle Fullscreen", action: onToggleFullscreen },
    { icon: Volume2,       label: "Audio & Video",     action: onOpenSettings },
    { icon: Settings,      label: "Settings",          action: onOpenSettings },
    { icon: PhoneOff,      label: "Leave Meeting",     action: onLeave, danger: true },
  ]

  return (
    // fixed + high z-index so it escapes ALL parent stacking contexts
    <div ref={ref}
      style={{ position: "fixed", bottom: "72px", left: "50%", transform: "translateX(-50%)", zIndex: 9999 }}
      className="w-52 bg-zinc-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
      {items.map(({ icon: Icon, label, action, danger }) => (
        <button key={label}
          onMouseDown={(e) => {
            e.preventDefault() // prevent blur from closing before action fires
            e.stopPropagation()
            onClose()
            setTimeout(() => action?.(), 0)
          }}
          className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5",
            danger ? "text-red-400 hover:text-red-300" : "text-zinc-300 hover:text-white")}>
          <Icon className="size-4 shrink-0" />{label}
        </button>
      ))}
    </div>
  )
}

// ── Chat panel ───────────────────────────────────────────────────────────────
function ChatPanel({ socket, meetingId, userName }) {
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState("")
  const endRef = useRef(null)

  useEffect(() => {
    if (!socket) return
    const handler = (data) => setMsgs(prev => [...prev, data])
    socket.on("meet_chat_message", handler)
    return () => socket.off("meet_chat_message", handler)
  }, [socket])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  const send = () => {
    if (!input.trim()) return
    const msg = { name: userName, text: input.trim(), ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    socket?.emit("meet_chat_message", { meeting_id: meetingId, ...msg })
    setMsgs(prev => [...prev, { ...msg, isMe: true }])
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <span className="text-sm font-semibold text-white">Meeting Chat</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {msgs.length === 0 && <p className="text-xs text-zinc-600 text-center pt-8">No messages yet</p>}
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex flex-col gap-0.5", m.isMe ? "items-end" : "items-start")}>
            <span className="text-[10px] text-zinc-500">{m.isMe ? "You" : m.name} · {m.ts}</span>
            <div className={cn("px-3 py-2 rounded-xl text-sm max-w-[85%]",
              m.isMe ? "bg-cyan-500/20 text-cyan-100" : "bg-zinc-800 text-zinc-200")}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-white/10 shrink-0 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50" />
        <button onClick={send} className="w-9 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center transition-colors">
          <Send className="size-4 text-white" />
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MeetingRoom() {
  const { id: meetingId } = useParams()
  const navigate = useNavigate()
  const { user, access_token } = useSelector(s => s.auth)

  // ── Data ────────────────────────────────────────────────────────────────
  const [meeting,      setMeeting]      = useState(null)
  const [participants, setParticipants] = useState([])
  const [actionItems,  setActionItems]  = useState([])
  const [decisions,    setDecisions]    = useState([])
  const [files,        setFiles]        = useState([])
  const [loading,      setLoading]      = useState(true)

  // ── UI ──────────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState("notes")
  const [panelOpen,    setPanelOpen]    = useState(true)
  const [showMore,     setShowMore]     = useState(false)
  const [showChat,     setShowChat]     = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [ending,       setEnding]       = useState(false)
  const [apiError,     setApiError]     = useState("")

  // ── Media ───────────────────────────────────────────────────────────────
  const [micOn,        setMicOn]        = useState(true)
  const [camOn,        setCamOn]        = useState(true)
  const [isRecording,  setIsRecording]  = useState(false)
  const screenShare = useScreenShare()

  // ── Notes ───────────────────────────────────────────────────────────────
  const [notes,       setNotes]       = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved,  setNotesSaved]  = useState(false)

  // ── Add state ───────────────────────────────────────────────────────────
  const [newTask,     setNewTask]     = useState("")
  const [newDecision, setNewDecision] = useState("")
  const [addingTask,  setAddingTask]  = useState(false)
  const [addingDec,   setAddingDec]   = useState(false)

  // ── AI ──────────────────────────────────────────────────────────────────
  const [aiMessages, setAiMessages] = useState([
    { role: "system", text: "I'm your SF meeting assistant. I can summarize decisions, extract tasks, and answer questions about this meeting." }
  ])
  const [aiInput,   setAiInput]   = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const aiEndRef = useRef(null)

  const socketRef = useRef(null)
  const elapsed   = useElapsed(meeting?.actual_start_at)
  const myName    = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "You" : "You"

  // ── Load data ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!meetingId) return
    setLoading(true)
    try {
      const [mRes, pRes, aRes, dRes, fRes] = await Promise.allSettled([
        meetAPI.getMeeting(meetingId),
        meetAPI.listParticipants(meetingId),
        meetAPI.getActionItems(meetingId),
        meetAPI.getDecisions(meetingId),
        meetAPI.getFiles(meetingId),
      ])
      if (mRes.status === "fulfilled" && mRes.value.data) {
        setMeeting(mRes.value.data)
        setIsRecording(mRes.value.data.recording_enabled || false)
      }
      if (pRes.status === "fulfilled") {
        const raw = pRes.value.data
        setParticipants(Array.isArray(raw) ? raw : raw?.participants || [])
      }
      if (aRes.status === "fulfilled") setActionItems(aRes.value.data?.action_items || [])
      if (dRes.status === "fulfilled") setDecisions(dRes.value.data?.decisions || [])
      if (fRes.status === "fulfilled") {
        const raw = fRes.value.data
        setFiles(Array.isArray(raw) ? raw : raw?.files || [])
      }
    } finally { setLoading(false) }
  }, [meetingId])

  useEffect(() => { load() }, [load])

  // ── Socket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingId || !access_token) return
    let socket, hb
    try {
      const { io } = require("socket.io-client")
      socket = io(window.location.origin, { transports: ["websocket"], withCredentials: true })
      socketRef.current = socket

      socket.emit("meet_join", { token: access_token, meeting_id: meetingId })

      socket.on("meet_participant_list", ({ participants: list }) => {
        if (Array.isArray(list)) setParticipants(list)
      })
      socket.on("meet_participant_joined", (data) => {
        setParticipants(prev => {
          if (prev.find(p => String(p.user_id) === String(data.user_id))) return prev
          return [...prev, { user_id: data.user_id, name: data.name, avatar: data.avatar, attendance_status: "attended" }]
        })
      })
      socket.on("meet_participant_left", ({ user_id }) => {
        setParticipants(prev => prev.filter(p => String(p.user_id) !== String(user_id)))
      })
      socket.on("meet_notes_delta", (data) => {
        if (String(data.user_id) === String(user?.id)) return
        const text = data.delta?.ops?.map(op => op.insert || "").join("") || ""
        if (text) setNotes(text)
      })

      hb = setInterval(() => socket.emit("meet_heartbeat", { meeting_id: meetingId }), 30000)
    } catch (e) { console.warn("[MeetRoom] Socket:", e.message) }

    return () => {
      clearInterval(hb)
      socketRef.current?.emit("meet_leave", { meeting_id: meetingId })
      socketRef.current?.disconnect()
    }
  }, [meetingId, access_token, user?.id])

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [aiMessages])

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleNotesChange = (val) => {
    setNotes(val)
    setNotesSaved(false)
    socketRef.current?.emit("meet_notes_change", {
      meeting_id: meetingId,
      delta: { ops: [{ insert: val }] },
      version: Date.now(),
    })
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      await meetAPI.saveArtifact(meetingId, {
        artifact_type: "notes",
        drive_file_id: `local:notes:${meetingId}:${Date.now()}`,
      })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 3000)
    } catch {}
    finally { setSavingNotes(false) }
  }

  const handleAddTask = async () => {
    const title = newTask.trim()
    if (addingTask) return
    if (!title) return
    setAddingTask(true)
    setApiError("")
    try {
      const res = await meetAPI.createActionItem(meetingId, { title, priority: "medium" })
      const item = res.data?.action_item || res.data
      if (item?.id) setActionItems(prev => [...prev, item])
      else setActionItems(prev => [...prev, { id: Date.now(), title, status: "open", priority: "medium" }])
      setNewTask("")
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Failed to add task"
      setApiError(msg)
      setTimeout(() => setApiError(""), 4000)
    }
    finally { setAddingTask(false) }
  }

  const handleToggleTask = async (item) => {
    const newStatus = item.status === "done" ? "open" : "done"
    setActionItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))
    try { await meetAPI.updateActionItem(meetingId, item.id, { status: newStatus }) }
    catch { setActionItems(prev => prev.map(i => i.id === item.id ? { ...i, status: item.status } : i)) }
  }

  const handleAddDecision = async () => {
    const statement = newDecision.trim()
    if (addingDec) return
    if (!statement) return
    setAddingDec(true)
    setApiError("")
    try {
      const res = await meetAPI.createDecision(meetingId, { decision_statement: statement })
      const dec = res.data?.decision || res.data
      if (dec?.id) setDecisions(prev => [...prev, dec])
      else setDecisions(prev => [...prev, { id: Date.now(), decision_statement: statement, status: "open" }])
      setNewDecision("")
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Failed to log decision"
      setApiError(msg)
      setTimeout(() => setApiError(""), 4000)
    }
    finally { setAddingDec(false) }
  }

  const handleAiSend = async (prompt) => {
    const q = (prompt || aiInput).trim()
    if (!q || aiLoading) return
    setAiInput("")
    setAiMessages(prev => [...prev, { role: "user", text: q }])
    setAiLoading(true)
    try {
      const history = aiMessages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }))
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an AI assistant in a live meeting on SF Collab. Meeting: "${meeting?.title || ""}". Type: ${meeting?.meeting_type || ""}. Current decisions: ${decisions.map(d => d.decision_statement).join("; ") || "none"}. Action items: ${actionItems.map(a => a.title).join("; ") || "none"}. Be concise and practical.`,
          messages: [...history, { role: "user", content: q }],
        }),
      })
      const data = await response.json()
      setAiMessages(prev => [...prev, { role: "assistant", text: data.content?.[0]?.text || "Sorry, I couldn't respond." }])
    } catch {
      setAiMessages(prev => [...prev, { role: "assistant", text: "Couldn't connect to AI right now." }])
    } finally { setAiLoading(false) }
  }

  const handleEnd = async () => {
    if (!window.confirm("End this meeting for everyone?")) return
    setEnding(true)
    try {
      await meetAPI.endMeeting(meetingId)
      socketRef.current?.emit("meet_leave", { meeting_id: meetingId })
      navigate(`/meet/${meetingId}/summary`)
    } catch (e) {
      console.error("Failed to end meeting:", e?.response?.data?.error)
      setEnding(false)
    }
  }

  const handleLeave = async () => {
    try { await meetAPI.leaveMeeting(meetingId) } catch {}
    socketRef.current?.emit("meet_leave", { meeting_id: meetingId })
    navigate("/meet")
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  // ── Video grid ───────────────────────────────────────────────────────────
  const tiles = participants.length > 0 ? participants : [
    { user_id: user?.id, name: myName, role: "host", isMe: true }
  ]

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading meeting…</p>
      </div>
    </div>
  )

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden select-none">

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Live</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-sm font-medium text-zinc-200 truncate max-w-[220px]">
            {meeting?.title || "Meeting"}
          </span>
          {meeting?.meeting_type && (
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 bg-white/5 rounded-md text-zinc-500 capitalize shrink-0">
              {meeting.meeting_type.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
            <Clock className="size-3" />{elapsed}
          </div>
          {isRecording && (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <RecordIcon className="size-3 animate-pulse" /> REC
            </div>
          )}
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <Users className="size-3" />
            <span>{tiles.length}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Video grid */}
        <div className="flex-1 p-3 overflow-hidden min-w-0">
          <div className={cn(
            "grid gap-2 h-full",
            tiles.length === 1 ? "grid-cols-1" :
            tiles.length <= 4 ? "grid-cols-2" :
            "grid-cols-3"
          )}>
            {tiles.map((p, i) => {
              const isMe = String(p.user_id) === String(user?.id)
              const name = isMe ? "You" : (p.name || `User ${p.user_id}`)
              const initials = name.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2) || "?"
              return (
                <div key={p.user_id || i}
                  className="relative rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.06] flex items-center justify-center min-h-[120px]">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold", COLORS[i % COLORS.length])}>
                    {initials}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      {name}{isMe && " (You)"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel toggle */}
        <button onClick={() => setPanelOpen(!panelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-zinc-800 border-y border-l border-white/10 rounded-l-lg p-1.5 text-zinc-500 hover:text-white transition-colors shadow-lg"
          style={{ right: panelOpen ? (showChat ? 320 : 320) : 0 }}>
          {panelOpen ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>

        {/* Side panel */}
        {panelOpen && (
          <div className="w-[340px] shrink-0 border-l border-white/[0.06] bg-zinc-950 flex flex-col min-h-0">
            {showChat ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
                  <span className="text-sm font-semibold text-white">Chat</span>
                  <button onClick={() => setShowChat(false)} className="text-zinc-500 hover:text-white"><X className="size-4" /></button>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatPanel socket={socketRef.current} meetingId={meetingId} userName={myName} />
                </div>
              </>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-white/[0.06] shrink-0 overflow-x-auto">
                  {TABS.map(tab => {
                    const Icon = tab.icon
                    const active = activeTab === tab.id
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={cn("flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2",
                          active ? "border-cyan-500 text-cyan-400 bg-cyan-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300")}>
                        <Icon className="size-3.5" />{tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* API error banner */}
                {apiError && (
                  <div className="mx-3 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 shrink-0">
                    {apiError}
                  </div>
                )}

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto min-h-0 p-3">

                  {/* NOTES */}
                  {activeTab === "notes" && (
                    <div className="flex flex-col h-full gap-2" style={{ minHeight: 300 }}>
                      <div className="flex items-center justify-between shrink-0">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live Notes</span>
                        <button onClick={handleSaveNotes} disabled={savingNotes}
                          className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors",
                            notesSaved ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white")}>
                          <Save className="size-3" />
                          {savingNotes ? "Saving…" : notesSaved ? "Saved ✓" : "Save"}
                        </button>
                      </div>
                      <textarea
                        value={notes}
                        onChange={e => handleNotesChange(e.target.value)}
                        placeholder={"Start typing notes…\n\nTips:\n• Key decisions\n• Action items\n• Blockers"}
                        className="flex-1 w-full bg-zinc-900/80 border border-white/[0.06] rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 resize-none font-mono leading-relaxed"
                        style={{ minHeight: 240 }}
                      />
                    </div>
                  )}

                  {/* TASKS */}
                  {activeTab === "tasks" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Action Items</span>
                        <span className="text-xs text-zinc-600">{actionItems.length}</span>
                      </div>
                      {/* Add task */}
                      <div className="flex gap-2">
                        <input
                          value={newTask}
                          onChange={e => setNewTask(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddTask(); } }}
                          placeholder="Add action item… (Enter to add)"
                          className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 transition-colors" />
                        <button
                          onClick={handleAddTask}
                          disabled={addingTask}
                          className="w-9 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                          <Plus className="size-4 text-white" />
                        </button>
                      </div>
                      {/* Task list */}
                      <div className="space-y-2">
                        {actionItems.length === 0 && (
                          <p className="text-xs text-zinc-600 text-center py-6">No action items yet</p>
                        )}
                        {actionItems.map(task => (
                          <div key={task.id} className="flex items-start gap-2.5 p-2.5 bg-zinc-900/60 border border-white/[0.06] rounded-xl group">
                            <button onClick={() => handleToggleTask(task)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                              {task.status === "done"
                                ? <CheckCircle2 className="size-4 text-emerald-400" />
                                : <Circle className="size-4 text-zinc-600 hover:text-zinc-400" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm leading-snug", task.status === "done" ? "line-through text-zinc-600" : "text-zinc-200")}>
                                {task.title}
                              </p>
                              <span className="text-[10px] text-zinc-600 capitalize">{task.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DECISIONS */}
                  {activeTab === "decisions" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decisions</span>
                        <span className="text-xs text-zinc-600">{decisions.length}</span>
                      </div>
                      {/* Add decision */}
                      <div className="flex gap-2">
                        <input
                          value={newDecision}
                          onChange={e => setNewDecision(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddDecision(); } }}
                          placeholder="Log a decision… (Enter to add)"
                          className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-colors" />
                        <button
                          onClick={handleAddDecision}
                          disabled={addingDec}
                          className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                          <Plus className="size-4 text-white" />
                        </button>
                      </div>
                      {/* Decisions list */}
                      <div className="space-y-2">
                        {decisions.length === 0 && (
                          <p className="text-xs text-zinc-600 text-center py-6">No decisions logged yet</p>
                        )}
                        {decisions.map(dec => (
                          <div key={dec.id} className="p-2.5 bg-zinc-900/60 border border-white/[0.06] rounded-xl">
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                              <p className="text-sm text-zinc-200 leading-snug">{dec.decision_statement}</p>
                            </div>
                            {dec.rationale && (
                              <p className="text-xs text-zinc-500 mt-1.5 pl-3.5 italic">{dec.rationale}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI */}
                  {activeTab === "ai" && (
                    <div className="flex flex-col gap-3" style={{ minHeight: 300 }}>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">SF Assistant</span>
                      {/* Quick prompts */}
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        {["Summarize meeting", "List decisions", "Extract tasks", "Key blockers"].map(p => (
                          <button key={p} onClick={() => handleAiSend(p)}
                            className="text-[10px] px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg text-zinc-400 hover:text-white transition-colors">
                            {p}
                          </button>
                        ))}
                      </div>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[160px]">
                        {aiMessages.map((msg, i) => (
                          <div key={i} className={cn("flex gap-2 text-sm", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                              msg.role === "user" ? "bg-cyan-500/20 text-cyan-300" :
                              msg.role === "system" ? "bg-zinc-800 text-zinc-500" : "bg-violet-500/20 text-violet-300")}>
                              {msg.role === "user" ? "Y" : msg.role === "system" ? "i" : "AI"}
                            </div>
                            <div className={cn("px-3 py-2 rounded-xl max-w-[85%] text-xs leading-relaxed",
                              msg.role === "user" ? "bg-cyan-500/10 border border-cyan-500/20 text-zinc-200" :
                              msg.role === "system" ? "bg-white/5 text-zinc-500 italic" :
                              "bg-zinc-900 border border-white/[0.06] text-zinc-300")}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] text-violet-300 shrink-0">AI</div>
                            <div className="bg-zinc-900 border border-white/[0.06] px-3 py-2 rounded-xl">
                              <div className="flex gap-1">
                                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={aiEndRef} />
                      </div>
                      {/* Input */}
                      <div className="flex gap-2 shrink-0">
                        <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAiSend()}
                          placeholder="Ask about this meeting…"
                          className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/40" />
                        <button onClick={() => handleAiSend()} disabled={aiLoading}
                          className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                          <Send className="size-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FILES */}
                  {activeTab === "files" && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Linked Files</span>
                      {files.length === 0 && (
                        <p className="text-xs text-zinc-600 text-center py-6">No files linked to this meeting</p>
                      )}
                      {files.map((f, i) => (
                        <button key={f.id || i}
                          onClick={() => meetAPI.openFile(meetingId, f.id)}
                          className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-white/[0.06] rounded-xl hover:border-white/20 transition-colors text-left w-full group">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <FileText className="size-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-200 truncate group-hover:text-cyan-400 transition-colors">
                              {f.drive_file_id || `File ${f.id}`}
                            </p>
                            <p className="text-[10px] text-zinc-600 capitalize">{f.artifact_type}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM TOOLBAR ──────────────────────────────────────────────── */}
      <footer className="h-16 shrink-0 border-t border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 relative" style={{zIndex: 20, backdropFilter: 'none'}}>

        {/* Left */}
        <div className="flex items-center gap-2 w-32">
          <button onClick={() => { setShowChat(!showChat); setPanelOpen(true) }}
            className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors",
              showChat ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white")}>
            <MessageSquare className="size-3.5" />
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-2">
          {/* Mic */}
          <ToolButton icon={micOn ? Mic : MicOff} label="Mic"
            active={micOn} danger={!micOn}
            onClick={() => setMicOn(!micOn)} />

          {/* Camera */}
          <ToolButton icon={camOn ? Video : VideoOff} label="Camera"
            active={camOn} danger={!camOn}
            onClick={() => setCamOn(!camOn)} />

          {/* Screen share */}
          <ToolButton icon={screenShare.sharing ? MonitorOff : MonitorUp}
            label={screenShare.sharing ? "Stop" : "Share"}
            active={!screenShare.sharing}
            accent={screenShare.sharing}
            onClick={screenShare.toggle} />

          {/* Record */}
          <ToolButton icon={RecordIcon} label="Record"
            active={!isRecording} danger={isRecording}
            onClick={() => setIsRecording(!isRecording)} />

          {/* More */}
          <div className="relative">
            <ToolButton icon={MoreHorizontal} label="More"
              active={true}
              onClick={() => setShowMore(!showMore)} />
            {showMore && (
              <MoreMenu
                onClose={() => setShowMore(false)}
                onToggleChat={() => { setShowChat(!showChat); setPanelOpen(true) }}
                onToggleFullscreen={toggleFullscreen}
                onOpenSettings={() => setShowSettings(true)}
                onLeave={handleLeave}
              />
            )}
          </div>
        </div>

        {/* Right: End */}
        <div className="flex items-center justify-end w-32">
          <button onClick={handleEnd} disabled={ending}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold h-9 px-4 rounded-xl transition-colors shadow-lg shadow-red-500/20">
            {ending ? "Ending…" : "End"}
          </button>
        </div>
      </footer>

      {/* Click outside to close More menu */}
      

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

// ── ToolButton ────────────────────────────────────────────────────────────────
function ToolButton({ icon: Icon, label, active, danger, accent, onClick }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button onClick={onClick}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105",
          danger ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30" :
          accent ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30 hover:bg-cyan-500/30" :
          "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        )}>
        <Icon className="size-4" />
      </button>
      <span className="text-[9px] text-zinc-600">{label}</span>
    </div>
  )
}