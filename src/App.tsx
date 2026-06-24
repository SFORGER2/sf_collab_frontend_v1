import { Dashboard } from "./components/dashboard"
import { ToastProvider } from "./hooks/use-toast"
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <ToastProvider>
      <Dashboard />
      <Toaster />
    </ToastProvider>
  )
}

export default App
