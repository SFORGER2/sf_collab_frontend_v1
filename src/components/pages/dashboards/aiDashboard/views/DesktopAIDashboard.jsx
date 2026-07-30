import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Coins, Lock, Sparkles } from "lucide-react";
import { tools } from "../AITools";
import { isAiToolsLocked, getAiToolsLockRemainingDays } from "../../../../../utils/config.js";
import AITutorial from "../AITutorial";
import {
  AllowanceMeter, CosmosButton, Display, Eyebrow, Lede, PageShell, Panel, Reveal, Tag,
} from "@/components/cosmos";
import { useEntitlements } from "@/services/entitlements/useEntitlements";
import { CREDIT_COSTS } from "@/services/entitlements/entitlements";

/**
 * The AI suite.
 *
 * Every tool here spends credits, so the page leads with what you have and what
 * things cost rather than making you find out after clicking. Free tools (AI
 * News) are labelled as such.
 *
 * The hero is a live constellation: nodes drifting on orbital paths with a
 * pulsing core, built from CSS/SVG animation rather than an image so it stays
 * crisp at any size and costs nothing to load. It honours
 * `prefers-reduced-motion` through the cosmos animation guards.
 */

/** Which tools a role reaches for first — those float to the top of the grid. */
const ROLE_PRIORITY = {
  founder: ["Business Plan AI", "AI Matchmaking", "Startup Logo Generator", "Landing Page Generator"],
  builder: ["Qwen AI Chat", "AI Matchmaking", "Data Scraper AI", "Multimodal Image AI"],
  influencer: ["Caption Generator", "Video Generator", "Multimodal Image AI", "AI Matchmaking"],
  investor: ["AI Matchmaking", "Data Scraper AI", "AI News", "Business Plan AI"],
  mentor: ["AI Matchmaking", "Qwen AI Chat", "AI News"],
  member: ["AI Matchmaking", "Qwen AI Chat", "AI News"],
};

/** Credit cost per tool. Free tools are explicitly zero. */
const TOOL_COST = {
  "Business Plan AI": CREDIT_COSTS.businessPlan,
  "Multimodal Image AI": CREDIT_COSTS.imageGeneration,
  "Startup Logo Generator": CREDIT_COSTS.logoGeneration,
  "Data Scraper AI": CREDIT_COSTS.dataScrape,
  "Qwen AI Chat": CREDIT_COSTS.assistantMessage,
  "Video Generator": CREDIT_COSTS.videoGeneration,
  "Caption Generator": CREDIT_COSTS.captionGeneration,
  "Landing Page Generator": CREDIT_COSTS.aiGeneration,
  "AI Matchmaking": CREDIT_COSTS.matchSuggestion,
  "Web Generator": CREDIT_COSTS.aiGeneration,
  "AI News": 0,
};

/** Maps the legacy tailwind gradient strings onto cosmos accents. */
const ACCENT_FOR = {
  "Business Plan AI": "#8b6cff",
  "Multimodal Image AI": "#4fd8ff",
  "Startup Logo Generator": "#ff4fd8",
  "Data Scraper AI": "#3ee6a0",
  "Qwen AI Chat": "#ffbf5e",
  "Video Generator": "#ff4fd8",
  "Caption Generator": "#ffbf5e",
  "Landing Page Generator": "#a9a2c2",
  "AI Matchmaking": "#8b6cff",
  "AI News": "#3ee6a0",
  "Web Generator": "#4fd8ff",
};

/** Decorative constellation. Pure SVG + CSS, no asset to download. */
function Constellation() {
  const nodes = [
    { cx: 22, cy: 30, r: 2.4, c: "#ffbf5e", d: 0 },
    { cx: 44, cy: 18, r: 1.8, c: "#4fd8ff", d: 0.6 },
    { cx: 68, cy: 34, r: 2.1, c: "#8b6cff", d: 1.2 },
    { cx: 82, cy: 62, r: 1.6, c: "#ff4fd8", d: 1.8 },
    { cx: 55, cy: 74, r: 2.2, c: "#3ee6a0", d: 2.4 },
    { cx: 28, cy: 66, r: 1.7, c: "#4fd8ff", d: 3.0 },
  ];

  // `meet` keeps the constellation square and sized to the panel height. With
  // `slice` on a wide panel it scaled up to cover, turning the core into an
  // enormous blob across the middle of the hero.
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-auto pointer-events-none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Orbits */}
      {[26, 38, 48].map((r, i) => (
        <circle
          key={r}
          cx="50" cy="50" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="0.3"
          style={{
            transformOrigin: "50px 50px",
            animation: `cosmosOrbit ${34 + i * 12}s linear infinite ${i % 2 ? "reverse" : ""}`,
          }}
          strokeDasharray={i === 1 ? "2 4" : undefined}
        />
      ))}

      {/* Connecting threads */}
      {nodes.map((n, i) => {
        const next = nodes[(i + 1) % nodes.length];
        return (
          <line
            key={`l-${i}`}
            x1={n.cx} y1={n.cy} x2={next.cx} y2={next.cy}
            stroke={n.c}
            strokeWidth="0.18"
            opacity="0.28"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={`n-${i}`}
          cx={n.cx} cy={n.cy} r={n.r}
          fill={n.c}
          style={{ animation: `cosmosNodePulse 4.2s ease-in-out ${n.d}s infinite` }}
        />
      ))}

      {/* Core */}
      <circle cx="50" cy="50" r="5" fill="#ffbf5e" opacity="0.16" />
      <circle
        cx="50" cy="50" r="2.6" fill="#ffbf5e"
        style={{ animation: "cosmosNodePulse 3s ease-in-out infinite" }}
      />
    </svg>
  );
}

export default function AIDashboard() {
  const locked = isAiToolsLocked();
  const daysRemaining = getAiToolsLockRemainingDays();
  const { credits, plan } = useEntitlements();
  const role = localStorage.getItem("activeRole") || "member";

  // Role-relevant tools first, everything else after, original order preserved.
  const priority = ROLE_PRIORITY[role] || ROLE_PRIORITY.member;
  const ordered = [...tools].sort((a, b) => {
    const ai = priority.indexOf(a.name);
    const bi = priority.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <PageShell width="wide" showAd={false}>
      <AITutorial />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Panel className="relative overflow-hidden p-7 sm:p-10 mb-6" accent="#8b6cff">
        {/* Anchored right so it decorates rather than sits behind the copy */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex justify-end opacity-70">
          <Constellation />
        </div>
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: "-10%", top: "-60%", width: "560px", height: "560px",
            background: "radial-gradient(circle, rgba(139,108,255,0.18) 0%, transparent 62%)",
          }}
        />

        <div className="relative max-w-[62ch]">
          <div className="flex items-center gap-2.5 mb-4">
            <Eyebrow>AI Suite</Eyebrow>
            <Tag tone="planned">{plan.name} Plan</Tag>
          </div>

          <Display size="xl" className="mb-4">
            Intelligence That Knows Your Startup.
          </Display>

          <Lede>
            Every tool here shares your Vision's context — so you describe your company once,
            not once per tool.
          </Lede>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <CosmosButton
              variant="ai"
              onClick={() => window.dispatchEvent(new CustomEvent("sfassistant:open"))}
            >
              <Sparkles size={15} /> Ask SF Assistant
            </CosmosButton>

            <CosmosButton variant="quiet" asChild>
              <Link to="/credits">
                <Coins size={14} /> {credits.toLocaleString()} Credits
              </Link>
            </CosmosButton>

            <AllowanceMeter
              limitKey="aiGenerationsPerDay"
              creditKey="aiGeneration"
              label="generations left today"
            />
          </div>
        </div>
      </Panel>

      {locked && (
        <Panel className="p-5 mb-6" accent="#ffbf5e">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-[1rem] text-star">AI Tools Unlock Soon</h2>
              <p className="text-[0.88rem] text-dim mt-1">
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining until the suite
                opens for your account.
              </p>
            </div>
          </div>
        </Panel>
      )}

      {/* ── Tool grid ────────────────────────────────────────────────────── */}
      <Reveal
        stagger
        className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(255px,1fr))]"
      >
        {ordered.map((tool) => {
          const Icon = tool.icon;
          const accent = ACCENT_FOR[tool.name] || "#8b6cff";
          const cost = TOOL_COST[tool.name] ?? CREDIT_COSTS.aiGeneration;
          const unavailable = tool.available === false || locked;
          const isPriority = priority.includes(tool.name);

          const card = (
            <motion.div
              whileHover={unavailable ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className={`cosmos-card h-full p-5 flex flex-col gap-3 ${
                unavailable ? "opacity-55" : "cosmos-card-interactive"
              }`}
              style={{ "--cosmos-accent": accent }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${accent}1f`, color: accent }}
                >
                  <Icon className="w-5 h-5" />
                </span>

                {cost === 0 ? (
                  <Tag tone="live">Free</Tag>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-dim">
                    <Coins size={11} /> {cost}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-display text-[1.02rem] text-star leading-snug">
                  {tool.name}
                </h3>
                <p className="text-[0.86rem] text-dim mt-1.5">{tool.description}</p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-auto">
                {tool.available === false ? (
                  <Tag tone="planned">Coming Soon</Tag>
                ) : isPriority ? (
                  <Tag tone="accent">For You</Tag>
                ) : (
                  <span />
                )}
                {!unavailable && (
                  <ArrowRight
                    className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: accent }}
                  />
                )}
              </div>
            </motion.div>
          );

          return unavailable ? (
            <div key={tool.name} className="cursor-not-allowed">{card}</div>
          ) : (
            <Link key={tool.name} to={tool.path} className="group block h-full">
              {card}
            </Link>
          );
        })}
      </Reveal>

      <Panel className="p-6 mt-6">
        <Eyebrow className="mb-3">How Credits Work</Eyebrow>
        <ul className="flex flex-col gap-2 text-[0.9rem] text-dim">
          <li>Each plan includes a daily allowance. Credits cover anything beyond it.</li>
          <li>Longer outputs cost more — a short answer and a full business plan are not the same work.</li>
          <li>AI News and the knowledge base are always free and never consume credits.</li>
        </ul>
        <div className="flex flex-wrap gap-2.5 mt-5">
          <CosmosButton variant="primary" size="sm" asChild>
            <Link to="/credits">Buy Credits</Link>
          </CosmosButton>
          <CosmosButton variant="quiet" size="sm" asChild>
            <Link to="/plans">Compare Plans</Link>
          </CosmosButton>
        </div>
      </Panel>
    </PageShell>
  );
}
