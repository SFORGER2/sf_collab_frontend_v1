import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { usersAPI } from "@/utils/APIs/userAPI";
import { useSelector } from "react-redux";

const AVAILABLE_ROLES = ["builder", "founder", "influencer", "investor"];

export default function DashboardSelectorModal({
  sections = [],
  activeRole,
  onSelect,
  onClose,
  setActiveRole,
  userRoles
}) {
  const navigate = useNavigate();
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const handleAddRole = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (selectedRole === "investor" && !userRoles?.includes("influencer")) {
      toast.info("Please complete the Influencer Application Form first.", { autoClose: 6000 });
      navigate("/apply-influencer");
      onClose();
      return;
    }
    await usersAPI.addRole([selectedRole]);
    onSelect(selectedRole);

    setActiveRole(selectedRole);
    setShowAddRole(false);
    
  };

  // Get roles not already in sections
  const availableRolesToAdd = AVAILABLE_ROLES.filter(
    role => !sections.some(s => s.id === role)
  );

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
        }}
        className="
          w-full max-w-md
          rounded-2xl
          bg-gradient-to-br from-slate-900 via-slate-900/95 to-black
          border border-white/10
          shadow-2xl shadow-black/50
          p-6
        "
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">
            Choose your dashboard
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-3">
          {sections.map((section) => {
            const isActive = section.id === activeRole;

            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(section.id)}
                className={`
                  flex items-center justify-between
                  px-4 py-3 rounded-xl
                  border transition-all
                  ${
                    isActive
                      ? "bg-blue-500/15 border-blue-400/40 text-blue-300"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }
                `}
              >
                <span className="font-medium">
                  {section.label || section.name}
                </span>

                {isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    Active
                  </span>
                )}
              </motion.button>
            );
          })}

          {!showAddRole ? (
            availableRolesToAdd.length > 0 && (
              <motion.button
                onClick={() => setShowAddRole(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  mt-4 w-full
                  px-4 py-3 rounded-xl
                  bg-blue-600/20 border border-blue-500/30
                  text-blue-400 font-medium
                  hover:bg-blue-600/30
                  transition-colors
                "
              >
                Add New Dashboard
              </motion.button>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <label className="block text-sm text-slate-300 font-medium">
                Select a role:
              </label>
              <div className="space-y-2">
                {availableRolesToAdd.map((role) => (
                  <motion.button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      w-full px-3 py-2 rounded-lg
                      border transition-all text-left capitalize
                      ${
                        selectedRole === role
                          ? "bg-blue-500/20 border-blue-400/40 text-blue-300"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }
                    `}
                  >
                    {role}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddRole(false);
                    setSelectedRole("");
                  }}
                  className="
                    flex-1 px-4 py-2 rounded-lg
                    bg-white/10 border border-white/20
                    text-slate-300 font-medium
                    hover:bg-white/20
                    transition-colors
                  "
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRole}
                  className="
                    flex-1 px-4 py-2 rounded-lg
                    bg-green-500/20 border border-green-400/30
                    text-green-400 font-medium
                    hover:bg-green-500/30
                    transition-colors disabled:opacity-50
                  "
                  disabled={!selectedRole}
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
