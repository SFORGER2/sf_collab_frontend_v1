import { motion, AnimatePresence } from "framer-motion"
import { LayoutTemplate, AlertCircle, RefreshCw } from "lucide-react"
import { usePacks } from "../../hooks/use-packs"
import { AppTypeCard } from "../app-type-card"
import { Button } from "../ui/button"
import type { WizardData, WizardErrors, AppPack } from "../../types"

interface AppTypeStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  errors: WizardErrors
  onErrors: (errors: WizardErrors) => void
}

export function AppTypeStep({ data, onChange, errors, onErrors }: AppTypeStepProps) {
  const { packs, isLoading, error, refetch } = usePacks()

  const handleSelect = (pack: AppPack) => {
    onChange({ packId: pack.id })
    onErrors({ ...errors, packId: undefined })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3">
          <LayoutTemplate className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">
          Choose a template
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Select the type of website you want to create
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <AlertCircle className="h-5 w-5 text-destructive/60" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground/70">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-2 gap-3">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
            >
              <AppTypeCard
                pack={pack}
                selected={data.packId === pack.id}
                onSelect={() => handleSelect(pack)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected pack detail */}
      <AnimatePresence mode="wait">
        {data.packId && (() => {
          const selected = packs.find((p) => p.id === data.packId)
          return selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div className="rounded-xl border border-border bg-secondary/50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-5 w-5 rounded-md bg-brand/10 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                  </div>
                  <span className="text-xs font-medium text-card-foreground">
                    {selected.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  {selected.description}
                </p>
              </div>
            </motion.div>
          ) : null
        })()}
      </AnimatePresence>
    </div>
  )
}
