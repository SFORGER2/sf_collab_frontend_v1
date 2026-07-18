// src/components/AssistantChat.jsx

// Usage:  <AssistantChat workspaceId={currentWorkspaceId} />
import { useEffect, useRef, useState } from 'react';
import assistantService from '@/services/assistantService';

const S = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 560,
          border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', overflow: 'hidden' },
  header: { padding: '10px 14px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 14 },
  body: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  row: (mine) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }),
  bubble: (mine) => ({ padding: '8px 12px', borderRadius: 10, fontSize: 14, whiteSpace: 'pre-wrap',
                       background: mine ? '#2563eb' : '#f3f4f6', color: mine ? '#fff' : '#111827' }),
  sources: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  action: { border: '1px solid #fbbf24', background: '#fffbeb', borderRadius: 10,
            padding: 10, fontSize: 13 },
  btnRow: { display: 'flex', gap: 8, marginTop: 8 },
  btn: (primary) => ({ padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                       border: primary ? 'none' : '1px solid #d1d5db',
                       background: primary ? '#2563eb' : '#fff', color: primary ? '#fff' : '#374151' }),
  inputRow: { display: 'flex', gap: 8, padding: 10, borderTop: '1px solid #e5e7eb' },
  input: { flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 },
};

export default function AssistantChat({ workspaceId = null }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! Ask me anything about your documents, or tell me to do something — e.g. \"schedule a standup tomorrow at 10am\" or \"write a pitch outline for our startup\"." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pendingAction]);

  const push = (msg) => setMessages((m) => [...m, msg]);

  const send = async (text, execute = false) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    if (!execute) push({ role: 'user', text });
    setInput('');
    try {
      const data = await assistantService.chat({
        message: text, workspaceId, conversationId, execute,
      });
      if (data.conversation_id) setConversationId(data.conversation_id);

      if (data.type === 'answer') {
        push({ role: 'assistant', text: data.answer, sources: data.sources, confidence: data.confidence });
      } else if (data.type === 'action_proposed') {
        setPendingAction({ message: text, description: data.description, action: data.action });
      } else if (data.type === 'action_executed') {
        setPendingAction(null);
        push({ role: 'assistant', text: `✅ Done — ${data.description}` });
      }
    } catch (err) {
      push({ role: 'assistant', text: `⚠️ ${err?.response?.data?.error || err.message}` });
    } finally {
      setBusy(false);
    }
  };

  const confirmAction = () => send(pendingAction.message, true);
  const cancelAction = () => {
    setPendingAction(null);
    push({ role: 'assistant', text: 'Okay, cancelled.' });
  };

  return (
    <div style={S.wrap}>
      <div style={S.header}>SF Assistant</div>
      <div style={S.body} ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} style={S.row(m.role === 'user')}>
            <div style={S.bubble(m.role === 'user')}>{m.text}</div>
            {m.sources?.length > 0 && (
              <div style={S.sources}>
                Sources: {m.sources.map((s) => s.title).join(' · ')}
                {m.confidence ? ` — confidence: ${m.confidence}` : ''}
              </div>
            )}
          </div>
        ))}
        {pendingAction && (
          <div style={S.action}>
            <div><strong>Confirm action:</strong> {pendingAction.description}</div>
            <div style={S.btnRow}>
              <button style={S.btn(true)} onClick={confirmAction} disabled={busy}>Confirm</button>
              <button style={S.btn(false)} onClick={cancelAction} disabled={busy}>Cancel</button>
            </div>
          </div>
        )}
        {busy && <div style={{ fontSize: 12, color: '#6b7280' }}>Thinking…</div>}
      </div>
      <div style={S.inputRow}>
        <input
          style={S.input}
          value={input}
          placeholder="Ask or instruct the assistant…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          disabled={busy}
        />
        <button style={S.btn(true)} onClick={() => send(input)} disabled={busy}>Send</button>
      </div>
    </div>
  );
}
