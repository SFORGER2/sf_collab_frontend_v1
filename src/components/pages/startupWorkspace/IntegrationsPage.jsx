// src/components/pages/startupWorkspace/IntegrationsPage.jsx
//
// "Integrations" module (spec section 10). Backed by
// app/routes/integrations_routes.py — connection records per provider.
// NOTE: this manages connection records, not real OAuth handshakes.
// Wiring up actual OAuth per provider is separate, provider-specific work.

import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plug, CreditCard, HardDrive, Calendar, MessageCircle, Webhook, Loader2 } from 'lucide-react';
import { integrationsAPI } from '@/utils/APIs/integrationsAPI';

const PROVIDERS = [
  { value: 'stripe', label: 'Stripe', icon: CreditCard, desc: 'Payments — already partially wired up via Checkout.jsx' },
  { value: 'google_drive', label: 'Google Drive', icon: HardDrive, desc: 'File sync — endpoints already exist' },
  { value: 'google_calendar', label: 'Google Calendar', icon: Calendar, desc: 'Meeting sync' },
  { value: 'slack', label: 'Slack', icon: MessageCircle, desc: 'Team + automation notifications' },
  { value: 'webhook', label: 'Custom Webhook', icon: Webhook, desc: 'Send events to any URL you control' },
];

export default function IntegrationsPage() {
  const { startupId } = useOutletContext();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await integrationsAPI.listConnections(startupId);
      setConnections(data || []);
    } catch (err) {
      toast.error('Could not load integrations');
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => { load(); }, [load]);

  const connectionFor = (provider) => connections.find((c) => c.provider === provider);

  const handleConnect = async (provider) => {
    setBusyProvider(provider);
    try {
      await integrationsAPI.connect(startupId, provider, {});
      toast.success('Connected');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to connect');
    } finally {
      setBusyProvider(null);
    }
  };

  const handleDisconnect = async (connection) => {
    setBusyProvider(connection.provider);
    try {
      await integrationsAPI.disconnect(connection.id);
      toast.success('Disconnected');
      load();
    } catch (err) {
      toast.error('Failed to disconnect');
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Plug className="w-5 h-5 text-blue-400" /> Integrations
        </h1>
        <p className="text-gray-500 text-sm">Connect external tools to this startup's workspace.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300 text-xs">
        These toggles record that a connection exists — real OAuth handshakes per provider
        (Stripe Connect, Google auth, Slack app install) still need to be wired in individually.
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {PROVIDERS.map((p) => {
            const conn = connectionFor(p.value);
            const isConnected = conn?.status === 'connected';
            const busy = busyProvider === p.value;
            return (
              <div key={p.value} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <p.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.label}</p>
                    <p className="text-gray-500 text-xs">{p.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => (isConnected ? handleDisconnect(conn) : handleConnect(p.value))}
                  disabled={busy}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                    isConnected
                      ? 'text-red-300 bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                      : 'text-white bg-blue-600 border-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}