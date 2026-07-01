import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dashboard } from "./components/dashboard"
import { Workspace } from "./components/workspace"
import { ToastProvider } from "./hooks/use-toast"
import { Toaster } from "./components/ui/toaster"

function App() {
  const [workspaceProjectId, setWorkspaceProjectId] = useState<string | null>(null)

  return (
    <ToastProvider>
      <AnimatePresence mode="popLayout">
        {workspaceProjectId ? (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            layout
          >
            <Workspace
              projectId={workspaceProjectId}
              onBack={() => setWorkspaceProjectId(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            layout
          >
            <Dashboard onOpenWorkspace={(id) => setWorkspaceProjectId(id)} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </ToastProvider>
  )
}

export default App
