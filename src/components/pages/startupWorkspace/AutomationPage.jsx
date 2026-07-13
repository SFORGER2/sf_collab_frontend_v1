// src/components/pages/startupWorkspace/AutomationPage.jsx
//
// "Automation" module (spec section 10). Backed by
// app/routes/automation_routes.py — CRUD for rules plus a manual
// test-trigger endpoint. NOTE: rules aren't automatically evaluated yet;
// "Test" logs what WOULD happen. Wiring rules into real events
// (milestone completion, low runway, etc.) is separate follow-up work.

import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bot, Plus, Loader2, Zap, Trash2, X, History } from 'lucide-react';
import { automationAPI } from '@/utils/APIs/automationAPI';

const TRIGGER_OPTIONS = [
  { value: 'milestone_completed', label: 'Milestone completed' },
  { value: 'low_runway', label: 'Runway drops low' },
  { value: 'new_applicant', label: 'New hiring applicant' },
  { value: 'execution_score_drop', label: 'Execution score drops' },
  { value: 'new_crm_deal', label: 'New CRM deal' },
  { value: 'custom', label: 'Custom' },
];

const ACTION_OPTIONS = [
  { value: 'notify_email', label: 'Send email' },
  { value: 'notify_inapp', label: 'In-app notification' },
  { value: 'webhook', label: 'Call a webhook' },
];

export default function AutomationPage() {
  const { startupId } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState(null);
  const [logs, setLogs] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await automationAPI.listRules(startupId);
      setRules(data || []);
    } catch (err) {
      toast.error('Could not load automation rules');
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (rule) => {
    try {
      await automationAPI.updateRule(rule.id, { isActive: !rule.isActive });
      load();
    } catch (err) {
      toast.error('Failed to update rule');
    }
  };

  const handleDelete = async (rule) => {
    try {
      await automationAPI.deleteRule(rule.id);
      toast.success('Rule deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  const handleTest = async (rule) => {
    try {
      const result = await automationAPI.testRule(rule.id);
      toast.success(result.log.detail);
      load();
    } catch (err) {
      toast.error('Failed to test rule');
    }
  };

  const handleViewLogs = async (rule) => {
    if (expandedLogs === rule.id) { setExpandedLogs(null); return; }
    try {
      const data = await automationAPI.listLogs(rule.id);
      setLogs(data || []);
      setExpandedLogs(rule.id);
    } catch (err) {
      toast.error('Could not load logs');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" /> Automation
          </h1>
          <p className="text-gray-500 text-sm">Rules that react to what's happening in your workspace.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300 text-xs">
        Rules aren't evaluated automatically yet — use "Test" to simulate what a rule would do.
        Automatic triggering needs to be wired into each event source separately.
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
      ) : rules.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-10">No automation rules yet.</p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{rule.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {TRIGGER_OPTIONS.find((t) => t.value === rule.triggerType)?.label} →{' '}
                    {ACTION_OPTIONS.find((a) => a.value === rule.actionType)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(rule)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      rule.isActive
                        ? 'text-green-300 bg-green-500/15 border-green-500/30'
                        : 'text-gray-400 bg-white/5 border-white/10'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Paused'}
                  </button>
                  <button onClick={() => handleTest(rule)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400" title="Test">
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleViewLogs(rule)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400" title="Logs">
                    <History className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(rule)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {expandedLogs === rule.id && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-xs">No runs logged yet.</p>
                  ) : (
                    logs.map((log) => (
                      <p key={log.id} className="text-xs text-gray-400">
                        <span className="text-gray-600">{new Date(log.triggeredAt).toLocaleString()}</span> — {log.detail}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewRuleModal
          startupId={startupId}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
}

function NewRuleModal({ startupId, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', triggerType: 'milestone_completed', actionType: 'notify_inapp', message: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Rule name is required'); return; }
    setSaving(true);
    try {
      await automationAPI.createRule(startupId, {
        name: form.name,
        triggerType: form.triggerType,
        actionType: form.actionType,
        actionConfig: form.message ? { message: form.message } : undefined,
      });
      toast.success('Rule created');
      onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[#0f1116] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">New Rule</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="modal-input" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">When</label>
          <select value={form.triggerType} onChange={(e) => setForm((f) => ({ ...f, triggerType: e.target.value }))} className="modal-input">
            {TRIGGER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Then</label>
          <select value={form.actionType} onChange={(e) => setForm((f) => ({ ...f, actionType: e.target.value }))} className="modal-input">
            {ACTION_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Message / config (optional)</label>
          <textarea rows={2} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="modal-input resize-none" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Rule
        </button>

        <style>{`
          .modal-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.75rem; padding: 0.55rem 0.8rem; color: white; font-size: 0.875rem; }
          .modal-input:focus { outline: none; border-color: rgba(59,130,246,0.5); }
        `}</style>
      </div>
    </div>
  );
}