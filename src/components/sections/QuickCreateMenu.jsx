import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Plus, Sparkles, Rocket, MessageSquareHeart, Video, Users,
  Lightbulb, ClipboardList, Store, FolderPlus,
} from 'lucide-react';
import { Eyebrow } from '@/components/cosmos';

/**
 * The `+` menu.
 *
 * It previously offered exactly two things — "New Startup" and "New Post" — on
 * a bare grey dropdown, and "New Startup" pointed at a nine-step wizard that is
 * now request-gated anyway. That is not a create menu, it's a stub.
 *
 * Now it's the fast path to everything worth starting, grouped by what you're
 * actually doing: putting an idea out, sharing, or getting work done. The first
 * item is the one most people want — a Vision — so it gets the primary
 * treatment. AI generation is deliberately absent: those are metered tools
 * that belong in AI Tools, not one click from every screen.
 *
 * Kept as a popover rather than a dropdown so the grouping, descriptions and
 * accents have room; a dropdown of ten unlabelled rows is worse than two.
 */

const GROUPS = [
  {
    label: 'Start something',
    items: [
      {
        icon: Sparkles, label: 'New Vision', to: '/vision/new', accent: '#ffbf5e',
        desc: 'An idea with structure, open to the ecosystem', primary: true,
      },
      {
        icon: Rocket, label: 'Register a startup', to: '/register-startup', accent: '#8b6cff',
        desc: 'By request — we review each one',
      },
      {
        icon: Store, label: 'List on the marketplace', to: '/marketplace', accent: '#ff8f5e',
        desc: 'Sell code, design, voices or your time',
      },
    ],
  },
  {
    label: 'Share',
    items: [
      { icon: MessageSquareHeart, label: 'New post', to: '/posts', accent: '#4fd8ff', desc: 'To the feed' },
      { icon: Lightbulb, label: 'Knowledge post', to: '/knowledge', accent: '#3ee6a0', desc: 'Something you worked out' },
    ],
  },
  {
    label: 'Work',
    items: [
      { icon: ClipboardList, label: 'New task', to: '/erp/tasks', accent: '#3ee6a0', desc: 'On a workspace board' },
      { icon: Video, label: 'Start a call', to: '/meet?start=1', accent: '#ff6fd8', desc: 'SF Meet' },
      { icon: FolderPlus, label: 'Upload to Drive', to: '/sf-drive', accent: '#4fd8ff', desc: 'Files and decks' },
      { icon: Users, label: 'Find people', to: '/discover-users', accent: '#8b6cff', desc: 'Builders, mentors, investors' },
    ],
  },
];

export default function QuickCreateMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const go = (to) => { setOpen(false); navigate(to); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Create"
          className={`p-2 rounded-lg transition-colors ${
            open ? 'bg-gold/15 text-gold' : 'text-slate-300 hover:bg-white/10 hover:text-gold'
          }`}
        >
          <Plus size={22} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(94vw,22rem)] p-4 cosmos-panel-neon border-white/10 rounded-2xl max-h-[78vh] overflow-y-auto"
      >
        <Eyebrow className="mb-3">Create</Eyebrow>

        <div className="flex flex-col gap-4">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-dim/70 block mb-1.5">
                {group.label}
              </span>

              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <MenuRow key={item.label} item={item} onClick={() => go(item.to)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuRow({ item, onClick }) {
  const { icon: Icon, label, desc, accent, primary } = item;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-left transition-colors hover:bg-white/[0.06]"
      style={primary ? { background: `${accent}12`, border: `1px solid ${accent}33` } : undefined}
    >
      <span
        className="grid place-items-center w-8 h-8 rounded-lg shrink-0 transition-transform group-hover:scale-110"
        style={{ background: `${accent}18`, border: `1px solid ${accent}2e`, color: accent }}
      >
        <Icon size={15} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[0.88rem] text-star leading-tight">{label}</span>
        {desc && <span className="block text-[0.75rem] text-dim leading-tight mt-0.5">{desc}</span>}
      </span>
    </button>
  );
}
