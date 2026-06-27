import { useState } from "react"
import { Link, Plus, X, ExternalLink } from "lucide-react"
import type { WizardData } from "../../types"

interface ReferenceUrlsStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export function ReferenceUrlsStep({ data, onChange }: ReferenceUrlsStepProps) {
  const [input, setInput] = useState("")

  const isValidUrl = (s: string) => {
    try {
      new URL(s.startsWith("http") ? s : `https://${s}`)
      return s.includes(".")
    } catch {
      return false
    }
  }

  const addUrl = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    if (!data.referenceUrls.includes(normalized) && isValidUrl(trimmed)) {
      onChange({ referenceUrls: [...data.referenceUrls, normalized] })
    }
    setInput("")
  }

  const removeUrl = (url: string) => {
    onChange({ referenceUrls: data.referenceUrls.filter((u) => u !== url) })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3">
          <Link className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">
          Reference URLs
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Add URLs of websites you'd like to use as inspiration
        </p>
      </div>

      {/* URL input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="e.g. example.com or https://..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={addUrl}
          disabled={!input.trim()}
          className="shrink-0 h-9 w-9 rounded-xl bg-brand text-brand-foreground flex items-center justify-center disabled:opacity-40 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* URL list */}
      {data.referenceUrls.length > 0 ? (
        <div className="flex flex-col gap-2">
          {data.referenceUrls.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-xs text-muted-foreground/80 truncate hover:text-primary transition-colors"
              >
                {url}
              </a>
              <button
                onClick={() => removeUrl(url)}
                className="shrink-0 cursor-pointer text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            No reference URLs added yet
          </p>
        </div>
      )}
    </div>
  )
}
