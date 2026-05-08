import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const mockProgramDetails = {
  id: 1,
  title: "Founder Mentorship Program",
  description:
    "A structured mentorship program helping founders build, validate, and scale startups.",
  duration: "3 Months",
  status: "Active",
  goals: [
    {
      id: 1,
      title: "Business",
      description: "Ensure market need and problem-solution fit.",
      milestones: [
        { id: 1, title: "Customer interviews", status: "Completed" },
        { id: 2, title: "Problem validation", status: "Completed" },
        { id: 3, title: "Solution validation", status: "Pending" },
      ],
    },
    {
      id: 2,
      title: "MVP",
      description: "Develop and test a minimum viable product.",
      milestones: [
        { id: 4, title: "MVP scope defined", status: "Completed" },
        { id: 5, title: "Prototype built", status: "Pending" },
      ],
    },
  ],
  mentors: [
    { id: 1, name: "Ankit Sharma", role: "Startup Advisor" },
    { id: 2, name: "Neha Verma", role: "Product Mentor" },
  ],
  mentees: [
    { id: 1, name: "Rahul Mehta" },
    { id: 2, name: "Priya Singh" },
  ],
};

const MentorshipProgramDetails = () => {
  const { id: startupId, programId } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/startups/${startupId}/mentorship/programs/${programId}`
      );

      if (!res.ok) throw new Error("API failed");

      const json = await res.json();
      setProgram(json.program);
    } catch (err) {
      console.warn("Program details fallback to mock data");
      setProgram(mockProgramDetails);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramDetails();
  }, [startupId, programId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading program details...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        Failed to load program
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full mx-auto space-y-8">

        {/* Back */}
        <Link
          to={`/startup/${startupId}/mentorship/programs`}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Programs
        </Link>

        {/* Program Overview */}
        <div className="bg-[#1A1A1A] rounded-3xl p-8">
          <h1 className="text-3xl font-bold mb-2">{program.title}</h1>
          <p className="text-gray-400 mb-4">{program.description}</p>

          <div className="flex gap-6 text-sm text-gray-300">
            <span>Status: {program.status}</span>
            <span>Duration: {program.duration}</span>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Goals & Milestones
          </h2>

          <div className="space-y-6">
            {program.goals.map((goal) => (
              <div key={goal.id}>
                <h3 className="text-xl font-medium mb-1">
                  {goal.title}
                </h3>
                <p className="text-gray-400 mb-3">
                  {goal.description}
                </p>

                <div className="space-y-2 pl-4 border-l border-white/10">
                  {goal.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {ms.status === "Completed" ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : (
                        <Circle className="text-gray-500" size={16} />
                      )}
                      <span>{ms.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-[#1A1A1A] rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Mentors</h2>
            <div className="space-y-2">
              {program.mentors.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between text-gray-300"
                >
                  <span>{m.name}</span>
                  <span className="text-gray-500">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Mentees</h2>
            <div className="space-y-2">
              {program.mentees.map((m) => (
                <div key={m.id} className="text-gray-300">
                  {m.name}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MentorshipProgramDetails;
