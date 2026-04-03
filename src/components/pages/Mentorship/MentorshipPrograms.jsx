import React, { useEffect, useState } from "react";
import {
  Layers,
  Users,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const mockPrograms = [
  {
    id: 1,
    title: "Founder Mentorship Program",
    description:
      "Guidance for early-stage founders on vision, execution, and scaling.",
    duration: "3 Months",
    status: "Active",
    mentorsCount: 5,
    menteesCount: 12,
  },
  {
    id: 2,
    title: "Product Leadership Program",
    description:
      "Mentorship focused on product strategy, discovery, and roadmap planning.",
    duration: "2 Months",
    status: "Draft",
    mentorsCount: 3,
    menteesCount: 0,
  },
  {
    id: 3,
    title: "Growth & Go-To-Market",
    description:
      "Helping startups crack growth, marketing, and distribution.",
    duration: "4 Months",
    status: "Completed",
    mentorsCount: 4,
    menteesCount: 10,
  },
];

const MentorshipPrograms = () => {
  const { id: startupId } = useParams();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/startups/${startupId}/mentorship/programs`
      );

      if (!res.ok) throw new Error("API failed");

      const json = await res.json();
      setPrograms(json.programs);
    } catch (err) {
      console.warn("Programs fallback to mock data");
      setPrograms(mockPrograms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [startupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading mentorship programs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Mentorship Programs
            </h1>
            <p className="text-gray-400">
              Programs designed to guide mentors and mentees through structured growth.
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} />
            Create Program
          </button>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              to={`/startup/${startupId}/mentorship/programs/${program.id}`}
              className="bg-[#1A1A1A] rounded-3xl p-6 hover:bg-[#222] transition-colors group"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="text-xl font-semibold">
                  {program.title}
                </h3>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    program.status === "Active"
                      ? "bg-green-600"
                      : program.status === "Draft"
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                  }`}
                >
                  {program.status}
                </span>
              </div>

              <p className="text-gray-400 mb-6 line-clamp-2">
                {program.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="text-purple-500" size={18} />
                  {program.mentorsCount} Mentors
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-yellow-500" size={18} />
                  {program.menteesCount} Mentees
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-500" size={18} />
                  {program.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="text-pink-500" size={18} />
                  Program
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <span className="text-blue-500 flex items-center gap-1 text-sm">
                  View Program
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {programs.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            No mentorship programs found.
          </div>
        )}

      </div>
    </div>
  );
};

export default MentorshipPrograms;
