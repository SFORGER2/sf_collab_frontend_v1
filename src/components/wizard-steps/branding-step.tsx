import { BrandingConfig } from "../branding-config"
import type { BrandingData } from "../../types"

interface BrandingStepProps {
  data: { branding: BrandingData }
  onChange: (data: { branding: BrandingData }) => void
}

export function BrandingStep({ data, onChange }: BrandingStepProps) {
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
