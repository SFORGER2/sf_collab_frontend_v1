import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { isAiToolsLocked, getAiToolsLockRemainingDays } from "../../utils/config.js";

export default function AIToolsGuard({ children }) {
  const navigate = useNavigate();
  const locked = isAiToolsLocked();

  const daysRemaining = useMemo(() => getAiToolsLockRemainingDays(), []);

  if (!locked) {
    return children;
  }

  return (
    <div className="relative w-full h-full">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg mx-4 rounded-2xl bg-slate-950 border border-white/10 shadow-2xl p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            AI tools temporarily locked
          </h2>
          <p className="text-slate-200 mb-3">
            We&apos;re currently putting additional security measures in place and running
            stability tests for our AI tools.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            During this period, AI features are unavailable for all users so we can verify data
            protection and reliability.
          </p>
          {daysRemaining > 0 && (
            <p className="text-slate-300 text-sm mb-6">
              Estimated time until access is restored:{" "}
              <span className="font-semibold text-white">
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
              </span>.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Back to main dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

