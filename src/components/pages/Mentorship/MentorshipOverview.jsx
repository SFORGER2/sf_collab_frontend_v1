import React, { useEffect, useState } from "react";
import { Users, Layers, ArrowUpRight, UserCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const mockMentorshipOverview = {
  programsCount: 3,
  mentorsCount: 12,
  menteesCount: 28,
  activePrograms: 2,
};

const MentorshipOverview = () => {
  const { id: startupId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/startups/${startupId}/mentorship/overview`
      );

      if (!res.ok) throw new Error("API failed");

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn("Mentorship overview fallback to mock data");
      setData(mockMentorshipOverview);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [startupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading mentorship overview...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        Failed to load mentorship data
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Mentorship</h1>
          <p className="text-gray-400">
            Structured mentoring programs for this startup
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Layers className="text-blue-500" />}
            label="Programs"
            value={data.programsCount}
          />
          <StatCard
            icon={<UserCheck className="text-green-500" />}
            label="Active Programs"
            value={data.activePrograms}
          />
          <StatCard
            icon={<Users className="text-purple-500" />}
            label="Mentors"
            value={data.mentorsCount}
          />
          <StatCard
            icon={<Users className="text-yellow-500" />}
            label="Mentees"
            value={data.menteesCount}
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title="Mentorship Programs"
            description="Browse and manage all mentorship programs under this startup."
            to={`/startup/${startupId}/mentorship/programs`}
          />
          <ActionCard
            title="Mentorship Requests"
            description="Review mentor and mentee applications."
            to={`/startup/${startupId}/mentorship/requests`}
          />
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-[#1A1A1A] rounded-3xl p-6 flex items-center gap-4">
    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ title, description, to }) => (
  <Link
    to={to}
    className="bg-[#1A1A1A] rounded-3xl p-6 hover:bg-[#222] transition-colors group"
  >
    <div className="flex justify-between items-start gap-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      <ArrowUpRight className="text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
    </div>
  </Link>
);

export default MentorshipOverview;
