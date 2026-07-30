import { BrandingConfig } from "../branding-config"
import type { BrandingData } from "../../types"

interface BrandDetailsStepProps {
  data: { branding: BrandingData }
  onChange: (data: { branding: BrandingData }) => void
}

export function BrandDetailsStep({ data, onChange }: BrandDetailsStepProps) {
  return (
    <div className="flex flex-col">
      <BrandingConfig
        data={data.branding}
        onChange={(branding) => onChange({ branding })}
        compact
      />
    </div>
  )
}
