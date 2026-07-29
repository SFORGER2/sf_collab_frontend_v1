import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, EyeOff, Columns2, Lock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Eyebrow } from '../primitives';

/**
 * Span classes.
 *
 * `items-stretch` on the grid plus `h-full` on the panel makes every widget in
 * a row match the tallest one, so a short widget beside a tall one fills its
 * cell instead of leaving a ragged gap. Medium breakpoints collapse thirds to
 * halves so two columns stay usable on tablets rather than squeezing three.
 */
const SPAN_CLASS = {
  third: 'md:col-span-6 lg:col-span-4',
  half: 'md:col-span-6',
  full: 'col-span-12',
};

const SPAN_LABEL = { third: 'One third', half: 'Half', full: 'Full width' };

/**
 * One card on an editable dashboard.
 *
 * Outside edit mode this is just a cosmos panel with a mono title — no handles,
 * no chrome, nothing competing with the content. The drag handle, hide button
 * and width control only appear once the user opts into customising, which is
 * what keeps the default view clean.
 */
export function DashboardWidget({
  id,
  title,
  eyebrow,
  span = 'full',
  locked = false,
  editing = false,
  onHide,
  onCycleSpan,
  accent,
  children,
}) {
  const sortable = useSortable({ id, disabled: !editing || locked });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...(accent ? { '--cosmos-accent': accent } : null),
      }}
      className={cn(
        'col-span-12 relative',
        SPAN_CLASS[span] || SPAN_CLASS.full,
        isDragging && 'z-50 opacity-90'
      )}
    >
      <div
        className={cn(
          'cosmos-panel h-full p-5 sm:p-6 transition-shadow',
          editing && !locked && 'ring-1 ring-violet/40',
          isDragging && 'shadow-[0_30px_80px_-20px_rgba(139,108,255,0.45)]'
        )}
      >
        {(title || editing) && (
          <header className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
              {title && (
                <h2 className="font-display text-[1.05rem] leading-tight text-star truncate">
                  {title}
                </h2>
              )}
            </div>

            {editing && (
              <div className="flex items-center gap-1 shrink-0">
                {locked ? (
                  <span
                    className="p-1.5 text-dim"
                    title="This section is always shown"
                    aria-label="Locked section"
                  >
                    <Lock size={15} />
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onCycleSpan?.(id)}
                      title={`Width: ${SPAN_LABEL[span]} — click to change`}
                      aria-label={`Change width, currently ${SPAN_LABEL[span]}`}
                      className="p-1.5 rounded-md text-dim hover:text-cyan hover:bg-cyan/10 transition-colors"
                    >
                      <Columns2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onHide?.(id)}
                      title="Hide this section"
                      aria-label={`Hide ${title || id}`}
                      className="p-1.5 rounded-md text-dim hover:text-magenta hover:bg-magenta/10 transition-colors"
                    >
                      <EyeOff size={15} />
                    </button>
                    <button
                      type="button"
                      {...attributes}
                      {...listeners}
                      title="Drag to reorder"
                      aria-label={`Reorder ${title || id}`}
                      className="p-1.5 rounded-md text-dim hover:text-gold hover:bg-gold/10 cursor-grab active:cursor-grabbing transition-colors touch-none"
                    >
                      <GripVertical size={15} />
                    </button>
                  </>
                )}
              </div>
            )}
          </header>
        )}

        <div className={cn(editing && !locked && 'pointer-events-none select-none opacity-80')}>
          {children}
        </div>
      </div>
    </section>
  );
}

export default DashboardWidget;
