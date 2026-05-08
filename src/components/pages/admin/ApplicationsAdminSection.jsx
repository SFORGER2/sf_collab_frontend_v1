import { applicationAPI } from "@/utils/APIs/applicationAPI";
import { useEffect, useState } from "react";

export default function AdminApplicationsSection() {
  const [allApplications, setAllApplications] = useState([]);
    useEffect(() => {
      async function fetchApplications() {
        const response = await applicationAPI.getAll({ page: 1, per_page: 1000 });
        setAllApplications(response.data.applications || []);
      }
      fetchApplications();
    }, []);
  return (
    <div className="bg-linear-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">📋 Applications</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Applications */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">💼 Job Applications</h3>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {allApplications
              .filter(item => item.application_type === 'job')
              .map((app) => (
                <li key={app.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition">
                  <div className="font-medium text-blue-300">{app.name}</div>
                  <p className="text-xs text-gray-400 mt-1">📧 {app.email}</p>
                  <p className="text-xs text-gray-400">🌍 {app.country}</p>
                  <div className="text-xs text-gray-300 mt-2">
                    <p><strong>Area:</strong> {app.data?.area}</p>
                    <p><strong>Skills:</strong> {app.data?.skills}</p>
                    <p><strong>Availability:</strong> {app.data?.availability} hours/week</p>
                    <p><strong>Early CoBuilder:</strong> {app.data?.earlyCoBuilder}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                </li>
              ))}
          </ul>
        </div>
    
        {/* Influencer Applications */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-300">⭐ Influencer Applications</h3>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {allApplications
              .filter(item => item.application_type === 'influencer')
              .map((app) => (
                <li key={app.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition">
                  <div className="font-medium text-purple-300">{app.name}</div>
                  <p className="text-xs text-gray-400 mt-1">📧 {app.email}</p>
                  <p className="text-xs text-gray-400">🌍 {app.country}</p>
                  <div className="text-xs text-gray-300 mt-2">
                    <p><strong>Niche:</strong> {app.data?.niche}</p>
                    <p><strong>Followers:</strong> {app.data?.followers}</p>
                    <p><strong>Audience Fit:</strong> {app.data?.audienceFit}</p>
                    <p><strong>Early Partner:</strong> {app.data?.earlyPartner}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}