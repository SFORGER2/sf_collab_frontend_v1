import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectStatusBadge } from "../website-generator/ProjectStatusBadge";
import JobProgressCard from "../website-generator/JobProgressCard";
import { GitPushForm } from "../website-generator/GitPushForm";
import { RepoViewer } from "../website-generator/RepoViewer";
import ProposalReviewPanel from "../website-generator/ProposalReviewPanel";
import { Download, FileArchive, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Proposal data representing GET /projects/:id/proposal
const MOCK_PROPOSAL = {
  app_type: "ecommerce",
  pack: {
    key: "ecommerce",
    label: "E-commerce Storefront",
    description: "Catalogue, customers, carts and orders with normalised order items."
  },
  stack: {
    frontend: "React 18 + Vite + react-router",
    backend: "Node.js 20 + Express (Repository & Service pattern)",
    database: "MySQL 8 (Docker-managed)",
    ci: "GitHub Actions"
  },
  entities: [
    {
      table: "products",
      seed_rows: 25,
      fields: [
        { name: "id", sql_type: "INT AUTO_INCREMENT PRIMARY KEY", nullable: false, fk: null },
        { name: "name", sql_type: "VARCHAR(255)", nullable: false, fk: null },
        { name: "description", sql_type: "TEXT", nullable: true, fk: null },
        { name: "price", sql_type: "DECIMAL(12,2)", nullable: false, fk: null },
        { name: "category_id", sql_type: "INT", nullable: false, fk: "categories.id" },
        { name: "is_active", sql_type: "BOOLEAN", nullable: false, fk: null },
        { name: "created_at", sql_type: "TIMESTAMP", nullable: false, fk: null }
      ],
      indexes: [
        ["category_id", "is_active", "price"]
      ]
    },
    {
      table: "categories",
      seed_rows: 5,
      fields: [
        { name: "id", sql_type: "INT AUTO_INCREMENT PRIMARY KEY", nullable: false, fk: null },
        { name: "name", sql_type: "VARCHAR(120)", nullable: false, fk: null },
        { name: "slug", sql_type: "VARCHAR(120)", nullable: false, fk: null }
      ],
      indexes: [
        ["slug"]
      ]
    },
    {
      table: "orders",
      seed_rows: 10,
      fields: [
        { name: "id", sql_type: "INT AUTO_INCREMENT PRIMARY KEY", nullable: false, fk: null },
        { name: "customer_id", sql_type: "INT", nullable: false, fk: "users.id" },
        { name: "status", sql_type: "VARCHAR(50)", nullable: false, fk: null },
        { name: "total_amount", sql_type: "DECIMAL(12,2)", nullable: false, fk: null },
        { name: "created_at", sql_type: "TIMESTAMP", nullable: false, fk: null }
      ],
      indexes: [
        ["customer_id", "status"]
      ]
    }
  ],
  pages: ["Home", "Shop", "Cart", "Contact"],
  file_tree: [
    "backend/src/server.js",
    "backend/src/routes/api.js",
    "backend/src/controllers/productController.js",
    "backend/src/controllers/categoryController.js",
    "backend/src/controllers/orderController.js",
    "frontend/src/App.jsx",
    "frontend/src/pages/Shop.jsx",
    "frontend/src/components/ProductCard.jsx",
    "frontend/src/components/Navbar.jsx"
  ],
  schema_preview: `-- MySQL 8 schema
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  category_id INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
};

// Pipeline metadata
const PIPELINE = [
  {
    status: "draft",
    step: 0,
    label: "Draft Spec",
    description: "Website specifications defined. Ready to begin data acquisition.",
    accentColor: "#71717a", // zinc-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    isLive: false,
  },
  {
    status: "harvesting",
    step: 1,
    label: "Harvesting Data",
    description: "Crawling and extracting branding profiles, color palettes, and copy from reference URLs.",
    accentColor: "#3b82f6", // blue-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    isLive: true,
  },
  {
    status: "proposal_ready",
    step: 2,
    label: "Proposal Ready",
    description: "Data acquisition completed. Review the proposed database schema, entities, and file tree.",
    accentColor: "#8b5cf6", // violet-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,11 12,14 22,4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    isLive: false,
  },
  {
    status: "approved",
    step: 2,
    label: "Proposal Approved",
    description: "Architecture approved. The project is ready to generate the codebase.",
    accentColor: "#8b5cf6", // violet-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    isLive: false,
  },
  {
    status: "generating",
    step: 3,
    label: "Generating Codebase",
    description: "Building database migrations, API controllers, and rendering frontend components.",
    accentColor: "#3b82f6", // blue-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16,18 22,12 16,6" />
        <polyline points="8,6 2,12 8,18" />
      </svg>
    ),
    isLive: true,
  },
  {
    status: "generated",
    step: 3,
    label: "Codebase Ready",
    description: "Codebase generated successfully. Ready to download the ZIP or push to a remote repository.",
    accentColor: "#10b981", // emerald-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    isLive: false,
  },
  {
    status: "pushing",
    step: 4,
    label: "Delivering to Git",
    description: "Initializing repository and pushing generated codebase to your remote Git provider.",
    accentColor: "#3b82f6", // blue-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M13 6h3a2 2 0 0 1 2 2v7" />
        <line x1="6" y1="9" x2="6" y2="21" />
      </svg>
    ),
    isLive: true,
  },
  {
    status: "delivered",
    step: 4,
    label: "Completed & Delivered",
    description: "Codebase successfully delivered to your remote repository. Build completed!",
    accentColor: "#10b981", // emerald-500
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    isLive: false,
  },
  {
    status: "failed",
    step: 4,
    label: "Execution Failed",
    description: "An error occurred during pipeline execution. Hover over the badge to review details.",
    accentColor: "#ef4444", // red-500
    lastError: "Failed to establish secure SSH tunnel to git.github.com: Connection timed out after 30000ms.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    isLive: false,
  },
];

const TOTAL_STEPS = 4;
const PROGRESS_PCT = { 0: 0, 1: 25, 2: 50, 3: 75, 4: 100 };

// Premium status card with glow effect
function StatusCard({ item, index }) {
  const pct = PROGRESS_PCT[item.step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group relative bg-gradient-to-b from-zinc-900/80 to-zinc-950 rounded-xl p-5 flex flex-col gap-4 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 overflow-hidden shadow-md hover:shadow-lg"
    >
      {/* Subtle corner glow on hover */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: item.accentColor }}
      />
      {/* Colored top border indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-60"
        style={{ backgroundColor: item.accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
            style={{
              backgroundColor: `${item.accentColor}15`,
              borderColor: `${item.accentColor}30`,
              color: item.accentColor,
            }}
          >
            {item.icon}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-zinc-100 tracking-tight">{item.label}</p>
            <p className="text-[11px] font-medium text-zinc-600 mt-0.5">
              Step {item.step} / {TOTAL_STEPS}
            </p>
          </div>
        </div>

        {item.isLive && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ backgroundColor: item.accentColor }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ backgroundColor: item.accentColor }}
              />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: item.accentColor }}>
              Live
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-zinc-500 leading-relaxed min-h-[38px]">{item.description}</p>

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10.5px] text-zinc-600 font-medium uppercase tracking-wider">Progress</span>
          <span className="text-[11px] font-mono font-semibold" style={{ color: pct === 100 ? item.accentColor : '#a1a1aa' }}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: index * 0.06 + 0.2, ease: "easeOut" }}
            style={{ backgroundColor: item.accentColor }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] mt-auto">
        <span className="text-[10.5px] text-zinc-600 font-medium uppercase tracking-wider">Status</span>
        <ProjectStatusBadge status={item.status} lastError={item.lastError} />
      </div>
    </motion.div>
  );
}

// Download ZIP Card component
function DownloadZipCard({ inline = false }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob(["Mock zip file content representing generated codebase. Generated successfully!"], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "scaffold-codebase.zip";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setDownloaded(false), 3000);
    }, 2000);
  };

  const btn = (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={cn(
        "w-full py-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
        downloading
          ? "bg-white/[0.05] text-zinc-600 cursor-not-allowed border border-white/[0.07]"
          : downloaded
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
          : "bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] active:scale-[0.99]"
      )}
    >
      {downloading ? (
        <>
          <svg aria-hidden="true" className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Downloading...
        </>
      ) : downloaded ? (
        <><Check size={14} />Downloaded</>
      ) : (
        <><Download size={14} />Download ZIP</>
      )}
    </button>
  );

  // Inline mode: just the button (parent provides the card shell + file tree)
  if (inline) return btn;

  return (
    <div className="relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-5 shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <FileArchive size={18} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-white tracking-tight">ZIP Archive</h3>
          <p className="text-[11px] text-zinc-600">Full project bundle</p>
        </div>
      </div>
      <div className="bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 font-mono text-[11px] flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-500/50" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <span className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="ml-auto text-zinc-700 text-[10px]">scaffold.zip</span>
        </div>
        {[
          { icon: "📁", name: "backend/", sub: false },
          { icon: "📄", name: "server.js", sub: true },
          { icon: "📄", name: "routes/api.js", sub: true },
          { icon: "📁", name: "frontend/", sub: false },
          { icon: "📄", name: "src/App.jsx", sub: true },
          { icon: "📄", name: "schema.sql", sub: false },
        ].map((f, i) => (
          <div key={i} className={`flex items-center gap-2 ${f.sub ? "pl-4 text-zinc-600" : "text-zinc-500"}`}>
            <span className="text-[10px]">{f.icon}</span>
            <span>{f.name}</span>
          </div>
        ))}
        <div className="mt-auto pt-2 border-t border-white/[0.04] flex justify-between">
          <span className="text-zinc-700">3 dirs · 12 files</span>
          <span className="text-zinc-500 font-semibold">~2.4 MB</span>
        </div>
      </div>
      {btn}
    </div>
  );
}

export default function WebsiteGenerator() {
  // Simulation States
  const [simActive, setSimActive] = useState(false);
  const [simStage, setSimStage] = useState("harvest");
  const [simProgress, setSimProgress] = useState(0);
  const [simMessage, setSimMessage] = useState("Standing by...");
  const [simStatus, setSimStatus] = useState("queued");
  const [simIsPolling, setSimIsPolling] = useState(false);
  const [autoRefreshAlert, setAutoRefreshAlert] = useState(false);

  // Delivery Stage States
  const [repoData, setRepoData] = useState(null);
  const [pushedRepoInfo, setPushedRepoInfo] = useState(null);

  const handleGitPushSubmit = (formData) => {
    setPushedRepoInfo(formData);
    setSimStage("delivery");
    setSimProgress(0);
    setSimStatus("queued");
    setSimMessage("Initializing remote git worker...");
    setRepoData(null);
    setSimActive(true);
  };

  // Simulation loop handler
  useEffect(() => {
    if (!simActive) return;

    const simulationLogs = {
      harvest: [
        { progress: 5, msg: "Connecting to reference URL: https://example.com..." },
        { progress: 15, msg: "Fetching HTML source code and headers..." },
        { progress: 35, msg: "Parsing branding palette and styling tokens..." },
        { progress: 60, msg: "Extracting social profile links & contact info..." },
        { progress: 85, msg: "Downloading assets and parsing site headings..." },
        { progress: 100, msg: "Data Acquisition complete! Saved palette." },
      ],
      proposal: [
        { progress: 15, msg: "Connecting to database visualizer engine..." },
        { progress: 45, msg: "Compiling architectural spec mapping..." },
        { progress: 75, msg: "Generating indexes and relational mapping..." },
        { progress: 100, msg: "Architectural proposal generated successfully!" }
      ],
      scaffold: [
        { progress: 10, msg: "Generating database migrations (MySQL)..." },
        { progress: 30, msg: "Writing Node.js Express controllers and route maps..." },
        { progress: 50, msg: "Assembling React vite project workspace..." },
        { progress: 75, msg: "Compiling client components and static content..." },
        { progress: 95, msg: "Bundling production-ready ZIP archive file..." },
        { progress: 100, msg: "Codebase successfully generated and bundled!" },
      ],
      delivery: [
        { progress: 15, msg: "Initializing git repository locally..." },
        { progress: 40, msg: "Authenticating token with remote Git provider..." },
        { progress: 70, msg: "Pushing scaffold commit to remote branch 'main'..." },
        { progress: 90, msg: "Verifying webhooks and remote delivery status..." },
        { progress: 100, msg: "Repository pushed successfully! Open links unlocked." },
      ]
    };

    const logs = simulationLogs[simStage];
    let stepIndex = 0;
    setSimStatus("running");
    setSimProgress(0);
    setSimMessage("Initializing worker queue...");
    setAutoRefreshAlert(false);

    const interval = setInterval(() => {
      if (stepIndex < logs.length) {
        const current = logs[stepIndex];
        setSimProgress(current.progress);
        setSimMessage(current.msg);
        
        if (current.progress === 100) {
          setSimStatus("succeeded");
          clearInterval(interval);
          setSimActive(false);
          setAutoRefreshAlert(true);

          // Populate RepoViewer mock data when delivery simulation finishes
          if (simStage === "delivery") {
            setRepoData({
              provider: pushedRepoInfo?.provider || "github",
              repo_full_name: `user/${pushedRepoInfo?.repo_name || "bloom-coffee-0615"}`,
              html_url: pushedRepoInfo?.provider === "gitlab"
                ? `https://gitlab.com/user/${pushedRepoInfo?.repo_name || "bloom-coffee-0615"}`
                : `https://github.com/user/${pushedRepoInfo?.repo_name || "bloom-coffee-0615"}`,
              default_branch: "main",
              branches: ["main", "develop", "feature/initial-scaffold"],
              private: true,
              pushed_commit_sha: "7a1b2c3d5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u",
              token_saved: pushedRepoInfo?.save_token || false,
              created_at: new Date().toISOString()
            });
          }

          setTimeout(() => setAutoRefreshAlert(false), 4000);
        }
        stepIndex++;
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [simActive, simStage, pushedRepoInfo]);

  const triggerSimulation = (stage) => {
    setSimStage(stage);
    setSimActive(true);
  };

  const getStageTitle = (s) => {
    if (s === "harvest") return "Data Acquisition";
    if (s === "proposal") return "Proposal Review";
    if (s === "scaffold") return "Codebase Generation";
    return "Repository Delivery";
  };

  return (
    <div className="min-h-screen bg-[#030305] text-zinc-100 font-sans selection:bg-violet-900/60 selection:text-white overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-120px] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
        <div className="absolute top-[300px] right-[-80px] w-[400px] h-[400px] rounded-full bg-blue-500/[0.04] blur-[100px]" />
        <div className="absolute bottom-[100px] left-[30%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.03] blur-[80px]" />
      </div>

      <div className="relative p-6 md:p-10 max-w-[1240px] mx-auto space-y-10">

        {/* ── Premium Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 pt-2"
        >
          {/* Eyebrow label */}
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-gradient-to-r from-violet-500 to-transparent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-400">AI Automation</span>
          </div>

          <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight leading-[1.15]">
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Website Generator
            </span>
          </h1>
          <p className="text-[15px] text-zinc-500 max-w-xl leading-relaxed">
            Monitor background jobs, inspect terminal logs, and track real-time project generation status across the full AI pipeline.
          </p>

          {/* Quick stats strip */}
          <div className="flex items-center gap-5 mt-1">
            {[
              { label: "Pipeline Stages", value: "4" },
              { label: "Live Workers", value: "2" },
              { label: "Avg. Build Time", value: "~3 min" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-zinc-200">{stat.value}</span>
                <span className="text-[12px] text-zinc-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Live Workspace ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* ── Simulation Controls Panel ── */}
          <div id="sandbox-controls" className="lg:col-span-5 relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.07] rounded-2xl p-6 flex flex-col shadow-xl overflow-hidden">
            {/* card inner glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h3 className="text-[15px] font-semibold text-white tracking-tight">Sandbox Controls</h3>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">DEV</span>
              </div>
              <p className="text-[12px] text-zinc-600">
                Test pipeline states, triggers, and edge-case fallback modes.
              </p>

              <div className="flex flex-col gap-5">
                {/* Stage Select */}
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="btn-stage-harvest" className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">Target Stage</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["harvest", "proposal", "scaffold", "delivery"].map((s) => (
                      <button
                        key={s}
                        id={`btn-stage-${s}`}
                        onClick={() => {
                          setSimStage(s);
                          setSimProgress(0);
                          setSimStatus("queued");
                          setSimMessage("Ready to simulate...");
                          if (s !== "delivery") {
                            setRepoData(null);
                          }
                        }}
                        disabled={simActive}
                        className={cn(
                          "px-1 py-2 text-[11.5px] font-semibold capitalize rounded-lg border transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                          simStage === s
                            ? "bg-violet-600 text-white border-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                            : "bg-white/[0.04] text-zinc-500 border-white/[0.07] hover:bg-white/[0.08] hover:text-zinc-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Toggle (Manual Control) */}
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="btn-state-queued" className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">State Override</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "queued", color: "#eab308" },
                      { id: "running", color: "#3b82f6" },
                      { id: "succeeded", color: "#10b981" },
                      { id: "failed", color: "#ef4444" }
                    ].map((st) => (
                      <button
                        key={st.id}
                        id={`btn-state-${st.id}`}
                        onClick={() => {
                          setSimStatus(st.id);
                          if (st.id === "succeeded") {
                            setSimProgress(100);
                            if (simStage === "delivery") {
                              setRepoData({
                                provider: "github",
                                repo_full_name: "user/bloom-coffee-0615",
                                html_url: "https://github.com/user/bloom-coffee-0615",
                                default_branch: "main",
                                branches: ["main", "develop", "feature/initial-scaffold"],
                                private: true,
                                pushed_commit_sha: "7a1b2c3d5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u",
                                token_saved: false,
                                created_at: new Date().toISOString()
                              });
                            }
                          }
                          if (st.id === "failed") {
                            setSimMessage("Fatal: An unexpected system exception terminated the execution sequence.");
                            setRepoData(null);
                          }
                        }}
                        disabled={simActive}
                        className={cn(
                          "px-2 py-2 text-[11px] capitalize rounded-lg border transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                          simStatus === st.id
                            ? "bg-white/[0.1] text-white border-white/[0.2]"
                            : "bg-transparent text-zinc-600 border-white/[0.07] hover:bg-white/[0.05] hover:text-zinc-400"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 shrink-0" style={{ backgroundColor: st.color }} />
                        {st.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Control */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="input-manual-progress" className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">Manual Progress</label>
                    <span className="text-[11px] font-mono font-bold text-violet-400">{simProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simProgress}
                    disabled={simActive}
                    id="input-manual-progress"
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSimProgress(val);
                      if (val === 100) {
                        setSimStatus("succeeded");
                        if (simStage === "delivery") {
                          setRepoData({
                            provider: "github",
                            repo_full_name: "user/bloom-coffee-0615",
                            html_url: "https://github.com/user/bloom-coffee-0615",
                            default_branch: "main",
                            branches: ["main", "develop", "feature/initial-scaffold"],
                            private: true,
                            pushed_commit_sha: "7a1b2c3d5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u",
                            token_saved: false,
                            created_at: new Date().toISOString()
                          });
                        }
                      } else if (val > 0) {
                        setSimStatus("running");
                      }
                    }}
                    className={cn(
                      "w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                      simActive ? "opacity-40 cursor-not-allowed" : ""
                    )}
                    style={{
                      backgroundImage: `linear-gradient(90deg, #7c3aed ${simProgress}%, rgba(255,255,255,0.07) ${simProgress}%)`
                    }}
                  />
                  <style>{`
                    input[type=range]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 14px;
                      height: 14px;
                      border-radius: 50%;
                      background: #a78bfa;
                      cursor: pointer;
                      box-shadow: 0 0 8px rgba(124,58,237,0.6);
                    }
                  `}</style>
                </div>

                {/* Polling Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-black/30 border border-white/[0.06] rounded-xl">
                  <div>
                    <span className="block text-[13px] font-semibold text-zinc-300">Simulate Polling</span>
                    <span className="block text-[11px] text-zinc-600 mt-0.5">Test HTTP fallback behavior</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simIsPolling}
                      disabled={simActive}
                      id="input-simulate-polling"
                      onChange={(e) => setSimIsPolling(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      "w-10 h-[22px] rounded-full transition-all duration-300 relative peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-950", 
                      simIsPolling ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-white/[0.08]"
                    )}>
                      <div className={cn(
                        "absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200 shadow-sm", 
                        simIsPolling ? "left-[22px] bg-white" : "left-[3px] bg-zinc-500"
                      )} />
                    </div>
                  </label>
                </div>
                {/* Toast Test Buttons */}
                <div className="flex flex-col gap-2.5 pt-3.5 border-t border-white/[0.05]">
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">Test Toast Feedbacks</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "success", label: "Success", type: "success", title: "Scaffold Succeeded", message: "Codebase generated and bundled successfully!" },
                      { id: "info", label: "Info", type: "info", title: "Server Info", message: "Vite dev server is ready on port 5174." },
                      { id: "warn", label: "Warning", type: "warning", title: "State Warning", message: "Action invalid for current status." },
                      { id: "error", label: "Error", type: "error", title: "API Error (502)", message: "Git delivery failed (git_orchestration_error)." }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("showToast", { detail: { type: t.type, title: t.title, message: t.message } })
                          );
                        }}
                        className="py-1.5 text-[10px] font-semibold rounded bg-white/[0.03] border border-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 transition-all text-center focus:outline-none"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sim Button — flush at bottom */}
            <div className="mt-auto pt-4">
            <button
              onClick={() => triggerSimulation(simStage)}
              disabled={simActive}
              id="btn-start-simulation"
              className={cn(
                "w-full py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                simActive
                  ? "bg-white/[0.05] text-zinc-600 cursor-not-allowed border border-white/[0.07]"
                  : "bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] active:scale-[0.99]"
              )}
            >
              {simActive ? (
                <>
                  <svg aria-hidden="true" className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running Simulation...
                </>
              ) : (
                <>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Start Auto-Simulation
                </>
              )}
            </button>
            </div>
          </div>

          {/* ── JobProgressCard Integration ── */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {autoRefreshAlert && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
                    </span>
                    <span className="text-[13px] font-medium text-emerald-500">
                      Auto Refresh Triggered: Re-fetching project details...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full flex-1 flex flex-col">
              {simStage === "proposal" && simStatus === "succeeded" ? (
                <ProposalReviewPanel
                  proposal={MOCK_PROPOSAL}
                  onApprove={() => {
                    setSimStage("scaffold");
                    setSimProgress(0);
                    setSimStatus("queued");
                    setSimMessage("Ready to simulate...");
                  }}
                  onReHarvest={() => {
                    setSimStage("harvest");
                    setSimProgress(0);
                    setSimStatus("queued");
                    setSimMessage("Ready to simulate...");
                  }}
                />
              ) : simStage === "delivery" ? (
                simStatus === "running" || (simStatus === "queued" && pushedRepoInfo) ? (
                  <JobProgressCard
                    className="flex-1"
                    projectId="demo-project-id"
                    stage={simStage}
                    title={getStageTitle(simStage)}
                    simulate={true}
                    simulatedProgress={simProgress}
                    simulatedMessage={simMessage}
                    simulatedStatus={simStatus}
                    simulatedIsPolling={simIsPolling}
                    onComplete={() => {
                      setAutoRefreshAlert(true);
                      setTimeout(() => setAutoRefreshAlert(false), 4000);
                    }}
                    onFail={(err) => {
                      console.log("Stage failed callback triggered:", err);
                    }}
                    onRetry={() => {
                      triggerSimulation(simStage);
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-6">
                    {simStatus === "failed" && (
                      <JobProgressCard
                        projectId="demo-project-id"
                        stage={simStage}
                        title={getStageTitle(simStage)}
                        simulate={true}
                        simulatedProgress={simProgress}
                        simulatedMessage={simMessage}
                        simulatedStatus={simStatus}
                        simulatedIsPolling={simIsPolling}
                        onComplete={() => {
                          setAutoRefreshAlert(true);
                          setTimeout(() => setAutoRefreshAlert(false), 4000);
                        }}
                        onFail={(err) => {
                          console.log("Stage failed callback triggered:", err);
                        }}
                        onRetry={() => {
                          triggerSimulation(simStage);
                        }}
                      />
                    )}
                    
                    {/* ── Unified Delivery Options Card ── */}
                    <div className="relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
                      {/* Top edge shimmer */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

                      {/* Card Header */}
                      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div>
                          <h3 className="text-[15px] font-bold text-white tracking-tight">Delivery Options</h3>
                          <p className="text-[12px] text-zinc-600 mt-0.5">Download the archive or push directly to a remote Git repository.</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                          <span className="text-[10.5px] font-semibold text-emerald-400 uppercase tracking-widest">Ready</span>
                        </div>
                      </div>

                      {/* Two-column body */}
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">

                        {/* ── Left: ZIP Archive ── */}
                        <div className="p-6 flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                              <FileArchive size={18} />
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-white tracking-tight">ZIP Archive</p>
                              <p className="text-[11px] text-zinc-600">Full project bundle</p>
                            </div>
                          </div>

                          {/* Mini file tree */}
                          <div className="bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 font-mono text-[11px] flex flex-col gap-1.5 flex-1">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="w-2 h-2 rounded-full bg-red-500/50" />
                              <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                              <span className="w-2 h-2 rounded-full bg-green-500/50" />
                              <span className="ml-auto text-zinc-700 text-[10px]">scaffold.zip</span>
                            </div>
                            {[
                              { icon: "📁", name: "backend/", sub: false },
                              { icon: "📄", name: "server.js", sub: true },
                              { icon: "📄", name: "routes/api.js", sub: true },
                              { icon: "📁", name: "frontend/", sub: false },
                              { icon: "📄", name: "src/App.jsx", sub: true },
                              { icon: "📄", name: "schema.sql", sub: false },
                            ].map((f, i) => (
                              <div key={i} className={`flex items-center gap-2 ${f.sub ? "pl-4 text-zinc-600" : "text-zinc-500"}`}>
                                <span className="text-[10px]">{f.icon}</span>
                                <span>{f.name}</span>
                              </div>
                            ))}
                            <div className="mt-auto pt-2 border-t border-white/[0.04] flex justify-between">
                              <span className="text-zinc-700">3 dirs · 12 files</span>
                              <span className="text-zinc-500 font-semibold">~2.4 MB</span>
                            </div>
                          </div>

                          <DownloadZipCard inline />
                        </div>

                        {/* ── Right: Git Push ── */}
                        <div className="p-6">
                          {repoData ? (
                            <RepoViewer
                              inline
                              repoData={repoData}
                              onReset={() => {
                                setRepoData(null);
                                setPushedRepoInfo(null);
                                setSimStatus("queued");
                                setSimProgress(0);
                                setSimMessage("Standing by...");
                              }}
                            />
                          ) : (
                            <GitPushForm
                              inline
                              defaultRepoName="bloom-coffee-0615"
                              isSubmitting={simActive}
                              onSubmit={handleGitPushSubmit}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <JobProgressCard
                  className="flex-1"
                  projectId="demo-project-id"
                  stage={simStage}
                  title={getStageTitle(simStage)}
                  simulate={true}
                  simulatedProgress={simProgress}
                  simulatedMessage={simMessage}
                  simulatedStatus={simStatus}
                  simulatedIsPolling={simIsPolling}
                  onComplete={() => {
                    setAutoRefreshAlert(true);
                    setTimeout(() => setAutoRefreshAlert(false), 4000);
                  }}
                  onFail={(err) => {
                    console.log("Stage failed callback triggered:", err);
                  }}
                  onRetry={() => {
                    triggerSimulation(simStage);
                  }}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Pipeline Matrix ── */}
        <div className="pt-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-5 bg-gradient-to-r from-violet-500 to-transparent" />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-violet-400">Status Map</span>
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">Pipeline Matrix</h3>
            </div>
            <p className="text-[12px] text-zinc-600">{PIPELINE.length} pipeline stages</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PIPELINE.map((item, i) => (
              <StatusCard key={item.status} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* ── Badge Legend Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-gradient-to-b from-zinc-900/60 to-zinc-950 rounded-2xl p-6 border border-white/[0.07] flex flex-col md:flex-row items-center gap-5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[14px] font-semibold text-white tracking-tight">System Badges</span>
            <span className="text-[12px] text-zinc-600 mt-0.5">Global status identifiers</span>
          </div>
          <div className="w-full h-px md:w-px md:h-10 bg-white/[0.07]" />
          <div className="flex flex-wrap gap-2">
            {PIPELINE.map((item) => (
              <ProjectStatusBadge
                key={item.status}
                status={item.status}
                lastError={item.lastError}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
