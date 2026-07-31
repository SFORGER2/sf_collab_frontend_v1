// src/components/pages/startupWorkspace/FinancialManagementPage.jsx
//
// "Financial Management" module (spec section 10). Reads/writes the
// financial columns that already exist on the Startup model
// (revenue, funding_amount, funding_round, burn_rate, runway_months,
// valuation, financial_notes).
//
// NOTE: the backend's PUT /startups/:id route reads `request.form`,
// not JSON — so this page submits a FormData body, not a plain object.

import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Wallet, Save, Loader2 } from 'lucide-react';
import { startupsAPI } from '@/utils/APIs/startupsAPI';

const FUNDING_ROUNDS = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c+', 'bootstrapped'];

const emptyForm = {
  revenue: '',
  funding_amount: '',
  funding_round: 'pre-seed',
  burn_rate: '',
  runway_months: '',
  valuation: '',
  financial_notes: '',
};

export default function FinancialManagementPage() {
  const { startup, startupId } = useOutletContext();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!startup) return;
    setForm({
      revenue: startup.revenue ?? '',
      funding_amount: startup.funding_amount ?? '',
      funding_round: startup.funding_round ?? 'pre-seed',
      burn_rate: startup.burn_rate ?? '',
      runway_months: startup.runway_months ?? '',
      valuation: startup.valuation ?? '',
      financial_notes: startup.financial_notes ?? '',
    });
  }, [startup]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? '');
      });
      await startupsAPI.update(startupId, formData);
      toast.success('Financials updated');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update financials');
    } finally {
      setSaving(false);
    }
  };

  const burn = Number(form.burn_rate) || 0;
  const funding = Number(form.funding_amount) || 0;
  const impliedRunway = burn > 0 ? Math.floor(funding / burn) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-400" /> Financial Management
        </h1>
        <p className="text-gray-500 text-sm">Revenue, funding, burn rate, and valuation for {startup?.name}.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Revenue (USD)">
            <input
              type="number" min="0" value={form.revenue} onChange={handleChange('revenue')}
              className="input-field"
            />
          </Field>
          <Field label="Funding Raised (USD)">
            <input
              type="number" min="0" value={form.funding_amount} onChange={handleChange('funding_amount')}
              className="input-field"
            />
          </Field>
          <Field label="Funding Round">
            <select value={form.funding_round} onChange={handleChange('funding_round')} className="input-field">
              {FUNDING_ROUNDS.map((r) => (
                <option key={r} value={r} style={{ backgroundColor: 'var(--surface-card)', color: "var(--color-star)" }}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Valuation (USD)">
            <input
              type="number" min="0" value={form.valuation} onChange={handleChange('valuation')}
              className="input-field"
            />
          </Field>
          <Field label="Monthly Burn Rate (USD)">
            <input
              type="number" min="0" value={form.burn_rate} onChange={handleChange('burn_rate')}
              className="input-field"
            />
          </Field>
          <Field label="Runway (months)">
            <input
              type="number" min="0" value={form.runway_months} onChange={handleChange('runway_months')}
              className="input-field"
            />
            {impliedRunway !== null && (
              <p className="text-gray-500 text-[11px] mt-1">
                Implied from funding ÷ burn: ~{impliedRunway} months
              </p>
            )}
          </Field>
        </div>

        <Field label="Financial Notes">
          <textarea
            rows={4} value={form.financial_notes} onChange={handleChange('financial_notes')}
            placeholder="Context for investors — burn assumptions, upcoming rounds, etc."
            className="input-field resize-none"
          />
        </Field>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500
                     disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save financials
        </button>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--surface-border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          color: white;
          font-size: 0.875rem;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(34,197,94,0.5);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}