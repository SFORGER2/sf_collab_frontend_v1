import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "../../hooks/use-toast"
import { ToastItem } from "./toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-0 inset-x-0 z-[100] pointer-events-none">
      <div className="flex flex-col items-center gap-2 pt-4 px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <ToastItem toast={toast} onDismiss={removeToast} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
