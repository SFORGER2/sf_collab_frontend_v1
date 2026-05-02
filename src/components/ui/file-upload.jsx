import React, { useState, useRef, useCallback, useEffect } from "react"
import { CloudUpload, X, FileText, CheckCircle2, AlertCircle, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// FileUpload

function fakeUpload(onProgress) {
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        onProgress(100)
        Math.random() < 0.05 ? reject(new Error("Upload failed")) : resolve()
      } else {
        onProgress(Math.round(progress))
      }
    }, 180)
  })
}

function formatSize(bytes) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

let _id = 0
function makeFile(raw) {
  return {
    id: ++_id,
    raw,
    name: raw.name,
    size: raw.size,
    status: "pending",
    progress: 0,
    preview: raw.type.startsWith("image/") ? URL.createObjectURL(raw) : null,
  }
}

const FileUpload = React.forwardRef(
  ({ className, onUploadComplete, maxFiles, accept, ...props }, ref) => {
    const [files, setFiles] = useState([])
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)

    const inputRef = useRef(null)
    const dragCounter = useRef(0)

    // Cleanup previews on unmount
    useEffect(() => {
      return () => files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
    }, [files])

    const addFiles = useCallback((fileList) => {
      setFiles((prev) => [...prev, ...Array.from(fileList).map(makeFile)])
    }, [])

    const removeFile = useCallback((id) => {
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id)
        if (target?.preview) URL.revokeObjectURL(target.preview)
        return prev.filter((f) => f.id !== id)
      })
    }, [])

    const clearAll = useCallback(() => {
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
      setFiles([])
    }, [files])

    const handleDragEnter = useCallback((e) => {
      e.preventDefault()
      dragCounter.current++
      setDragging(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
      e.preventDefault()
      dragCounter.current--
      if (dragCounter.current === 0) setDragging(false)
    }, [])

    const handleDrop = useCallback((e) => {
      e.preventDefault()
      dragCounter.current = 0
      setDragging(false)
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
    }, [addFiles])

    const handleDragOver = useCallback((e) => e.preventDefault(), [])

    async function handleUpload() {
      const pending = files.filter((f) => f.status === "pending")
      if (!pending.length) return

      setUploading(true)

      for (const file of pending) {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f))
        )
        try {
          await fakeUpload((progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
            )
          })
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "done", progress: 100 } : f
            )
          )
        } catch {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "error", progress: 0 } : f
            )
          )
        }
      }

      setUploading(false)
      onUploadComplete?.()
    }

    const pendingCount = files.filter((f) => f.status === "pending").length

    return (
      <div
        ref={ref}
        data-slot="file-upload"
        className={cn("w-full max-w-2xl mx-auto space-y-6", className)}
        {...props}
      >
        {/* Drop Zone */}
        <Card
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center py-16 px-6 cursor-pointer border-dashed border-2 transition-all",
            dragging ? "border-primary bg-secondary/50" : "hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files)
              e.target.value = ""
            }}
          />

          <div className={cn("p-4 mb-4 rounded-full", dragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
            <CloudUpload className="h-8 w-8" />
          </div>

          <p className="text-sm font-medium">Click to browse or drag & drop</p>
          <p className="text-xs text-muted-foreground mt-1">Any file type supported</p>
        </Card>

        {/* Upload Queue */}
        {files.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-sm">Upload Queue ({files.length})</CardTitle>
              {!uploading && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-8">
                  Clear All
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* File List */}
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card shadow-sm">
                    {/* Preview */}
                    <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                      {file.preview
                        ? <img src={file.preview} alt="" className="h-full w-full object-cover" />
                        : <FileText className="h-5 w-5 text-muted-foreground" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium truncate pr-4">{file.name}</p>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                          {file.status === "uploading" && <Badge variant="secondary">{file.progress}%</Badge>}
                          {file.status === "done" && <Badge variant="default">Done</Badge>}
                          {file.status === "error" && <Badge variant="destructive">Error</Badge>}
                        </div>
                      </div>

                      {(file.status === "pending" || file.status === "uploading") && (
                        <Progress value={file.progress} className="h-1.5" />
                      )}
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                      disabled={file.status === "uploading"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Upload Action */}
              {pendingCount > 0 && (
                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : `Upload ${pendingCount} files`}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }
