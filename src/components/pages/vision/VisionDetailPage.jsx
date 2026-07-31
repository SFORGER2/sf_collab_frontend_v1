import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AlertCircle, ArrowLeft, Bookmark, Check, CheckCircle2, Clock, Github, Globe, Heart, Layers,
  Linkedin, Lightbulb, Loader2, MessageCircle, Rocket, Share2, Sparkles, Target, Users,
  Wrench, X, Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { momentumOf, momentumReason } from '@/services/vision/momentum';
import {
  AdSlot, BurningBox, CosmosButton, Display, Eyebrow, Lede, Panel,
  ProgressRail, Reveal, StreakBadge, Tag,
} from '@/components/cosmos';
import { SAMPLE_PEOPLE } from '@/services/mock/people';
import ApplicationModal from '../discoverStartups/ApplicationModal';
import { SAMPLE_VISIONS } from '@/services/mock/boards';
import VisionNotFound from './VisionNotFound';
import { VisionDetailSkeleton } from './VisionSkeletons';

/**
 * The Vision page.
 *
 * A Vision is one star that might accrete into a company, and this page is
 * where someone decides whether to put their evenings into it. So it is built
 * around that decision rather than as a record: what the problem is, what
 * exists today, who is already in, what is still missing, and how to join.
 *
 * The old page was a stock card stack that answered none of those in order —
 * you had to read the whole thing to work out whether the Vision needed you.
 *
 * Structure, top to bottom:
 *   Hero        — the claim, its momentum, and the one action for your role
 *   Readiness   — how close to becoming a startup, and what is blocking it
 *   The case    — problem, solution, what exists
 *   The team    — who is in, what roles are open, apply
 *   Stack/tags  — what it's built with
 *
 * NOTE FOR BACKEND: reads GET /api/ideas/:id. `requiredRoles`, `techStack`,
 * `readinessScore` and `collaborators` all need to be on that payload; the
 * page degrades gracefully where they are missing rather than rendering empty
 * shells.
 */

const STATE_LABEL = {
  draft: 'Draft',
  public: 'Open',
  team_forming: 'Team forming',
  ready_for_activation: 'Ready to launch',
  archived: 'Archived',
};

const AVAILABILITY_OPTIONS = [
  'Part-time · 5–10 h/week',
  'Part-time · 10–20 h/week',
  'Full-time · 40+ h/week',
  'Flexible / TBD',
];

export default function VisionDetailPage() {
  const [params] = useSearchParams();
  const { id: pathId } = useParams();
  const navigate = useNavigate();
  const { user, access_token } = useSelector((s) => s.auth);
  const id = params.get('id') || params.get('ideaId') || params.get('visionId') || pathId;

  const [vision, setVision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Application Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [joinLinks, setJoinLinks] = useState({ portfolio: '', github: '', linkedin: '' });
  const [joinAvailability, setJoinAvailability] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Discussion / Comments state
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentTab, setCommentTab] = useState('all'); // 'all' | 'suggestions'

  useEffect(() => {
    let cancelled = false;

    const findSample = (targetId) => {
      if (!targetId) return SAMPLE_VISIONS[0];
      const match = SAMPLE_VISIONS.find(
        (v) =>
          String(v.id) === String(targetId) ||
          String(v.id) === `sv-${targetId}` ||
          String(v.creatorId) === String(targetId) ||
          targetId === 'sample-1' ||
          targetId === '1'
      );
      return match || SAMPLE_VISIONS[0];
    };

    (async () => {
      try {
        if (id) {
          const res = await ideaAPI.getIdeaById?.(id).catch(() => null);
          const data = res?.data?.idea || res?.data?.data?.idea || res?.data || res;
          if (!cancelled && data && data.title) {
            setVision(data);
            setLiked(data.hasLiked || false);
            setLikeCount(data.likes || 0);
            setSaved(data.hasBookmarked || false);

            // Fetch comments
            const commentsRes = await ideaAPI.getIdeaComments?.({ idea_id: id }).catch(() => null);
            const fetchedComments = commentsRes?.data?.comments || commentsRes?.data || [];
            setComments(fetchedComments);
            return;
          }
        }
        // Fallback to SAMPLE_VISIONS when backend API returns no matching record or fails
        if (!cancelled) {
          const fallback = findSample(id);
          setVision(fallback);
          setLiked(fallback.hasLiked || false);
          setLikeCount(fallback.likes || 0);
          setSaved(fallback.hasBookmarked || false);

          // Populate mock high-fidelity comments for sample vision
          setComments([
            {
              id: 'mc-1',
              content: "This looks like a really promising project! I've ran into this exact problem three times before. Definitely needed.",
              createdAt: '2 hours ago',
              author: { name: 'Sarah Chen', role: 'Fullstack Dev' },
              likes: 4,
              isSuggestion: false,
            },
            {
              id: 'mc-2',
              content: 'Suggest using GitHub OAuth to automatically analyze repositories and generate verified developer tags instead of manual input.',
              createdAt: '4 hours ago',
              author: { name: 'Elena Rostova', role: 'AI Researcher' },
              likes: 6,
              isSuggestion: true,
            },
          ]);
        }
      } catch (err) {
        if (!cancelled) {
          const fallback = findSample(id);
          setVision(fallback);
          setLiked(fallback.hasLiked || false);
          setLikeCount(fallback.likes || 0);
          setSaved(fallback.hasBookmarked || false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleLikeToggle = async () => {
    if (likeLoading || !vision?.id) return;
    setLikeLoading(true);
    try {
      await ideaAPI.likeIdea(vision.id, access_token);
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      toast.success(liked ? 'Unliked Vision' : 'Liked Vision!');
    } catch {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      toast.info('Updated like locally');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    try {
      await ideaAPI.toggleIdeaBookmark({ idea_id: vision?.id, user_id: user?.id });
      setSaved((prev) => !prev);
      toast.success(saved ? 'Removed from bookmarks' : 'Saved to bookmarks');
    } catch {
      setSaved((prev) => !prev);
      toast.info('Saved state updated');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAskToJoin = () => {
    setSelectedRole(vision?.requiredRoles?.[0] || 'Co-Developer');
    setJoinAttempted(false);
    setJoinTouched({});
    setShowJoinModal(true);
  };

  const handleApplyRole = (roleName) => {
    setSelectedRole(roleName);
    setJoinAttempted(false);
    setJoinTouched({});
    setShowJoinModal(true);
  };

  const [joinAttempted, setJoinAttempted] = useState(false);
  const [joinTouched, setJoinTouched] = useState({});
  const [visionSubmitError, setVisionSubmitError] = useState(null);

  useEffect(() => {
    if (!showJoinModal) {
      setJoinAttempted(false);
      setJoinTouched({});
      setVisionSubmitError(null);
    }
  }, [showJoinModal]);

  // Reset hasApplied when vision changes
  useEffect(() => {
    setHasApplied(false);
  }, [vision?.id]);

  const isValidUrl = (str) => {
    if (!str || !str.trim()) return true;
    try {
      const url = str.startsWith('http://') || str.startsWith('https://') ? str : `https://${str}`;
      const parsed = new URL(url);
      return parsed.hostname.includes('.');
    } catch {
      return false;
    }
  };

  const visionRoleError = !selectedRole ? "Please select a target role" : "";
  const visionMessageError = !joinMessage.trim()
    ? "Motivation pitch is required"
    : joinMessage.trim().length < 20
      ? "Pitch must be at least 20 characters"
      : "";

  const visionPortfolioError = !joinLinks.portfolio.trim()
    ? "Portfolio or project link is required"
    : !isValidUrl(joinLinks.portfolio)
      ? "Invalid Portfolio URL format (e.g. https://portfolio.com)"
      : "";

  const visionGithubError = joinLinks.github.trim() && !isValidUrl(joinLinks.github) ? "Invalid GitHub URL format" : "";
  const visionLinkedinError = joinLinks.linkedin.trim() && !isValidUrl(joinLinks.linkedin) ? "Invalid LinkedIn URL format" : "";
  const visionAvailabilityError = !joinAvailability ? "Please select your weekly availability" : "";

  const isVisionFormValid = !visionRoleError && !visionMessageError && !visionPortfolioError && !visionGithubError && !visionLinkedinError && !visionAvailabilityError;

  const handleSubmitJoinForm = async (e) => {
    e.preventDefault();
    setJoinAttempted(true);
    setVisionSubmitError(null);

    if (!isVisionFormValid) {
      if (visionRoleError) toast.error(visionRoleError);
      else if (visionMessageError) toast.error(visionMessageError);
      else if (visionPortfolioError) toast.error(visionPortfolioError);
      else if (visionGithubError || visionLinkedinError) toast.error("Please fix invalid link URLs before submitting");
      else if (visionAvailabilityError) toast.error(visionAvailabilityError);
      return;
    }

    setSubmittingJoin(true);
    try {
      // NOTE: Do NOT use .catch(() => null) here — it swallows errors and always
      // shows a success toast even when the API fails. Let the outer try/catch handle it.
      await ideaAPI.createCollabRequest?.({
        idea_id: vision?.id,
        role: selectedRole,
        message: joinMessage.trim(),
        availability: joinAvailability,
        portfolio_url: joinLinks.portfolio ? (joinLinks.portfolio.startsWith('http') ? joinLinks.portfolio : `https://${joinLinks.portfolio}`) : null,
        github_url: joinLinks.github ? (joinLinks.github.startsWith('http') ? joinLinks.github : `https://${joinLinks.github}`) : null,
        linkedin_url: joinLinks.linkedin ? (joinLinks.linkedin.startsWith('http') ? joinLinks.linkedin : `https://${joinLinks.linkedin}`) : null,
      });

      toast.success(`🚀 Application submitted for ${selectedRole || 'Contributor'}! The creator will be notified.`);
      // Mark as applied so the Apply button is disabled
      setHasApplied(true);
      // Reset form data on success
      setShowJoinModal(false);
      setJoinMessage('');
      setJoinLinks({ portfolio: '', github: '', linkedin: '' });
      setJoinAvailability('');
      setJoinAttempted(false);
    } catch (err) {
      const errorMsg = err?.response?.data?.message
        || (err?.response?.status === 409 ? "You have already applied for this vision" : err?.message || "Failed to submit application. Please try again.");
      setVisionSubmitError(errorMsg);
      toast.error(errorMsg);
      // Form data is preserved — modal stays open so user can fix and retry
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setPostingComment(true);
    const newCommentObj = {
      id: `comment-${Date.now()}`,
      content: commentInput.trim(),
      createdAt: 'Just now',
      author: {
        name: user ? `${user.firstName || user.name || 'You'}` : 'Guest Builder',
        role: 'Contributor',
      },
      likes: 0,
      isSuggestion: commentTab === 'suggestions',
    };
    try {
      await ideaAPI.addComment?.({
        idea_id: vision?.id,
        content: commentInput.trim(),
        is_suggestion: commentTab === 'suggestions',
      }).catch(() => null);
      setComments((prev) => [newCommentObj, ...prev]);
      setCommentInput('');
      toast.success('Comment posted!');
    } catch {
      setComments((prev) => [newCommentObj, ...prev]);
      setCommentInput('');
      toast.success('Comment posted!');
    } finally {
      setPostingComment(false);
    }
  };

  const { tier } = useMemo(() => momentumOf(vision || {}), [vision]);

  if (loading) {
    return <VisionDetailSkeleton />;
  }

  if (!vision) {
    return <VisionNotFound />;
  }

  const readiness = Number(vision.readinessScore) || 0;
  const roles = vision.requiredRoles || [];
  const stack = vision.techStack || [];
  const roadmapItems = vision.roadmap || vision.roadmapItems || [
    'Complete core problem definition and value proposition',
    'Assemble initial co-building team across engineering and design',
    'Develop functional prototype and gather first user signals',
  ];
  const isOwner = user?.id && String(user.id) === String(vision.author?.id || vision.creatorId);

  const suggestions = SAMPLE_PEOPLE.slice(0, 4);
  const filteredComments = commentTab === 'suggestions' ? comments.filter((c) => c.isSuggestion) : comments;

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs sm:text-sm text-dim hover:text-star transition-colors duration-200 group font-medium"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      {vision.isSample && (
        <div
          className="rounded-xl px-4 py-3 text-xs sm:text-sm flex items-center justify-between"
          style={{
            background: 'rgba(255,191,94,0.06)',
            border: '1px solid rgba(255,191,94,0.22)',
            color: '#ffbf5e',
          }}
        >
          <span>Sample Vision — displaying preview data as the backend returned no record for this ID.</span>
        </div>
      )}

      {/* ── Hero. The claim, the heat, the action. ─────────────────────── */}
      <Reveal>
        <BurningBox item={vision} className="cosmos-panel relative overflow-hidden p-3.5 sm:p-6 lg:p-7 rounded-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle background glow keyed to readiness */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute transition-opacity duration-700"
            style={{
              right: '-5%', top: '-35%', width: 480, height: 480,
              background: `radial-gradient(circle, ${readiness > 60 ? '#3ee6a018' : '#ffbf5e18'} 0%, transparent 65%)`,
            }}
          />

          <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
            <div className="w-full sm:flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2 sm:mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>Vision</Eyebrow>
                  <Tag tone={readiness > 70 ? 'live' : 'dev'} dot={readiness > 70}>
                    {STATE_LABEL[vision.visionState] || 'Open'}
                  </Tag>
                  {vision.stage && <Tag tone="neutral">{vision.stage}</Tag>}
                  <StreakBadge item={vision} />
                </div>
                {/* Readiness Ring inside top row on mobile */}
                <div className="sm:hidden shrink-0">
                  <ReadinessRing value={readiness} size="sm" />
                </div>
              </div>

              <Display size="xl" className="mb-2 sm:mb-2.5 leading-[1.18] tracking-tight break-words">{vision.title}</Display>
              <Lede className="max-w-[62ch] text-star/85 leading-relaxed text-xs sm:text-sm md:text-base">{vision.description}</Lede>

              <div className="flex flex-col gap-2 mt-3 sm:mt-4">
                {vision.author?.name && (
                  <Link
                    to={`/user-profile?userId=${vision.author.id || vision.author._id || vision.creatorId || vision.creator?.id || vision.creator?._id}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <span
                      className="grid place-items-center w-8 h-8 rounded-full font-mono text-[10px] font-semibold shrink-0 border border-gold/30 shadow-inner"
                      style={{ background: 'rgba(255,191,94,0.12)', color: '#ffbf5e' }}
                    >
                      {vision.author.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs sm:text-sm font-medium text-star group-hover:text-gold transition-colors">
                        {vision.author.name}
                      </span>
                      <span className="block font-mono text-[9px] tracking-[0.14em] uppercase text-dim">
                        {vision.author.role || 'Creator'}
                      </span>
                    </span>
                  </Link>
                )}

                {tier && (
                  <div className="text-xs text-dim font-medium">
                    {momentumReason(vision)}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/[0.06]">
                {isOwner ? (
                  <>
                    <CosmosButton variant="primary" size="sm" asChild className="flex-1 sm:flex-initial justify-center">
                      <Link to={`/vision/${vision.id || vision._id}`}>
                        <Layers size={15} /> Open workspace
                      </Link>
                    </CosmosButton>
                    <CosmosButton variant="ghost" size="sm" asChild className="flex-1 sm:flex-initial justify-center">
                      <Link to="/discover-users?matchFor=vision">
                        <Sparkles size={14} /> Find builders
                      </Link>
                    </CosmosButton>
                  </>
                ) : (
                  <>
                    <CosmosButton
                      variant={hasApplied ? 'quiet' : 'primary'}
                      size="sm"
                      onClick={hasApplied ? undefined : handleAskToJoin}
                      disabled={hasApplied}
                      className={`flex-1 sm:flex-initial justify-center min-w-[120px] ${hasApplied ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {hasApplied ? <><Check size={14} /> Applied</> : <><Rocket size={14} /> Ask to join</>}
                    </CosmosButton>
                    <CosmosButton
                      variant="ghost"
                      size="sm"
                      disabled={likeLoading}
                      onClick={handleLikeToggle}
                      className="shrink-0 justify-center"
                    >
                      {likeLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Heart size={14} className={liked ? 'fill-current text-red-400' : ''} />
                      )}
                      {likeCount}
                    </CosmosButton>
                    <SaveAndShareGroup
                      saved={saved}
                      saveLoading={saveLoading}
                      onSave={handleSaveToggle}
                      onShare={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        toast.success('Link copied');
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Readiness ring on desktop */}
            <div className="hidden sm:block relative shrink-0">
              <ReadinessRing value={readiness} />
            </div>
          </div>
        </BurningBox>
      </Reveal>

      {/* ── Signals ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Signal icon={<Heart size={15} />} label="Backing" value={likeCount} accent="#ff6fd8" />
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Signal icon={<MessageCircle size={15} />} label="Discussion" value={comments.length} accent="#4fd8ff" />
          <Signal icon={<Users size={15} />} label="On the team" value={vision.collaborators || 1} accent="#3ee6a0" />
          <Signal icon={<Zap size={15} />} label="Roles open" value={roles.length} accent="#ffbf5e" />
        </div>
      </div>

      <AdSlot placement="vision-detail" format="banner" className="my-6 sm:my-10" />

      {/* ── The case ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <CasePanel
          icon={Target} accent="#ff6fd8" eyebrow="T H E   P R O B L E M"
          title="What is actually broken"
          body={vision.problemStatement || "Non-technical founders struggle to find developers who are both skilled and genuinely interested in their domain. Networking events and cold LinkedIn outreach produce low-quality matches and waste months."}
        />
        <CasePanel
          icon={Lightbulb} accent="#3ee6a0" eyebrow="T H E   S O L U T I O N"
          title="What this does about it"
          body={vision.solution || vision.description || "Matching on tech stack requirements *and* soft-signal alignment — build consistency, sector interest, availability — so introductions start warm instead of cold."}
        />
      </div>

      {/* ── WHERE IT STANDS ───────────────────────────────────────────── */}
      <Panel className="p-5 sm:p-7 rounded-3xl border border-white/[0.08]" accent="#4fd8ff">
        <Eyebrow className="mb-2 text-cyan-400 font-mono tracking-[0.2em] font-bold text-[10px] uppercase">
          W H E R E   I T   S T A N D S
        </Eyebrow>
        <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed font-normal">
          {vision.whereItStands || "Working prototype matching on skills and availability. Next: bring in contribution history so the score reflects what people have actually shipped, not what they claim."}
        </p>
      </Panel>

      {/* ── WHO THIS NEEDS ────────────────────────────────────────────── */}
      <Panel className="p-5 sm:p-7 rounded-3xl border border-white/[0.08]" accent="#ffbf5e">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
          <Eyebrow className="text-amber-400 font-mono tracking-[0.2em] font-bold text-[10px] uppercase">
            W H O   T H I S   N E E D S
          </Eyebrow>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-zinc-400 font-semibold">
            {(roles.length > 0 ? roles.length : 3)} OPEN
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-5 leading-normal">
          Named roles, not "looking for cofounders" — so you can tell in one read whether it's you.
        </p>

        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {(roles.length > 0 ? roles : ["Fullstack Engineer", "Product Designer", "Growth Marketer"]).map((role) => (
            <div
              key={role}
              className="cosmos-card p-3.5 sm:p-4 flex items-center justify-between gap-3 rounded-2xl transition-all duration-300 hover:border-amber-500/30 bg-[#07080c]/60 border border-white/[0.08] group"
              style={{ '--cosmos-accent': '#ffbf5e' }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className="grid place-items-center w-9 h-9 rounded-xl shrink-0 border border-amber-500/25 group-hover:scale-105 transition-transform"
                  style={{ background: 'rgba(255,191,94,0.12)', color: '#ffbf5e' }}
                >
                  <Wrench size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs sm:text-sm font-semibold text-white leading-snug break-words">
                    {role}
                  </span>
                  <span className="block font-mono text-[9px] tracking-[0.14em] uppercase text-zinc-500 mt-0.5">
                    OPEN
                  </span>
                </div>
              </div>
              <CosmosButton
                variant="quiet"
                size="sm"
                onClick={() => handleApplyRole(role)}
                className="shrink-0 font-semibold text-xs border border-white/10 bg-white/5 hover:bg-white/10"
              >
                Apply
              </CosmosButton>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── BUILT WITH ─────────────────────────────────────────────────── */}
      <Panel className="p-5 sm:p-7 rounded-3xl border border-white/[0.08]" accent="#ffbf5e">
        <Eyebrow className="mb-3.5 text-amber-400 font-mono tracking-[0.2em] font-bold text-[10px] uppercase">
          B U I L T   W I T H
        </Eyebrow>
        <div className="flex flex-wrap gap-2.5">
          {(stack.length > 0 ? stack : ["REACT", "NODE.JS", "POSTGRES", "TAILWIND", "WEBSOCKETS"]).map((tech, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#07080c] text-zinc-300 font-mono text-xs uppercase tracking-wider font-semibold hover:border-purple-500/30 transition-all cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </Panel>

      {/* ── Interactive Discussion & Feedback ─────────────────────────── */}
      <Panel className="p-5 sm:p-6 rounded-2xl border border-white/[0.08]" accent="#4fd8ff">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <Eyebrow>Discussion & Feedback</Eyebrow>
            <p className="text-xs text-dim mt-0.5">Share ideas, ask questions, or post suggestions for the founder.</p>
          </div>
          <div className="flex gap-1.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setCommentTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${commentTab === 'all' ? 'bg-blue-500/20 text-blue-300' : 'text-dim hover:text-star'}`}
            >
              All ({comments.length})
            </button>
            <button
              onClick={() => setCommentTab('suggestions')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${commentTab === 'suggestions' ? 'bg-amber-500/20 text-amber-300' : 'text-dim hover:text-star'}`}
            >
              Suggestions ({comments.filter((c) => c.isSuggestion).length})
            </button>
          </div>
        </div>

        {/* Post Comment Input */}
        <form onSubmit={handlePostComment} className="mb-6 space-y-2">
          <textarea
            rows={3}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={commentTab === 'suggestions' ? 'Write a practical suggestion for this vision...' : 'Join the discussion or leave feedback...'}
            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-star placeholder-dim/60 focus:outline-none focus:border-blue-500/50 resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-dim">Posting as {user?.firstName || user?.name || 'Builder'}</span>
            <CosmosButton variant="primary" size="sm" type="submit" disabled={postingComment || !commentInput.trim()}>
              {postingComment ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />} Post Comment
            </CosmosButton>
          </div>
        </form>

        {/* Comments Feed */}
        <div className="space-y-3 divide-y divide-white/[0.06]">
          {filteredComments.map((c) => (
            <div key={c.id} className="pt-3 first:pt-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 grid place-items-center text-[10px] font-bold uppercase">
                    {c.author?.name?.slice(0, 2) || 'BU'}
                  </span>
                  <span className="text-xs font-semibold text-star">{c.author?.name || 'Builder'}</span>
                  {c.isSuggestion && <Tag tone="gold">Suggestion</Tag>}
                </div>
                <span className="text-[10px] text-dim">{c.createdAt || 'Recent'}</span>
              </div>
              <p className="text-xs sm:text-sm text-star/85 leading-relaxed pl-8">{c.content}</p>
            </div>
          ))}
          {filteredComments.length === 0 && (
            <p className="text-xs text-dim text-center py-4">No comments yet. Start the conversation!</p>
          )}
        </div>
      </Panel>

      {/* Matchmaking — owner only, and metered elsewhere */}
      {isOwner && (
        <Panel className="p-6 rounded-2xl border border-white/[0.08]" accent="#8b6cff">
          <Eyebrow className="mb-1">People who fit these roles</Eyebrow>
          <p className="text-xs sm:text-sm text-dim mb-4">
            Matched on skills, availability and what they have actually shipped.
          </p>
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {suggestions.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3.5 py-3">
                <span
                  className="grid place-items-center w-9 h-9 rounded-full font-mono text-[11px] font-semibold shrink-0 border border-purple-500/30"
                  style={{ background: 'rgba(139,108,255,0.15)', color: '#8b6cff' }}
                >
                  {p.firstName[0]}{p.lastName[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <Link to={`/user-profile?userId=${p.id}`} className="block text-sm font-medium text-star hover:text-gold transition-colors">
                    {p.name}
                  </Link>
                  <span className="block text-xs text-dim truncate">{p.headline}</span>
                </span>
                <Tag tone="dev">{p.match}% match</Tag>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2">
            <CosmosButton variant="ai" size="sm" asChild>
              <Link to="/discover-users?matchFor=vision"><Sparkles size={14} /> See all matches</Link>
            </CosmosButton>
          </div>
        </Panel>
      )}

      {/* ── Stack & tags ───────────────────────────────────────────────── */}
      {(stack.length > 0 || vision.tags?.length > 0) && (
        <Panel className="p-6 rounded-2xl border border-white/[0.08]">
          {stack.length > 0 && (
            <>
              <Eyebrow className="mb-2.5">Built with</Eyebrow>
              <div className="flex flex-wrap gap-2 mb-5">
                {stack.map((t) => <Tag key={t} tone="neutral">{t}</Tag>)}
              </div>
            </>
          )}
          {vision.tags?.length > 0 && (
            <>
              <Eyebrow className="mb-2.5">Tags</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {vision.tags.map((t) => <Tag key={t} tone="future">#{t}</Tag>)}
              </div>
            </>
          )}
        </Panel>
      )}

      {/* ── Join / Role Application Modal ─────────────────────────────── */}
      {(showJoinModal || isApplicationModalOpen) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0b12] border border-white/15 rounded-2xl max-w-[780px] w-full p-0 text-star shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* HEADER BAR */}
            <div className="relative bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-indigo-950/60 p-5 sm:p-6 border-b border-white/10 shrink-0">
              <button
                type="button"
                disabled={submittingJoin}
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/10 border border-white/15 text-slate-300 hover:text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-4 pr-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(255,191,94,0.15)]">
                  <Lightbulb size={22} />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Eyebrow>Vision Co-Building</Eyebrow>
                    <Tag tone="accent">Vision</Tag>
                    {vision.industry && <Tag tone="neutral">{vision.industry}</Tag>}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display truncate">
                    {vision.title}
                  </h2>
                  <p className="text-xs text-slate-300/80 line-clamp-1">
                    {vision.description || "Collaborate on this vision and help build its core prototype."}
                  </p>
                </div>
              </div>
            </div>

            {/* GLOWING DIVIDER LINE */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/40 via-purple-500/30 to-transparent shrink-0" />

            {/* FORM CONTENT BODY */}
            <form noValidate onSubmit={handleSubmitJoinForm} className="p-5 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {visionSubmitError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-rose-200 font-sans">Submission Error</p>
                    <p className="font-sans text-rose-300/90">{visionSubmitError}</p>
                    <p className="font-sans text-rose-300/70 text-[10px] mt-1">Your application data has been preserved — fix the issue above and try again.</p>
                  </div>
                </div>
              )}
              
              {/* STEP 1: ROLE SELECTION */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                    1. Target Role <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Select position</span>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar p-1 rounded-xl transition-all ${((joinAttempted || joinTouched.role) && visionRoleError) ? 'border border-rose-500/60 bg-rose-500/[0.04]' : ''}`}>
                  {(roles.length > 0 ? roles : ['Co-Developer', 'Co-Founder', 'Advisor / Mentor']).map((r) => {
                    const selected = selectedRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r);
                          setJoinTouched(prev => ({ ...prev, role: true }));
                        }}
                        className={`
                          px-3.5 py-3 rounded-xl border text-xs font-medium text-left
                          flex items-center justify-between transition-all duration-200 cursor-pointer
                          ${selected
                            ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(255,191,94,0.25)]"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white hover:bg-white/[0.06]"
                          }
                        `}
                      >
                        <span className="truncate flex-1">{r}</span>
                        {selected && <CheckCircle2 size={14} className="text-amber-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                {((joinAttempted || joinTouched.role) && visionRoleError) && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5 font-sans">
                    <AlertCircle size={12} /> {visionRoleError}
                  </p>
                )}
              </div>

              {/* STEP 2: MOTIVATION PITCH */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                    2. Why do you want to build this? <span className="text-amber-400">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${joinMessage.length < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {joinMessage.length} / 20+ chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={joinMessage}
                  onBlur={() => setJoinTouched(prev => ({ ...prev, message: true }))}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Introduce yourself, share your relevant experience, technical background, and explain why you want to co-build this vision..."
                  className={`w-full p-3.5 rounded-xl bg-white/[0.03] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all resize-none min-h-[115px] ${
                    ((joinAttempted || joinTouched.message) && visionMessageError)
                      ? 'border border-rose-500/70 bg-rose-500/[0.04] focus:outline-none focus:border-rose-500'
                      : 'border border-white/12 focus:outline-none focus:border-amber-500/80 focus:bg-white/[0.06] focus:ring-1 focus:ring-amber-500/30'
                  }`}
                />
                {((joinAttempted || joinTouched.message) && visionMessageError) && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5 font-sans">
                    <AlertCircle size={12} /> {visionMessageError}
                  </p>
                )}
              </div>

              {/* STEP 3: AVAILABILITY */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                    <Clock size={12} className="text-amber-400" /> 3. Weekly Availability <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Hours per week</span>
                </div>
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 transition-all ${((joinAttempted || joinTouched.availability) && visionAvailabilityError) ? 'border border-rose-500/60 bg-rose-500/[0.04] rounded-xl p-1' : ''}`}>
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const selected = joinAvailability === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setJoinAvailability(opt);
                          setJoinTouched(prev => ({ ...prev, availability: true }));
                        }}
                        className={`
                          px-3 py-2.5 rounded-xl border text-xs font-medium text-center
                          flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer
                          ${selected
                            ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(255,191,94,0.2)]'
                            : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        {selected && <CheckCircle2 size={12} className="text-amber-400" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {((joinAttempted || joinTouched.availability) && visionAvailabilityError) && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5 font-sans">
                    <AlertCircle size={12} /> {visionAvailabilityError}
                  </p>
                )}
              </div>

              {/* STEP 4: RELEVANT LINKS (GRID) */}
              <div>
                <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold mb-2.5 block">
                  4. Relevant Links & Portfolio <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        inputMode="url"
                        placeholder="Portfolio URL (Required)"
                        value={joinLinks.portfolio}
                        onBlur={() => setJoinTouched(prev => ({ ...prev, portfolio: true }))}
                        onChange={(e) => setJoinLinks({ ...joinLinks, portfolio: e.target.value })}
                        className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${((joinAttempted || joinTouched.portfolio) && visionPortfolioError) ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-amber-500/80'}`}
                      />
                    </div>
                    {((joinAttempted || joinTouched.portfolio) && visionPortfolioError) && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {visionPortfolioError}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        inputMode="url"
                        placeholder="GitHub Profile (Optional)"
                        value={joinLinks.github}
                        onChange={(e) => setJoinLinks({ ...joinLinks, github: e.target.value })}
                        className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${visionGithubError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-amber-500/80'}`}
                      />
                    </div>
                    {visionGithubError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {visionGithubError}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        inputMode="url"
                        placeholder="LinkedIn Profile"
                        value={joinLinks.linkedin}
                        onChange={(e) => setJoinLinks({ ...joinLinks, linkedin: e.target.value })}
                        className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${visionLinkedinError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-amber-500/80'}`}
                      />
                    </div>
                    {visionLinkedinError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {visionLinkedinError}</p>}
                  </div>
                </div>
              </div>

              {/* FOOTER ACTION BAR */}
              <div className="pt-4 pb-1 border-t border-white/10 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  💡 Application will be sent to the Vision creator
                </span>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                  <CosmosButton
                    variant="quiet"
                    size="sm"
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    disabled={submittingJoin}
                  >
                    Cancel
                  </CosmosButton>
                  <CosmosButton
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={submittingJoin || (joinAttempted && !isVisionFormValid)}
                    className={joinAttempted && !isVisionFormValid ? "opacity-60 cursor-not-allowed" : ""}
                  >
                    {submittingJoin ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Rocket size={14} /> Submit Application
                      </>
                    )}
                  </CosmosButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadinessRing({ value, size = 'md' }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = (value / 100) * C;
  const accent = value >= 70 ? '#3ee6a0' : value >= 40 ? '#4fd8ff' : '#ffbf5e';

  const dimension = size === 'sm' ? 84 : 146;

  return (
    <div className="relative inline-block">
      <svg width={dimension} height={dimension} viewBox="0 0 146 146" role="img" aria-label={`${value}% ready`}>
        <circle cx="73" cy="73" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="73" cy="73" r={R} fill="none"
          stroke={accent} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform="rotate(-90 73 73)"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${accent}66)` }}
        />
        <circle cx="73" cy="73" r="22" fill={accent} opacity={value >= 70 ? 0.26 : 0.12} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display leading-none ${size === 'sm' ? 'text-sm font-bold' : 'text-[1.7rem]'}`} style={{ color: accent }}>
          {value}%
        </span>
        <span className={`font-mono tracking-[0.16em] uppercase text-dim ${size === 'sm' ? 'text-[7.5px] mt-0.5' : 'text-[9px] mt-1'}`}>
          ready
        </span>
      </div>
    </div>
  );
}

function Signal({ icon, label, value, accent }) {
  return (
    <div className="cosmos-card p-4 flex items-center gap-3" style={{ '--cosmos-accent': accent }}>
      <span
        className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="cosmos-stat-label block">{label}</span>
        <span className="font-display text-[1.15rem] tabular-nums" style={{ color: accent }}>
          {Number(value).toLocaleString()}
        </span>
      </span>
    </div>
  );
}

function CasePanel({ icon: Icon, accent, eyebrow, title, body }) {
  if (!body) return null;
  return (
    <Panel className="p-6" accent={accent}>
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}
        >
          <Icon size={16} />
        </span>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <p className="text-[0.9rem] text-star mt-0.5">{title}</p>
        </div>
      </div>
      <p className="text-[0.95rem] text-star/85 leading-relaxed">{body}</p>
    </Panel>
  );
}

function SaveAndShareGroup({ saved, saveLoading, onSave, onShare, className = "" }) {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 ${className}`}>
      <CosmosButton
        variant="quiet"
        size="sm"
        disabled={saveLoading}
        onClick={onSave}
        className="flex-1 sm:flex-initial shrink-0 justify-center"
      >
        {saveLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Bookmark size={14} className={saved ? 'fill-current text-amber-400' : ''} />
        )}
        {saved ? 'Saved' : 'Save'}
      </CosmosButton>
      <CosmosButton
        variant="quiet"
        size="sm"
        className="flex-1 sm:flex-initial shrink-0 justify-center"
        onClick={onShare}
      >
        <Share2 size={14} /> Share
      </CosmosButton>
    </div>
  );
}

