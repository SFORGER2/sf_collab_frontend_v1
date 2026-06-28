import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, ExternalLink, AlertCircle, Link } from "lucide-react"
import { cn } from "../../lib/utils"
import { scaleFadeIn, getScaleFadeTransition } from "../../lib/animations"

const MAX_URLS = 10

function isValidUrl(s: string): boolean {
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`)
    return url.hostname.includes(".")
  } catch {
    return false
  }
}

function normalizeUrl(s: string): string {
  const trimmed = s.trim()
  if (!trimmed) return ""
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
}

interface UrlInputProps {
  value: string[]
  onChange: (urls: string[]) => void
  placeholder?: string
  label?: string
  description?: string
  disabled?: boolean
  maxUrls?: number
}

export function UrlInput({
  value,
  onChange,
  placeholder = "e.g. example.com or https://...",
  label,
  description,
  disabled = false,
  maxUrls = MAX_URLS,
}: UrlInputProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const atLimit = value.length >= maxUrls

  const handleAdd = () => {
    const trimmed = input.trim()
    setError(null)

    if (!trimmed) return

    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid URL")
      return
    }

    const normalized = normalizeUrl(trimmed)

    if (value.includes(normalized)) {
      setError("This URL has already been added")
      return
    }

    onChange([...value, normalized])
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  const removeUrl = (url: string) => {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-medium text-card-foreground/70">
          {label}
        </label>
      )}
      {description && (
        <p className="text-[11px] text-muted-foreground/50 -mt-1">
          {description}
        </p>
      )}

      {/* Input row */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-1 rounded-lg border border-border bg-background px-2 transition-all duration-200",
            "focus-within:ring-1 focus-within:ring-ring focus-within:border-transparent",
            atLimit && "border-destructive/30 bg-destructive/[0.02]"
          )}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={atLimit ? "Max URLs reached" : placeholder}
            disabled={disabled || atLimit}
            className="flex-1 h-9 bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          />
          <span className="text-[10px] tabular-nums text-muted-foreground/40 shrink-0">
            {value.length}/{maxUrls}
          </span>
          <button
            onClick={handleAdd}
            disabled={!input.trim() || atLimit || disabled}
            className="shrink-0 h-6 w-6 rounded-md bg-brand text-brand-foreground flex items-center justify-center disabled:opacity-30 transition-opacity cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive/70">
          <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
          {error}
        </div>
      )}

      {/* Max limit warning */}
      {atLimit && !error && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive/70">
          <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
          Maximum of {maxUrls} URLs reached
        </div>
      )}

      {/* URL list — animated enter/exit */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <AnimatePresence mode="popLayout">
          {value.map((url, index) => (
            <motion.div
              key={url}
              layout
              {...scaleFadeIn}
              transition={getScaleFadeTransition(index)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <Link className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-[11px] text-muted-foreground/70 truncate hover:text-primary transition-colors"
              >
                {url}
              </a>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground/30 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
              <button
                onClick={() => removeUrl(url)}
                disabled={disabled}
                className="shrink-0 cursor-pointer text-muted-foreground/30 hover:text-destructive transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {value.length === 0 && !atLimit && (
        <p className="text-[11px] text-muted-foreground/40 italic">
          No reference URLs added yet
        </p>
      )}
    </div>
  )
}
