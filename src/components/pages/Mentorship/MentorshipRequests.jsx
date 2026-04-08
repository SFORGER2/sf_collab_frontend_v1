import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  Users,
} from "lucide-react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const mockRequests = [
  {
    id: 1,
    userName: "Suhail",
    role: "Mentee",
    programName: "Founder Mentorship Program",
    status: "Pending",
  },
  {
    id: 2,
    userName: "Mohammad",
    role: "Mentor",
    programName: "Product Leadership Program",
    status: "Pending",
  },
  {
    id: 3,
    userName: "Oskar",
    role: "Mentee",
    programName: "Growth & Go-To-Market",
    status: "Approved",
  },
];

const MentorshipRequests = () => {
  const { id: startupId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/startups/${startupId}/mentorship/requests`
      );

      if (!res.ok) throw new Error("API failed");

      const json = await res.json();
      setRequests(json.requests);
    } catch (err) {
      console.warn("Requests fallback to mock data");
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await fetch(
        `${API_URL}/mentorship-requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status } : r
        )
      );
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [startupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading mentorship requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Mentorship Requests
          </h1>
          <p className="text-gray-400">
            Review and manage mentor and mentee applications.
          </p>
        </div>

        {/* Requests Table */}
        <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#222] text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-white/10"
                >
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    {req.userName}
                  </td>
                  <td className="px-6 py-4">{req.role}</td>
                  <td className="px-6 py-4">{req.programName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        req.status === "Pending"
                          ? "bg-yellow-600"
                          : req.status === "Approved"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateRequestStatus(req.id, "Approved")
                          }
                          className="bg-green-600 hover:bg-green-700 p-2 rounded-lg"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() =>
                            updateRequestStatus(req.id, "Rejected")
                          }
                          className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              No mentorship requests found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MentorshipRequests;
