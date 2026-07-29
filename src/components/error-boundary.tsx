import { Component, type ReactNode, type ErrorInfo } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, errorInfo.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-28 gap-5 px-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="h-14 w-14 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 flex items-center justify-center"
          >
            <AlertTriangle className="h-7 w-7 text-destructive/70" strokeWidth={1.3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center max-w-md"
          >
            <h2 className="text-sm font-medium text-card-foreground mb-1">
              Something went wrong
            </h2>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred. Please try again."}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </motion.div>
        </motion.div>
      )
    }

    return this.props.children
  }
}
