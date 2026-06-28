import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { scaleFadeIn, getScaleFadeTransition } from "../../lib/animations"

interface FeatureChipInputProps {
  value: string[]
  onChange: (features: string[]) => void
  suggestions?: string[]
  maxFeatures?: number
  placeholder?: string
  label?: string
  description?: string
  disabled?: boolean
}

export function FeatureChipInput({
  value,
  onChange,
  suggestions,
  maxFeatures = 20,
  placeholder = "Add a feature...",
  label,
  description,
  disabled = false,
}: FeatureChipInputProps) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const atLimit = value.length >= maxFeatures

  const availableSuggestions = suggestions
    ? suggestions.filter((s) => !value.includes(s))
    : []

  const addFeature = (feature: string) => {
    const trimmed = feature.trim()
    if (!trimmed || value.includes(trimmed) || atLimit) return
    onChange([...value, trimmed])
  }

  const handleAdd = () => {
    addFeature(input)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeFeature = (feature: string) => {
    onChange(value.filter((f) => f !== feature))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-medium text-card-foreground/70">
          {label}
        </label>
      )}
      {description && (
        <p className="text-[11px] text-muted-foreground/50 -mt-1">{description}</p>
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
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={atLimit ? "Max features reached" : placeholder}
            disabled={disabled || atLimit}
            className="flex-1 h-9 bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          />
          <span className="text-[10px] tabular-nums text-muted-foreground/40 shrink-0">
            {value.length}/{maxFeatures}
          </span>
          <button
            onClick={handleAdd}
            disabled={!input.trim() || atLimit || disabled}
            className="shrink-0 h-6 w-6 rounded-md bg-brand text-brand-foreground flex items-center justify-center disabled:opacity-30 transition-opacity cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Suggestion dropdown */}
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-md max-h-32 overflow-y-auto">
            {availableSuggestions
              .filter((s) =>
                s.toLowerCase().includes(input.toLowerCase())
              )
              .slice(0, 6)
              .map((s) => (
                <button
                  key={s}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addFeature(s)
                    setInput("")
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-card-foreground hover:bg-accent transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                >
                  {s}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Max limit warning */}
      {atLimit && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive/70">
          <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
          Maximum of {maxFeatures} features reached
        </div>
      )}

      {/* Feature chips — animated enter/exit */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        <AnimatePresence mode="popLayout">
          {value.map((feature, index) => (
            <motion.span
              key={feature}
              layout
              {...scaleFadeIn}
              transition={getScaleFadeTransition(index)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand/[0.08] text-[11px] font-medium text-brand group"
            >
              <span className="truncate max-w-[180px]">{feature}</span>
              <button
                onClick={() => removeFeature(feature)}
                disabled={disabled}
                className="cursor-pointer hover:bg-brand/10 rounded-sm p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {value.length === 0 && !atLimit && (
        <p className="text-[11px] text-muted-foreground/40 italic">
          No features selected yet
        </p>
      )}
    </div>
  )
}
