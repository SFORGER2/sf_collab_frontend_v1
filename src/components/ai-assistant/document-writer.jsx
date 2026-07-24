import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  FileText, Sparkles, Zap, Type, ListChecks, BookOpen, Globe,
  Save, Tag, AlertCircle, CheckCircle, Loader2, Monitor, FileDown, FileCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import assistantService from "@/services/assistantService"

const DOCUMENT_TYPES = [
  { id: "business_plan", label: "Business Plan", icon: BookOpen, description: "Strategic business plan" },
  { id: "report", label: "Report", icon: FileText, description: "General report or analysis" },
  { id: "spec", label: "Specification", icon: FileCode, description: "Technical specification" },
  { id: "meeting_summary", label: "Meeting Summary", icon: ListChecks, description: "Summarize meeting notes" },
  { id: "pitch_outline", label: "Pitch Outline", icon: Sparkles, description: "Investor pitch deck outline" },
  { id: "roadmap", label: "Roadmap", icon: Globe, description: "Product or project roadmap" },
  { id: "proposal", label: "Proposal", icon: FileDown, description: "Client or project proposal" },
  { id: "custom", label: "Custom", icon: Tag, description: "Any other document type" },
]

const OUTPUT_FORMATS = [
  { id: "markdown", label: "Markdown", icon: FileCode, description: "Rich text format" },
  { id: "docx", label: "DOCX", icon: FileText, description: "Word document" },
  { id: "pdf", label: "PDF", icon: FileDown, description: "Portable document" },
]

export default function DocumentWriter({ onDocumentGenerated, defaultWorkspaceId }) {
  const [topic, setTopic] = useState("")
  const [instructions, setInstructions] = useState("")
  const [documentType, setDocumentType] = useState("report")
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId || "")
  const [outputFormat, setOutputFormat] = useState("markdown")
  const [saveToDrive, setSaveToDrive] = useState(true)
  const [title, setTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [touched, setTouched] = useState({})

  const canGenerate = topic.trim().length >= 3 && !isGenerating

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return
    setIsGenerating(true)
    setError(null)
    setResult(null)
    try {
      const res = await assistantService.writeDocument({
        topic: topic.trim(),
        instructions: instructions.trim() || undefined,
        documentType,
        workspaceId: workspaceId ? Number(workspaceId) : undefined,
        outputFormat,
        saveToDrive,
        title: title.trim() || undefined,
      })
      setResult(res)
      onDocumentGenerated?.(res)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to generate document")
    } finally {
      setIsGenerating(false)
    }
  }, [topic, instructions, documentType, workspaceId, outputFormat, saveToDrive, title, canGenerate, onDocumentGenerated])

  // Result view
  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-success/20 bg-success/5"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.5} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-success">Document generated!</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {saveToDrive ? "Saved to your drive" : "Ready for download"}
            </p>
          </div>
          {result.file_url && (
            <a
              href={result.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/15 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download
            </a>
          )}
        </motion.div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-xs font-medium text-card-foreground">{result.title}</span>
            </div>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">{outputFormat.toUpperCase()}</span>
          </div>
          <div className="p-4 max-h-[320px] overflow-y-auto">
            <pre className="text-xs text-card-foreground/80 leading-relaxed whitespace-pre-wrap font-mono">
              {result.content}
            </pre>
          </div>
        </div>

        {result.sources?.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-xs font-medium text-card-foreground">Sources</span>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {result.sources.map((source, i) => (
                <div key={source.document_id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-secondary/30">
                  <span className="text-[11px] text-card-foreground/80 truncate">{source.title}</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground/50 ml-2 shrink-0">
                    {Math.round(source.score * 100)}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => { setResult(null); setTopic(""); setInstructions(""); setTitle("") }} className="gap-1.5 w-full">
          <FileText className="h-3.5 w-3.5" />
          Generate another document
        </Button>
      </motion.div>
    )
  }

  // Form view
  return (
    <div className="flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3"
        >
          <FileText className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">AI Document Writer</h3>
        <p className="text-xs text-muted-foreground/70">Generate documents powered by AI</p>
      </motion.div>

      {/* Topic */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Topic <span className="text-destructive">*</span>
          {topic.trim().length >= 3 && touched.topic && (
            <CheckCircle className="h-3 w-3 text-success" strokeWidth={2} />
          )}
        </label>
        <Input
          placeholder="e.g. Investor update for Q3"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onBlur={() => handleBlur("topic")}
          autoFocus
        />
        {touched.topic && topic.length > 0 && topic.trim().length < 3 && (
          <p className="text-[11px] text-destructive/80 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Topic must be at least 3 characters
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Instructions <span className="text-muted-foreground/40 font-normal">(optional)</span>
        </label>
        <Textarea
          placeholder="Focus on wallet launch, include revenue projections..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          className="min-h-[60px]"
        />
      </div>

      {/* Document Type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Document type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DOCUMENT_TYPES.map((dt) => {
            const Icon = dt.icon
            const isSelected = documentType === dt.id
            return (
              <button
                key={dt.id}
                onClick={() => setDocumentType(dt.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center group ${
                  isSelected
                    ? "border-brand bg-brand/[0.03] shadow-sm"
                    : "border-border bg-card hover:border-brand/30 hover:bg-card-hover"
                }`}
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isSelected ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand"
                }`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
                <span className={`text-[10px] font-medium leading-tight ${isSelected ? "text-brand" : "text-card-foreground"}`}>
                  {dt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Workspace + Output Format */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
            Workspace ID <span className="text-muted-foreground/40 font-normal">(optional)</span>
          </label>
          <Input
            type="number"
            placeholder="e.g. 12"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
            Output format
          </label>
          <div className="flex gap-2">
            {OUTPUT_FORMATS.map((fmt) => {
              const Icon = fmt.icon
              const isSelected = outputFormat === fmt.id
              return (
                <button
                  key={fmt.id}
                  onClick={() => setOutputFormat(fmt.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isSelected ? "border-brand bg-brand/[0.03]" : "border-border bg-card hover:border-brand/30"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-brand" : "text-muted-foreground/50"}`} strokeWidth={1.5} />
                  <span className={`text-[11px] font-medium ${isSelected ? "text-brand" : "text-card-foreground"}`}>{fmt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Title + Save to Drive */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
            Document title <span className="text-muted-foreground/40 font-normal">(optional)</span>
          </label>
          <Input
            placeholder="Leave empty to auto-generate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5 justify-end">
          <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
            <Save className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
            Save to Drive
          </label>
          <div className="flex gap-2">
            {[
              { id: true, label: "Enabled" },
              { id: false, label: "Disabled" },
            ].map((opt) => {
              const isSelected = saveToDrive === opt.id
              return (
                <button
                  key={String(opt.id)}
                  onClick={() => setSaveToDrive(opt.id)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected ? "border-brand bg-brand/[0.03] text-brand" : "border-border bg-card text-card-foreground hover:border-brand/30"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" strokeWidth={1.5} />
          <p className="text-[11px] text-destructive/80">{error}</p>
        </div>
      )}

      {/* Generate */}
      <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full gap-2">
        {isGenerating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
        ) : (
          <><Zap className="h-4 w-4" /> Generate Document</>
        )}
      </Button>
    </div>
  )
}
