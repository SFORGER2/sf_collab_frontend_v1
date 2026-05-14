import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Calendar, Clock, Users, Video,
  FileText, Code, Image as ImageIcon,
  CheckCircle2, Circle, Crown,
  ArrowLeft, Paperclip,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { meetAPI } from "@/utils/APIs/meetAPI"

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30",
  "bg-cyan-500/20   text-cyan-300   ring-1 ring-cyan-500/30",
  "bg-amber-500/20  text-amber-300  ring-1 ring-amber-500/30",
  "bg-pink-500/20   text-pink-300   ring-1 ring-pink-500/30",
  "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
]

const FILE_CONFIG = {
  recording:  { icon: Video,     color: "text-red-400",    bg: "bg-red-500/10"    },
  transcript: { icon: FileText,  color: "text-cyan-400",   bg: "bg-cyan-500/10"   },
  summary:    { icon: FileText,  color: "text-emerald-400",bg: "bg-emerald-500/10"},
  notes:      { icon: Code,      color: "text-violet-400", bg: "bg-violet-500/10" },
  annotation: { icon: ImageIcon, color: "text-amber-400",  bg: "bg-amber-500/10"  },
  default:    { icon: FileText,  color: "text-zinc-400",   bg: "bg-zinc-800"      },
}

const ATTENDANCE_STATUS = {
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  invited:  "bg-amber-500/10   text-amber-400   border-amber-500/20",
  attended: "bg-blue-500/10    text-blue-400    border-blue-500/20",
  declined: "bg-red-500/10     text-red-400     border-red-500/20",
  no_show:  "bg-zinc-800       text-zinc-500    border-zinc-700",
}

const MEETING_STATUS = {
  live:      { label: "● Live Now", cls: "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" },
  scheduled: { label: "Upcoming",   cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  ended:     { label: "Ended",      cls: "bg-muted text-muted-foreground" },
  processing:{ label: "Processing", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  indexed:   { label: "Indexed",    cls: "bg-zinc-800 text-zinc-400 border-zinc-700" },
}

function fmt(iso) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function durStr(start, end) {
  if (!start || !end) return null
  const mins = Math.round((new Date(end) - new Date(start)) / 60000)
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

/**
 * MeetingDetail — loads real data from /api/meet/:id
 * Can be used as a component (with props) or standalone page (reads :id from route)
 */
const MeetingDetail = React.forwardRef((
  { meetingId: propId, onJoin, onBack, className, ...props },
  ref
) => {
  const params   = useParams()
  const navigate = useNavigate()
  const id       = propId || params.id

  const [meeting,      setMeeting]      = useState(null)
  const [participants, setParticipants] = useState([])
  const [decisions,    setDecisions]    = useState([])
  const [actionItems,  setActionItems]  = useState([])
  const [files,        setFiles]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [ending,       setEnding]       = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const [mRes, pRes, dRes, aRes, fRes] = await Promise.allSettled([
          meetAPI.getMeeting(id),
          meetAPI.listParticipants(id),
          meetAPI.getDecisions(id),
          meetAPI.getActionItems(id),
          meetAPI.getFiles(id),
        ])
        if (mRes.status === "fulfilled") setMeeting(mRes.value.data)
        if (pRes.status === "fulfilled") {
          const raw = pRes.value.data
          setParticipants(Array.isArray(raw) ? raw : raw?.participants || [])
        }
        if (dRes.status === "fulfilled") setDecisions(dRes.value.data?.decisions || [])
        if (aRes.status === "fulfilled") setActionItems(aRes.value.data?.action_items || [])
        if (fRes.status === "fulfilled") setFiles(Array.isArray(fRes.value.data) ? fRes.value.data : [])
      } finally { setLoading(false) }
    })()
  }, [id])

  const handleJoin = async () => {
    if (onJoin) { onJoin(); return }
    try { await meetAPI.startMeeting(id) } catch {}
    navigate(`/meet/room/${id}`)
  }

  const handleBack = () => {
    if (onBack) { onBack(); return }
    navigate(-1)
  }

  const handleEnd = async () => {
    if (!window.confirm("End this meeting?")) return
    setEnding(true)
    try { await meetAPI.endMeeting(id); window.location.reload() }
    catch (e) { alert(e?.response?.data?.error || "Failed to end meeting.") }
    finally { setEnding(false) }
  }

  if (loading) return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!meeting) return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Meeting not found.</p>
      <button onClick={handleBack} className="text-sm text-primary hover:underline">← Back</button>
    </div>
  )

  const status    = meeting.status || "scheduled"
  const isLive    = status === "live"
  const isEnded   = ["ended", "indexed", "processing"].includes(status)
  const canJoin   = !isEnded
  const meetStatus = MEETING_STATUS[status] || MEETING_STATUS.scheduled
  const dur        = durStr(meeting.scheduled_start_at, meeting.scheduled_end_at)

  // Agenda — use decisions as agenda items if no dedicated field
  const agendaItems = meeting.agenda_items || []
  const doneCount   = agendaItems.filter(a => a.done).length
  const totalCount  = agendaItems.length
  const progress    = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div ref={ref} data-slot="meeting-detail"
      className={cn("w-full max-w-5xl mx-auto space-y-6 py-8 px-4 sm:px-6", className)}
      {...props}>

      {/* Breadcrumb */}
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Meetings
      </button>

      {/* Hero */}
      <Card className="relative overflow-hidden border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <CardContent className="relative pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {meeting.meeting_type && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/30 text-primary">
                    {meeting.meeting_type.replace(/_/g, " ")}
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-[10px]", meetStatus.cls)}>
                  {meetStatus.label}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{meeting.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 shrink-0" />{fmt(meeting.scheduled_start_at)}</span>
                {dur && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />{dur}</span>}
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 shrink-0" />{participants.length} participants</span>
                <span className="flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5 shrink-0" />{files.length} files linked</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              {canJoin && (
                <Button size="lg" onClick={handleJoin}
                  className={cn("gap-2 h-11 px-6 font-semibold",
                    isLive ? "shadow-lg shadow-red-500/20 ring-2 ring-red-500/30" : "shadow-lg shadow-primary/20")}>
                  <Video className="h-4 w-4" />{isLive ? "Join Live" : "Join Meeting"}
                </Button>
              )}
              {isLive && (
                <Button size="lg" variant="destructive" onClick={handleEnd} disabled={ending}
                  className="h-11 px-6 font-semibold">
                  {ending ? "Ending…" : "End Meeting"}
                </Button>
              )}
              {isEnded && (
                <Button size="lg" variant="outline" onClick={() => navigate(`/meet/${id}/summary`)}
                  className="h-11 px-6 font-semibold">
                  <FileText className="h-4 w-4 mr-2" /> View Summary
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* Agenda / Decisions */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {agendaItems.length > 0 ? "Agenda" : `Decisions (${decisions.length})`}
              </CardTitle>
              {agendaItems.length > 0 && (
                <span className="text-xs text-muted-foreground font-medium">{doneCount} / {totalCount} complete</span>
              )}
            </div>
            {agendaItems.length > 0 && totalCount > 0 && (
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-2">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-1 pt-1">
            {agendaItems.length > 0 ? agendaItems.map((item, i) => (
              <div key={i} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                item.done ? "text-muted-foreground" : "text-foreground hover:bg-muted/40")}>
                {item.done
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  : <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-muted-foreground">{i + 1}</span>
                    </div>}
                <span className={item.done ? "line-through" : ""}>{item.label}</span>
              </div>
            )) : decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No decisions captured yet.</p>
            ) : decisions.map((d, i) => (
              <div key={d.id || i} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-colors">
                <div className="mt-1 size-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <div className="size-1.5 rounded-full bg-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground">{d.decision_statement}</p>
                  {d.rationale && <p className="text-xs text-muted-foreground mt-1 italic">{d.rationale}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Participants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {participants.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No participants added.</p>
              )}
              {participants.map((p, i) => {
                const name    = p.name || (p.user ? `${p.user.firstName} ${p.user.lastName}` : `User #${p.user_id}`)
                const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                const isHost  = p.role === "host"
                const status  = p.attendance_status || "invited"
                return (
                  <div key={p.id || i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8">
                        <AvatarFallback className={cn("text-xs font-bold", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">{name}</p>
                          {isHost && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground capitalize">{p.role || "member"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", ATTENDANCE_STATUS[status] || ATTENDANCE_STATUS.invited)}>
                      {status}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Linked Files */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Linked Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {files.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No files linked.</p>
              )}
              {files.map((file, i) => {
                const cfg  = FILE_CONFIG[file.artifact_type] || FILE_CONFIG.default
                const Icon = cfg.icon
                return (
                  <div key={file.id || i}
                    onClick={() => meetAPI.openFile(file.meeting_id, file.id)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-all cursor-pointer group hover:scale-[1.01]">
                    <div className={cn("h-8 w-8 flex items-center justify-center rounded-md shrink-0", cfg.bg, cfg.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium truncate transition-colors", cfg.color)}>
                        {file.drive_file_id || `${file.artifact_type} file`}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">{file.artifact_type}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
})

MeetingDetail.displayName = "MeetingDetail"
export { MeetingDetail }
export default MeetingDetail