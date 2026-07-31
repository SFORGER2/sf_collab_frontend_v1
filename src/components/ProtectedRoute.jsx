// src/components/ProtectedRoute.jsx
import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";
import AccessRequestModal from "./auth/admin/AccessRequestModal";
import { hasPermission } from "../utils/permissionCheck";

// ── Permission Denied Page ────────────────────────────────────────────────
const PermissionDeniedPage = ({ onRequestAccess }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0b10] to-[#11131a] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center bg-[#0d0f17] border border-slate-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-white">🚫 Access Denied</h1>
        <p className="text-slate-400">
          You don’t have permission to access this page.
        </p>
        <div className="space-y-4">
          <button
            onClick={onRequestAccess}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            Request Access
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ProtectedRoute (supports role + permission) ───────────────────────────
export const ProtectedRoute = ({ role, requiredPermission }) => {
  const location = useLocation();
  const { access_token, loading, user } = useSelector((state) => state.auth);
  const [showAccessModal, setShowAccessModal] = useState(false);

  if (loading) return <LoadingSpinner />;

  // Not authenticated → redirect to login
  if (!access_token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (admin vs member)
  if (role && user?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission check (optional granular permissions)
  if (requiredPermission) {
    const hasPerm = hasPermission(user, requiredPermission);
    if (!hasPerm) {
      return (
        <>
          <AccessRequestModal
            isOpen={showAccessModal}
            onClose={() => setShowAccessModal(false)}
            permissionKey={requiredPermission}
          />
          <PermissionDeniedPage onRequestAccess={() => setShowAccessModal(true)} />
        </>
      );
    }
  }

  // All good → render child routes via Outlet
  return <Outlet />;
};

// ── AuthRoute (for public routes like login/signup) ──────────────────────
export const AuthRoute = ({ children }) => {
  const { access_token, loading } = useSelector((state) => state.auth);

  if (loading) return <LoadingSpinner />;

  if (access_token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
