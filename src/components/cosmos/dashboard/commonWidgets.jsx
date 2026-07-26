import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, FolderOpen, Star, Users, Video } from 'lucide-react';
import { CosmosButton } from '../CosmosButton';
import { AdSlot } from '../AdSlot';
import AINewsWidget from './AINewsWidget';
import DrawsWidget from '@/components/pages/draws/DrawsWidget';

/**
 * Widgets every dashboard should carry.
 *
 * SF Drive and SF Meet are core products, but they only appeared on some role
 * dashboards — a founder saw them and a member never did. These give each role
 * the same entry points without each dashboard re-inventing them.
 */

function QuickLinkRow({ to, icon: Icon, label, hint }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 py-2.5 border-b border-white/[0.07] last:border-0 group"
    >
      <Icon className="w-4 h-4 text-dim group-hover:text-[var(--cosmos-accent,#ffbf5e)] transition-colors shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.92rem] text-star truncate">{label}</span>
        {hint && <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim">{hint}</span>}
      </span>
    </Link>
  );
}

/** SF Drive — the startup's connected knowledge environment. */
export function DriveWidget() {
  return (
    <div className="flex flex-col gap-1" style={{ '--cosmos-accent': '#4fd8ff' }}>
      <p className="text-[0.88rem] text-dim mb-2">
        Files, research and decisions, connected to your Vision and team.
      </p>
      <QuickLinkRow to="/sf-drive" icon={FolderOpen} label="My Drive" hint="All files" />
      <QuickLinkRow to="/sf-drive/shared" icon={Users} label="Shared with me" />
      <QuickLinkRow to="/sf-drive/recent" icon={Clock} label="Recent" />
      <QuickLinkRow to="/sf-drive/starred" icon={Star} label="Starred" />
      <CosmosButton variant="quiet" size="sm" className="mt-3 self-start" asChild>
        <Link to="/sf-drive">Open SF Drive</Link>
      </CosmosButton>
    </div>
  );
}

/** SF Meet — meetings that stay attached to project context. */
export function MeetWidget() {
  return (
    <div className="flex flex-col gap-1" style={{ '--cosmos-accent': '#8b6cff' }}>
      <p className="text-[0.88rem] text-dim mb-2">
        Discussions, notes and decisions kept inside the same ecosystem.
      </p>
      <QuickLinkRow to="/meet" icon={Video} label="All meetings" />
      <QuickLinkRow to="/meet/upcoming" icon={Clock} label="Upcoming" />
      <QuickLinkRow to="/meet/recordings" icon={Video} label="Recordings" />
      <CosmosButton variant="quiet" size="sm" className="mt-3 self-start" asChild>
        <Link to="/meet">Open SF Meet</Link>
      </CosmosButton>
    </div>
  );
}

/**
 * The shared tail every role dashboard gets: SF Drive, SF Meet, and an ad slot
 * that only renders on ad-supported plans.
 */
export function commonWidgets({ includeAd = true, includeNews = true, includeDraws = true } = {}) {
  return [
    ...(includeNews
      ? [{ id: 'ainews', title: 'AI news', eyebrow: 'Signals', span: 'half', accent: '#8b6cff', node: <AINewsWidget /> }]
      : []),
    ...(includeDraws
      ? [{ id: 'draws', title: 'Draws & prizes', eyebrow: 'Rewards', span: 'half', accent: '#ffbf5e', node: <DrawsWidget /> }]
      : []),
    { id: 'drive', title: 'SF Drive', eyebrow: 'Knowledge', span: 'half', accent: '#4fd8ff', node: <DriveWidget /> },
    { id: 'meet', title: 'SF Meet', eyebrow: 'Meetings', span: 'half', accent: '#8b6cff', node: <MeetWidget /> },
    ...(includeAd
      ? [{ id: 'sponsored', title: null, span: 'full', node: <AdSlot placement="dashboard-footer" format="banner" /> }]
      : []),
  ];
}
