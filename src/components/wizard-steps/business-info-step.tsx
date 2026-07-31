import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Building2, Mail, Globe, FileText, AlertCircle, CheckCircle } from "lucide-react"
import type { WizardData, WizardErrors } from "../../types"
import { cn } from "@/lib/utils"

interface BusinessInfoStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  errors: WizardErrors
  onErrors: (errors: WizardErrors) => void
}

export function BusinessInfoStep({ data, onChange, errors, onErrors }: BusinessInfoStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const newErrors: WizardErrors = {}
    const fields = [
      { key: "businessName" as const, value: data.businessName, label: "Business name", minLen: 2 },
      { key: "websiteName" as const, value: data.websiteName, label: "Website name", minLen: 2 },
    ]

    for (const field of fields) {
      if (touched[field.key] || field.value.length > 0) {
        if (!field.value.trim()) {
          newErrors[field.key] = `${field.label} is required`
        } else if (field.value.trim().length < field.minLen) {
          newErrors[field.key] = `${field.label} must be at least ${field.minLen} characters`
        }
      }
    }

    if (touched.businessEmail && data.businessEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.businessEmail.trim())) {
        newErrors.businessEmail = "Please enter a valid email address"
      }
    }

    onErrors(newErrors)
  }, [data.businessName, data.websiteName, data.businessEmail, touched, onErrors])

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

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
          <Building2 className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Business Information
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Tell us about your business and website
        </motion.p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Business Name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-col gap-1.5"
        >
          <label htmlFor="wiz-business-name" className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
            Business name <span className="text-destructive">*</span>
            {data.businessName.trim().length >= 2 && touched.businessName && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <CheckCircle className="h-3 w-3 text-success" strokeWidth={2} />
              </motion.div>
            )}
          </label>
          <input
            id="wiz-business-name"
            type="text"
            placeholder="e.g. Acme Inc."
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            onBlur={() => handleBlur("businessName")}
            autoFocus
            className={cn(
              "h-10 rounded-xl border bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 transition-all duration-200 w-full",
              errors.businessName ? "border-destructive focus:ring-destructive" :
              data.businessName.trim().length >= 2 && touched.businessName ? "border-success/50 focus:ring-success/30" :
              "border-border focus:ring-ring"
            )}
          />
          {errors.businessName && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-destructive/80 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
              {errors.businessName}
            </motion.p>
          )}
        </motion.div>

        {/* Business Email */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="flex flex-col gap-1.5"
        >
          <label htmlFor="wiz-business-email" className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
            Business email <span className="text-muted-foreground/40 font-normal">(optional)</span>
            {data.businessEmail && !errors.businessEmail && touched.businessEmail && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <CheckCircle className="h-3 w-3 text-success" strokeWidth={2} />
              </motion.div>
            )}
          </label>
          <input
            id="wiz-business-email"
            type="email"
            placeholder="hello@acme.com"
            value={data.businessEmail}
            onChange={(e) => onChange({ businessEmail: e.target.value })}
            onBlur={() => handleBlur("businessEmail")}
            className={cn(
              "h-10 rounded-xl border bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 transition-all duration-200 w-full",
              errors.businessEmail ? "border-destructive focus:ring-destructive" :
              data.businessEmail && !errors.businessEmail && touched.businessEmail ? "border-success/50 focus:ring-success/30" :
              "border-border focus:ring-ring"
            )}
          />
          {errors.businessEmail && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-destructive/80 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
              {errors.businessEmail}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Website Name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col gap-1.5"
      >
        <label htmlFor="wiz-website-name" className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Website name <span className="text-destructive">*</span>
          {data.websiteName.trim().length >= 2 && touched.websiteName && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle className="h-3 w-3 text-success" strokeWidth={2} />
            </motion.div>
          )}
        </label>
        <input
          id="wiz-website-name"
          type="text"
          placeholder="e.g. Acme Website"
          value={data.websiteName}
          onChange={(e) => onChange({ websiteName: e.target.value })}
          onBlur={() => handleBlur("websiteName")}
          className={cn(
            "h-10 rounded-xl border bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 transition-all duration-200 w-full",
            errors.websiteName ? "border-destructive focus:ring-destructive" :
            data.websiteName.trim().length >= 2 && touched.websiteName ? "border-success/50 focus:ring-success/30" :
            "border-border focus:ring-ring"
          )}
        />
        {errors.websiteName && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-destructive/80 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
            {errors.websiteName}
          </motion.p>
        )}
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex flex-col gap-1.5"
      >
        <label htmlFor="wiz-desc" className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Description <span className="text-muted-foreground/40 font-normal">(optional)</span>
        </label>
        <textarea
          id="wiz-desc"
          placeholder="What does your business do? What's the purpose of this website?"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="h-20 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all duration-200"
        />
      </motion.div>
    </div>
  )
}
