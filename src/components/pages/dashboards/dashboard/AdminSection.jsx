import { Link } from "react-router-dom";
import { Shield, Settings, BarChart3, Users } from 'lucide-react';

export default function AdminSection() {
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-400/30 backdrop-blur-sm p-5 sm:p-6 lg:p-8">
    
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px]" />
<div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Admin Panel
            </h2>
          </div>
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
      
        {/* Text content */}
        <div className="text-center">
          
          <p className="text-white/80 text-center max-w-2xl m-auto text-sm sm:text-base">
            Manage users, monitor platform activity, and control system settings from the admin dashboard.
          </p>

          {/* Admin Features */}
          <div className="flex flex-wrap items-center justify-center w-full gap-2 mt-4">
            <span className="px-3 py-1.5 bg-red-500/40 border border-red-400/50 rounded-full text-white text-xs sm:text-sm flex items-center gap-1">
              <Users className="w-3 h-3" /> User Management
            </span>
            <span className="px-3 py-1.5 bg-orange-500/40 border border-orange-400/50 rounded-full text-white text-xs sm:text-sm flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Analytics
            </span>
            <span className="px-3 py-1.5 bg-amber-500/40 border border-amber-400/50 rounded-full text-white text-xs sm:text-sm flex items-center gap-1">
              <Settings className="w-3 h-3" /> Settings
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="md:absolute md:bottom-1 md:right-1 flex lg:justify-end">
          <Link
            to="/admin"
            className="inline-flex w-full items-center justify-center h-12 px-6 sm:px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 border border-red-300/50 hover:scale-105"
          >
            Access Admin
          </Link>
        </div>

      </div>
    </div>
  )
}