import React, { useState, useEffect } from "react";
import { usePWAInstall } from "@/utils/hooks/use-pwa-install";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

export const PWAInstallPrompt = () => {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const onDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  const onInstall = () => {
    handleInstallClick();
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[9999]"
        >
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Install SFCollab</h3>
                <p className="text-[10px] text-white/60">Add to home screen for a better experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onInstall}
                className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Install
              </button>
              <button
                onClick={onDismiss}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
