import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api/admin/audit-logs" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/").then(res => {
      setLogs(res.data.logs || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 28 }}>
      <h1>📜 Audit Logs</h1>
      <table>
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.created_at).toLocaleString()}</td>
              <td>{log.actor_user_id}</td>
              <td>{log.action}</td>
              <td>{log.entity_type} #{log.entity_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const th = { textAlign: "left", padding: "10px 6px", color: "#9ca3af" };
const td = { padding: "10px 6px", color: "#e5e7eb", fontSize: 13 };