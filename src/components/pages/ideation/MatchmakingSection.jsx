import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, ExternalLink, ChevronRight, ChevronDown, Check, Coins, Sparkles } from "lucide-react";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { AllowanceMeter, CosmosButton, Eyebrow, Panel } from "@/components/cosmos";
import { useEntitlements } from "@/services/entitlements/useEntitlements";
import { CREDIT_COSTS } from "@/services/entitlements/entitlements";

export const MatchCard = ({ recommendation }) => {
  const builder = recommendation.user || recommendation.builder || recommendation || {};
  const id = builder.id || builder.user_id || recommendation.user_id || recommendation.id;
  
  const firstName = builder.firstName || builder.first_name || "";
  const lastName = builder.lastName || builder.last_name || "";
  const fullName = builder.name || `${firstName} ${lastName}`.trim() || "Collaborator";
  const role = builder.role || builder.title || (builder.profile && (builder.profile.role || builder.profile.title)) || "Builder";
  
  const score = recommendation.match_score ?? recommendation.matchScore ?? recommendation.score ?? 0;
  const label = recommendation.match_label || recommendation.matchLabel || recommendation.label || "";
  const skills = recommendation.skills || builder.skills || (builder.profile && builder.profile.skills) || [];
  const explanation = recommendation.explanation || recommendation.why_matched || recommendation.match_explanation || [];
  
  const profilePic = getProfilePicture(builder);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "C";

  const explanationItems = Array.isArray(explanation)
    ? explanation
    : typeof explanation === "string"
    ? [explanation]
    : [];

  return (
    <div className="flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden group transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]">
      {/* Ambient glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 70% 0%, rgba(59,130,246,0.07) 0%, transparent 60%)",
        }}
      />
      {/* Top shimmer */}
      <div className="absolute -inset-px rounded-3xl pointer-events-none"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 40%)",
        }}
      />

      {/* Top Header Section */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        {profilePic ? (
          <img
            src={profilePic}
            alt={fullName}
            loading="lazy"
            className="w-14 h-14 rounded-full border border-white/20 object-cover shadow-sm flex-shrink-0"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          style={{ display: profilePic ? "none" : "flex" }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 items-center justify-center text-base font-bold text-blue-300 shadow-sm flex-shrink-0"
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white text-base truncate tracking-tight group-hover:text-blue-300 transition-colors duration-300">{fullName}</h3>
          <p className="text-xs text-blue-400 font-medium truncate mt-0.5">{role}</p>
        </div>
      </div>

      {/* Scores & Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          score >= 85 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
            : score >= 70 
            ? 'bg-blue-500/10 border-blue-500/25 text-blue-400' 
            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            score >= 85 ? 'bg-emerald-400' : score >= 70 ? 'bg-blue-400' : 'bg-amber-400'
          }`} />
          {score}% Match
        </div>
        {label && (
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-gray-300 bg-white/5 font-medium">
            {label}
          </span>
        )}
      </div>

      {/* Skills badges */}
      {skills.length > 0 && (
        <div className="mb-5 relative z-10">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-white/[0.03] text-gray-300 text-[11px] px-2.5 py-1 rounded-lg border border-white/[0.06] transition-all hover:bg-white/[0.08]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match Explanation */}
      {explanationItems.length > 0 && (
        <div className="mb-6 flex-1 relative z-10">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Why Matched</h4>
          <ul className="space-y-2" role="list">
            {explanationItems.map((item, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-2.5 leading-relaxed">
                <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* View Profile Action Link */}
      <div className="mt-auto pt-4 border-t border-white/[0.06] relative z-10">
        <Link
          to={`/user-profile?userId=${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:border-blue-500/30 bg-white/[0.02] hover:bg-blue-500/10 text-slate-300 hover:text-white text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          View Profile
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

/** How many matches are included before credits are required. */
const FREE_MATCHES = 10;

/**
 * Recommended builders, metered.
 *
 * The first `FREE_MATCHES` are included with any plan; past that each batch is
 * unlocked with credits. This is the panel a founder actually recruits from, so
 * it's also where the AI matchmaking spend happens.
 *
 * `viewerRole` gates the whole panel: only the Vision's owner (or a founder)
 * should see a list of builders. A builder looking at someone else's Vision gets
 * nothing here — showing them their own competition was the original bug.
 *
 * ⚠️ Frontend shaping only. The backend must enforce the same cap.
 */
export const MatchmakingSection = ({
  recommendations = [],
  loading = false,
  canRecruit = true,
}) => {
  const [unlocked, setUnlocked] = useState(FREE_MATCHES);
  const { check, spend, credits } = useEntitlements();
  const status = check('matchSuggestionsPerDay', 'matchSuggestion');
  const cost = CREDIT_COSTS.matchSuggestion;

  if (!canRecruit) return null;

  const visible = recommendations.slice(0, unlocked);
  const remaining = Math.max(0, recommendations.length - unlocked);

  const handleUnlock = () => {
    if (spend('matchSuggestionsPerDay', 'matchSuggestion')) {
      setUnlocked((n) => n + FREE_MATCHES);
    }
  };

  return (
    <Panel className="p-6 sm:p-8" accent="#4fd8ff">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>AI Matchmaking</Eyebrow>
          <h2 className="font-display text-[1.25rem] text-star mt-1.5 flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan" />
            Recommended Builders
          </h2>
          <p className="text-[0.88rem] text-dim mt-1">
            Ranked by how well their skills fit the roles this Vision needs.
          </p>
        </div>
        <AllowanceMeter
          limitKey="matchSuggestionsPerDay"
          creditKey="matchSuggestion"
          label="unlocks left today"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">
            Finding matches
          </span>
        </div>
      ) : recommendations.length === 0 ? (
        <p className="text-[0.9rem] text-dim py-10 text-center">
          No suitable collaborators yet — add the roles you need to your Vision so matchmaking
          has something to work with.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map((rec, index) => (
              <MatchCard key={rec.id || rec.user_id || index} recommendation={rec} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-white/10">
            {remaining > 0 ? (
              <>
                <CosmosButton
                  variant="primary"
                  size="sm"
                  disabled={!status.allowed}
                  onClick={handleUnlock}
                >
                  <Coins size={14} />
                  Unlock {Math.min(FREE_MATCHES, remaining)} More
                  {status.reason === 'credits' && ` · ${cost} Credits`}
                </CosmosButton>

                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
                  Showing {visible.length} of {recommendations.length} · {credits} credits
                </span>

                {!status.allowed && (
                  <CosmosButton variant="quiet" size="sm" asChild>
                    <Link to="/credits"><Sparkles size={13} /> Get Credits</Link>
                  </CosmosButton>
                )}
              </>
            ) : (
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
                All {recommendations.length} matches shown
              </span>
            )}
          </div>

          {!status.allowed && remaining > 0 && (
            <p className="text-[0.85rem] text-dim mt-3">
              You've used today's included matches. Unlock more with credits, or upgrade for a
              larger daily allowance.
            </p>
          )}
        </>
      )}
    </Panel>
  );
};

export default MatchmakingSection;
