import { motion } from "framer-motion"
import { Link } from "lucide-react"
import { UrlInput } from "../ui/url-input"
import type { WizardData } from "../../types"

interface ReferenceUrlsStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export function ReferenceUrlsStep({ data, onChange }: ReferenceUrlsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.05 }}
          className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3"
        >
          <Link className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Reference URLs
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Add URLs of websites you'd like to use as inspiration
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <UrlInput
          value={data.referenceUrls}
          onChange={(urls) => onChange({ referenceUrls: urls })}
          placeholder="e.g. example.com or https://..."
          label="Reference URLs"
          description="Add up to 10 URLs — each gets validated before being added"
          maxUrls={10}
        />
      </motion.div>
    </div>
  )
}
