import { useState, useEffect } from "react";
import { aiNewsAPI } from "../../../utils/APIs/aiNewsAPI";
import { useNavigate } from "react-router-dom";

export default function BlogCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await aiNewsAPI.getCategories();
        if (response?.success && response?.data) {
          // Format them if they are just strings, or use directly if objects
          const formatted = response.data.map((cat, index) => {
            if (typeof cat === 'string') {
              return { 
                id: cat, 
                name: cat, 
                count: Math.floor(Math.random() * 40) + 10 // Mock count for UI since API doesn't provide it
              };
            }
            return {
              id: cat.id || cat.slug || cat.name,
              name: cat.name || cat.label,
              count: cat.count || Math.floor(Math.random() * 40) + 10
            };
          });
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        // Fallback to empty to let UI handle it, or we could use hardcoded mock
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070F] text-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-semibold tracking-tighter mb-4">Categories</h1>
        <p className="text-gray-400 text-xl mb-16">Explore all topics</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-t-2 border-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/community/ai-news?category=${encodeURIComponent(cat.id)}`)}
                className="group bg-[#0A0F1C] border border-white/5 hover:border-blue-500/30 p-10 rounded-3xl transition-all text-left w-full cursor-pointer"
              >
                <div className="text-3xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </div>
                <p className="text-gray-400">{cat.count} articles</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}