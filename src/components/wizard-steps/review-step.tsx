import { motion } from "framer-motion"
import {
  Building2,
  Briefcase,
  Palette,
  Monitor,
  Moon,
  Sun,
  LayoutDashboard,
  FileText,
  Link,
  Puzzle,
} from "lucide-react"
import type { WizardData, DesignTheme } from "../../types"
import { DESIGN_THEMES, INDUSTRIES, TEMPLATES } from "../../types"

interface ReviewStepProps {
  data: WizardData
  onEditStep: (stepIndex: number) => void
}

function getIndustryLabel(id: string): string {
  return INDUSTRIES.find((i) => i.id === id)?.label ?? id
}

function getTemplateName(id: string): string {
  return TEMPLATES.find((t) => t.id === id)?.name ?? id
}

function getThemeName(id: string): string {
  return DESIGN_THEMES.find((t) => t.id === id)?.name ?? id
}

function getTheme(themeId: string): DesignTheme | undefined {
  return DESIGN_THEMES.find((t) => t.id === themeId)
}

interface SectionProps {
  title: string
  stepIndex: number
  icon: React.ReactNode
  onEdit?: (stepIndex: number) => void
  children: React.ReactNode
}

function Section({ title, stepIndex, icon, onEdit, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/50">{icon}</span>
          <span className="text-xs font-medium text-card-foreground">{title}</span>
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(stepIndex)}
            className="text-[10px] font-medium text-brand hover:text-brand/80 transition-colors cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </motion.div>
  )
}

interface RowProps {
  label: string
  value: string | React.ReactNode
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-muted-foreground/60">{label}</span>
      <span className="text-[11px] font-medium text-card-foreground text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  )
}

export function ReviewStep({ data, onEditStep }: ReviewStepProps) {
  const theme = getTheme(data.designTheme)

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
          <FileText className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Review your website
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Verify everything looks correct before generating
        </motion.p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {/* Business Info */}
        <Section title="Business Information" stepIndex={0} icon={<Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />} onEdit={onEditStep}>
          <Row label="Business name" value={data.businessName} />
          {data.businessEmail && <Row label="Email" value={data.businessEmail} />}
          <Row label="Website name" value={data.websiteName} />
          {data.description && (
            <div className="flex items-start justify-between py-1">
              <span className="text-[11px] text-muted-foreground/60 shrink-0 mr-3">Description</span>
              <span className="text-[11px] text-muted-foreground/80 text-right">{data.description}</span>
            </div>
          )}
        </Section>

        {/* Template */}
        <Section title="Template" stepIndex={1} icon={<LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.5} />} onEdit={onEditStep}>
          <Row label="Selected template" value={getTemplateName(data.template)} />
        </Section>

        {/* Industry */}
        <Section title="Industry" stepIndex={2} icon={<Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />} onEdit={onEditStep}>
          <Row label="Selected industry" value={getIndustryLabel(data.industry)} />
        </Section>

        {/* Brand Details */}
        <Section title="Brand Details" stepIndex={3} icon={<Palette className="h-3.5 w-3.5" strokeWidth={1.5} />} onEdit={onEditStep}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 rounded-md" style={{ backgroundColor: data.branding.primaryColor }} />
            <div className="h-5 w-5 rounded-md" style={{ backgroundColor: data.branding.accentColor }} />
            <span className="text-[11px] text-muted-foreground/60 ml-1">Primary & Accent colors</span>
          </div>
          <Row label="Font" value={data.branding.font} />
          {data.branding.tagline && <Row label="Tagline" value={data.branding.tagline} />}
          {data.branding.logoUrl && (
            <Row
              label="Logo URL"
              value={
                <a
                  href={data.branding.logoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {data.branding.logoUrl.length > 30
                    ? data.branding.logoUrl.slice(0, 30) + "..."
                    : data.branding.logoUrl}
                </a>
              }
            />
          )}
        </Section>

        {/* Design Preferences */}
        <Section title="Design Preferences" stepIndex={4} icon={<Monitor className="h-3.5 w-3.5" strokeWidth={1.5} />} onEdit={onEditStep}>
          <div className="flex items-center gap-2 mb-2">
            {theme && (
              <div className="flex gap-1 h-4 rounded overflow-hidden">
                <div className="w-4" style={{ backgroundColor: theme.primaryColor }} />
                <div className="w-4" style={{ backgroundColor: theme.accentColor }} />
              </div>
            )}
            <span className="text-[11px] font-medium">{getThemeName(data.designTheme)}</span>
          </div>
          <Row label="Button style" value={data.buttonStyle === "slightly-rounded" ? "Soft" : data.buttonStyle.charAt(0).toUpperCase() + data.buttonStyle.slice(1)} />
          <Row label="Border radius" value={data.borderRadius.charAt(0).toUpperCase() + data.borderRadius.slice(1)} />
          <Row label="Layout" value={data.layout === "full-width" ? "Full Width" : "Boxed"} />
          <Row label="Color mode"
            value={
              <span className="inline-flex items-center gap-1">
                {data.darkMode ? (
                  <Moon className="h-3 w-3" strokeWidth={1.5} />
                ) : (
                  <Sun className="h-3 w-3" strokeWidth={1.5} />
                )}
                {data.darkMode ? "Dark Mode" : "Light Mode"}
              </span>
            }
          />
        </Section>

        {/* Features */}
        {data.features.length > 0 && (
          <Section title="Features" stepIndex={5} icon={<Puzzle className="h-3.5 w-3.5" strokeWidth={1.5} />}>
            <div className="flex flex-wrap gap-1.5">
              {data.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex px-2 py-0.5 rounded-md bg-brand/[0.08] text-[10px] font-medium text-brand"
                >
                  {f}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Reference URLs */}
        {data.referenceUrls.length > 0 && (
          <Section title="Reference URLs" stepIndex={6} icon={<Link className="h-3.5 w-3.5" strokeWidth={1.5} />}>
            <div className="flex flex-col gap-1">
              {data.referenceUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted-foreground/70 hover:text-brand truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
