// src/components/ProtectedRoute.jsx
import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";
import AccessRequestModal from "./auth/admin/AccessRequestModal";
import { hasPermission } from "../utils/permissionCheck";
import { DEV_AUTH_BYPASS } from "../services/auth/devSession";
import { CosmosButton } from "@/components/cosmos";

// ── Permission Denied Page ────────────────────────────────────────────────
const PermissionDeniedPage = ({ onRequestAccess }) => {
  return (
    <div className="min-h-screen cosmos-atmosphere flex items-center justify-center p-4">
      <div className="cosmos-panel max-w-md w-full p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-star mb-2">Access Denied</h1>
        <p className="text-dim mb-6">
          You don't have permission to access this page.
        </p>
        <div className="flex flex-col gap-2.5">
          <CosmosButton variant="primary" onClick={onRequestAccess}>
            Request Access
          </CosmosButton>
          <CosmosButton variant="quiet" onClick={() => window.history.back()}>
            Go Back
          </CosmosButton>
        </div>
      </div>
    </div>
  );
};

// ── ProtectedRoute (supports both children and nested Route Outlets) ──────
export const ProtectedRoute = ({ children, requiredPermission }) => {
  const location = useLocation();
  const { access_token, loading, user } = useSelector((state) => state.auth);
  const [showAccessModal, setShowAccessModal] = useState(false);

  if (loading) return <LoadingSpinner />;

  // Not authenticated → redirect to login.
  // DEV_AUTH_BYPASS lets the UI be reviewed without a backend; it is statically
  // false in production builds, so this guard is fully intact when it ships.
  if (!DEV_AUTH_BYPASS && (!access_token || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If permission is required, check it
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

  // Render children if provided, otherwise Outlet for layout routes
  return children ? children : <Outlet />;
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