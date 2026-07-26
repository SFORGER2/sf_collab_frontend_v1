import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardSelectorModal from "./DashboardSelectorModal";
import { CosmosButton, RoleTabs, ROLE_ACCENTS } from "@/components/cosmos";

const AVAILABLE_ROLES = ["builder", "founder", "mentor", "influencer", "investor"];

/**
 * Role switcher.
 *
 * Roles the user already has are one click away as coloured tabs — the same
 * five-profile control as the landing page. Roles they don't have yet go
 * through the selector modal, which handles the influencer application flow.
 *
 * This replaced a title + dropdown button that took two clicks and a modal to
 * switch between dashboards the user already had access to.
 */
export default function DashboardChangeSection({
  sections = [],
  onSectionChange,
  activeRole,
  setActiveRole,
  userRoles,
  setUserRoles,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const ownedRoles = (userRoles || []).filter((r) => ROLE_ACCENTS[r]);
  const unclaimed = AVAILABLE_ROLES.filter((r) => !ownedRoles.includes(r));

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

    setUserRoles((prevRoles) => {
      const updatedRoles = [...prevRoles, role];
      localStorage.setItem("userRoles", JSON.stringify(updatedRoles));
      return updatedRoles;
    });
    onSectionChange(role);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {ownedRoles.length > 0 && (
          <RoleTabs
            value={activeRole}
            onChange={onSectionChange}
            roles={ownedRoles}
            label="Select your dashboard"
          />
        )}

        {unclaimed.length > 0 && (
          <CosmosButton variant="quiet" size="sm" onClick={() => setIsOpen(true)}>
            <Plus size={14} /> Add a role
          </CosmosButton>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <DashboardSelectorModal
            sections={sections.filter((s) => AVAILABLE_ROLES.includes(s.id))}
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
