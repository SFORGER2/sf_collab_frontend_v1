/* ---------------------- PrivacySection (UI-only mapping) ---------------------- */
export default function PrivacySection ({ formData, onChange }) {
  const privacy = formData.privacySettings || {};
  const updatePrivacy = (patch) => onChange(patch);

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Profile Visibility</h3>
        <p className="text-gray-400 text-sm">Control who can see your profile and personal information.</p>

        <div className="space-y-3">
          {["public", "private"].map(opt => (
            <label key={opt} className="flex items-center gap-3 bg-gray-700/30 p-4 rounded-lg cursor-pointer">
              <input type="radio" name="visibility" value={opt} checked={(privacy.profileVisibility || 'public') === opt} onChange={() => updatePrivacy({ profileVisibility: opt })} />
              <span className="capitalize">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-10">
        <h3 className="text-xl font-semibold">Activity Status</h3>
        <p className="text-gray-400 text-sm">Decide when others can see your online presence.</p>

        {[
          { key: "showOnlineStatus", title: "Show Online Status", desc: "Allow users to see when you are online." },
          { key: "showLastSeen", title: "Show Last Seen", desc: "Shows your last active timestamp." },
          { key: "showActivityInCommunities", title: "Community Activity", desc: "Display when you are active inside communities." },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-400">{item.desc}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={privacy[item.key] ?? true} onChange={(e) => updatePrivacy({ [item.key]: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-10">
        <h3 className="text-xl font-semibold">Data Sharing</h3>
        <p className="text-gray-400 text-sm">Manage how your data is used for personalization and analytics.</p>

        {[
          { key: "personalizedAds", title: "Personalized Ads", desc: "Receive ads tailored to your activity." },
          { key: "analytics", title: "Analytics", desc: "Allow anonymous usage data collection." },
          { key: "partnerSharing", title: "Partner Data Sharing", desc: "Allow sharing data with trusted partners." },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-400">{item.desc}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={privacy.dataSharing?.[item.key] ?? true} onChange={(e) => updatePrivacy({ dataSharing: { ...(privacy.dataSharing || {}), [item.key]: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-10">
        <h3 className="text-xl font-semibold">Blocked Users</h3>
        <p className="text-gray-400 text-sm">Users you have blocked will not be able to interact with you.</p>

        <div className="space-y-4">
          {(privacy.blockedUsers || []).map(user => (
            <div key={user.id} className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-gray-400">Blocked user</span>
              </div>
              <button onClick={() => updatePrivacy({ blockedUsers: (privacy.blockedUsers || []).filter(u => u.id !== user.id) })} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">Unblock</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};