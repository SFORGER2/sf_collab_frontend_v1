import React from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

/**
 * The app-wide crash net.
 *
 * Until now there was no error boundary above the router, so a single bad read
 * in a single page unmounted the entire React tree and left a white screen —
 * no nav, no way back, nothing on screen to explain it. That is how /pricing
 * failed: one `plans[0].description` on an empty array took down the whole app.
 *
 * This keeps the failure local. The page that broke shows what happened and
 * offers a way out; everything around it keeps working.
 *
 * `resetKey` (pass the pathname) clears the error on navigation, so moving to
 * another page recovers without a reload.
 */
export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    // Keep the full trace in the console for whoever is debugging.
    console.error('Route crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-6 py-16">
        <div className="cosmos-panel cosmos-panel-accent max-w-[42rem] w-full p-8 text-center"
             style={{ '--cosmos-accent': '#ff6f6f' }}>
          <span className="grid place-items-center w-12 h-12 rounded-2xl mx-auto mb-4"
                style={{ background: 'rgba(255,111,111,0.12)' }}>
            <AlertTriangle size={22} className="text-red-400" />
          </span>

          <h2 className="font-display text-[1.35rem] text-star">This page hit an error</h2>
          <p className="text-[0.9rem] text-dim mt-2 max-w-[52ch] mx-auto">
            The rest of the app is fine — only this view failed to render. Reloading usually
            clears it; if it keeps happening, the details below are what to report.
          </p>

          <pre className="mt-5 text-left overflow-x-auto text-[11px] font-mono text-red-300/80 bg-white/[0.03] border border-white/10 rounded-xl p-3">
            {String(error?.message || error)}
          </pre>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-[0.88rem] text-star hover:bg-white/[0.06] transition-colors"
            >
              <RotateCw size={14} /> Reload
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/dashboard'; }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-[0.88rem] text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
            >
              <Home size={14} /> Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Router-aware wrapper — must live inside <BrowserRouter>. Resets on every
 * pathname change so navigating away from a broken page recovers the app.
 */
export function RouteBoundary({ children }) {
  const { pathname } = useLocation();
  return <RouteErrorBoundary resetKey={pathname}>{children}</RouteErrorBoundary>;
}

export default RouteErrorBoundary;
