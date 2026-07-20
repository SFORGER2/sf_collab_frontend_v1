// src/components/pages/erp/FlagsPage.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export function FlagsPage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlags = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/workspaces/${workspaceId}/flags`, { params: { status: "pending" } });
        setFlags(res.data.flags || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, [workspaceId]);

  const resolveFlag = async (flagId) => {
    try {
      await api.post(`/workspaces/${workspaceId}/flags/${flagId}/resolve`);
      setFlags(flags.filter(f => f.id !== flagId));
    } catch (err) {
      alert("Failed to resolve flag");
    }
  };

  if (loading) return <div>Loading flags...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 28 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🚩 Suspicious Flags</h1>
      {flags.length === 0 ? <div>No pending flags</div> : (
        <table style={{ width: "100%" }}>
          <thead><tr><th>ID</th><th>Reason</th><th>Reported</th><th>Action</th></tr></thead>
          <tbody>
            {flags.map(flag => (
              <tr key={flag.id}>
                <td>{flag.id}</td>
                <td>{flag.reason}</td>
                <td>{new Date(flag.created_at).toLocaleDateString()}</td>
                <td><button onClick={() => resolveFlag(flag.id)}>Resolve</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
const th = { textAlign: "left", padding: "12px 8px", color: "#9ca3af" };
const td = { padding: "12px 8px", color: "#e5e7eb" };
const styles = { resolveBtn: { background: "#10b981", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer" } };