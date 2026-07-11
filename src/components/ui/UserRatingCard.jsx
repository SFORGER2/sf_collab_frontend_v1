/**
 * src/components/ui/UserRatingCard.jsx
 *
 * Drop-in rating widget for any user profile page.
 * Usage:
 *   <UserRatingCard
 *     subjectId={user.id}
 *     subjectName={user.fullName || user.firstName}
 *   />
 */
import React, { useState, useEffect, useCallback } from "react";
import { Star, Flag, ChevronDown, ChevronUp, X } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "@/utils/APIs/interceptors";
import { toast } from "react-toastify";

// Axios instance — uses same interceptors as the rest of the app
const api = axios.create({ baseURL: "/api/user-ratings" });
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const CATEGORIES = [
  "mentor", "developer", "designer",
  "marketer", "founder", "influencer", "investor",
];

const LABELS = {
  mentor: "Mentor", developer: "Developer", designer: "Designer",
  marketer: "Marketer", founder: "Founder", influencer: "Influencer",
  investor: "Investor",
};

// ── Star row component ────────────────────────────────────────────────────────
function Stars({ value = 0, onChange, readonly = false, size = 16 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            size={size}
            className={`transition-colors ${
              n <= (hover || value)
                ? "text-amber-400 fill-amber-400"
                : "text-zinc-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Rate / Edit modal ─────────────────────────────────────────────────────────
function RateModal({ category, subjectId, subjectName, existing, onClose, onSaved }) {
  const [score, setScore]           = useState(existing?.score || 0);
  const [reviewText, setReviewText] = useState(existing?.review_text || "");
  const [saving, setSaving]         = useState(false);

  const submit = async () => {
    if (!score) { toast.error("Please pick a score"); return; }
    setSaving(true);
    try {
      await api.post(`/${subjectId}`, {
        category,
        score,
        review_text: reviewText.trim() || null,
      });
      toast.success(existing ? "Rating updated" : "Rating submitted");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to submit rating");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Rate as {LABELS[category]}
          </h3>
          <button onClick={onClose}><X size={18} className="text-zinc-400" /></button>
        </div>

        <p className="text-sm text-zinc-400">Rating {subjectName}</p>

        <div className="flex justify-center py-2">
          <Stars value={score} onChange={setScore} size={28} />
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Optional review..."
          maxLength={500}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5
                     text-sm text-white placeholder-zinc-600 outline-none resize-none"
        />

        <button
          onClick={submit}
          disabled={saving || !score}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40
                     rounded-xl text-black font-semibold text-sm transition-colors"
        >
          {saving ? "Saving…" : existing ? "Update Rating" : "Submit Rating"}
        </button>
      </div>
    </div>
  );
}

// ── Dispute modal ─────────────────────────────────────────────────────────────
function DisputeModal({ ratingId, onClose, onFiled }) {
  const [reason, setReason] = useState("");
  const [filing, setFiling] = useState(false);

  const submit = async () => {
    if (!reason.trim()) { toast.error("Please describe the issue"); return; }
    setFiling(true);
    try {
      await api.post(`/${ratingId}/dispute`, { reason: reason.trim() });
      toast.success("Dispute filed — our team will review it");
      onFiled();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to file dispute");
    } finally {
      setFiling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Dispute Rating</h3>
          <button onClick={onClose}><X size={18} className="text-zinc-400" /></button>
        </div>

        <p className="text-sm text-zinc-400">
          Explain why this rating is unfair. Our team will review it.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the issue…"
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5
                     text-sm text-white placeholder-zinc-600 outline-none resize-none"
        />

        <button
          onClick={submit}
          disabled={filing || !reason.trim()}
          className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40
                     rounded-xl text-white font-semibold text-sm transition-colors"
        >
          {filing ? "Filing…" : "File Dispute"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserRatingCard({ subjectId, subjectName }) {
  const { user } = useSelector((s) => s.auth);
  const isOwnProfile = String(user?.id) === String(subjectId);

  const [summary,   setSummary]   = useState({});   // { mentor: { average, count }, … }
  const [myRatings, setMyRatings] = useState({});   // { mentor: ratingObj, … }
  const [expanded,  setExpanded]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Modals
  const [rateModal,    setRateModal]    = useState(null); // category string
  const [disputeModal, setDisputeModal] = useState(null); // rating object

  const load = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const [sumRes, mineRes] = await Promise.allSettled([
        api.get(`/${subjectId}/summary`),
        !isOwnProfile ? api.get(`/${subjectId}/mine`) : Promise.resolve(null),
      ]);

      if (sumRes.status === "fulfilled") {
        setSummary(sumRes.value?.data?.data?.summary || sumRes.value?.data?.summary || {});
      }
      if (mineRes.status === "fulfilled" && mineRes.value) {
        const map = {};
        (mineRes.value?.data?.data?.ratings || mineRes.value?.data?.ratings || []).forEach((r) => {
          map[r.category] = r;
        });
        setMyRatings(map);
      }
    } catch (e) {
      console.error("UserRatingCard load error", e);
    } finally {
      setLoading(false);
    }
  }, [subjectId, isOwnProfile]);

  useEffect(() => { load(); }, [load]);

  // Overall average across all rated categories
  const ratedCats = Object.keys(summary);
  const overallAvg = ratedCats.length
    ? (ratedCats.reduce((s, k) => s + summary[k].average, 0) / ratedCats.length).toFixed(1)
    : null;

  const totalRatings = ratedCats.reduce((s, k) => s + summary[k].count, 0);

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-white">
              {loading
                ? "Loading…"
                : overallAvg
                ? `${overallAvg} / 5`
                : "No ratings yet"}
            </span>
            {totalRatings > 0 && (
              <span className="text-xs text-zinc-500">({totalRatings})</span>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded category breakdown */}
        {expanded && (
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((cat) => {
              const data     = summary[cat];
              const myRating = myRatings[cat];
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between py-1.5
                             border-b border-zinc-800 last:border-0"
                >
                  {/* Category + avg */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-zinc-400 w-20 shrink-0">
                      {LABELS[cat]}
                    </span>
                    {data ? (
                      <div className="flex items-center gap-1.5">
                        <Stars value={Math.round(data.average)} readonly size={11} />
                        <span className="text-xs text-zinc-500">
                          {data.average} ({data.count})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {/* Rate / Edit — only for OTHER people's profiles */}
                    {!isOwnProfile && (
                      <button
                        onClick={() => setRateModal(cat)}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700
                                   text-zinc-400 hover:border-amber-500/50 hover:text-amber-400
                                   transition-colors"
                      >
                        {myRating ? "Edit" : "Rate"}
                      </button>
                    )}

                    {/* Dispute — only for your OWN received ratings */}
                    {isOwnProfile && data && !myRating?.has_dispute && (
                      <button
                        onClick={() => setDisputeModal({ id: cat })}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700
                                   text-zinc-400 hover:border-red-500/50 hover:text-red-400
                                   transition-colors flex items-center gap-1"
                      >
                        <Flag size={9} /> Dispute
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rate / Edit modal */}
      {rateModal && (
        <RateModal
          category={rateModal}
          subjectId={subjectId}
          subjectName={subjectName}
          existing={myRatings[rateModal]}
          onClose={() => setRateModal(null)}
          onSaved={load}
        />
      )}

      {/* Dispute modal */}
      {disputeModal && (
        <DisputeModal
          ratingId={disputeModal.id}
          onClose={() => setDisputeModal(null)}
          onFiled={load}
        />
      )}
    </>
  );
}