import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText, FileDown, CheckCircle, BookOpen, Copy, Check,
  ExternalLink, Eye, EyeOff, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DocumentPreview({ document: doc, outputFormat = "markdown", onDownload, onClose }) {
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSources, setShowSources] = useState(true)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const handleDownload = () => {
    if (onDownload) { onDownload(); return }
    if (doc.file_url) { window.open(doc.file_url, "_blank"); return }
    const blob = new Blob([doc.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${doc.title || "document"}.${outputFormat === "markdown" ? "md" : outputFormat}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasSources = doc.sources && doc.sources.length > 0

  return (
    <div className="flex flex-col gap-5">
      {/* Success banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-success/20 bg-success/5"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.5} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-success">Document generated</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {doc.drive_file ? "Saved to your drive" : "Ready for download"}
          </p>
        </div>
        <span className="text-[10px] font-medium text-success/70 bg-success/10 px-2 py-0.5 rounded-full tabular-nums">
          {outputFormat.toUpperCase()}
        </span>
      </motion.div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={handleDownload} size="sm" className="gap-1.5">
          <FileDown className="h-3.5 w-3.5" /> Download
        </Button>
        <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5">
          {copied ? <><Check className="h-3.5 w-3.5 text-success" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </Button>
        <Button onClick={() => setShowRaw(!showRaw)} variant="ghost" size="sm" className="gap-1.5">
          {showRaw ? <><EyeOff className="h-3.5 w-3.5" /> Hide raw</> : <><Eye className="h-3.5 w-3.5" /> Show raw</>}
        </Button>
        {doc.file_url && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-secondary transition-all ml-auto"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
        )}
      </div>

      {/* Content preview */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-medium text-card-foreground truncate">{doc.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {showRaw && <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">Raw</span>}
            {doc.document_id && <span className="text-[10px] text-muted-foreground/40 tabular-nums font-mono">#{doc.document_id}</span>}
          </div>
        </div>
        <div className="relative">
          <div className={cn("p-4 overflow-y-auto transition-all duration-300", showRaw ? "max-h-[500px]" : "max-h-[400px]")}>
            {showRaw ? (
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-card-foreground/80">{doc.content}</pre>
            ) : (
              <div className="text-xs leading-relaxed text-card-foreground/80">
                {doc.content?.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) return <h1 key={i} className="text-sm font-heading font-bold text-card-foreground mt-4 mb-2 first:mt-0">{line.replace("# ", "")}</h1>
                  if (line.startsWith("## ")) return <h2 key={i} className="text-xs font-semibold text-card-foreground mt-3 mb-1.5">{line.replace("## ", "")}</h2>
                  if (line.startsWith("### ")) return <h3 key={i} className="text-[11px] font-semibold text-card-foreground mt-2 mb-1">{line.replace("### ", "")}</h3>
                  if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-[11px] text-card-foreground/70 ml-4 list-disc">{line.replace(/^[-*] /, "")}</li>
                  if (line.match(/^\d+\. /)) return <li key={i} className="text-[11px] text-card-foreground/70 ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>
                  if (line.trim() === "") return <div key={i} className="h-2" />
                  return <p key={i} className="text-[11px] text-card-foreground/70 leading-relaxed mb-1">{line}</p>
                })}
              </div>
            )}
          </div>
          {!showRaw && doc.content?.length > 800 && (
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Sources */}
      {hasSources && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button onClick={() => setShowSources(!showSources)} className="w-full flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30 cursor-pointer">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-xs font-medium text-card-foreground">Source references</span>
              <span className="text-[10px] text-muted-foreground/50 tabular-nums bg-secondary/60 px-1.5 py-0.5 rounded">{doc.sources.length}</span>
            </div>
            <svg className={`h-3 w-3 text-muted-foreground/50 transition-transform duration-200 ${showSources ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSources && (
            <div className="p-3 flex flex-col gap-1.5">
              {doc.sources.map((source, i) => (
                <div key={source.document_id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-5 w-5 rounded-md bg-brand/[0.08] flex items-center justify-center shrink-0">
                      <BookOpen className="h-3 w-3 text-brand" strokeWidth={1.5} />
                    </div>
                    <span className="text-[11px] text-card-foreground/80 truncate">{source.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="h-1.5 w-12 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-brand origin-left rounded-full" style={{ transform: `scaleX(${source.score})` }} />
                    </div>
                    <span className="text-[10px] tabular-nums font-medium text-muted-foreground/60 min-w-[3ch] text-right">
                      {Math.round(source.score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/40">
        <Sparkles className="h-3 w-3" strokeWidth={1.5} />
        <span>Generated by AI</span>
        {doc.drive_file && <><span className="text-muted-foreground/20">&middot;</span><span>Saved to drive</span></>}
      </div>

      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose} className="w-full gap-1.5">
          Close preview
        </Button>
      )}
    </div>
  )
}
