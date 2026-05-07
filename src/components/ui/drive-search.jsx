import React, { useState, useMemo } from "react"
import { Search, FileText, Code, Image as ImageIcon, FileArchive, Calendar, Tag, X, SearchX, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

// DriveSearch

const MOCK_FILES = [
  { id: "1", name: "Q3_Roadmap_Draft.pdf", type: "document", size: "2.4 MB", date: "2026-04-25", tags: ["#urgent", "#planning"], summary: "Mentions 'Q3 goals' and 'Architecture Node mapping' on page 3." },
  { id: "2", name: "auth_service.js", type: "code", size: "14 KB", date: "2026-04-28", tags: ["#backend", "#security"], summary: "Contains reference to 'System Intelligence API keys'." },
  { id: "3", name: "Hero_Section_V2.png", type: "image", size: "4.1 MB", date: "2026-04-20", tags: ["#design"], summary: "Image analysis detected text: 'SFCollab Network Overview'." },
  { id: "4", name: "Meeting_Notes_April.docx", type: "document", size: "1.1 MB", date: "2026-04-27", tags: ["#draft"], summary: "Discussion around the new Search UI filters and performance." },
  { id: "5", name: "App.jsx", type: "code", size: "8 KB", date: "2026-04-28", tags: ["#frontend"], summary: "Main routing logic for the new SF Drive components." },
]

const FILE_TYPES = [
  { id: "all", label: "All Files" },
  { id: "document", label: "Documents" },
  { id: "code", label: "Code" },
  { id: "image", label: "Images" },
]

const AVAILABLE_TAGS = ["#urgent", "#planning", "#backend", "#frontend", "#design", "#draft"]

function getFileIcon(type) {
  switch (type) {
    case "document": return <FileText className="h-5 w-5" />
    case "code":     return <Code className="h-5 w-5" />
    case "image":    return <ImageIcon className="h-5 w-5" />
    default:         return <FileArchive className="h-5 w-5" />
  }
}

const DriveSearch = React.forwardRef(({ className, ...props }, ref) => {
  const [query, setQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedTags, setSelectedTags] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function clearFilters() {
    setQuery("")
    setSelectedType("all")
    setSelectedTags([])
  }

  const activeFilterCount = (selectedType !== "all" ? 1 : 0) + selectedTags.length

  const filteredResults = useMemo(() => {
    return MOCK_FILES.filter((file) => {
      const q = query.toLowerCase()
      const matchesText = file.name.toLowerCase().includes(q) || file.summary.toLowerCase().includes(q)
      const matchesType = selectedType === "all" || file.type === selectedType
      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => file.tags.includes(tag))
      return matchesText && matchesType && matchesTags
    })
  }, [query, selectedType, selectedTags])

  return (
    <div
      ref={ref}
      data-slot="drive-search"
      className={cn("w-full max-w-3xl mx-auto space-y-6", className)}
      {...props}
    >
      {/* Search Bar */}
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files by name or content..."
              className="pl-10 pr-10 h-12 text-base border-0 shadow-none focus-visible:ring-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 h-8 w-8 text-muted-foreground"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Dialog */}
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="h-12 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Files</DialogTitle>
                <DialogDescription>Narrow down results by file type and tags.</DialogDescription>
              </DialogHeader>

              {/* File Type */}
              <div className="space-y-3">
                <p className="text-sm font-medium">File Type</p>
                <div className="flex flex-wrap gap-2">
                  {FILE_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type.id)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => { setSelectedType("all"); setSelectedTags([]) }} disabled={activeFilterCount === 0}>
                  Reset
                </Button>
                <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {selectedType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {FILE_TYPES.find((t) => t.id === selectedType)?.label}
              <button onClick={() => setSelectedType("all")} className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => toggleTag(tag)} className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Results</h3>
          <span className="text-xs text-muted-foreground">{filteredResults.length} of {MOCK_FILES.length} files</span>
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 ? (
          <Card className="items-center py-16">
            <SearchX className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">No results found</p>
            <p className="text-xs text-muted-foreground mb-4">Try adjusting your search or filters.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((file) => (
              <Card key={file.id} className="gap-0 py-0 group hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-start gap-4 py-4">
                  {/* Icon */}
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 group-hover:text-primary transition-colors">
                    {getFileIcon(file.type)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-sm font-medium truncate pr-4 group-hover:text-primary transition-colors">{file.name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{file.size}</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{file.summary}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {file.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                        <Calendar className="h-3 w-3" />
                        {file.date}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

DriveSearch.displayName = "DriveSearch"

export { DriveSearch }
export default DriveSearch
