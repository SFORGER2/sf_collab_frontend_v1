// src/components/pages/startupWorkspace/CRMPage.jsx
//
// "CRM" module (spec section 10). Backed by app/routes/crm_routes.py —
// contacts and a deal pipeline, scoped to this startup.

import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Contact, Plus, X, Loader2, Mail, Phone, Building2, DollarSign, ChevronRight,
} from 'lucide-react';
import { crmAPI } from '@/utils/APIs/crmAPI';

const STAGE_ORDER = ['lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const STAGE_LABELS = {
  lead: 'Lead', contacted: 'Contacted', qualified: 'Qualified',
  proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};
const VISIBLE_STAGES = STAGE_ORDER.filter((s) => s !== 'lost');

export default function CRMPage() {
  const { startupId } = useOutletContext();
  const [tab, setTab] = useState('deals'); // 'deals' | 'contacts'

  const [contacts, setContacts] = useState([]);
  const [board, setBoard] = useState(null);
  const [totalValue, setTotalValue] = useState({ open: 0, won: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsData, pipelineData] = await Promise.all([
        crmAPI.listContacts(startupId),
        crmAPI.getPipelineBoard(startupId),
      ]);
      setContacts(contactsData || []);
      setBoard(pipelineData.board);
      setTotalValue(pipelineData.totalValue || { open: 0, won: 0 });
    } catch (err) {
      console.error('Failed to load CRM data:', err);
      toast.error('Could not load CRM data');
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => { load(); }, [load]);

  const handleMoveStage = async (deal, newStage) => {
    try {
      await crmAPI.updateDeal(deal.id, { stage: newStage });
      toast.success(`Moved ${deal.title} to ${STAGE_LABELS[newStage]}`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to move deal');
    }
  };

  const visibleStages = showArchived ? STAGE_ORDER : VISIBLE_STAGES;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Contact className="w-5 h-5 text-blue-400" /> CRM
          </h1>
          <p className="text-gray-500 text-sm">
            {`$${(totalValue.open || 0).toLocaleString()} open · $${(totalValue.won || 0).toLocaleString()} won`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab(tab === 'deals' ? 'contacts' : 'deals')}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-3 py-2 rounded-lg bg-white/5 border border-white/10"
          >
            {tab === 'deals' ? 'View Contacts' : 'View Pipeline'}
          </button>
          <button
            onClick={() => (tab === 'deals' ? setShowNewDeal(true) : setShowNewContact(true))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> {tab === 'deals' ? 'New Deal' : 'New Contact'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
      ) : tab === 'deals' ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showArchived ? 'Hide' : 'Show'} lost deals
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {visibleStages.map((stage) => (
              <div key={stage} className="w-64 flex-shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{STAGE_LABELS[stage]}</p>
                  <span className="text-xs text-gray-600">{board?.[stage]?.length ?? 0}</span>
                </div>
                <div className="space-y-2 min-h-[60px]">
                  {(board?.[stage] || []).map((deal) => (
                    <DealCard key={deal.id} deal={deal} onMoveStage={(s) => handleMoveStage(deal, s)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-sm col-span-full text-center py-10">No contacts yet.</p>
          ) : (
            contacts.map((c) => <ContactCard key={c.id} contact={c} />)
          )}
        </div>
      )}

      <AnimatePresence>
        {showNewContact && (
          <NewContactModal
            startupId={startupId}
            onClose={() => setShowNewContact(false)}
            onCreated={() => { setShowNewContact(false); load(); }}
          />
        )}
        {showNewDeal && (
          <NewDealModal
            startupId={startupId}
            contacts={contacts}
            onClose={() => setShowNewDeal(false)}
            onCreated={() => { setShowNewDeal(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DealCard({ deal, onMoveStage }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-white/20 transition-colors">
      <p className="text-white text-sm font-medium truncate">{deal.title}</p>
      {deal.contactName && <p className="text-gray-500 text-xs mt-1 truncate">{deal.contactName}</p>}
      {deal.value != null && (
        <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
          <DollarSign className="w-3 h-3" /> {Number(deal.value).toLocaleString()} {deal.currency}
        </p>
      )}
      <select
        value={deal.stage}
        onChange={(e) => onMoveStage(e.target.value)}
        className="w-full mt-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5
                   text-gray-300 text-xs focus:outline-none focus:border-blue-500/50"
      >
        {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
      </select>
    </div>
  );
}

function ContactCard({ contact }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-white text-sm font-medium">{contact.name}</p>
      {contact.company && (
        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1"><Building2 className="w-3 h-3" /> {contact.company}</p>
      )}
      {contact.email && (
        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {contact.email}</p>
      )}
      {contact.phone && (
        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {contact.phone}</p>
      )}
      <p className="text-gray-600 text-[11px] mt-2">{contact.dealCount} deal{contact.dealCount === 1 ? '' : 's'}</p>
    </div>
  );
}

function NewContactModal({ startupId, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', title: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await crmAPI.createContact({ startupId, ...form });
      toast.success('Contact added');
      onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="New Contact" icon={Contact} onClose={onClose}>
      <ModalField label="Name">
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="modal-input" />
      </ModalField>
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Email">
          <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="modal-input" />
        </ModalField>
        <ModalField label="Phone">
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="modal-input" />
        </ModalField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Company">
          <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="modal-input" />
        </ModalField>
        <ModalField label="Title">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="modal-input" />
        </ModalField>
      </div>
      <ModalField label="Notes">
        <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="modal-input resize-none" />
      </ModalField>
      <ModalSubmit onClick={handleSubmit} saving={saving} label="Add Contact" />
    </ModalShell>
  );
}

function NewDealModal({ startupId, contacts, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', contactId: '', value: '', currency: 'USD', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Deal title is required'); return; }
    setSaving(true);
    try {
      await crmAPI.createDeal({
        startupId,
        title: form.title,
        contactId: form.contactId || undefined,
        value: form.value ? Number(form.value) : undefined,
        currency: form.currency,
        notes: form.notes,
      });
      toast.success('Deal created');
      onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create deal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="New Deal" icon={DollarSign} onClose={onClose}>
      <ModalField label="Title">
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="modal-input" />
      </ModalField>
      <ModalField label="Contact">
        <select value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))} className="modal-input">
          <option value="">No contact</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </ModalField>
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Value">
          <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="modal-input" />
        </ModalField>
        <ModalField label="Currency">
          <input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="modal-input" />
        </ModalField>
      </div>
      <ModalField label="Notes">
        <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="modal-input resize-none" />
      </ModalField>
      <ModalSubmit onClick={handleSubmit} saving={saving} label="Create Deal" />
    </ModalShell>
  );
}

function ModalShell({ title, icon: Icon, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
        <style>{`
          .modal-input {
            width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.75rem; padding: 0.55rem 0.8rem; color: white; font-size: 0.875rem;
          }
          .modal-input:focus { outline: none; border-color: rgba(59,130,246,0.5); }
        `}</style>
      </motion.div>
    </motion.div>
  );
}

function ModalField({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function ModalSubmit({ onClick, saving, label }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
      {label}
    </button>
  );
}