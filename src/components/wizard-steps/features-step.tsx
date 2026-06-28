import { motion, AnimatePresence } from "framer-motion"
import { Puzzle } from "lucide-react"
import { FeatureChipInput } from "../ui/feature-chip-input"
import { scaleFadeIn, getScaleFadeTransition } from "../../lib/animations"
import type { WizardData } from "../../types"

const ALL_FEATURES = [
  "Hero section with CTA",
  "Features grid",
  "Testimonials carousel",
  "Contact form",
  "SEO optimized",
  "Rich text editor",
  "Categories & tags",
  "Author profiles",
  "RSS feed",
  "Comment system",
  "Product catalog",
  "Shopping cart",
  "Secure checkout",
  "Payment gateway",
  "Order management",
  "Analytics charts",
  "User management",
  "Subscription billing",
  "API keys",
  "Team collaboration",
]

interface FeaturesStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export function FeaturesStep({ data, onChange }: FeaturesStepProps) {
  const selected = data.features

  const toggleFeature = (feature: string) => {
    if (selected.includes(feature)) {
      onChange({ features: selected.filter((f) => f !== feature) })
    } else if (selected.length < 20) {
      onChange({ features: [...selected, feature] })
    }
  }

  const availableFeatures = ALL_FEATURES.filter((f) => !selected.includes(f))

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
          <Puzzle className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Features
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Click to select features or search for specific ones
        </motion.p>
      </motion.div>

      {/* Quick-select feature tags — animated enter/exit */}
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {availableFeatures.map((feature, index) => (
            <motion.div
              key={feature}
              layout
              {...scaleFadeIn}
              transition={getScaleFadeTransition(index)}
            >
              <button
                onClick={() => toggleFeature(feature)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-[11px] font-medium text-muted-foreground/70 transition-all duration-200 cursor-pointer hover:border-foreground/30 hover:text-card-foreground"
              >
                {feature}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Divider with "or search" */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/30 font-medium">
          or search
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <FeatureChipInput
        value={data.features}
        onChange={(features) => onChange({ features })}
        suggestions={ALL_FEATURES}
        maxFeatures={20}
        placeholder="Search or type a feature..."
        label="Search features"
        description="Type to find and add features not listed above"
      />
    </div>
  )
}
