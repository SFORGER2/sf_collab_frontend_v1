import React from "react";
import { Link } from "react-router-dom";

export default function Upcoming() {
  return (
    <div className="relative bg-black text-white overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-indigo-600/20 to-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-600/15 to-blue-600/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Coming Soon Content */}
      <div className="text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          UPCOMING
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto mb-8">
          Something amazing is in the works. Stay tuned!
        </p>
        <Link
          to="/"
          className="inline-block text-lg font-medium border-b border-white hover:text-white/80 transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

