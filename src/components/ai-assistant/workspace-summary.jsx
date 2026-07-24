import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Target, Users, ListTodo, CalendarClock, CalendarDays,
  FileText, GitBranch, RefreshCw, Loader2, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import assistantService from "@/services/assistantService"

export default function WorkspaceSummary() {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    setError(null)
    try {
      const data = await assistantService.getWorkspaceSummary()
      setSummary(data)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to load workspace summary")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  return (
    <div className="flex flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3"
        >
          <LayoutDashboard className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">Workspace Summary</h3>
        <p className="text-xs text-muted-foreground/70">Overview of your workspace activity</p>
      </motion.div>

      <div className="flex justify-end">
        <button
          onClick={() => fetchSummary(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-secondary transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} strokeWidth={1.5} />
          Refresh Summary
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-brand" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground/60">Loading workspace summary...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" strokeWidth={1.5} />
          <p className="text-[11px] text-destructive/80">{error}</p>
        </div>
      )}

      {!isLoading && !error && summary && (
        <div className="flex flex-col gap-3">
          {/* Mission */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-card-foreground">Mission</span>
            </div>
            <p className="text-[11px] text-card-foreground/70 leading-relaxed">{summary.mission}</p>
          </div>

          {/* Team Members */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Users className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-card-foreground">Team Members</span>
              <span className="text-[10px] text-muted-foreground/50 tabular-nums bg-secondary/60 px-1.5 py-0.5 rounded ml-auto">
                {summary.teamMembers?.length || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.teamMembers?.map((member) => (
                <div key={member.name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/40">
                  <div className="h-5 w-5 rounded-full bg-brand/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-brand">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-card-foreground">{member.name}</span>
                    <span className="text-[9px] text-muted-foreground/50 ml-1">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-card-foreground">Open Tasks</span>
              </div>
              <p className="text-2xl font-heading font-bold text-card-foreground tabular-nums">{summary.openTasks || 0}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-card-foreground">Upcoming Deadlines</span>
              </div>
              <div className="flex flex-col gap-1">
                {summary.deadlines?.map((dl) => (
                  <div key={dl.title} className="flex items-center justify-between">
                    <span className="text-[11px] text-card-foreground/70 truncate mr-2">{dl.title}</span>
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">{dl.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Meeting */}
          {summary.latestMeeting && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-card-foreground">Latest Meeting</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarDays className="h-3 w-3 text-muted-foreground/50" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-card-foreground">{summary.latestMeeting.title}</p>
                  <p className="text-[10px] text-muted-foreground/50">
                    {new Date(summary.latestMeeting.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  <p className="text-[11px] text-card-foreground/70 mt-1.5 leading-relaxed">{summary.latestMeeting.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Documents */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <FileText className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-card-foreground">Key Documents</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {summary.keyDocuments?.map((doc) => (
                <div key={doc.title} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                    <span className="text-[11px] text-card-foreground/80 truncate">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[9px] text-muted-foreground/40 bg-secondary/60 px-1 py-0.5 rounded">{doc.type}</span>
                    <span className="text-[9px] text-muted-foreground/40">{doc.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Decisions */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <GitBranch className="h-4 w-4 text-brand shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-card-foreground">Recent Decisions</span>
            </div>
            <div className="flex flex-col gap-2">
              {summary.recentDecisions?.map((dec) => (
                <div key={dec.decision + dec.date} className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-card-foreground/80 leading-relaxed">{dec.decision}</p>
                    <p className="text-[9px] text-muted-foreground/40 mt-0.5">{dec.date} &middot; {dec.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
