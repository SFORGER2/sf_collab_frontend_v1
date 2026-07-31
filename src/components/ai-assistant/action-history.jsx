import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  History, Clock, CheckCircle2, XCircle, AlertTriangle, Ban,
  RefreshCw, Loader2, ChevronDown, ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import assistantService from "@/services/assistantService"

const STATUS_CONFIG = {
  executed: { label: "Executed", icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  proposed: { label: "Proposed", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  failed: { label: "Failed", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  denied: { label: "Denied", icon: Ban, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export default function ActionHistory() {
  const [actions, setActions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    setError(null)
    try {
      const data = await assistantService.getActionHistory()
      setActions(data)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to load action history")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  return (
    <div className="flex flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3"
        >
          <History className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">Action History</h3>
        <p className="text-xs text-muted-foreground/70">Review previous AI assistant actions</p>
      </motion.div>

      <div className="flex justify-end">
        <button
          onClick={() => fetchHistory(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-secondary transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} strokeWidth={1.5} />
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-brand" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground/60">Loading action history...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" strokeWidth={1.5} />
          <p className="text-[11px] text-destructive/80">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex flex-col gap-2">
          {actions.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <History className="h-8 w-8 text-muted-foreground/20" strokeWidth={1} />
              <p className="text-xs text-muted-foreground/40">No actions recorded yet</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {actions.map((item, index) => {
                const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.executed
                const StatusIcon = config.icon
                const isExpanded = expandedId === item.id

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    layout
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer group ${config.border} bg-card hover:bg-card-hover`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${config.bg} group-hover:scale-105`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-card-foreground">{item.action}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{formatFullDate(item.date)}</p>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
                                <p className="text-[11px] text-card-foreground/80 leading-relaxed">{item.result}</p>
                                {item.params && Object.keys(item.params).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(item.params).map(([key, val]) => (
                                      <span key={key} className="text-[10px] text-muted-foreground/50 bg-secondary/50 px-1.5 py-0.5 rounded font-mono">
                                        {key}: {String(val)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="shrink-0 h-6 w-6 rounded-md bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isExpanded
                          ? <ChevronUp className="h-3 w-3 text-muted-foreground/50" strokeWidth={2} />
                          : <ChevronDown className="h-3 w-3 text-muted-foreground/50" strokeWidth={2} />
                        }
                      </motion.div>
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  )
}
