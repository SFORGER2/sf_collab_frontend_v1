import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { requestInterceptor, responseInterceptor } from '../../../utils/APIs/interceptors';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const milestonesApi = axios.create({ baseURL: `${API_BASE}/api/milestones` });
milestonesApi.interceptors.request.use(requestInterceptor);
milestonesApi.interceptors.response.use((r) => r, responseInterceptor);

const filesApi = axios.create({ baseURL: `${API_BASE}/api/milestone-files` });
filesApi.interceptors.request.use(requestInterceptor);
filesApi.interceptors.response.use((r) => r, responseInterceptor);

const T = {
  bg:       '#0f1117',
  surface:  '#1a1d27',
  card:     '#1e2130',
  border:   '#2a2d3e',
  text:     '#f1f5f9',
  muted:    '#64748b',
  subtle:   '#94a3b8',
  accent:   '#f97316',
  accentBg: 'rgba(249,115,22,0.12)',
  indigo:   '#6366f1',
  indigoBg: 'rgba(99,102,241,0.12)',
  green:    '#22c55e',
  greenBg:  'rgba(34,197,94,0.12)',
  red:      '#ef4444',
  redBg:    'rgba(239,68,68,0.12)',
  yellow:   '#eab308',
  yellowBg: 'rgba(234,179,8,0.12)',
  blue:     '#3b82f6',
  blueBg:   'rgba(59,130,246,0.12)',
};

const STATUS_CFG = {
  completed:   { color: T.green,  bg: T.greenBg,  label: 'Completed'   },
  in_progress: { color: T.blue,   bg: T.blueBg,   label: 'In Progress' },
  pending:     { color: T.yellow, bg: T.yellowBg, label: 'Pending'     },
  overdue:     { color: T.red,    bg: T.redBg,    label: 'Overdue'     },
};

const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtB = (b) => { if (!b) return ''; if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; };
const fIcon = (c) => ({ image: '🖼️', document: '📄' }[c] ?? '📎');
const iBtn  = { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, padding: 4, borderRadius: 6 };

// ── FileCard ──────────────────────────────────────────────────────────────────
function FileCard({ file, onToggleProof, onDelete }) {
  const [busy, setBusy] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 10, marginBottom: 6,
      border: `1px solid ${file.is_proof ? 'rgba(34,197,94,.3)' : T.border}`,
      background: file.is_proof ? 'rgba(34,197,94,.07)' : T.card,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{fIcon(file.file_category)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={`${API_BASE}${file.file_url}`} target="_blank" rel="noreferrer"
          style={{ fontWeight: 600, fontSize: 13, color: T.text, textDecoration: 'none',
            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.original_name}
        </a>
        <span style={{ fontSize: 11, color: T.muted }}>
          {fmtB(file.file_size)}{file.uploaded_by ? ` · ${file.uploaded_by.name}` : ''}
        </span>
      </div>
      {file.is_proof && (
        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
          background: T.greenBg, color: T.green, border: `1px solid rgba(34,197,94,.3)`, flexShrink: 0 }}>
          PROOF
        </span>
      )}
      <button onClick={async () => { setBusy(true); try { await onToggleProof(file.id, !file.is_proof); } finally { setBusy(false); } }}
        disabled={busy} title={file.is_proof ? 'Unmark proof' : 'Mark as proof'}
        style={{ ...iBtn, opacity: busy ? .4 : 1, color: file.is_proof ? T.green : T.muted }}>
        {file.is_proof ? '✅' : '☑️'}
      </button>
      <button onClick={async () => {
        if (!window.confirm(`Delete "${file.original_name}"?`)) return;
        setBusy(true); try { await onDelete(file.id); } finally { setBusy(false); }
      }} disabled={busy} style={{ ...iBtn, opacity: busy ? .4 : 1, color: T.muted }}>🗑️</button>
    </div>
  );
}

// ── UploadZone ────────────────────────────────────────────────────────────────
function UploadZone({ milestoneId, onUploaded }) {
  const inputRef              = useRef(null);
  const [drag,  setDrag]      = useState(false);
  const [prog,  setProg]      = useState(null);
  const [err,   setErr]       = useState('');

  const doUpload = async (file) => {
    setErr(''); setProg(0);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await filesApi.post(`/${milestoneId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProg(Math.round((e.loaded * 100) / e.total)),
      });
      onUploaded(res.data.file);
    } catch (e) { setErr(e?.response?.data?.error || 'Upload failed'); }
    finally { setProg(null); }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) doUpload(f); }}
        style={{ border: `2px dashed ${drag ? T.accent : T.border}`, borderRadius: 10,
          padding: '18px', textAlign: 'center', cursor: 'pointer',
          background: drag ? T.accentBg : T.surface, transition: 'all .15s' }}>
        <div style={{ fontSize: 22, marginBottom: 4 }}>📁</div>
        <p style={{ margin: 0, fontSize: 12, color: T.subtle }}>
          {prog !== null ? `Uploading… ${prog}%` : 'Click or drag a file to attach'}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: T.muted }}>PDF, DOCX, XLSX, PNG, JPG — max 20 MB</p>
      </div>
      {prog !== null && (
        <div style={{ height: 3, background: T.border, borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${prog}%`, background: T.accent, borderRadius: 4, transition: 'width .2s' }} />
        </div>
      )}
      {err && <p style={{ margin: '4px 0 0', fontSize: 11, color: T.red }}>{err}</p>}
      <input ref={inputRef} type="file" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files[0]; if (f) doUpload(f); e.target.value = ''; }} />
    </div>
  );
}

// ── FilesPanel ────────────────────────────────────────────────────────────────
function FilesPanel({ milestoneId }) {
  const [proof, setProof]   = useState([]);
  const [docs,  setDocs]    = useState([]);
  const [load,  setLoad]    = useState(true);
  const [err,   setErr]     = useState('');

  useEffect(() => {
    (async () => {
      setLoad(true); setErr('');
      try {
        const res = await filesApi.get(`/${milestoneId}`);
        setProof(res.data.proof_files || []);
        setDocs(res.data.documents   || []);
      } catch { setErr('Could not load files.'); }
      finally  { setLoad(false); }
    })();
  }, [milestoneId]);

  const onUploaded = (f) => setDocs((p) => [f, ...p]);

  const onToggleProof = async (fileId, isProof) => {
    await filesApi.patch(`/${fileId}/mark-proof`, { is_proof: isProof });
    if (isProof) {
      const f = docs.find((x) => x.id === fileId);
      if (f) { setDocs((p) => p.filter((x) => x.id !== fileId)); setProof((p) => [{ ...f, is_proof: true }, ...p]); }
    } else {
      const f = proof.find((x) => x.id === fileId);
      if (f) { setProof((p) => p.filter((x) => x.id !== fileId)); setDocs((p) => [{ ...f, is_proof: false }, ...p]); }
    }
  };

  const onDelete = async (fileId) => {
    await filesApi.delete(`/${fileId}`);
    setProof((p) => p.filter((x) => x.id !== fileId));
    setDocs((p)  => p.filter((x) => x.id !== fileId));
  };

  const SectionLabel = ({ color, children }) => (
    <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color, letterSpacing: '.07em', textTransform: 'uppercase' }}>{children}</p>
  );

  return (
    <div>
      <UploadZone milestoneId={milestoneId} onUploaded={onUploaded} />
      {load && <p style={{ fontSize: 12, color: T.muted }}>Loading files…</p>}
      {err  && <p style={{ fontSize: 12, color: T.red }}>{err}</p>}
      {!load && !err && (
        <>
          <div style={{ marginBottom: 18 }}>
            <SectionLabel color={T.green}>✅ Proof Files ({proof.length})</SectionLabel>
            {proof.length === 0
              ? <p style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>No proof files yet.</p>
              : proof.map((f) => <FileCard key={f.id} file={f} onToggleProof={onToggleProof} onDelete={onDelete} />)}
          </div>
          <div>
            <SectionLabel color={T.muted}>📄 Documents ({docs.length})</SectionLabel>
            {docs.length === 0
              ? <p style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>No documents attached.</p>
              : docs.map((f) => <FileCard key={f.id} file={f} onToggleProof={onToggleProof} onDelete={onDelete} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ── MilestoneCard ─────────────────────────────────────────────────────────────
function MilestoneCard({ milestone, isSelected, onClick }) {
  const s   = STATUS_CFG[milestone.status] || STATUS_CFG.pending;
  const pct = milestone.progress_percentage ?? 0;
  return (
    <div onClick={onClick} style={{
      padding: '13px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 6,
      border: `1px solid ${isSelected ? T.accent : T.border}`,
      background: isSelected ? T.accentBg : T.card, transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: T.text, flex: 1, paddingRight: 8,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {milestone.title}
        </p>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
          background: s.bg, color: s.color, border: `1px solid ${s.color}44`, flexShrink: 0 }}>
          {s.label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99,
            background: isSelected ? T.accent : T.indigo, transition: 'width .4s' }} />
        </div>
        <span style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>{pct}%</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: T.muted }}>Due {fmt(milestone.due_date)}</p>
    </div>
  );
}

// ── MilestoneDetail ───────────────────────────────────────────────────────────
function MilestoneDetail({ milestone, onStatusChange }) {
  const [tab,    setTab]    = useState('files');
  const [saving, setSaving] = useState(false);
  const s   = STATUS_CFG[milestone.status] || STATUS_CFG.pending;
  const pct = milestone.progress_percentage ?? 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text, flex: 1, paddingRight: 16 }}>
            {milestone.title}
          </h2>
          <select value={milestone.status} disabled={saving}
            onChange={async (e) => { setSaving(true); try { await onStatusChange(milestone.id, e.target.value); } finally { setSaving(false); } }}
            style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
              border: `1px solid ${s.color}55`, background: s.bg, color: s.color, cursor: 'pointer', outline: 'none' }}>
            {['pending','in_progress','completed','overdue'].map((st) => (
              <option key={st} value={st} style={{ background: T.surface, color: T.text }}>
                {STATUS_CFG[st]?.label || st}
              </option>
            ))}
          </select>
        </div>

        {milestone.description && (
          <p style={{ margin: '0 0 14px', fontSize: 13, color: T.subtle, lineHeight: 1.7 }}>
            {milestone.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99,
              background: `linear-gradient(90deg, ${T.indigo}, ${T.accent})` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.accent }}>{pct}%</span>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['📅 Start', fmt(milestone.start_date)], ['🏁 Due', fmt(milestone.due_date)], ['🆔 ID', `#${milestone.id}`]].map(([label, val]) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, color: T.subtle, fontWeight: 600 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, paddingLeft: 24, background: T.surface }}>
        {[['files','📎 Files'], ['details','📋 Details']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '12px 16px', fontSize: 13, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? T.accent : T.muted, border: 'none', background: 'transparent',
              borderBottom: `2px solid ${tab === key ? T.accent : 'transparent'}`,
              cursor: 'pointer', transition: 'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: T.bg }}>
        {tab === 'files' && <FilesPanel milestoneId={milestone.id} />}
        {tab === 'details' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[['Status', s.label], ['Progress', `${pct}%`], ['Start Date', fmt(milestone.start_date)],
                ['Due Date', fmt(milestone.due_date)], ['Created', fmt(milestone.created_at)], ['ID', `#${milestone.id}`]
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '12px 14px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.text }}>{val}</p>
                </div>
              ))}
            </div>
            {milestone.description && (
              <div style={{ padding: 14, background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase' }}>Description</p>
                <p style={{ margin: 0, fontSize: 13, color: T.subtle, lineHeight: 1.7 }}>{milestone.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MilestonePage() {
  const [milestones, setMilestones] = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('all');
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const res  = await milestonesApi.get('/');
        const list = res.data?.milestones || res.data || [];
        setMilestones(list);
        if (list.length > 0) setSelected(list[0]);
      } catch { setError('Could not load milestones.'); }
      finally  { setLoading(false); }
    })();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await milestonesApi.patch(`/${id}`, { status: newStatus });
      const upd = (m) => m.id === id ? { ...m, status: newStatus } : m;
      setMilestones((p) => p.map(upd));
      setSelected((p)   => p?.id === id ? { ...p, status: newStatus } : p);
    } catch { alert('Failed to update status.'); }
  };

  const filtered = milestones.filter((m) =>
    (filter === 'all' || m.status === filter) &&
    (!search || m.title?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    ['Total',       milestones.length,                                              T.indigo, T.indigoBg],
    ['Completed',   milestones.filter((m) => m.status === 'completed').length,     T.green,  T.greenBg ],
    ['In Progress', milestones.filter((m) => m.status === 'in_progress').length,   T.blue,   T.blueBg  ],
    ['Overdue',     milestones.filter((m) => m.status === 'overdue').length,       T.red,    T.redBg   ],
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif', background: T.bg, color: T.text }}>

      {/* Top bar */}
      <div style={{ padding: '16px 24px', background: T.surface, borderBottom: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text }}>🏁 Milestones</h1>
          <p style={{ margin: 0, fontSize: 12, color: T.muted }}>Track progress · attach files · mark proof of completion</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {stats.map(([label, val, col, bg]) => (
            <div key={label} style={{ padding: '6px 14px', borderRadius: 10,
              background: bg, border: `1px solid ${col}33`, textAlign: 'center', minWidth: 72 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: col }}>{val}</p>
              <p style={{ margin: 0, fontSize: 10, color: col, opacity: .75 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left panel */}
        <div style={{ width: 300, borderRight: `1px solid ${T.border}`, background: T.surface,
          display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: 12, borderBottom: `1px solid ${T.border}` }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milestones…"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.card, color: T.text,
                fontSize: 13, marginBottom: 8, boxSizing: 'border-box', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[['all','All'],['pending','Pending'],['in_progress','Active'],['completed','Done'],['overdue','Overdue']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, border: 'none',
                    cursor: 'pointer', fontWeight: filter === val ? 700 : 400,
                    background: filter === val ? T.accent : T.card,
                    color:      filter === val ? '#fff'   : T.muted,
                    transition: 'all .15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {loading && <p style={{ textAlign: 'center', color: T.muted, fontSize: 13, marginTop: 32 }}>Loading…</p>}
            {error   && <p style={{ color: T.red, fontSize: 13 }}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <p style={{ fontSize: 36 }}>🏁</p>
                <p style={{ fontSize: 13, color: T.muted }}>No milestones found.</p>
              </div>
            )}
            {filtered.map((m) => (
              <MilestoneCard key={m.id} milestone={m}
                isSelected={selected?.id === m.id}
                onClick={() => setSelected(m)} />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
          {selected
            ? <MilestoneDetail milestone={selected} onStatusChange={handleStatusChange} />
            : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 52 }}>🏁</span>
                <p style={{ fontSize: 14, color: T.muted }}>Select a milestone to view details</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}