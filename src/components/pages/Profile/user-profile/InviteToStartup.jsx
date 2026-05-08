import { useState, useEffect, useMemo } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startupsAPI } from "@/utils/APIs/startupsAPI";

export default function InviteToStartup({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // ✅ Derive selected startup safely
  const selectedStartup = useMemo(() => {
    return startups.find((s) => String(s.id) === selectedStartupId);
  }, [startups, selectedStartupId]);

  useEffect(() => {
    if (isOpen) fetchStartups();
  }, [isOpen]);

  const fetchStartups = async () => {
    try {
      setFetching(true);
      const response = await startupsAPI.getAll({
        my_startups: true,
        per_page: 50,
      });

      if (response.success && response.data?.startups) {
        setStartups(response.data.startups);
      }
    } catch (error) {
      console.error("Error fetching startups:", error);
      toast.error("Failed to load startups");
    } finally {
      setFetching(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedStartupId) {
      toast.warning("Please select a startup");
      return;
    }

    if (!selectedRole) {
      toast.warning("Please select a role");
      return;
    }

    try {
      setLoading(true);

      const response = await startupsAPI.createInvitation(selectedStartupId, {
        user_id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        role: selectedRole,
      });

      if (response.success) {
        toast.success(
          `${user.firstName} ${user.lastName} invited to ${selectedStartup.name}`
        );

        setIsOpen(false);
        setSelectedStartupId("");
        setSelectedRole("");
      } else {
        throw new Error(response.error || "Failed to invite member");
      }
    } catch (error) {

      toast.error(error.message || error.error || error.data.error || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Invite to Startup
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-gray-900 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Invite {user.firstName} {user.lastName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Startup Selection */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block font-medium">
                Select Startup
              </label>

              <Select
                value={selectedStartupId}
                onValueChange={(id) => {
                  setSelectedStartupId(id);
                  setSelectedRole(""); // reset role on startup change
                }}
                disabled={fetching}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue
                    placeholder={
                      fetching
                        ? "Loading startups..."
                        : "Choose a startup"
                    }
                  />
                </SelectTrigger>

                <SelectContent className="bg-gray-800 border-gray-700">
                  {startups.map((startup) => (
                    <SelectItem
                      key={startup.id}
                      value={String(startup.id)}
                      className="text-white focus:bg-blue-600"
                    >
                      {startup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-sm text-gray-300 mb-3 block font-medium">
                Select Role
              </label>

              {!selectedStartup ? (
                <div className="text-xs text-gray-500">
                  Select a startup first
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(selectedStartup.roles || {}).map(
                    (role, idx) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all
                          ${
                            selectedRole === role
                              ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20"
                              : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                          }
                        `}
                      >
                        {role}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
              >
                {loading ? "Inviting..." : "Send Invite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}