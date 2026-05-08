import React from 'react';
import { MapPin, Briefcase, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrowseStartups = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Browse Startups</h1>
          </div>
          <p className="text-gray-400">
            Discover and apply to startups that match your skills
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/discover-startups"
            className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Briefcase className="w-6 h-6 mb-2" />
            <h3 className="font-semibold text-lg">Browse All Startups</h3>
            <p className="text-sm text-blue-100 mt-1">Explore opportunities</p>
          </Link>

          <Link
            to="/builder/saved-startups"
            className="p-6 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Users className="w-6 h-6 mb-2" />
            <h3 className="font-semibold text-lg">My Saved Startups</h3>
            <p className="text-sm text-rose-100 mt-1">View bookmarked startups</p>
          </Link>

          <Link
            to="/builder/my-applications"
            className="p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            <h3 className="font-semibold text-lg">My Applications</h3>
            <p className="text-sm text-green-100 mt-1">Track your applications</p>
          </Link>
        </div>

        {/* Suggestions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Featured Startups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Cards */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Startup Name</h3>
                <p className="text-sm text-gray-400 mb-4">Brief description of the startup</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>Series A</span>
                  <span>•</span>
                  <span>5 members</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20">
          <h2 className="text-2xl font-semibold mb-2">Ready to build?</h2>
          <p className="text-gray-400 mb-4">Find your next opportunity and start working with innovative startups</p>
          <Link
            to="/discover-startups"
            className="inline-block px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Explore Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrowseStartups;
