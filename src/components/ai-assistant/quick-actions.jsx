import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlusCircle, CalendarPlus, ListTodo, Bell, FileText, Zap,
  Loader2, CheckCircle, AlertCircle,
} from "lucide-react"
import assistantService from "@/services/assistantService"

const QUICK_ACTIONS = [
  { id: "create_workspace", label: "Create Workspace", description: "Set up a new workspace", icon: PlusCircle, color: "text-violet-500", bg: "bg-violet-500/8", border: "border-violet-500/20", hoverBorder: "hover:border-violet-500/40" },
  { id: "schedule_meeting", label: "Schedule Meeting", description: "Plan a meeting with your team", icon: CalendarPlus, color: "text-blue-500", bg: "bg-blue-500/8", border: "border-blue-500/20", hoverBorder: "hover:border-blue-500/40" },
  { id: "create_task", label: "Create Task", description: "Add a new task or to-do", icon: ListTodo, color: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/20", hoverBorder: "hover:border-emerald-500/40" },
  { id: "create_reminder", label: "Create Reminder", description: "Set a reminder for later", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/8", border: "border-amber-500/20", hoverBorder: "hover:border-amber-500/40" },
  { id: "write_document", label: "Write Document", description: "Generate a document with AI", icon: FileText, color: "text-brand", bg: "bg-brand/[0.08]", border: "border-brand/20", hoverBorder: "hover:border-brand/40" },
]

export default function QuickActions({ onAction, onActionResult }) {
  const [executing, setExecuting] = useState(null)
  const [results, setResults] = useState({})

  const handleAction = useCallback(async (actionId) => {
    if (executing) return
    setExecuting(actionId)
    onAction?.(actionId)
    try {
      const params = {
        create_workspace: { name: "New Workspace" },
        schedule_meeting: { title: "Team Meeting", when: "tomorrow at 10am", duration_minutes: 30 },
        create_task: { title: "New Task", workspace_id: 0 },
        create_reminder: { title: "Reminder", when: "tomorrow at 9am" },
        write_document: { topic: "New Document", output_format: "markdown" },
      }[actionId]
      const res = await assistantService.executeAction(actionId, params)
      const result = {
        success: true,
        description: res.description || `${QUICK_ACTIONS.find((a) => a.id === actionId)?.label} executed successfully`,
        data: res.data,
      }
      setResults((prev) => ({ ...prev, [actionId]: result }))
      onActionResult?.(actionId, result)
    } catch (err) {
      const result = {
        success: false,
        error: err?.response?.data?.error || err.message || "Action failed",
      }
      setResults((prev) => ({ ...prev, [actionId]: result }))
      onActionResult?.(actionId, result)
    } finally {
      setExecuting(null)
    }
  }, [executing, onAction, onActionResult])

  const dismissResult = (actionId) => {
    setResults((prev) => {
      const next = { ...prev }
      delete next[actionId]
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3"
        >
          <Zap className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">Quick Actions</h3>
        <p className="text-xs text-muted-foreground/70">Shortcuts for common assistant actions</p>
      </motion.div>

      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon
          const isExecuting = executing === action.id
          const result = results[action.id]

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              layout
            >
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={`result-${action.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-xl border overflow-hidden ${result.success ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"}`}
                  >
                    <div className="flex items-start gap-2.5 px-3.5 py-3">
                      {result.success
                        ? <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" strokeWidth={1.5} />
                        : <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${result.success ? "text-success" : "text-destructive"}`}>
                          {result.success ? action.label : "Action failed"}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">
                          {result.success ? result.description : result.error}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissResult(action.id)}
                        className="shrink-0 h-5 w-5 rounded flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground hover:bg-secondary/50 transition-all cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key={`btn-${action.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleAction(action.id)}
                    disabled={executing !== null}
                    className={`w-full relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer group ${action.border} ${action.hoverBorder} bg-card hover:bg-card-hover ${isExecuting ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <motion.div
                      animate={isExecuting ? { rotate: 360 } : {}}
                      transition={isExecuting ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${action.bg} group-hover:scale-105`}
                    >
                      {isExecuting
                        ? <Loader2 className={`h-4 w-4 animate-spin ${action.color}`} strokeWidth={1.5} />
                        : <Icon className={`h-4 w-4 ${action.color}`} strokeWidth={1.5} />
                      }
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-card-foreground group-hover:text-foreground transition-colors">
                        {action.label}
                      </span>
                      <p className="text-[11px] text-muted-foreground/60 leading-tight mt-0.5">{action.description}</p>
                    </div>
                    <div className="shrink-0 h-6 w-6 rounded-md bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-3 w-3 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
