import { useState } from "react";

/* ---------------------- SavedSection ---------------------- */
export default function SavedSection({ formData, onChange }) {
  const tabs = ["ideas", "startups", "posts", "resources", "archived"];
  const [activeTab, setActiveTab] = useState("ideas");
  const saved = formData.savedItems || { ideas: [], startups: [], posts: [], resources: [], archived: [] };

  const handleUnsave = (id) => {
    onChange({ [activeTab]: saved[activeTab].filter(item => item.id !== id) });
  };

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold mb-6">Saved Items</h2>
      <div className="flex gap-4 border-b border-gray-700 pb-2">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg capitalize ${activeTab === tab ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700"}`}>{tab.replace(/_/g,' ')}</button>
        ))}
      </div>

      <div className="space-y-4">
        {saved[activeTab].length === 0 ? <div className="text-center py-10 text-gray-500">No saved {activeTab} yet.</div> : saved[activeTab].map(item => (
          <div key={item.id} className="bg-gray-700/40 border border-gray-600 rounded-xl p-4 flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-600 overflow-hidden">
              {item.thumbnail ? <img loading="lazy" src={item.thumbnail} className="w-full h-full object-cover" alt="thumb" /> : <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>}
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <span className="text-sm text-gray-400">{item.dateSaved}</span>
              </div>
              <div className="text-gray-400 text-sm capitalize">{item.type}</div>
              <div className="flex gap-2 mt-2 flex-wrap">{item.tags?.map((t,i) => <span key={i} className="text-xs bg-gray-600 px-2 py-1 rounded-lg text-gray-300">{t}</span>)}</div>

              <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 rounded-lg"><ExternalLink size={14} /> Open</button>
                <button onClick={() => handleUnsave(item.id)} className="flex items-center gap-2 px-3 py-2 bg-red-600 rounded-lg"><Trash2 size={14} /> Unsave</button>
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 rounded-lg"><Share2 size={14} /> Share</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};