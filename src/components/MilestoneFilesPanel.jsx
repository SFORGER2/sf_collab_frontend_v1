import { useState, useEffect, useRef } from 'react';
import {
  uploadMilestoneFile,
  getMilestoneFiles,
  markFileAsProof,
  deleteMilestoneFile,
} from '../services/milestoneFileService';

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (category) => {
  if (category === 'image') return '🖼️';
  if (category === 'document') return '📄';
  return '📎';
};

// ─── sub-components ───────────────────────────────────────────────────────────

function FileCard({ file, onToggleProof, onDelete }) {
  const [busy, setBusy] = useState(false);

  const handleProof = async () => {
    setBusy(true);
    try { await onToggleProof(file.id, !file.is_proof); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${file.original_name}"?`)) return;
    setBusy(true);
    try { await onDelete(file.id); }
    finally { setBusy(false); }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${file.is_proof ? '#22c55e44' : '#e5e7eb'}`,
        background: file.is_proof ? '#f0fdf4' : '#fff',
        marginBottom: '8px',
      }}
    >
      {/* icon */}
      <span style={{ fontSize: '22px', flexShrink: 0 }}>{fileIcon(file.file_category)}</span>

      {/* file info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={file.file_url}
          target="_blank"
          rel="noreferrer"
          style={{
            fontWeight: 600,
            fontSize: '13px',
            color: '#111827',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.original_name}
        </a>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>
          {formatBytes(file.file_size)}
          {file.uploaded_by ? ` · ${file.uploaded_by.name}` : ''}
        </span>
      </div>

      {/* proof badge */}
      {file.is_proof && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            background: '#22c55e',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          PROOF
        </span>
      )}

      {/* actions */}
      <button
        onClick={handleProof}
        disabled={busy}
        title={file.is_proof ? 'Unmark proof' : 'Mark as proof'}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '16px',
          opacity: busy ? 0.4 : 1,
          flexShrink: 0,
        }}
      >
        {file.is_proof ? '✅' : '☑️'}
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        title="Delete file"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '16px',
          opacity: busy ? 0.4 : 1,
          flexShrink: 0,
        }}
      >
        🗑️
      </button>
    </div>
  );
}


function UploadZone({ milestoneId, onUploaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);   // null | 0-100
  const [error, setError] = useState('');

  const doUpload = async (file) => {
    setError('');
    setProgress(0);
    try {
      const res = await uploadMilestoneFile(milestoneId, file, setProgress);
      onUploaded(res.data.file);
    } catch (e) {
      setError(e?.response?.data?.error || 'Upload failed');
    } finally {
      setProgress(null);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) doUpload(file);
    e.target.value = '';           // reset input so same file can be re-chosen
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#eef2ff' : '#fafafa',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>📁</div>
        <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>
          {progress !== null
            ? `Uploading… ${progress}%`
            : 'Click or drag a file here to attach'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
          PDF, DOCX, XLSX, PNG, JPG, ZIP — max 20 MB
        </p>
      </div>

      {progress !== null && (
        <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#6366f1',
              borderRadius: '4px',
              transition: 'width 0.2s',
            }}
          />
        </div>
      )}

      {error && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ef4444' }}>{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
}


// ─── main component ───────────────────────────────────────────────────────────

/**
 * MilestoneFilesPanel
 * Props:
 *   milestoneId  {number}  — required
 */
export default function MilestoneFilesPanel({ milestoneId }) {
  const [proofFiles, setProofFiles]   = useState([]);
  const [documents,  setDocuments]    = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getMilestoneFiles(milestoneId);
      setProofFiles(res.data.proof_files || []);
      setDocuments(res.data.documents   || []);
    } catch {
      setFetchError('Could not load files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [milestoneId]);

  // Called when a new file is uploaded — optimistically prepend to documents
  const handleUploaded = (newFile) => {
    setDocuments((prev) => [newFile, ...prev]);
  };

  // Toggle proof — move file between the two lists
  const handleToggleProof = async (fileId, isProof) => {
    await markFileAsProof(fileId, isProof);
    // Move card between lists without re-fetching
    if (isProof) {
      const file = documents.find((f) => f.id === fileId);
      if (file) {
        setDocuments((prev)  => prev.filter((f) => f.id !== fileId));
        setProofFiles((prev) => [{ ...file, is_proof: true }, ...prev]);
      }
    } else {
      const file = proofFiles.find((f) => f.id === fileId);
      if (file) {
        setProofFiles((prev) => prev.filter((f) => f.id !== fileId));
        setDocuments((prev)  => [{ ...file, is_proof: false }, ...prev]);
      }
    }
  };

  // Delete — remove from whichever list it's in
  const handleDelete = async (fileId) => {
    await deleteMilestoneFile(fileId);
    setProofFiles((prev) => prev.filter((f) => f.id !== fileId));
    setDocuments((prev)  => prev.filter((f) => f.id !== fileId));
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '680px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
        📎 Milestone Files
      </h3>

      {/* upload zone */}
      <UploadZone milestoneId={milestoneId} onUploaded={handleUploaded} />

      {loading && (
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading files…</p>
      )}

      {fetchError && (
        <p style={{ fontSize: '13px', color: '#ef4444' }}>{fetchError}</p>
      )}

      {!loading && !fetchError && (
        <>
          {/* ── proof files ── */}
          <section style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✅ Proof Files ({proofFiles.length})
            </h4>
            {proofFiles.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                No proof files yet. Upload a file and mark it as proof.
              </p>
            ) : (
              proofFiles.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  onToggleProof={handleToggleProof}
                  onDelete={handleDelete}
                />
              ))
            )}
          </section>

          {/* ── latest docs ── */}
          <section>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📄 Documents ({documents.length})
            </h4>
            {documents.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                No documents attached yet.
              </p>
            ) : (
              documents.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  onToggleProof={handleToggleProof}
                  onDelete={handleDelete}
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}