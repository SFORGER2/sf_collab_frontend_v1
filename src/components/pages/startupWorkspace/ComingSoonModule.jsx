// src/components/pages/startupWorkspace/ComingSoonModule.jsx
//
// Shared shell for Startup Workspace modules that don't have backend
// support yet (CRM, Hiring, Investor Portal, Business Intelligence,
// Automation, Integrations). Keeps the module visible and navigable
// in the workspace per the spec, without faking data that doesn't exist.

import React from 'react';
import { motion } from 'framer-motion';

export default function ComingSoonModule({ icon: Icon, title, description, plannedFeatures = [] }) {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-5"
      >
        <Icon className="w-6 h-6 text-blue-400" />
      </motion.div>
      <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{description}</p>

      {plannedFeatures.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left inline-block">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Planned</p>
          <ul className="space-y-2">
            {plannedFeatures.map((f, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-6">This module needs backend work before it can go live.</p>
    </div>
  );
}