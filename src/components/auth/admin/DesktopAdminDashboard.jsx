import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";

const AdminDashboard = () => {
  const location = useLocation();

  const navItems = [
    { path: "/admin/access-requests", label: "Access Requests", icon: "📋" },
    { path: "/admin/user-permissions", label: "User Permissions", icon: "👥" },
    { path: "/admin/permissions", label: "Permission Management", icon: "🔑" },
  ];

  return (
    <div className="min-h-screen bg-panel">
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-star">Admin Panel</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-black text-white"
                        : "text-dim hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="border-black text-star hover:bg-white/[0.06]">
                ← Back to App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;