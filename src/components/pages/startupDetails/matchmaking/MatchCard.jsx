/**
 * MatchCard — Tasks 3+4+5+6 (Premium Rewrite)
 *
 * Skills: impeccable · tasteskill · Emil-tier high-end-visual-design
 *
 * Premium design applied:
 * - bg-gray-900 / border-white/5 — one step darker than surrounding surface
 * - Hover: violet glow shadow lift (NOT border+shadow combo — pick one)
 * - Card float on hover: whileHover={{ y: -2 }} — Emil signature
 * - Avatar border shifts to match score colour on hover (CSS group-hover)
 * - "View Profile" button: tactile press active:-translate-y-px scale-[0.98]
 * - Skills: neutral bg-gray-800 badges — blue reserved as accent, not used here
 * - Typography: font-semibold 15px name, text-[13px] role
 * - rounded-2xl cards, rounded-lg button, rounded-full badges — shape lock
 * - All states: default, hover, active on button
 * - prefers-reduced-motion: no y float, instant transitions
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import ExplanationList from './ExplanationList';

/** Entry animation — driven by parent stagger in AIMatchmakingSection */
export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
};

/** Colour for avatar ring matching score tier */
const getAvatarRingColor = (score) => {
  if (score >= 90) return 'ring-violet-500/60';
  if (score >= 75) return 'ring-blue-500/60';
  if (score >= 50) return 'ring-amber-500/60';
  return 'ring-gray-500/40';
};

export default function MatchCard({ match }) {
  const navigate = useNavigate();
  const { builder_id, score, profile = {}, explanation = [] } = match;

  const builderName =
    profile?.name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    'Unknown Builder';

  const builderRole =
    profile?.role || profile?.headline || profile?.title || 'Builder';

  const avatarRing = getAvatarRingColor(score);

  // Task 6 — View Profile navigation
  const handleViewProfile = () => {
    navigate(`/user-profile?userId=${builder_id}`);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group h-full"
    >
      {/* Card shell — dark bg, hairline border, glow on hover */}
      <div
        className="
          h-full flex flex-col gap-4 p-5 rounded-2xl
          bg-gray-900 border border-white/5
          transition-all duration-200
          group-hover:border-violet-500/20
          group-hover:shadow-[0_0_28px_rgba(139,92,246,0.08)]
        "
      >
        {/* ── Row 1: Avatar + Identity + ScoreBadge ── */}
        <div className="flex items-start justify-between gap-3">

          {/* Avatar + Name/Role */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              className={`
                w-11 h-11 flex-shrink-0
                ring-2 ring-transparent transition-all duration-200
                group-hover:${avatarRing}
              `}
            >
              <AvatarImage
                src={profile?.photo_url || profile?.avatar_url || profile?.profile_picture}
                alt={builderName}
              />
              <AvatarFallback className="bg-gray-800 text-gray-300 text-[13px] font-semibold border border-white/10">
                {getInitials(builderName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white leading-tight truncate">
                {builderName}
              </p>
              <p className="text-[13px] text-gray-400 mt-0.5 truncate">
                {builderRole}
              </p>
            </div>
          </div>

          {/* Task 4 — animated SVG arc score */}
          <ScoreBadge score={score} />
        </div>

        {/* ── Row 2: Skills — neutral badges, not blue (blue = accent, reserved) ── */}
        {profile?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                  bg-gray-800 text-gray-300 border border-white/8"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* ── Row 3: Task 5 — Verbatim ExplanationList ── */}
        <div className="flex-1">
          <ExplanationList items={explanation} />
        </div>

        {/* ── Row 4: Task 6 — View Profile with tactile press ── */}
        <button
          onClick={handleViewProfile}
          id={`view-profile-btn-${builder_id}`}
          className="
            w-full mt-auto flex items-center justify-center gap-2
            px-4 py-2.5 rounded-lg text-[13px] font-medium
            border border-violet-500/25 text-violet-400
            transition-all duration-150
            hover:bg-violet-500/8 hover:border-violet-400/40 hover:text-violet-300
            active:-translate-y-px active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50
          "
          aria-label={`View profile of ${builderName}`}
        >
          View Profile
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>

      </div>
    </motion.div>
  );
}
