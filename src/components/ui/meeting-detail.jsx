import React from "react"
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
import { Separator } from "@/components/ui/separator"

// ── Mock data — used when no props are passed ──────────────────────────────
const MOCK = {
  title: "Quarterly Vision Alignment",
  type: "Vision Review",
  status: "upcoming",           // "live" | "upcoming" | "ended"
  date: "Monday, May 5 · 10:00 AM",
  duration: "60 min",
  participants: [
    { name: "Alex Rivera",  role: "Founder",        status: "confirmed", isHost: true  },
    { name: "Sarah Chen",   role: "Lead Architect",  status: "confirmed", isHost: false },
    { name: "Marcus Bell",  role: "Product Manager", status: "pending",   isHost: false },
    { name: "Priya Nair",   role: "Designer",        status: "confirmed", isHost: false },
    { name: "James Okafor", role: "Engineer",        status: "declined",  isHost: false },
  ],
  agenda: [
    { label: "Recap Q2 milestones and wins",         done: true  },
    { label: "Q3 roadmap walkthrough",               done: true  },
    { label: "Architecture Node deep dive",          done: false },
    { label: "GTM strategy alignment",               done: false },
    { label: "Open floor — questions & blockers",    done: false },
  ],
  files: [
    { name: "Q3_Roadmap_Draft.pdf",      type: "document", size: "2.4 MB" },
    { name: "Architecture_Overview.pdf", type: "document", size: "1.8 MB" },
    { name: "auth_service.js",           type: "code",     size: "14 KB"  },
    { name: "Hero_Section_V2.png",       type: "image",    size: "4.1 MB" },
  ],
}

// ── Avatar colors — each participant gets a unique color ───────────────────
const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30",
  "bg-cyan-500/20   text-cyan-300   ring-1 ring-cyan-500/30",
  "bg-amber-500/20  text-amber-300  ring-1 ring-amber-500/30",
  "bg-pink-500/20   text-pink-300   ring-1 ring-pink-500/30",
  "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
]

// ── File type config ───────────────────────────────────────────────────────
const FILE_CONFIG = {
  document: { icon: FileText, color: "text-cyan-400",   bg: "bg-cyan-500/10"   },
  code:     { icon: Code,     color: "text-violet-400", bg: "bg-violet-500/10" },
  image:    { icon: ImageIcon,color: "text-amber-400",  bg: "bg-amber-500/10"  },
}

// ── Status badge config ────────────────────────────────────────────────────
const PARTICIPANT_STATUS = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending:   "bg-amber-500/10   text-amber-400   border-amber-500/20",
  declined:  "bg-red-500/10     text-red-400     border-red-500/20",
}

const MEETING_STATUS = {
  live:     { label: "● Live Now", cls: "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" },
  upcoming: { label: "Upcoming",   cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  ended:    { label: "Ended",      cls: "bg-muted text-muted-foreground" },
}

/**
 * MeetingDetail — premium meeting detail page component.
 *
 * Props:
 *   title        — string
 *   type         — string (e.g. "Vision Review")
 *   status       — "live" | "upcoming" | "ended"
 *   date         — string
 *   duration     — string
 *   participants — [{ name, role, status, isHost }]
 *   agenda       — [{ label, done }]
 *   files        — [{ name, type, size }]
 *   onJoin       — function
 *   onBack       — function
 */
const MeetingDetail = React.forwardRef((
  {
    title        = MOCK.title,
    type         = MOCK.type,
    status       = MOCK.status,
    date         = MOCK.date,
    duration     = MOCK.duration,
    participants = MOCK.participants,
    agenda       = MOCK.agenda,
    files        = MOCK.files,
    onJoin       = () => window.location.href = "/meet/room/mtg-001",
    onBack,
    className,
    ...props
  },
  ref
) => {

  // Agenda progress
  const doneCount  = agenda.filter(a => a.done).length
  const totalCount = agenda.length
  const progress   = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const meetingStatus = MEETING_STATUS[status] ?? MEETING_STATUS.upcoming

  return (
    <div
      ref={ref}
      data-slot="meeting-detail"
      className={cn("w-full max-w-5xl mx-auto space-y-6 py-8 px-4 sm:px-6", className)}
      {...props}
    >
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Meetings
        </button>
      )}

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-border/60">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        <CardContent className="relative pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

            {/* Left: meta */}
            <div className="space-y-3 flex-1 min-w-0">
              {/* Type + Live badge row */}
              <div className="flex flex-wrap items-center gap-2">
                {type && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/30 text-primary">
                    {type}
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-[10px]", meetingStatus.cls)}>
                  {meetingStatus.label}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                {title}
              </h1>

              {/* Meta pills: date · duration · headcount */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {participants.length} participants
                </span>
                <span className="flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  {files.length} files linked
                </span>
              </div>
            </div>

            {/* Right: Join CTA */}
            <div className="shrink-0">
              <Button
                size="lg"
                onClick={onJoin}
                disabled={status === "ended"}
                className={cn(
                  "gap-2 h-11 px-6 font-semibold transition-all duration-200",
                  status === "live"
                    ? "shadow-lg shadow-red-500/20 ring-2 ring-red-500/30"
                    : "shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]"
                )}
              >
                <Video className="h-4 w-4" />
                {status === "live" ? "Join Live" : "Join Meeting"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Body: 3-col left / 2-col right ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Left: Agenda ──────────────────────────────────────────────── */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Agenda</CardTitle>
              {/* Progress fraction */}
              <span className="text-xs text-muted-foreground font-medium">
                {doneCount} / {totalCount} complete
              </span>
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-1 pt-1">
            {agenda.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">No agenda items yet.</p>
            )}

            {agenda.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  item.done
                    ? "text-muted-foreground"
                    : "text-foreground hover:bg-muted/40"
                )}
              >
                {/* Number bubble or check */}
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground">{i + 1}</span>
                  </div>
                )}
                <span className={item.done ? "line-through" : ""}>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Right column: Participants + Files ────────────────────────── */}
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

              {participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Color-coded avatar */}
                    <Avatar className="size-8">
                      <AvatarFallback
                        className={cn("text-xs font-bold", AVATAR_COLORS[i % AVATAR_COLORS.length])}
                      >
                        {p.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      {/* Name + host crown */}
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        {p.isHost && (
                          <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{p.role}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize shrink-0", PARTICIPANT_STATUS[p.status] ?? "")}
                  >
                    {p.status}
                  </Badge>
                </div>
              ))}
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
                const cfg = FILE_CONFIG[file.type] ?? FILE_CONFIG.document
                const Icon = cfg.icon
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-all duration-150 cursor-pointer group hover:scale-[1.01]"
                  >
                    {/* Color-coded file icon */}
                    <div className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-md shrink-0 transition-colors",
                      cfg.bg, cfg.color
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-sm font-medium truncate transition-colors",
                        "group-hover:" + cfg.color.replace("text-", "text-")
                      )}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{file.size}</p>
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
