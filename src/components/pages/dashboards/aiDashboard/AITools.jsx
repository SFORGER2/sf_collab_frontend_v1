import { Brain, CaptionsIcon, Database, FileSignature, ImageIcon, MessageSquare, PenTool, VideoIcon } from "lucide-react";

export const tools = [
  {
    name: "Business Plan AI",
    description: "Generate structured business plans, pitch logic, and market insights.",
    icon: Brain,
    path: "/business-plan",
    gradient: "from-purple-600 to-indigo-600"
  },
  {
    name: "Multimodal Image AI",
    description: "Create, analyze, and reason over images using multimodal models.",
    icon: ImageIcon,
    path: "/multimodal-images",
    gradient: "from-blue-600 to-cyan-600"
  },
  {
    name: "Startup Logo Generator",
    description: "Generate brand-ready logos aligned with your startup identity.",
    icon: PenTool,
    path: "/logo-generator",
    gradient: "from-pink-600 to-rose-600"
  },
  {
    name: "Data Scraper AI",
    description: "Extract, structure, and analyze data from the web intelligently.",
    icon: Database,
    path: "/data-scraper",
    gradient: "from-emerald-600 to-green-600"
  },
  {
    name: "Qwen AI Chat",
    description: "Advanced conversational AI for reasoning, coding, and research.",
    icon: MessageSquare,
    path: "/qwen-chat",
    gradient: "from-orange-600 to-amber-600"
  },
  {
    name: "Video Generator",
    description: "Create engaging videos from text, images, and audio automatically.",
    icon: VideoIcon,
    path: "/video-generator",
    gradient: "from-red-600 to-pink-600"
  },
  {
    name: "Caption Generator",
    description: "Generate compelling captions and descriptions for your content.",
    icon: CaptionsIcon,
    path: "/caption-generator",
    gradient: "from-yellow-600 to-orange-600"
  },
  {
    name: "Landing Page Generator",
    description: "Generate responsive and engaging landing pages tailored to your startup.",
    icon: FileSignature,
    path: "/landing-page-generator",
    gradient: "from-slate-600 to-gray-600",
    available: false
  },

];