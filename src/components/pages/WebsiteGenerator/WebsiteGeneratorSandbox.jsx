import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  CheckCircle, XCircle, CheckCheck, Code2, Star, Link,
  Globe, ChevronRight, ChevronLeft, Zap, Sparkles, FileCode2, Cpu, ShieldAlert, Trash2,
} from "lucide-react";
import BrandingForm from "./BrandingForm";
import FeatureChipInput from "./FeatureChipInput";
import UrlInput from "./UrlInput";
import UrlList from "./UrlList";
import AppTypeSelector from "./AppTypeSelector";
import RealtimeTracker from "./RealtimeTracker";
import SchemaViewer from "./SchemaViewer";
import FileTreeViewer from "./FileTreeViewer";
import ProposalApprovalFlow from "./ProposalApprovalFlow";
import GenerateCodebaseFlow from "./GenerateCodebaseFlow";
import ApiErrorSandbox from "./ApiErrorSandbox";
import DeleteProjectFlow from "./DeleteProjectFlow";

// ─── Mock data for Proposal step ────────────────────────────────────────────
const MOCK_SQL = `CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  body       TEXT,
  published  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);`;

const MOCK_TREE = {
  src: {
    components: { "Header.jsx": null, "Footer.jsx": null, "Hero.jsx": null },
    pages: { "Home.jsx": null, "About.jsx": null, "Blog.jsx": null },
    hooks: { "useAuth.js": null },
    "App.jsx": null,
    "main.jsx": null,
    "index.css": null,
  },
  public: { "index.html": null, "favicon.ico": null },
  "package.json": null,
  "vite.config.js": null,
  "README.md": null,
};

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "a",        label: "App Type",  sublabel: "Pick a template",   icon: Globe       },
  { id: "b",        label: "Branding",  sublabel: "Colors & tagline",   icon: Sparkles    },
  { id: "c",        label: "Features",  sublabel: "Features & URLs",    icon: Star        },
  { id: "preview",  label: "Preview",   sublabel: "JSON output",        icon: Code2       },
  { id: "proposal", label: "Proposal",  sublabel: "Review & approve",   icon: FileCode2   },
  { id: "generate", label: "Generate",  sublabel: "Build codebase",     icon: Cpu         },
  { id: "realtime", label: "Realtime",  sublabel: "Socket · Task 9",    icon: Zap         },
  { id: "errors",   label: "Errors",    sublabel: "API error handling", icon: ShieldAlert },
  { id: "delete",   label: "Delete",    sublabel: "Delete project",     icon: Trash2      },
];
const STEP_IDS = STEPS.map((s) => s.id);
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const URL_RE = /^https?:\/\/.+/;

// ─── Toast ────────────────────────────────────────────────────────────────────
function ValidationToast({ message, type = "success", onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`fixed bottom-24 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl
                  border shadow-2xl max-w-sm backdrop-blur-md
                  ${type === "success"
          ? "bg-green-500/10 border-green-500/30 text-green-300 shadow-green-500/10"
          : "bg-red-500/10 border-red-500/30 text-red-300 shadow-red-500/10"
        }`}
      role="status"
      aria-live="polite"
    >
      {type === "success"
        ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
        : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />}
      <div className="flex-1 text-sm leading-snug">{message}</div>
      <button onClick={onClose} aria-label="Dismiss" className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <XCircle className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Vertical Stepper (desktop left panel) ────────────────────────────────────
function VerticalStepper({ steps, activeStep, onStepClick }) {
  const activeIdx = STEP_IDS.indexOf(activeStep);
  return (
    <div className="relative flex flex-col gap-0">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < activeIdx;
        const isActive = idx === activeIdx;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="relative flex items-start gap-3">
            {/* Vertical connecting line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 w-px h-[calc(100%-8px)] z-0"
                style={{
                  background: isDone
                    ? "linear-gradient(to bottom, #7c3aed, #7c3aed)"
                    : "rgba(255,255,255,0.07)",
                }} />
            )}

            {/* Circle */}
            <button
              type="button"
              id={`wizard-tab-${step.id}`}
              onClick={() => onStepClick(step.id)}
              aria-selected={isActive}
              className="relative z-10 focus:outline-none flex-shrink-0 mt-0.5"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(124,58,237,0.2), 0 0 14px rgba(124,58,237,0.4)"
                    : "none",
                }}
                transition={{ duration: 0.25 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                            ${isActive
                    ? "bg-violet-600 border-violet-400 text-white"
                    : isDone
                      ? "bg-violet-500/20 border-violet-500/60 text-violet-400"
                      : "bg-white/5 border-white/15 text-slate-500 hover:border-white/30"
                  }`}
              >
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </motion.span>
                  ) : (
                    <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Icon className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </button>

            {/* Label */}
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className="pb-7 text-left focus:outline-none group"
            >
              <div className={`text-sm font-semibold leading-tight transition-colors
                              ${isActive ? "text-white" : isDone ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                {step.label}
              </div>
              <div className="text-[10px] text-slate-600 leading-tight mt-0.5">
                {step.sublabel}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Horizontal Stepper (mobile) ──────────────────────────────────────────────
function HorizontalStepper({ steps, activeStep, onStepClick }) {
  const activeIdx = STEP_IDS.indexOf(activeStep);
  return (
    <div className="relative flex items-center w-full">
      <div className="absolute top-4 left-0 right-0 h-px bg-white/8 mx-4 z-0" />
      <motion.div
        className="absolute top-4 left-4 h-px z-0"
        style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
        animate={{ width: `calc(${(activeIdx / (steps.length - 1)) * 100}% - 8px)` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < activeIdx;
        const isActive = idx === activeIdx;
        return (
          <button
            key={step.id}
            type="button"
            id={`wizard-tab-${step.id}`}
            onClick={() => onStepClick(step.id)}
            aria-selected={isActive}
            className="relative z-10 flex flex-col items-center gap-1 flex-1 focus:outline-none group"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                boxShadow: isActive ? "0 0 0 3px rgba(124,58,237,0.3)" : "none",
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                          ${isActive ? "bg-violet-600 border-violet-400 text-white"
                  : isDone ? "bg-violet-500/20 border-violet-500 text-violet-300"
                    : "bg-white/5 border-white/15 text-slate-500"}`}
            >
              <AnimatePresence mode="wait">
                {isDone
                  ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle className="w-3.5 h-3.5" /></motion.span>
                  : <motion.span key="i" initial={{ scale: 0 }} animate={{ scale: 1 }}><Icon className="w-3.5 h-3.5" /></motion.span>}
              </AnimatePresence>
            </motion.div>
            <span className={`text-[10px] font-semibold hidden sm:block transition-colors
                              ${isActive ? "text-white" : isDone ? "text-violet-400" : "text-slate-600"}`}>
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, className = "" }) {
  return (
    <div className={`bg-white/[0.025] border border-white/8 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, iconClass, title, subtitle }) { // eslint-disable-line no-unused-vars
  return (
    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-white/5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────
function SummaryBar({ stepA, branding, features, referenceUrls }) {
  const items = [
    stepA.name && { label: stepA.name, icon: <Globe className="w-3 h-3" /> },
    { label: stepA.app_type, mono: true, color: "text-violet-300 bg-violet-500/10 border-violet-500/30" },
    { label: branding.primary_color, dot: branding.primary_color },
    { label: branding.accent_color, dot: branding.accent_color },
    { label: `${features.length} feature${features.length !== 1 ? "s" : ""}` },
    { label: `${referenceUrls.length} URL${referenceUrls.length !== 1 ? "s" : ""}` },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Summary</p>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border
                        ${item.color || "bg-white/4 border-white/8 text-slate-400"}`}
          >
            {item.dot && (
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/15"
                style={{ background: item.dot }} />
            )}
            {item.icon && <span className="text-slate-500 flex-shrink-0">{item.icon}</span>}
            <span className={`truncate ${item.mono ? "font-mono" : ""}`}>{item.label}</span>
          </div>
        ))}
        {branding.tagline && (
          <div className="px-2.5 py-1.5 rounded-lg text-[10px] text-slate-500 italic border border-white/5 bg-white/3 truncate">
            "{branding.tagline}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WebsiteGeneratorSandbox() {
  const [activeStep, setActiveStep] = useState("a");
  const [prevStep, setPrevStep] = useState(null);
  const [toast, setToast] = useState(null);

  const [stepA, setStepA] = useState({ name: "", app_type: "landing" });
  const [branding, setBranding] = useState({ primary_color: "#7c3aed", accent_color: "#f59e0b", tagline: "", logo_url: "" });
  const [features, setFeatures] = useState([]);
  const [referenceUrls, setReferenceUrls] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddUrl = (url) => setReferenceUrls((p) => [...p, url]);
  const handleRemoveUrl = (idx) => setReferenceUrls((p) => p.filter((_, i) => i !== idx));

  const navigate = (stepId) => { setPrevStep(activeStep); setActiveStep(stepId); };
  const activeIdx = STEP_IDS.indexOf(activeStep);
  const goNext = () => { if (activeIdx < STEP_IDS.length - 1) navigate(STEP_IDS[activeIdx + 1]); };
  const goPrev = () => { if (activeIdx > 0) navigate(STEP_IDS[activeIdx - 1]); };

  const forward = (() => {
    const curIdx = STEP_IDS.indexOf(activeStep);
    const prevIdx = STEP_IDS.indexOf(prevStep);
    return curIdx >= prevIdx;
  })();

  const xIn = forward ? 24 : -24;
  const xOut = forward ? -24 : 24;

  const validateAll = () => {
    const errors = [];
    const name = (stepA.name || "").trim();
    if (name.length < 2) errors.push("Website name must be at least 2 characters.");
    if (name.length > 120) errors.push("Website name must be at most 120 characters.");
    if (!stepA.app_type) errors.push("Please select an app type.");
    if (!HEX_RE.test(branding.primary_color)) errors.push("Primary colour is not a valid hex (#RRGGBB).");
    if (!HEX_RE.test(branding.accent_color)) errors.push("Accent colour is not a valid hex (#RRGGBB).");
    if (branding.tagline.length > 200) errors.push("Tagline exceeds 200 characters.");
    if (branding.logo_url && !URL_RE.test(branding.logo_url)) errors.push("Logo URL must start with http:// or https://.");
    if (features.length === 0) errors.push("Add at least one feature.");
    if (referenceUrls.some((u) => !URL_RE.test(u))) errors.push("One or more reference URLs are invalid.");
    errors.length === 0
      ? showToast("All fields are valid! Ready to generate.", "success")
      : showToast(errors[0], "error");
  };

  const previewBody = {
    name: stepA.name || undefined,
    app_type: stepA.app_type,
    branding: {
      primary_color: branding.primary_color,
      accent_color: branding.accent_color,
      ...(branding.tagline && { tagline: branding.tagline }),
      ...(branding.logo_url && { logo_url: branding.logo_url }),
    },
    features,
    reference_urls: referenceUrls,
  };

  return (
    <div className="min-h-screen w-full pb-28 relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Fixed ambient background ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.035)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute top-0 left-[15%] w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-fuchsia-600/7 rounded-full blur-[120px]" />
      </div>

      {/* ── Main full-width content ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-4 md:px-6 xl:px-8 pt-6">

        {/* ── Mobile: horizontal stepper on top ───────────────────────────── */}
        <div className="lg:hidden mb-6 space-y-4">
          {/* Mobile hero */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">AI Website Builder</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #c4b5fd 40%, #f0abfc 70%, #fff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              Website Generator
            </h1>
          </motion.div>
          <HorizontalStepper steps={STEPS} activeStep={activeStep} onStepClick={navigate} />
        </div>

        {/* ── Desktop: two-column split ────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">

          {/* ── LEFT PANEL — sticky sidebar ──────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="hidden lg:flex flex-col flex-shrink-0 w-56 xl:w-64 gap-6 sticky top-6 self-start"
          >
            {/* Hero */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">AI Website Builder</span>
              </div>
              <h1 className="text-2xl xl:text-3xl font-black tracking-tight leading-tight mb-2"
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #c4b5fd 45%, #f0abfc 75%, #fff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Website<br />Generator
              </h1>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Configure your brand, pick features and reference sources — we'll generate a production-ready site.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/6" />

            {/* Vertical stepper */}
            <VerticalStepper steps={STEPS} activeStep={activeStep} onStepClick={navigate} />

            {/* Divider */}
            <div className="h-px bg-white/6" />

            {/* Summary */}
            <SummaryBar
              stepA={stepA}
              branding={branding}
              features={features}
              referenceUrls={referenceUrls}
            />
          </motion.aside>

          {/* ── RIGHT PANEL — step content (flex-1, full remaining width) ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeStep === "a" && (
                <motion.div key="step-a"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SectionCard>
                    <SectionHeader icon={Globe} iconClass="bg-sky-500/15 text-sky-400" title="App Type" subtitle="Step 1 · Name your project & choose a template pack" />
                    <AppTypeSelector value={stepA} onChange={setStepA} />
                  </SectionCard>
                </motion.div>
              )}

              {activeStep === "b" && (
                <motion.div key="step-b"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SectionCard>
                    <BrandingForm value={branding} onChange={setBranding} />
                  </SectionCard>
                </motion.div>
              )}

              {activeStep === "c" && (
                <motion.div key="step-c"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <SectionCard>
                    <SectionHeader icon={Star} iconClass="bg-amber-500/15 text-amber-400" title="Features" subtitle="Step 3 · Up to 40 features" />
                    <FeatureChipInput value={features} onChange={setFeatures} />
                  </SectionCard>
                  <SectionCard>
                    <SectionHeader icon={Link} iconClass="bg-sky-500/15 text-sky-400" title="Reference URLs" subtitle="Step 3 · Up to 10 URLs to harvest" />
                    <div className="space-y-4">
                      <UrlInput urls={referenceUrls} onAdd={handleAddUrl} />
                      <UrlList urls={referenceUrls} onRemove={handleRemoveUrl} />
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {activeStep === "preview" && (
                <motion.div key="step-preview"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SectionCard>
                    <SectionHeader icon={Code2} iconClass="bg-green-500/15 text-green-400" title="POST /api/generator/projects — Request Body" subtitle="Live preview · Updates in real time" />
                    {/* Color swatches */}
                    <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl border border-white/5"
                      style={{ background: `linear-gradient(135deg, ${branding.primary_color}18 0%, ${branding.accent_color}10 100%)` }}>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-xl border-2 border-white/20 flex-shrink-0"
                          style={{ background: branding.primary_color, boxShadow: `0 4px 16px ${branding.primary_color}40` }} />
                        <div className="w-10 h-10 rounded-xl border-2 border-white/20 flex-shrink-0"
                          style={{ background: branding.accent_color, boxShadow: `0 4px 16px ${branding.accent_color}40` }} />
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <div>Primary <span className="font-mono text-violet-300">{branding.primary_color}</span></div>
                        <div>Accent  <span className="font-mono text-amber-300">{branding.accent_color}</span></div>
                        {stepA.name && <div className="mt-1 text-slate-500">"{stepA.name}"</div>}
                      </div>
                    </div>
                    <pre id="json-preview"
                      className="text-xs font-mono text-slate-300 bg-black/50 rounded-xl p-5 border border-white/5
                                    overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                      {JSON.stringify(previewBody, null, 2)}
                    </pre>
                  </SectionCard>
                </motion.div>
              )}

              {activeStep === "proposal" && (
                <motion.div key="step-proposal"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SectionCard>
                    <SectionHeader
                      icon={FileCode2}
                      iconClass="bg-violet-500/15 text-violet-400"
                      title="Proposal Review"
                      subtitle="Step 5 · Schema, file tree & approval"
                    />
                    <div className="space-y-6 mt-4">
                      <SchemaViewer sql={MOCK_SQL} />
                      <div className="h-px bg-white/5" />
                      <FileTreeViewer tree={MOCK_TREE} />
                      <div className="h-px bg-white/5" />
                      <ProposalApprovalFlow />
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {activeStep === "generate" && (
                <motion.div key="step-generate"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SectionCard>
                    <SectionHeader
                      icon={Cpu}
                      iconClass="bg-emerald-500/15 text-emerald-400"
                      title="Generate Codebase"
                      subtitle="Step 6 · POST /projects/:id/generate"
                    />
                    <div className="mt-4">
                      <GenerateCodebaseFlow />
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {activeStep === "realtime" && (
                <motion.div key="step-realtime"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <RealtimeTracker />
                </motion.div>
              )}

              {activeStep === "errors" && (
                <motion.div key="step-errors"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ApiErrorSandbox />
                </motion.div>
              )}

              {activeStep === "delete" && (
                <motion.div key="step-delete"
                  initial={{ opacity: 0, x: xIn }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: xOut }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <DeleteProjectFlow />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile summary bar (below content on mobile) */}
            <div className="lg:hidden mt-6">
              <SummaryBar stepA={stepA} branding={branding} features={features} referenceUrls={referenceUrls} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="mb-4 pointer-events-auto"
        >
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/10
                          bg-black/60 backdrop-blur-xl shadow-2xl shadow-black/50">
            {/* Step label */}
            <div className="hidden sm:flex flex-col pl-2 pr-1 min-w-[90px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Step {activeIdx + 1} of {STEPS.length}</span>
              <span className="text-xs font-semibold text-white leading-tight">{STEPS[activeIdx]?.label}</span>
            </div>

            <div className="w-px h-7 bg-white/10 hidden sm:block" />

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 px-1">
              {STEPS.map((_, i) => (
                <button key={i} type="button" onClick={() => navigate(STEP_IDS[i])}
                  className="transition-all duration-300 rounded-full focus:outline-none"
                  style={{
                    width: i === activeIdx ? 20 : 6,
                    height: 6,
                    background: i <= activeIdx
                      ? "linear-gradient(90deg, #7c3aed, #a855f7)"
                      : "rgba(255,255,255,0.12)",
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <div className="w-px h-7 bg-white/10" />

            {/* Prev */}
            <button type="button" onClick={goPrev} disabled={activeIdx === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         text-slate-400 hover:text-white hover:bg-white/8
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Next / Validate */}
            {activeIdx < STEPS.length - 1 ? (
              <button type="button" onClick={goNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           text-white transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.4)",
                }}>
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" id="validate-all-btn" onClick={validateAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           text-white transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  boxShadow: "0 0 16px rgba(5,150,105,0.4)",
                }}>
                <CheckCheck className="w-4 h-4" />
                Validate
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <ValidationToast key="toast" message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
