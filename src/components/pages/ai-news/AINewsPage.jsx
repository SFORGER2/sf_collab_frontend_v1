/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Newspaper, Search, X, Clock, Calendar, Tag,
  TrendingUp, ChevronRight, ExternalLink, Mail,
  BookOpen, Zap, Globe, Brain, DollarSign, Scale,
  ArrowUpRight, Flame, Bell, Share2, ChevronDown, Filter,
  AlertTriangle, RotateCw, CheckCircle2, RefreshCw, ChevronLeft
} from "lucide-react";
import { aiNewsAPI } from "../../../utils/APIs/aiNewsAPI";
import ArticleCard from "./components/ArticleCard";
import NewsSkeleton from "./components/NewsSkeleton";
import ShinyText from "../../ui/ShinyText";

// Mock Data

const CATEGORIES = [
  { id: "all", label: "All", icon: <Globe size={14} /> },
  { id: "research", label: "Research", icon: <Brain size={14} /> },
  { id: "product", label: "Product Launches", icon: <Zap size={14} /> },
  { id: "industry", label: "Industry", icon: <TrendingUp size={14} /> },
  { id: "ethics", label: "Ethics & Safety", icon: <Scale size={14} /> },
  { id: "funding", label: "Funding", icon: <DollarSign size={14} /> },
];

const NEWS_ARTICLES = [
  {
    id: 1,
    category: "research",
    categoryLabel: "Research",
    title: "DeepMind's AlphaFold 3 Predicts Protein Interactions with Near-Perfect Accuracy",
    summary: "The latest iteration of AlphaFold extends its capabilities beyond single proteins to model complex biomolecular interactions, opening new frontiers in drug discovery and disease treatment.",
    content: `DeepMind's latest breakthrough with AlphaFold 3 represents a quantum leap in structural biology. Unlike its predecessor, which focused on predicting individual protein structures, AlphaFold 3 can model the intricate dance between proteins, DNA, RNA, and small molecules — the very interactions that govern cellular processes.\n\nThe model was trained on a staggering dataset of over 200,000 protein complexes derived from the Protein Data Bank and other structural databases. Using a novel diffusion-based architecture inspired by image generation models, it achieves accuracy that surpasses experimental methods in many benchmarks.\n\nFor startups in biotech, this means the cost of target identification in drug discovery could drop by orders of magnitude. What previously required years of X-ray crystallography experiments can now be simulated in hours. Pharmaceutical giants like Eli Lilly and Novartis have already announced partnerships to integrate AlphaFold 3 into their discovery pipelines.`,
    date: "Jun 27, 2026",
    readTime: "5 min read",
    featured: true,
    tags: ["DeepMind", "AlphaFold", "Biotech", "Drug Discovery"],
    source: "DeepMind",
    sourceId: "deepmind",
    impact: 95,
  },
  {
    id: 2,
    category: "product",
    categoryLabel: "Product Launch",
    title: "Anthropic Releases Claude 4 with Persistent Memory and 1M Token Context",
    summary: "Anthropic's newest model features true persistent memory across sessions and a one-million token context window, fundamentally changing how developers build long-horizon AI applications.",
    content: `Anthropic has officially launched Claude 4, and the AI community is reacting with equal parts excitement and caution. The headline features — persistent cross-session memory and a one-million token context window — address two of the biggest pain points developers have faced with large language models.\n\nPersistent memory means Claude 4 can remember previous conversations, user preferences, and project context without developers having to re-inject this information at the start of every session. This is implemented through a secure, encrypted memory store that users can inspect and edit.\n\nThe 1M token context window translates to roughly 750,000 words — enough to hold an entire codebase, book, or multi-month conversation history. Combined with Constitutional AI training, Anthropic claims Claude 4 hallucinates 40% less than its predecessor on factual recall tasks.`,
    date: "Jun 26, 2026",
    readTime: "4 min read",
    featured: false,
    tags: ["Anthropic", "Claude", "LLM", "Memory"],
    source: "Anthropic",
    sourceId: "anthropic",
    impact: 90,
  },
  {
    id: 3,
    category: "funding",
    categoryLabel: "Funding",
    title: "AI Infrastructure Startup Groq Raises $1.5B at $15B Valuation",
    summary: "Groq's LPU architecture is attracting massive venture capital as demand for low-latency AI inference continues to outpace GPU supply from Nvidia and AMD.",
    content: `Groq has closed a $1.5 billion Series D round led by BlackRock and joined by Cisco Investments and T. Rowe Price, valuing the chip startup at $15 billion. The round comes amid surging demand for alternatives to Nvidia's H100 and H200 GPUs, which remain heavily backlogged.\n\nGroq's Language Processing Unit (LPU) architecture is purpose-built for inference — running already-trained models rather than training them. This focus allows the LPU to deliver dramatically lower latency than GPU-based solutions. Groq claims tokens-per-second throughput up to 18x faster than competing solutions.\n\nThe fresh capital will fund mass production of the GroqChip 2, expand data center capacity across North America and Europe, and accelerate hiring across silicon engineering and go-to-market teams.`,
    date: "Jun 25, 2026",
    readTime: "3 min read",
    featured: false,
    tags: ["Groq", "Chips", "Funding", "Inference"],
    source: "Groq",
    sourceId: "groq",
    impact: 85,
  },
  {
    id: 4,
    category: "ethics",
    categoryLabel: "Ethics & Safety",
    title: "EU AI Act Enforcement Begins: What Founders Need to Know Right Now",
    summary: "With the EU AI Act entering its enforcement phase, startups using high-risk AI systems face real compliance obligations. Here's a practical breakdown for founders.",
    content: `The EU AI Act is no longer theoretical — enforcement mechanisms are now active, and regulators across member states have begun issuing compliance guidance. For founders building products in or selling into the European market, understanding your obligations is now business-critical.\n\nHigh-risk AI systems — broadly defined as those used in hiring, credit scoring, medical diagnosis, biometric identification, and critical infrastructure — must undergo conformity assessments before market deployment. This involves detailed documentation of training data, model architecture, performance metrics, and human oversight mechanisms.\n\nGeneral-purpose AI models with systemic risk (those trained on more than 10^25 FLOPs) face additional obligations, including adversarial testing and transparency reports. Fines for non-compliance can reach €35 million or 7% of global annual turnover — whichever is higher.`,
    date: "Jun 24, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["EU AI Act", "Regulation", "Compliance", "Founders"],
    source: "EU AI Act",
    sourceId: "eu-ai-act",
    impact: 75,
  },
  {
    id: 5,
    category: "industry",
    categoryLabel: "Industry",
    title: "OpenAI Surpasses 300 Million Weekly Active Users, Plans Enterprise Expansion",
    summary: "OpenAI's user milestone underscores ChatGPT's dominance, while the company announces a major push into enterprise with vertical-specific solutions for healthcare, legal, and finance.",
    content: `OpenAI CEO Sam Altman announced that ChatGPT and the broader OpenAI API ecosystem now serve over 300 million weekly active users — a remarkable growth trajectory from the 100 million milestone reached in early 2023. The figure includes both consumer ChatGPT users and enterprise API customers.\n\nThe more strategically significant announcement is OpenAI's enterprise expansion roadmap. The company is building vertical-specific products for healthcare (documentation, clinical decision support), legal (contract analysis, due diligence), and financial services (earnings analysis, regulatory reporting). Each vertical product will include HIPAA and SOC 2 compliance out of the box.\n\nFor the startup ecosystem, this signals that OpenAI is moving up the stack from infrastructure provider to application competitor — a shift that will force many AI-native startups to differentiate more aggressively on domain expertise, data moats, and workflow integration.`,
    date: "Jun 23, 2026",
    readTime: "4 min read",
    featured: false,
    tags: ["OpenAI", "ChatGPT", "Enterprise", "Growth"],
    source: "OpenAI",
    sourceId: "openai",
    impact: 80,
  },
  {
    id: 6,
    category: "research",
    categoryLabel: "Research",
    title: "MIT CSAIL Publishes Breakthrough in AI Reasoning: Self-Correcting Chains",
    summary: "", // Testing empty summary fallback
    content: `Researchers at MIT CSAIL have published a paper introducing Recursive Introspective Chains (RIC), a training-time technique that enables language models to flag and self-correct logical inconsistencies during the generation process — without requiring external verifiers or human feedback.\n\nThe key insight is a secondary "critic" pathway trained simultaneously with the main generation pathway. During inference, this critic evaluates the coherence of each reasoning step against the problem statement and prior steps. When it detects a contradiction or logical gap, it triggers a controlled backtrack and re-generation.\n\nOn the MATH benchmark — a suite of competition-level mathematics problems — models trained with RIC achieved 89.3% accuracy, compared to 73.1% for chain-of-thought baselines. The improvements are even more pronounced on multi-step logical reasoning tasks, where standard models frequently accumulate small errors into large final mistakes.`,
    date: "", // Testing missing date / scraped_at fallback
    scraped_at: "2026-06-22T10:00:00Z",
    readTime: "7 min read",
    featured: false,
    tags: ["MIT", "Reasoning", "Research", "LLM"],
    author: "", // Testing missing author fallback
    source: "MIT CSAIL",
    sourceId: "mit-csail",
    impact: 88,
  },
];

const TRENDING_TOPICS = [
  { tag: "#AlphaFold3", count: "12.4K posts" },
  { tag: "#EUAIAct", count: "9.8K posts" },
  { tag: "#Claude4", count: "8.1K posts" },
  { tag: "#GroqChip", count: "5.3K posts" },
  { tag: "#OpenAIEnterprise", count: "4.7K posts" },
];

const SORT_OPTIONS = [
  { id: "latest", name: "Latest" },
  { id: "oldest", name: "Oldest" },
  { id: "impact", name: "Impact" },
];

const ARTICLES_PER_PAGE = 4;

// Sub-components

const CategoryBadge = React.memo(({ label }) => {
  const colorMap = {
    research: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    product: "bg-blue-500/20   text-blue-300   border-blue-500/30",
    industry: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ethics: "bg-amber-500/20  text-amber-300  border-amber-500/30",
    funding: "bg-pink-500/20   text-pink-300   border-pink-500/30",
    all: "bg-zinc-500/20   text-zinc-300   border-zinc-500/30",
  };
  const key = Object.keys(colorMap).find(k => label?.toLowerCase()?.includes(k)) || "all";
  return (
    <span className={`text-[10px] font-roboto font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorMap[key]}`}>
      {label}
    </span>
  );
});

// News Ticker

const NewsTicker = React.memo(({ articles, onRead }) => {
  if (!articles || articles.length === 0) return null;
  // Duplicate list to achieve continuous infinite scroll loop
  const tickerArticles = [...articles, ...articles, ...articles];

  return (
    <div className="w-full bg-zinc-900/95 border-b border-zinc-800/80 overflow-hidden py-2.5 text-xs font-mono text-zinc-300 select-none backdrop-blur-md sticky top-0 z-30 flex items-center relative">
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-zinc-900 text-zinc-100 text-[10px] font-bold tracking-wider flex items-center gap-2 z-10 border-r border-zinc-800 select-none" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="uppercase font-mono tracking-widest">News</span>
      </div>
      <div className="relative w-full flex overflow-hidden pl-24" aria-label="AI news ticker" role="marquee">
        <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
          {tickerArticles.map((article, i) => {
            const cat = article.categoryLabel || article.category || "News";
            return (
              <span
                key={`${article.id}-${i}`}
                role="button"
                tabIndex={0}
                aria-label={`Read article: ${article.title}`}
                onClick={() => onRead(article)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRead(article); } }}
                className="hover:text-white cursor-pointer transition-colors duration-150 inline-flex items-center gap-3 py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
              >
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-sans">
                  {cat}
                </span>
                <span className="text-zinc-200 hover:text-white font-medium">{article.title}</span>
                <span className="text-zinc-700 select-none" aria-hidden="true">⚡</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// Skeletons

const NewsCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 flex flex-col justify-between h-[380px] animate-pulse">
    <div>
      <div className="h-36 w-full bg-zinc-800/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-800/60 rounded-md w-5/6" />
        <div className="h-4 bg-zinc-800/60 rounded-md w-2/3" />
        <div className="pt-2 space-y-2">
          <div className="h-3 bg-zinc-800/40 rounded-md w-full" />
          <div className="h-3 bg-zinc-800/40 rounded-md w-full" />
          <div className="h-3 bg-zinc-800/40 rounded-md w-4/5" />
        </div>
      </div>
    </div>
    <div className="p-4 pt-0">
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="h-3 bg-zinc-800/40 rounded-md w-1/3" />
        <div className="h-3 bg-zinc-800/40 rounded-md w-1/4" />
      </div>
    </div>
  </div>
);

const FeaturedCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 flex flex-col md:flex-row h-auto md:h-64 animate-pulse mb-8">
    <div className="w-full md:w-2/5 h-48 md:h-full bg-zinc-800/50" />
    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="h-5 bg-zinc-800/60 rounded-md w-1/4" />
        <div className="space-y-2">
          <div className="h-6 bg-zinc-800/60 rounded-md w-11/12" />
          <div className="h-6 bg-zinc-800/60 rounded-md w-3/4" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3.5 bg-zinc-800/40 rounded-md w-full" />
          <div className="h-3.5 bg-zinc-800/40 rounded-md w-5/6" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="h-4 bg-zinc-800/40 rounded-md w-1/3" />
        <div className="h-4 bg-zinc-800/40 rounded-md w-1/6" />
      </div>
    </div>
  </div>
);

// Featured Article 

const FeaturedCard = React.memo(({ article, onRead }) => {
  const shouldReduceMotion = useReducedMotion();
  const authorName = article.author || article.source || article.sourceId || "AI News Desk";
  const summaryText = article.summary || "No summary available";
  const formattedDate = useMemo(() => {
    const rawDate = article.published_at || article.scraped_at || article.date;
    if (!rawDate) return "Unknown Date";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return rawDate;
    }
  }, [article.published_at, article.scraped_at, article.date]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
      role="button"
      tabIndex={0}
      aria-label={`Featured article: ${article.title}`}
      onClick={() => onRead(article)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRead(article); } }}
      className="relative overflow-hidden rounded-xl border border-white/10 cursor-pointer group flex flex-col md:flex-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 transition-all duration-300"
      style={{ background: "linear-gradient(135deg, #0d1a36 0%, #0a0a0a 60%, #1a0d2e 100%)" }}
    >
      {/* Article Image Container */}
      <div className="w-full md:w-2/5 h-48 md:h-auto overflow-hidden relative min-h-[180px] bg-zinc-950 shrink-0">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 motion-safe-transition opacity-0"
            onLoad={(e) => e.currentTarget.classList.replace('opacity-0', 'opacity-100')}
            style={{ transition: 'opacity 0.3s ease, transform 0.3s ease' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900/40 via-zinc-900 to-violet-900/40 flex items-center justify-center relative" aria-hidden="true">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <Newspaper className="text-zinc-700 w-12 h-12" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="relative p-6 pb-6 md:p-8 flex-1 flex flex-col justify-between">
        <div className="absolute top-0 left-1/4 w-80 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
              <Flame size={11} aria-hidden="true" /> Featured
            </span>
            <CategoryBadge label={article.categoryLabel || article.category} />
          </div>

          <h2 className="font-editorial text-lg md:text-3xl font-bold text-white leading-[1.15] mb-3 max-w-3xl group-hover:text-blue-300 transition-colors duration-300">
            {article.title}
          </h2>

          <p className="font-roboto text-zinc-400 text-xs md:text-sm leading-relaxed max-w-2xl mb-4 line-clamp-3">
            {summaryText}
          </p>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5 font-roboto">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><Calendar size={12} aria-hidden="true" />{formattedDate}</span>
            {article.readTime && <span className="flex items-center gap-1.5"><Clock size={12} aria-hidden="true" />{article.readTime}</span>}
            <span className="font-semibold text-zinc-400">By {authorName}</span>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold text-blue-400 group-hover:text-white transition-colors" aria-hidden="true">
            Read Full Article
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform motion-safe-transition" />
          </span>
        </div>
      </div>
    </motion.div>
  );
});

// News Card

const NewsCard = React.memo(({ article, index, onRead }) => {
  const shouldReduceMotion = useReducedMotion();
  const authorName = article.author || article.source || article.sourceId || "AI News Desk";
  const summaryText = article.summary || "No summary available";
  const formattedDate = useMemo(() => {
    const rawDate = article.published_at || article.scraped_at || article.date;
    if (!rawDate) return "Unknown Date";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return rawDate;
    }
  }, [article.published_at, article.scraped_at, article.date]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      role="button"
      tabIndex={0}
      aria-label={article.title}
      onClick={() => onRead(article)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRead(article); } }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-white/15 cursor-pointer group flex flex-col justify-between min-h-[380px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <div>
        <div className="h-36 w-full overflow-hidden relative bg-zinc-950">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-safe-transition opacity-0"
              onLoad={(e) => e.currentTarget.classList.replace('opacity-0', 'opacity-100')}
              style={{ transition: 'opacity 0.3s ease, transform 0.3s ease' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900/40 via-zinc-900 to-violet-900/40 flex items-center justify-center relative" aria-hidden="true">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <Newspaper className="text-zinc-700 w-8 h-8" aria-hidden="true" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <CategoryBadge label={article.categoryLabel || article.category} />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-editorial text-white text-base font-semibold leading-[1.15] mb-2 group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>
          <p className="font-roboto text-zinc-400 text-xs leading-relaxed line-clamp-3 mb-2">
            {summaryText}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2 font-roboto">
            {article.tags && article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] text-zinc-500 bg-zinc-800/80 rounded px-2 py-0.5">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-3 border-t border-white/5 font-roboto">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Calendar size={9} aria-hidden="true" />{formattedDate}</span>
            {article.readTime && <span className="flex items-center gap-1"><Clock size={9} aria-hidden="true" />{article.readTime}</span>}
          </div>
          <span className="font-semibold text-zinc-400 truncate max-w-[100px]">By {authorName}</span>
        </div>
      </div>
    </motion.div>
  );
});

// Article Detail Drawer

const ArticleDrawer = ({ article, loading, error, onClose, closeButtonRef }) => {
  const drawerRef = useRef(null);
  const authorName = article?.author || article?.source || article?.sourceId || "AI News Desk";
  const summaryText = article?.summary || "No summary available";
  const formattedDate = useMemo(() => {
    if (!article) return "";
    const rawDate = article.published_at || article.scraped_at || article.date;
    if (!rawDate) return "Unknown Date";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return rawDate;
    }
  }, [article]);

  useEffect(() => {
    if ((article || error) && closeButtonRef?.current) {
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [article, error, closeButtonRef]);

  useEffect(() => {
    if (!article && !error) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(drawer.querySelectorAll(focusableSelectors)).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleKeyDown);
    return () => drawer.removeEventListener('keydown', handleKeyDown);
  }, [article, error, onClose]);

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950";

  return (
    <AnimatePresence>
      {(article || error) && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            ref={drawerRef}
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label={article ? `Article: ${article.title}` : "Article details"}
            className="fixed right-0 top-0 h-full w-full sm:max-w-lg bg-zinc-950 border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between px-4 sm:px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-white/8 z-10">
              <CategoryBadge label={article?.categoryLabel || article?.category || "Detail"} />
              <div className="flex items-center gap-2">
                <button aria-label="Share article" className={`p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer ${focusRing}`}>
                  <Share2 size={15} aria-hidden="true" />
                </button>
                <button aria-label="Open source link" className={`p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer ${focusRing}`}>
                  <ExternalLink size={15} aria-hidden="true" />
                </button>
                <button ref={closeButtonRef} onClick={onClose} aria-label="Close article" className={`p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1 cursor-pointer ${focusRing}`}>
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {error ? (
              <div className="p-8 text-center mt-20 font-roboto" role="alert">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-amber-400" aria-hidden="true">
                  <AlertTriangle size={22} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Article Not Found</h4>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                  {error || "This article could not be retrieved from the server."}
                </p>
              </div>
            ) : loading ? (
              <div className="p-8 text-center mt-20 animate-pulse space-y-6" aria-label="Loading article" aria-busy="true">
                <div className="h-6 bg-zinc-800 rounded-xl w-3/4 mx-auto" />
                <div className="h-4 bg-zinc-800 rounded-xl w-1/2 mx-auto" />
                <div className="h-48 bg-zinc-800/40 rounded-xl w-full" />
                <div className="space-y-3 pt-4">
                  <div className="h-3.5 bg-zinc-800 rounded-xl w-full" />
                  <div className="h-3.5 bg-zinc-800 rounded-xl w-full" />
                  <div className="h-3.5 bg-zinc-800 rounded-xl w-4/5" />
                </div>
              </div>
            ) : (
              <>
                <div className="h-56 w-full overflow-hidden bg-zinc-950">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover opacity-0"
                      onLoad={(e) => e.currentTarget.classList.replace('opacity-0', 'opacity-100')}
                      style={{ transition: 'opacity 0.3s ease' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 via-zinc-900 to-violet-900/40 flex items-center justify-center relative" aria-hidden="true">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      <Newspaper className="text-zinc-700 w-16 h-16" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="px-4 sm:px-6 py-6">
                  <h2 className="font-editorial text-2xl font-bold text-white leading-[1.15] mb-4">
                    {article.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-6 font-roboto">
                    <span className="flex items-center gap-1.5"><Calendar size={11} aria-hidden="true" />{formattedDate}</span>
                    {article.readTime && <span className="flex items-center gap-1.5"><Clock size={11} aria-hidden="true" />{article.readTime}</span>}
                    <span className="font-semibold text-zinc-400">By {authorName}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/15 mb-6 font-roboto">
                    <p className="text-blue-200 text-sm leading-relaxed font-medium">{summaryText}</p>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none font-roboto">
                    {article.content && article.content.split("\n\n").map((para, i) => (
                      <p key={i} className="text-zinc-300 text-sm leading-7 mb-4">{para}</p>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/8 font-roboto">
                    {article.tags && article.tags.map(tag => (
                      <span
                        key={tag}
                        className={`text-xs text-zinc-400 bg-zinc-800 border border-white/8 rounded-full px-3 py-1 hover:bg-zinc-700 cursor-pointer transition-colors ${focusRing}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Filter by tag: ${tag}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 font-roboto">
                    <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-400" aria-hidden="true" />
                      Community Discussion
                    </h4>
                    {["Great insight — especially relevant for biotech founders building on GCP.",
                      "The conformity assessment requirements are brutal for early-stage companies.",
                      "Groq's latency benchmarks are insane. We integrated it last week — 10x improvement."
                    ].map((comment, i) => (
                      <div key={i} className="flex gap-3 mb-4">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0" aria-hidden="true">
                          {["A", "R", "S"][i]}
                        </div>
                        <div className="flex-1 bg-zinc-900 rounded-xl px-4 py-3 border border-white/6">
                          <p className="text-zinc-300 text-xs leading-relaxed">{comment}</p>
                          <p className="text-zinc-600 text-[10px] mt-1.5" aria-label={`Posted ${["2 hours ago", "5 hours ago", "1 day ago"][i]}`}>{["2h ago", "5h ago", "1d ago"][i]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Trending Sidebar

const TrendingWidget = React.memo(() => (
  <div className="rounded-xl border border-white/8 bg-zinc-900/60 p-4 font-roboto">
    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
      <Flame size={14} className="text-orange-400" /> Trending in AI
    </h3>
    <div className="space-y-3">
      {TRENDING_TOPICS.map((t, i) => (
        <div key={t.tag} className="flex items-center justify-between group cursor-pointer focus-ring rounded-xl p-0.5">
          <div className="flex items-center gap-2.5">
            <span className="text-zinc-600 text-xs font-mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-zinc-300 text-xs font-medium group-hover:text-blue-400 transition-colors">{t.tag}</span>
          </div>
          <span className="text-zinc-600 text-[10px]">{t.count}</span>
        </div>
      ))}
    </div>
  </div>
));

const NewsletterWidget = React.memo(() => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950";

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 p-5 font-roboto"
      style={{ background: "linear-gradient(135deg, #071a10 0%, #050a06 100%)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20" aria-hidden="true">
          <Bell size={14} />
        </div>
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Newsletter</span>
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">AI News Weekly Digest</h3>
      <p className="text-zinc-400 text-xs leading-relaxed mb-4">
        Get the top AI stories delivered to your inbox every Monday morning.
      </p>
      {subscribed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          role="status"
        >
          <CheckCircle2 size={13} aria-hidden="true" /> Subscribed Successfully!
        </motion.div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full text-xs bg-zinc-950/80 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${focusRing}`}
          />
          <button
            type="submit"
            className={`w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${focusRing} active:scale-98`}
          >
            <Mail size={12} aria-hidden="true" /> Subscribe Free
          </button>
        </form>
      )}
    </div>
  );
});

export function AINewsPageCurrent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [sources, setSources] = useState([
    { id: "all", name: "All Sources" },
    { id: "deepmind", name: "DeepMind" },
    { id: "anthropic", name: "Anthropic" },
    { id: "groq", name: "Groq" },
    { id: "eu-ai-act", name: "EU AI Act" },
    { id: "openai", name: "OpenAI" },
    { id: "mit-csail", name: "MIT CSAIL" },
  ]);
  const [selectedSource, setSelectedSource] = useState("all");
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("latest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setNextPage] = useState(false);
  const [hasPrevPage, setPrevPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [drawerArticle, setDrawerArticle] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(null);

  const [articles, setArticles] = useState(NEWS_ARTICLES);
  const [isUsingApiData, setIsUsingApiData] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0);

  const sourceDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target)) {
        setIsSourceDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSources = async () => {
      try {
        const response = await aiNewsAPI.getSources(controller.signal);
        let fetchedSources = [];
        if (Array.isArray(response)) {
          fetchedSources = response;
        } else if (response && Array.isArray(response.sources)) {
          fetchedSources = response.sources;
        } else if (response && Array.isArray(response.data)) {
          fetchedSources = response.data;
        }

        if (fetchedSources.length > 0) {
          const formatted = fetchedSources.map(s => {
            if (typeof s === "string") {
              return { id: s.toLowerCase().replace(/\s+/g, "-"), name: s };
            }
            return { id: s.id || s.slug || s.value || "unknown", name: s.name || s.label || "Unknown" };
          });

          if (!formatted.some(s => s.id === "all")) {
            formatted.unshift({ id: "all", name: "All Sources" });
          }
          setSources(formatted);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        console.warn("Could not load sources from API, using default sources.", err);
      }
    };

    fetchSources();
    return () => controller.abort();
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setActiveCategory("all");
    setSelectedSource("all");
    setSelectedSort("latest");
    setCurrentPage(1);
    setError(null);
  }, []);

  const handleRetryFetch = useCallback(() => {
    setError(null);
    setRetryTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await aiNewsAPI.getArticles({
          page: currentPage,
          sort: selectedSort,
          source: selectedSource !== "all" ? selectedSource : undefined,
          category: activeCategory !== "all" ? activeCategory : undefined,
          search: debouncedSearch || undefined,
        }, controller.signal);

        let fetchedArticles = [];
        let total = 1;
        let hasNext = false;
        let hasPrev = false;

        if (response) {
          fetchedArticles = response.articles || response.data || [];
          total = response.total_pages || response.totalPages || 1;
          hasNext = response.has_next !== undefined ? response.has_next : (response.hasNextPage || false);
          hasPrev = response.has_prev !== undefined ? response.has_prev : (response.hasPrevPage || false);
        }

        if (fetchedArticles.length > 0) {
          setArticles(fetchedArticles);
          setTotalPages(total);
          setNextPage(hasNext);
          setPrevPage(hasPrev);
          setIsUsingApiData(true);
        } else {
          setArticles([]);
          setTotalPages(1);
          setNextPage(false);
          setPrevPage(false);
          setIsUsingApiData(true);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        const status = err.response?.status;
        console.error("API error fetching articles status:", status, err);

        if (status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else if (status === 404) {
          setError({
            status: 404,
            message: "The requested AI news feed or path could not be found on the server (404)."
          });
        } else if (status === 500) {
          setError({
            status: 500,
            message: "A server-side error occurred. The backend failed to process the request (500)."
          });
        } else {
          setIsUsingApiData(false);
          setArticles(NEWS_ARTICLES);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();
    return () => controller.abort();
  }, [currentPage, selectedSort, selectedSource, activeCategory, debouncedSearch, retryTrigger]);

  const handleReadArticle = useCallback(async (article) => {
    lastFocusedRef.current = document.activeElement;
    setSelectedArticle(article);
    setDrawerArticle(article);
    setDrawerLoading(true);
    setDrawerError(null);
    const controller = new AbortController();
    try {
      const response = await aiNewsAPI.getArticleById(article.id, controller.signal);
      const detail = response?.article || response?.data || response;
      if (detail) {
        setDrawerArticle(detail);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      console.warn("Could not load article detail from API, using fallback baseline.", err);
      const status = err.response?.status;
      if (status === 404) {
        setDrawerError("This article was not found on the server (404).");
      } else if (status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const featuredArticle = useMemo(() => {
    if (error) return null;
    const featured = articles.find(a => a.featured);
    if (!featured) return null;

    if (selectedSource !== "all") {
      const sourceMatch = featured.sourceId === selectedSource ||
        (featured.source && featured.source.toLowerCase() === selectedSource.toLowerCase()) ||
        (featured.tags && featured.tags.some(t => t.toLowerCase() === selectedSource.toLowerCase()));
      if (!sourceMatch) return null;
    }
    return featured;
  }, [articles, selectedSource, error]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      if (a.featured && featuredArticle && a.id === featuredArticle.id) return false;

      const matchCat = activeCategory === "all" || a.category === activeCategory;

      const matchSource = selectedSource === "all" ||
        a.sourceId === selectedSource ||
        (a.source && a.source.toLowerCase() === selectedSource.toLowerCase()) ||
        (a.tags && a.tags.some(t => t.toLowerCase() === selectedSource.toLowerCase()));

      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q ||
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)));

      return matchCat && matchSource && matchSearch;
    });
  }, [articles, featuredArticle, activeCategory, selectedSource, debouncedSearch]);

  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      if (selectedSort === "latest") {
        const timeA = new Date(a.published_at || a.scraped_at || a.date).getTime();
        const timeB = new Date(b.published_at || b.scraped_at || b.date).getTime();
        return timeB - timeA;
      }
      if (selectedSort === "oldest") {
        const timeA = new Date(a.published_at || a.scraped_at || a.date).getTime();
        const timeB = new Date(b.published_at || b.scraped_at || b.date).getTime();
        return timeA - timeB;
      }
      if (selectedSort === "impact") {
        const impactA = a.impact || 0;
        const impactB = b.impact || 0;
        return impactB - impactA;
      }
      return 0;
    });
  }, [filteredArticles, selectedSort]);

  useEffect(() => {
    if (!isUsingApiData) {
      const count = sortedArticles.length;
      const pages = Math.ceil(count / ARTICLES_PER_PAGE) || 1;
      setTotalPages(pages);
      setPrevPage(currentPage > 1);
      setNextPage(currentPage < pages);

      if (currentPage > pages) {
        setCurrentPage(1);
      }
    }
  }, [sortedArticles, currentPage, isUsingApiData]);

  const paginatedArticles = useMemo(() => {
    if (isUsingApiData) {
      return sortedArticles;
    }
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    return sortedArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [sortedArticles, currentPage, isUsingApiData]);

  return (
    <div className="min-h-[100dvh] text-white font-roboto" style={{ background: "transparent" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Roboto:wght@300;400;500;700&display=swap');
        .font-editorial {
          font-family: 'Newsreader', Georgia, serif;
        }
        .font-roboto {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .focus-ring:focus-visible {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
            overflow-x: auto;
          }
          .motion-safe-transition {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <NewsTicker articles={articles} onRead={handleReadArticle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-3 font-roboto">
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/25">
              <Newspaper size={18} className="text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Community</span>
          </div>
          <h1 className="font-editorial text-4xl md:text-5xl font-bold text-white mb-2 leading-[1.15]">
            AI <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">News</span>
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 mb-4">
            <div className="flex -space-x-1.5 overflow-hidden">
              {["A", "R", "S"].map((c, i) => (
                <div key={i} className="inline-block h-5 w-5 rounded-full ring-2 ring-zinc-950 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[8px] font-bold">
                  {c}
                </div>
              ))}
            </div>
            <span className="text-xs text-zinc-500 font-medium">Join <span className="text-emerald-400 font-bold">12,400+ builders</span> reading daily updates</span>
          </div>
          <p className="font-roboto text-zinc-400 text-sm max-w-xl leading-relaxed">
            Stay ahead of the curve with curated AI research, product launches, funding rounds, and industry analysis — handpicked for builders and founders.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex flex-col md:flex-row gap-3 mb-6 w-full max-w-5xl font-roboto">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" aria-hidden="true" />
            <label htmlFor="ai-news-search" className="sr-only">Search AI news</label>
            <input
              id="ai-news-search"
              type="text"
              placeholder="Search AI news, topics, companies…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 focus:border-blue-500/50 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors focus-ring"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} aria-label="Clear search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer focus-ring">
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative" ref={sourceDropdownRef}>
              <button onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)} className="w-full sm:w-48 flex items-center justify-between gap-2 bg-zinc-900/80 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all duration-200 focus-ring">
                <span className="flex items-center gap-2 truncate">
                  <Filter size={14} className="text-blue-400 shrink-0" />
                  <span className="truncate">{sources.find(s => s.id === selectedSource)?.name || "All Sources"}</span>
                </span>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isSourceDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isSourceDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden">
                    <div className="py-1.5 max-h-60 overflow-y-auto scrollbar-thin">
                      {sources.map(source => (
                        <button
                          key={source.id}
                          onClick={() => { setSelectedSource(source.id); setIsSourceDropdownOpen(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between focus-ring ${selectedSource === source.id ? "bg-blue-600/15 text-blue-400 font-medium" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"}`}
                        >
                          <span className="truncate">{source.name}</span>
                          {selectedSource === source.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={sortDropdownRef}>
              <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full sm:w-40 flex items-center justify-between gap-2 bg-zinc-900/80 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all duration-200 focus-ring">
                <span className="flex items-center gap-2 truncate">
                  <TrendingUp size={14} className="text-violet-400 shrink-0" />
                  <span className="truncate">Sort: {SORT_OPTIONS.find(o => o.id === selectedSort)?.name || "Latest"}</span>
                </span>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isSortDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-44 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden">
                    <div className="py-1.5">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setSelectedSort(opt.id); setIsSortDropdownOpen(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between focus-ring ${selectedSort === opt.id ? "bg-violet-600/15 text-violet-400 font-medium" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"}`}
                        >
                          <span>{opt.name}</span>
                          {selectedSort === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-8 font-roboto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
              aria-pressed={activeCategory === cat.id}
              className={`flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full border whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 active:scale-98 ${activeCategory === cat.id ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-zinc-900/60 border-white/8 text-zinc-400 hover:text-white hover:border-white/20"}`}
            >
              <span aria-hidden="true">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </motion.div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {!loading && `${paginatedArticles.length} article${paginatedArticles.length !== 1 ? 's' : ''} shown`}
        </div>

        {error ? (
          error.status === 404 ? (
            <div className="text-center py-20 px-4 max-w-lg mx-auto font-roboto">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-amber-400">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Feed Not Found</h2>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{error.message || "The article feed you are looking for is currently unavailable."}</p>
              <button onClick={handleResetFilters} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-semibold cursor-pointer text-white transition-colors focus-ring active:scale-98">Return to All News</button>
            </div>
          ) : (
            <div className="text-center py-20 px-4 max-w-lg mx-auto bg-zinc-900/30 rounded-2xl border border-white/5 font-roboto">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20 text-rose-400">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Server Error (500)</h2>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{error.message || "Failed to retrieve the latest articles. Please try again."}</p>
              <div className="flex justify-center gap-3">
                <button onClick={handleRetryFetch} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors focus-ring active:scale-98">
                  <RotateCw size={14} className={loading ? "animate-spin" : ""} /> Retry Loading
                </button>
                <button onClick={() => { setError(null); setIsUsingApiData(false); setArticles(NEWS_ARTICLES); }} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors focus-ring active:scale-98">
                  Use Offline Mock Data
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {loading && (!searchQuery && activeCategory === "all") && <FeaturedCardSkeleton />}
            {!loading && (!searchQuery && activeCategory === "all") && featuredArticle && (
              <div className="mb-8">
                <FeaturedCard article={featuredArticle} onRead={handleReadArticle} />
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <NewsCardSkeleton key={i} />)}
                  </div>
                ) : paginatedArticles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                      {paginatedArticles.map((article, i) => (
                        <NewsCard key={article.id} article={article} index={i} onRead={handleReadArticle} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-12 py-4 border-t border-white/5 font-roboto">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={!hasPrevPage || loading} aria-label="Previous page" className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 focus-ring active:scale-98 ${hasPrevPage && !loading ? "bg-zinc-900 border-white/10 hover:border-white/20 text-white cursor-pointer" : "bg-zinc-900/40 border-white/5 text-zinc-600 cursor-not-allowed"}`}>
                          <ChevronRight size={14} className="rotate-180" aria-hidden="true" /> Previous
                        </button>
                        <span className="text-xs text-zinc-400 font-medium" aria-label={`Page ${currentPage} of ${totalPages}`}>
                          Page <span className="text-blue-400 font-bold" aria-hidden="true">{currentPage}</span> of {totalPages}
                        </span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={!hasNextPage || loading} aria-label="Next page" className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 focus-ring active:scale-98 ${hasNextPage && !loading ? "bg-zinc-900 border-white/10 hover:border-white/20 text-white cursor-pointer" : "bg-zinc-900/40 border-white/5 text-zinc-600 cursor-not-allowed"}`}>
                          Next <ChevronRight size={14} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-xl border border-white/5 max-w-xl mx-auto font-roboto">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 text-blue-400">
                      <Newspaper size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">No articles found.</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed max-w-md mx-auto mb-6">We couldn't find any articles matching your search query, selected category, or source. Try widening your search or resetting the active filters.</p>
                    <button onClick={handleResetFilters} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200 focus-ring active:scale-98">Reset All Filters</button>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4">
                <TrendingWidget />
                <NewsletterWidget />
              </div>
            </div>
          </>
        )}
      </div>

      <ArticleDrawer
        article={drawerArticle}
        loading={drawerLoading}
        error={drawerError}
        closeButtonRef={closeButtonRef}
        onClose={() => {
          setSelectedArticle(null);
          setDrawerArticle(null);
          setDrawerError(null);
          setTimeout(() => lastFocusedRef.current?.focus(), 60);
        }}
      />
    </div>
  );
}

function CustomDropdown({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0] || { label: value, value };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between gap-2.5 hover:bg-zinc-800/60 rounded-full px-4 py-2 text-xs font-medium cursor-pointer outline-none transition-all duration-150 active:translate-y-[1px] min-w-[130px] ${isOpen ? "bg-zinc-800/60 text-zinc-100" : "bg-transparent text-zinc-300"}`}
        >
          <span className="flex items-center gap-1.5 truncate">
            {label && <span className="text-zinc-500 font-normal">{label}:</span>}
            <span className="truncate">{selectedOption.label}</span>
          </span>
          <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-155 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute right-0 mt-2 z-40 min-w-[160px] bg-[#1c1c1e] border border-zinc-700/60 shadow-xl shadow-black/80 rounded-xl py-1.5 overflow-hidden backdrop-blur-xl"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-zinc-800/80 ${value === opt.value ? "text-blue-400 bg-blue-500/10 font-semibold" : "text-zinc-300"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
};

const toolbarVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

export function AINewsPageIncoming() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [sources, setSources] = useState(["All Sources"]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchTerm !== searchQuery) {
      setLoading(true);
    }
    const delayDebounce = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, searchQuery]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, srcRes] = await Promise.all([
          aiNewsAPI.getCategories(),
          aiNewsAPI.getSources()
        ]);
        if (catRes?.success && catRes?.data) {
          setCategories(["All", ...catRes.data.filter(c => c !== "All")]);
        }
        if (srcRes?.success && srcRes?.data) {
          setSources(["All Sources", ...srcRes.data.filter(s => s !== "All Sources")]);
        }
      } catch (err) {
        console.error("Failed to load news metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedSource, sortBy]);

  const fetchArticles = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = {
        search: searchQuery,
        category: selectedCategory,
        source: selectedSource,
        sort_by: sortBy,
        page: page,
        limit: 6
      };

      const res = await aiNewsAPI.getArticles(params);

      if (res?.success && res?.data) {
        setArticles(res.data.articles || []);
        setTotalPages(res.data.total_pages || 1);
        setHasNext(res.data.has_next || false);
        setHasPrev(res.data.has_prev || false);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        return;
      }

      console.error("Failed to fetch articles:", err);
      const status = err.response?.status || 500;
      setError({
        status,
        message: "Could not fetch news articles at this time."
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSource, sortBy, page]);

  useEffect(() => {
    fetchArticles();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchArticles]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedSource("All Sources");
    setSortBy("latest");
    setSearchTerm("");
    setSearchQuery("");
    setPage(1);
  };

  const sourceOptions = sources.map(src => ({ value: src, label: src }));
  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
    { value: "impact", label: "Highest Impact" }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-7xl mx-auto px-6 py-10 text-zinc-300 min-h-screen bg-[#0e0d0d] overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.18, 0.35, 0.18],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 left-1/4 w-[700px] h-[400px] bg-gradient-to-r from-blue-600/20 to-indigo-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.92, 1.1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-1/4 w-[500px] h-[300px] bg-gradient-to-r from-violet-600/15 to-purple-600/10 rounded-full blur-3xl"
        />
      </div>

      <motion.header variants={headerVariants} className="relative z-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none mb-3">
            <ShinyText text="AI News & Intelligence" speed={4} />
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
            Raw intelligence feeds, industrial neural updates, and breaking research curated across validated technology nodes.
          </p>
        </div>

        <div className="flex items-center gap-0 shrink-0 border border-zinc-700/50 bg-[#161618] rounded-xl overflow-hidden divide-x divide-zinc-700/40">
          <div className="text-left px-5 py-3">
            <div className="text-2xl font-bold font-mono text-blue-400 tracking-tight leading-none mb-1">
              {String(articles.length || 0).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-widest">Loaded Feeds</div>
          </div>
          <div className="text-left px-5 py-3">
            <div className="text-2xl font-bold font-mono text-violet-400 tracking-tight leading-none mb-1">
              {String(sources.length ? sources.length - 1 : 0).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-widest">Active Nodes</div>
          </div>
        </div>
      </motion.header>

      <motion.div
        variants={toolbarVariants}
        className={`sticky top-0 z-30 transition-all duration-300 p-1.5 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:rounded-full rounded-2xl border ${isScrolled
            ? "bg-[#111113]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 border-zinc-700/60"
            : "bg-[#161618]/80 backdrop-blur-lg border-zinc-700/40"
          }`}
      >
        <div className="relative w-full md:max-w-md flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <Search size={16} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AI news..."
            className="w-full pl-11 pr-12 py-2.5 bg-transparent border-none text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-0 transition-all duration-150"
            aria-label="Search articles"
          />
          <button
            onClick={() => setSearchTerm("")}
            className={`absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white transition-opacity duration-120 ${searchTerm ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1 shrink-0 px-1.5 pb-1.5 md:pb-0">
          <CustomDropdown
            label="Source"
            value={selectedSource}
            options={sourceOptions}
            onChange={(val) => {
              setSelectedSource(val);
              setLoading(true);
            }}
          />

          <div className="w-[1px] h-4 bg-zinc-800 mx-1 hidden md:block" />

          <CustomDropdown
            label="Sort"
            value={sortBy}
            options={sortOptions}
            onChange={(val) => {
              setSortBy(val);
              setLoading(true);
            }}
          />

          {(selectedCategory !== "All" || selectedSource !== "All Sources" || sortBy !== "latest" || searchTerm) && (
            <>
              <div className="w-[1px] h-4 bg-zinc-800 mx-1 hidden md:block" />
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100 text-xs font-medium cursor-pointer transition-all duration-120 active:translate-y-[1px]"
              >
                <RefreshCw size={12} />
                Reset
              </button>
            </>
          )}
        </div>
      </motion.div>

      <div className="flex overflow-x-auto scrollbar-hide w-full mb-10 pb-2 -mx-2 px-2 md:mx-0 md:px-0">
        <div className="inline-flex items-center p-1.5 bg-[#121212]/80 backdrop-blur-xl border border-zinc-800 rounded-full mx-auto shadow-lg shadow-black/40 min-w-max">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (!isActive) {
                    setSelectedCategory(cat);
                    setLoading(true);
                  }
                }}
                className={`relative px-4 sm:px-5 py-2 text-xs font-medium cursor-pointer transition-colors duration-200 outline-none shrink-0 rounded-full z-10 ${isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-[#252529] rounded-full border border-zinc-700/60 shadow-md"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <NewsSkeleton count={6} />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            className="flex flex-col items-center justify-center text-center p-12 bg-red-950/10 border border-red-900/20 rounded-xl max-w-md mx-auto"
          >
            <AlertTriangle className="text-red-400 mb-3" size={24} />
            <h3 className="text-sm font-bold text-red-200 mb-1">Failed to load articles</h3>
            <p className="text-red-300/70 text-xs mb-4 leading-relaxed">{error.message}</p>
            <button
              onClick={fetchArticles}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-800 cursor-pointer transition-all duration-120 active:translate-y-[1px]"
            >
              <RefreshCw size={11} />
              Retry Connection
            </button>
          </motion.div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            className="flex flex-col items-center justify-center text-center py-16 px-6 bg-zinc-900/20 border border-zinc-800/50 rounded-xl max-w-md mx-auto"
          >
            <Newspaper size={24} className="text-zinc-600 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No articles found</h3>
            <p className="text-zinc-450 text-xs mb-4 leading-relaxed">
              There are no articles matching your selection filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white shadow-sm text-xs font-semibold rounded-lg border border-transparent cursor-pointer transition-all duration-120 active:translate-y-[1px]"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {articles.map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                />
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14 border-t border-zinc-800/50 pt-8">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1));
                    setLoading(true);
                  }}
                  disabled={!hasPrev}
                  className="px-4 py-2 rounded-full border border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/60 text-zinc-300 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed text-xs font-medium transition-all duration-150 active:translate-y-[1px] flex items-center gap-1.5"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => {
                          setPage(pNum);
                          setLoading(true);
                        }}
                        className={`w-8 h-8 rounded-full border text-xs font-semibold transition-all duration-150 active:translate-y-[1px] ${page === pNum
                            ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/30"
                            : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700"
                          }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setPage((p) => Math.min(p + 1, totalPages));
                    setLoading(true);
                  }}
                  disabled={!hasNext}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs transition-all duration-120 active:translate-y-[1px] flex items-center gap-1"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
export default AINewsPageCurrent;