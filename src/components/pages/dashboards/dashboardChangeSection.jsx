import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardSelectorModal from "./DashboardSelectorModal";

const AVAILABLE_ROLES = ["builder", "founder", "influencer", "investor"];

export default function DashboardChangeSection({
  sections = [],
  onSectionChange,
  activeRole,
  setActiveRole,
  userRoles,
  setUserRoles
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const activeSection = sections.find(s => s.id === activeRole);

  const handleRoleSelect = (role) => {
    if (!AVAILABLE_ROLES.includes(role)) {
      toast.error("Invalid role selected");
      return;
    }

    if (role === "influencer" && !userRoles?.includes("influencer")) {
      toast.info("Please complete the Influencer Application Form first.", { autoClose: 6000 });
      navigate("/apply-influencer");
      setIsOpen(false);
      return;
    }
    setUserRoles(prevRoles => {
      const updatedRoles = [...prevRoles, role];
      localStorage.setItem('userRoles', JSON.stringify(updatedRoles));
      return updatedRoles;
    });
    onSectionChange(role);
    setIsOpen(false);
  };

  return (
    <>
      <div className="z-50 flex items-center justify-between px-4 my-6">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-xl font-semibold text-white"
        >
          Select your dashboard
        </motion.h2>

        {/* Selector */}
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          
          className="
            roles
            relative flex items-center gap-3 px-5 py-2.5
            rounded-xl
            bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-black/80
            border border-white/10
            text-white font-medium
            backdrop-blur-md
            hover:border-blue-400/40
            hover:shadow-xl hover:shadow-blue-500/10
            transition-colors
          "
        >
          {/* Glow */}
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity" />

          <span className="relative z-10 text-sm text-slate-300">
            {activeSection?.label || "Choose dashboard"}
          </span>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 text-slate-400"
          >
            <ChevronDown size={18} />
          </motion.span>
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <DashboardSelectorModal
            sections={sections.filter(s => AVAILABLE_ROLES.includes(s.id))}
            activeRole={activeRole}
            onClose={() => setIsOpen(false)}
            onSelect={handleRoleSelect}
            setActiveRole={setActiveRole}
            userRoles={userRoles}
          />
        )}
      </AnimatePresence>
    </>
  );
}
