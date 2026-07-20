import React from 'react';
import { Handshake } from 'lucide-react';
import ComingSoonModule from './ComingSoonModule';

export default function InvestorPortalPage() {
  return (
    <ComingSoonModule
      icon={Handshake}
      title="Investor Portal"
      description="A dedicated space for investors to review your metrics, documents, and cap table without exposing your full workspace."
      plannedFeatures={[
        'Investor-facing metrics dashboard',
        'Data room / shared document access',
        'Cap table & round tracking',
        'Investor update broadcasts',
      ]}
    />
  );
}