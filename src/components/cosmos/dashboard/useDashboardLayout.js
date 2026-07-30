import { useCallback, useEffect, useMemo, useState } from 'react';

const PREFIX = 'sfc.dashboard.';

/** Widths a widget can occupy. Kept coarse so layouts stay tidy at any size. */
export const SPANS = ['third', 'half', 'full'];

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the layout just won't persist */
  }
}

/**
 * Persisted, user-editable dashboard layout.
 *
 * Stores order, hidden widgets and per-widget width under one key, and
 * reconciles that against the widget list on every load: widgets added since
 * the layout was saved appear at the end rather than vanishing, and widgets
 * that no longer exist are dropped. That reconciliation is the reason this
 * isn't just `useState(savedOrder)` — without it, shipping a new dashboard
 * widget would leave it invisible to every existing user.
 *
 * @param {string} key      layout identity, usually the role name
 * @param {Array}  widgets  [{ id, title, eyebrow, span, node, locked }]
 */
export function useDashboardLayout(key, widgets) {
  const defaults = useMemo(
    () => ({
      order: widgets.map((w) => w.id),
      hidden: [],
      spans: widgets.reduce((acc, w) => {
        if (w.span) acc[w.id] = w.span;
        return acc;
      }, {}),
    }),
    [widgets]
  );

  const [layout, setLayout] = useState(defaults);
  const [editing, setEditing] = useState(false);

  // Load and reconcile whenever the widget set or key changes.
  useEffect(() => {
    const saved = read(key);
    if (!saved) {
      setLayout(defaults);
      return;
    }

    const known = new Set(widgets.map((w) => w.id));
    const savedOrder = (saved.order || []).filter((id) => known.has(id));
    const appended = widgets.map((w) => w.id).filter((id) => !savedOrder.includes(id));

    setLayout({
      order: [...savedOrder, ...appended],
      hidden: (saved.hidden || []).filter((id) => known.has(id)),
      spans: { ...defaults.spans, ...(saved.spans || {}) },
    });
  }, [key, widgets, defaults]);

  const persist = useCallback(
    (next) => {
      setLayout(next);
      write(key, next);
    },
    [key]
  );

  const reorder = useCallback(
    (order) => persist({ ...layout, order }),
    [layout, persist]
  );

  const toggleHidden = useCallback(
    (id) => {
      const hidden = layout.hidden.includes(id)
        ? layout.hidden.filter((h) => h !== id)
        : [...layout.hidden, id];
      persist({ ...layout, hidden });
    },
    [layout, persist]
  );

  /** Cycles a widget through third → half → full → third. */
  const cycleSpan = useCallback(
    (id) => {
      const current = layout.spans[id] || 'full';
      const next = SPANS[(SPANS.indexOf(current) + 1) % SPANS.length];
      persist({ ...layout, spans: { ...layout.spans, [id]: next } });
    },
    [layout, persist]
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* noop */
    }
    setLayout(defaults);
  }, [key, defaults]);

  /** Widgets in saved order, with hidden ones separated out. */
  const { visible, hiddenWidgets } = useMemo(() => {
    const byId = new Map(widgets.map((w) => [w.id, w]));
    const ordered = layout.order.map((id) => byId.get(id)).filter(Boolean);
    return {
      visible: ordered
        .filter((w) => !layout.hidden.includes(w.id))
        .map((w) => ({ ...w, span: layout.spans[w.id] || w.span || 'full' })),
      hiddenWidgets: ordered.filter((w) => layout.hidden.includes(w.id)),
    };
  }, [widgets, layout]);

  const isCustomised =
    layout.hidden.length > 0 ||
    layout.order.join() !== defaults.order.join() ||
    JSON.stringify(layout.spans) !== JSON.stringify(defaults.spans);

  return {
    visible,
    hiddenWidgets,
    editing,
    setEditing,
    reorder,
    toggleHidden,
    cycleSpan,
    reset,
    isCustomised,
  };
}
