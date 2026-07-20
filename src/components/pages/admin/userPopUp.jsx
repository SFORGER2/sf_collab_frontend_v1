import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { usersAPI } from "@/utils/APIs/userAPI";
import { getProfilePicture } from "@/utils/getProfilePicture";

const AVAILABLE_ROLES = ["founder", "builder", "investor", "influencer"];

const UserPopUp = ({ user, onClose }) => {
  const { access_token } = useSelector((state) => state.auth);

  const [roles, setRoles] = useState(user.roles || []);
  const [isBanned, setIsBanned] = useState(user.status === "banned");
  const [loading, setLoading] = useState(false);

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = async () => {
    if (isBanned && user.role === "admin") {
      toast.error("Cannot ban an admin user");
      return;
    }

    try {
      setLoading(true);

      const response = await usersAPI.updateProfile(
        user.id,
        {
          roles,
          status: isBanned ? "banned" : "active",
        },
        access_token,
        "application/json"
      );

      if (!response.success) {
        toast.error(response.message || "Failed to update user");
        return;
      }

      toast.success("User updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">

        {/* Header */}
        <div className="border-b border-gray-700/40 px-6 py-4 flex items-center gap-4">
          <img
            src={getProfilePicture(user)}
            alt={user.fullName}
            className="h-12 w-12 rounded-full object-cover border border-gray-700/60"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Manage User
              </h2>
              <a
                href={`/user-profile?userId=${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                View profile
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {user.fullName} • {user.email}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">

          {/* Roles */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((role) => {
                const active = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm capitalize transition
                      ${active
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-gray-700/40 text-gray-400 border border-gray-700 hover:bg-gray-600/40"
                      }
                    `}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-red-400">
                  Ban user
                </p>
                <p className="text-xs text-gray-400">
                  User will lose access immediately
                </p>
              </div>
              <input
                type="checkbox"
                checked={isBanned}
                onChange={() => setIsBanned((v) => !v)}
                className="w-4 h-4 accent-red-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-700/40 px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-700/40 text-gray-300 hover:bg-gray-600/40 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="
              px-5 py-2 rounded-lg font-medium text-white
              bg-gradient-to-r from-green-500 to-green-600
              hover:from-green-600 hover:to-green-700
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPopUp;
