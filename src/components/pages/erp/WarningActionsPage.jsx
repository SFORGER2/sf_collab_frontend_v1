// src/components/pages/erp/WarningActionsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

// Base URL to /api – we will append full paths
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export function WarningActionsPage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const loadWarnings = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      // ✅ Correct URL: /api/warnings?workspace_id=...
      const res = await api.get("/warnings", { params: { workspace_id: workspaceId } });
      setWarnings(
  res.data?.data?.warnings ||
  res.data?.data?.items ||
  []
);
    } catch (err) {
      console.error("Failed to load warnings", err);
      setError("Failed to load warnings");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  const resolveWarning = async (id, note = "") => {
    setActionLoading(id);
    try {
      await api.post(`/warnings/${id}/resolve`, { resolution_note: note });
      loadWarnings();
    } catch (err) {
      console.error("Failed to resolve warning", err);
      setError("Failed to resolve warning");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>⚠️ Warnings</h1>
      {error && <div style={styles.error}>{error}</div>}
      {warnings.length === 0 && <EmptyState />}
      {warnings.map(w => (
        <WarningCard key={w.id} warning={w} onResolve={resolveWarning} loading={actionLoading === w.id} />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// Warning Card Component
// ----------------------------------------------------------------------
function WarningCard({ warning, onResolve, loading }) {
  const [showModal, setShowModal] = useState(false);
  const typeLabel = warning.type?.replace(/_/g, " ").toUpperCase() || "WARNING";

  const handleResolve = (note) => {
    onResolve(warning.id, note);
    setShowModal(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.type}>{typeLabel}</span>
        <span style={styles.severity(warning.severity)}>{warning.severity || "MEDIUM"}</span>
      </div>
      <p style={styles.message}>{warning.message}</p>
      <div style={styles.meta}>
        <span>📅 {new Date(warning.created_at).toLocaleDateString()}</span>
        {warning.reference_date && <span>⏰ Due: {warning.reference_date}</span>}
      </div>
      {!warning.is_resolved && (
        <div style={styles.actions}>
          <button onClick={() => setShowModal(true)} style={styles.btnResolve} disabled={loading}>
            {loading ? "..." : "Resolve"}
          </button>
        </div>
      )}
      {warning.resolved_at && (
        <div style={styles.resolvedNote}>
          Resolved on {new Date(warning.resolved_at).toLocaleString()}
        </div>
      )}
      {showModal && (
        <ResolveModal
          onClose={() => setShowModal(false)}
          onConfirm={handleResolve}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Resolve Modal Component
// ----------------------------------------------------------------------
function ResolveModal({ onClose, onConfirm }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onConfirm(note);
    setSubmitting(false);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3 style={modalStyles.title}>Resolve Warning</h3>
        <textarea
          style={modalStyles.textarea}
          placeholder="Optional resolution note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
        <div style={modalStyles.buttons}>
          <button onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={modalStyles.confirmBtn}>
            {submitting ? "Resolving..." : "Confirm Resolve"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------
const styles = {
  container: { maxWidth: 800, margin: "0 auto", padding: "28px 20px" },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#f9fafb" },
  error: { background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: 10, marginBottom: 16, color: "#fca5a5" },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { display: "flex", gap: 12, alignItems: "center", marginBottom: 8 },
  type: { background: "#1e1b4b", color: "#a5b4fc", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600 },
  severity: (p) => ({
    background: p === "HIGH" ? "#450a0a" : p === "MEDIUM" ? "#451a03" : "#111827",
    color: p === "HIGH" ? "#f87171" : p === "MEDIUM" ? "#fbbf24" : "#9ca3af",
    padding: "2px 8px",
    borderRadius: 99,
    fontSize: 11,
  }),
  message: { color: "#e5e7eb", fontSize: 14, margin: "0 0 8px" },
  meta: { display: "flex", gap: 16, fontSize: 12, color: "#6b7280", marginBottom: 12 },
  actions: { display: "flex", gap: 8, marginTop: 8 },
  btnResolve: { background: "#4f46e5", border: "none", padding: "6px 14px", borderRadius: 6, color: "#fff", cursor: "pointer" },
  resolvedNote: { fontSize: 11, color: "#6b7280", marginTop: 8, fontStyle: "italic" },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#1f2937",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  title: { color: "#f9fafb", marginBottom: 16, fontSize: 18 },
  textarea: {
    width: "100%",
    background: "#374151",
    border: "1px solid #4b5563",
    borderRadius: 8,
    padding: 10,
    color: "#f9fafb",
    fontSize: 14,
    marginBottom: 20,
    resize: "vertical",
  },
  buttons: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { background: "#4b5563", border: "none", padding: "8px 16px", borderRadius: 6, color: "#fff", cursor: "pointer" },
  confirmBtn: { background: "#10b981", border: "none", padding: "8px 16px", borderRadius: 6, color: "#fff", cursor: "pointer" },
};

const Spinner = () => (
  <div style={{ textAlign: "center", padding: 60 }}>
    <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid #1f2937", borderTop: "3px solid #6366f1", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const EmptyState = () => (
  <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
    ✅ No pending warnings
  </div>
);