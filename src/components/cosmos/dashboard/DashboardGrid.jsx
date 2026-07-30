import React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Check, Eye, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CosmosButton } from '../CosmosButton';
import { Eyebrow } from '../primitives';
import { roleAccent } from '../roles';
import { DashboardWidget } from './DashboardWidget';
import { useDashboardLayout } from './useDashboardLayout';

/**
 * An editable dashboard.
 *
 * Pass a widget list; the user can reorder by drag, resize between third/half/
 * full width, and hide sections they don't use. The layout persists per role,
 * so a founder and a builder each keep their own arrangement.
 *
 * The editing affordances are deliberately behind a "Customise" toggle — the
 * resting state is a clean read-only board, which is what people spend
 * 99% of their time looking at.
 *
 *   <DashboardGrid
 *     layoutKey="founder"
 *     role="founder"
 *     widgets={[{ id, title, eyebrow, span, locked, node }]}
 *   />
 */
export function DashboardGrid({ layoutKey, role, widgets, header = null }) {
  const {
    visible,
    hiddenWidgets,
    editing,
    setEditing,
    reorder,
    toggleHidden,
    cycleSpan,
    reset,
    isCustomised,
  } = useDashboardLayout(layoutKey, widgets);

  const accent = roleAccent(role).color;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = visible.map((w) => w.id);
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from === -1 || to === -1) return;

    // Reorder within the full saved order, not just the visible slice, so
    // hidden widgets keep their place if they're shown again later.
    const moved = arrayMove(ids, from, to);
    const hiddenIds = hiddenWidgets.map((w) => w.id);
    reorder([...moved, ...hiddenIds]);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div className="min-w-0">{header}</div>

        <div className="flex items-center gap-2.5 shrink-0">
          {editing && isCustomised && (
            <CosmosButton variant="quiet" size="sm" onClick={reset}>
              <RotateCcw size={14} /> Reset
            </CosmosButton>
          )}
          <CosmosButton
            variant={editing ? 'primary' : 'quiet'}
            size="sm"
            onClick={() => setEditing(!editing)}
            aria-pressed={editing}
          >
            {editing ? <><Check size={14} /> Done</> : <><SlidersHorizontal size={14} /> Customise</>}
          </CosmosButton>
        </div>
      </div>

      {editing && (
        <p className="text-[0.88rem] text-dim mb-4">
          Drag the handles to reorder, change a section's width, or hide what you don't need.
          Your layout is saved for the {roleAccent(role).label.toLowerCase()} dashboard.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={visible.map((w) => w.id)} strategy={rectSortingStrategy}>
          {/* items-stretch + h-full panels means a small widget beside a large
              one grows to fill its cell, so rows read as a solid band rather
              than a ragged edge. */}
          <div className="grid grid-cols-12 gap-4 sm:gap-5 items-stretch auto-rows-auto">
            {visible.map((w) => (
              <DashboardWidget
                key={w.id}
                id={w.id}
                title={w.title}
                eyebrow={w.eyebrow}
                span={w.span}
                locked={w.locked}
                editing={editing}
                onHide={toggleHidden}
                onCycleSpan={cycleSpan}
                accent={w.accent || accent}
              >
                {w.node}
              </DashboardWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editing && hiddenWidgets.length > 0 && (
        <div className="mt-6 cosmos-panel p-5" style={{ '--cosmos-accent': accent }}>
          <Eyebrow className="mb-3">Hidden sections</Eyebrow>
          <div className="flex flex-wrap gap-2.5">
            {hiddenWidgets.map((w) => (
              <CosmosButton
                key={w.id}
                variant="quiet"
                size="sm"
                onClick={() => toggleHidden(w.id)}
              >
                <Eye size={14} /> {w.title || w.id}
              </CosmosButton>
            ))}
          </div>
        </div>
      )}

      {visible.length === 0 && (
        <div className="cosmos-panel p-10 text-center">
          <p className="text-dim">
            Every section is hidden. Choose <strong className="text-star">Customise</strong> to bring
            some back.
          </p>
        </div>
      )}
    </div>
  );
}

export default DashboardGrid;
