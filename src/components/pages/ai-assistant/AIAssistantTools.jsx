import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Eye, Zap, History, LayoutDashboard } from "lucide-react"
import DocumentWriter from "@/components/ai-assistant/document-writer"
import DocumentPreview from "@/components/ai-assistant/document-preview"
import QuickActions from "@/components/ai-assistant/quick-actions"
import ActionHistory from "@/components/ai-assistant/action-history"
import WorkspaceSummary from "@/components/ai-assistant/workspace-summary"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "writer", label: "Document Writer", icon: FileText },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "actions", label: "Quick Actions", icon: Zap },
  { id: "history", label: "Action History", icon: History },
  { id: "workspace", label: "Workspace", icon: LayoutDashboard },
]

export default function AIAssistantTools() {
  const [activeTab, setActiveTab] = useState("writer")
  const [lastGeneratedDoc, setLastGeneratedDoc] = useState(null)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-lg font-heading tracking-tight text-foreground">AI Assistant Tools</h1>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Generate documents, execute actions, review history, and manage your workspace
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-xs"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isDisabled = tab.id === "preview" && !lastGeneratedDoc

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer overflow-hidden select-none",
                    isActive
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : isDisabled
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground/70 hover:text-card-foreground hover:bg-secondary/80",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-tab"
                      className="absolute inset-0 bg-brand rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 hidden sm:block relative z-10" strokeWidth={1.5} />
                  <span className="relative z-10 truncate">
                    {tab.label === "Document Writer" ? (
                      <><span className="hidden sm:inline">Document Writer</span><span className="sm:hidden">Document</span></>
                    ) : tab.label === "Quick Actions" ? (
                      <><span className="hidden sm:inline">Quick Actions</span><span className="sm:hidden">Actions</span></>
                    ) : (
                      tab.label
                    )}
                  </span>
                </button>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {activeTab === "writer" && (
                <DocumentWriter onDocumentGenerated={(doc) => { setLastGeneratedDoc(doc); setActiveTab("preview") }} />
              )}
              {activeTab === "preview" && lastGeneratedDoc && (
                <DocumentPreview document={lastGeneratedDoc} onClose={() => setActiveTab("writer")} />
              )}
              {activeTab === "actions" && <QuickActions />}
              {activeTab === "history" && <ActionHistory />}
              {activeTab === "workspace" && <WorkspaceSummary />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
