import { useState, useEffect, useCallback } from "react"
import type { AppPack } from "../types"

const MOCK_PACKS: AppPack[] = [
  {
    id: "landing",
    name: "Landing Site",
    description:
      "A sleek, high-conversion landing page to showcase your product, brand, or campaign with a clean, focused design.",
    icon: "Globe",
    features: [
      "Hero section with CTA",
      "Features grid",
      "Testimonials carousel",
      "Contact form",
      "SEO optimized",
    ],
  },
  {
    id: "blog",
    name: "Blog",
    description:
      "A fully-featured blog with rich text editing, categories, tags, and social sharing to grow your audience.",
    icon: "FileText",
    features: [
      "Rich text editor",
      "Categories & tags",
      "Author profiles",
      "RSS feed",
      "Comment system",
    ],
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    description:
      "A complete online store with product listings, cart, checkout, and payment integration to sell your products.",
    icon: "ShoppingCart",
    features: [
      "Product catalog",
      "Shopping cart",
      "Secure checkout",
      "Payment gateway",
      "Order management",
    ],
  },
  {
    id: "saas",
    name: "SaaS Dashboard",
    description:
      "A modern SaaS dashboard with analytics, user management, and subscription billing for your web application.",
    icon: "LayoutDashboard",
    features: [
      "Analytics charts",
      "User management",
      "Subscription billing",
      "API keys",
      "Team collaboration",
    ],
  },
]

interface UsePacksReturn {
  packs: AppPack[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePacks(): UsePacksReturn {
  const [packs, setPacks] = useState<AppPack[]>(MOCK_PACKS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPacks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/packs")

      if (!response.ok) {
        throw new Error(`Failed to fetch packs: ${response.statusText}`)
      }

      const data: AppPack[] = await response.json()
      setPacks(data)
    } catch {
      // API not available — use mock data for development
      setPacks(MOCK_PACKS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  return { packs, isLoading, error, refetch: fetchPacks }
}
