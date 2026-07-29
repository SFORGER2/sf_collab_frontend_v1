import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Sparkles, X } from 'lucide-react';
import { profileCompleteness } from '@/services/profile/profileSchema';
import { toSchemaProfile } from '@/services/profile/profileAdapter';
import { CosmosButton, Eyebrow, ProgressRail } from './index';

/**
 * "Upload your CV and we'll do the rest" — where people can actually find it.
 *
 * The intake flow existed at /profile-intake but nothing linked to it, so in
 * practice it did not exist: you pick a role, land on the dashboard, and the
 * one thing that makes matchmaking and every AI surface work is a page you
 * have never heard of.
 *
 * This sits at the top of the dashboard until the profile is genuinely usable,
 * and only then. It states the actual reason rather than nagging — a bar that
 * says "60% complete" gives no reason to act; "matchmaking can't rank you yet"
 * does.
 *
 * Dismissible for the session, because being told twice is enough.
 */

const THRESHOLD = 60;   // below this, matchmaking output is not worth showing
const KEY = 'sfc.profilePrompt.dismissed';

export function ProfilePrompt({ className = '' }) {
  const { user } = useSelector((s) => s.auth);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
  });

  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!user) return;
    setPct(profileCompleteness(toSchemaProfile(user)));
  }, [user]);

  if (!user || dismissed || pct >= THRESHOLD) return null;

  const dismiss = () => {
    try { sessionStorage.setItem(KEY, '1'); } catch { /* blocked */ }
    setDismissed(true);
  };

  return (
    <div
      className={`cosmos-panel cosmos-panel-neon relative p-5 sm:p-6 ${className}`}
      style={{ '--cosmos-accent': '#8b6cff' }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 p-1 rounded-md text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
      >
        <X size={14} />
      </button>

      <div className="flex flex-wrap items-start gap-4">
        <span
          className="grid place-items-center w-12 h-12 rounded-2xl shrink-0"
          style={{ background: 'rgba(139,108,255,0.14)', color: '#8b6cff' }}
        >
          <FileText size={22} />
        </span>

        <div className="min-w-0 flex-1">
          <Eyebrow>Finish your profile</Eyebrow>
          <h3 className="font-display text-[1.15rem] text-star mt-1.5 leading-tight">
            Upload your CV — the assistant fills in the rest.
          </h3>
          <p className="text-[0.87rem] text-dim mt-1.5 max-w-[58ch]">
            Matchmaking can't rank you and the AI tools have nothing to work from until your
            profile has some substance. A CV or portfolio link covers most of it in one go.
          </p>

          <div className="mt-4 max-w-[26rem]">
            <ProgressRail label="Profile completeness" value={pct} />
          </div>

          <div className="flex flex-wrap gap-2.5 mt-4">
            <CosmosButton variant="ai" size="sm" asChild>
              <Link to="/profile-intake"><Sparkles size={14} /> Upload CV or portfolio</Link>
            </CosmosButton>
            <CosmosButton variant="quiet" size="sm" asChild>
              <Link to="/user-profile">Fill it in by hand</Link>
            </CosmosButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePrompt;
