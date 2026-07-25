import { motion } from "framer-motion";
import { Clock, ArrowLeft, Share2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { aiNewsAPI } from "../../../utils/APIs/aiNewsAPI";

export default function BlogArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Fallback to ID '1' if not provided for some reason
        const targetId = id || "1";
        const response = await aiNewsAPI.getArticleById(targetId);
        
        if (response?.success && response?.data) {
          setArticle(response.data);
        } else {
          setError("Article not found.");
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Failed to fetch article. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: article?.title || "Article",
      text: "Check out this article",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.log("Share failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070F] text-white pb-20 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#05070F] text-white pb-20 pt-32 text-center">
        <h2 className="text-3xl font-bold mb-4">Article Not Found</h2>
        <p className="text-gray-400 mb-8">{error || "The article you are looking for does not exist."}</p>
        <button
          onClick={() => navigate('/blog/homepage')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  const category = article.categoryLabel || article.category || "News";
  const authorName = article.author || article.source || "AI News Desk";
  const publishDate = article.published_at || article.scraped_at ? new Date(article.published_at || article.scraped_at).toLocaleDateString() : "Unknown Date";

  return (
    <div className="min-h-screen bg-[#05070F] text-white pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-12">
          <div className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-sm rounded-full mb-6">
            {category}
          </div>
          <h1 className="text-4xl md:text-5xl leading-tight font-semibold tracking-tighter mb-8">
            {article.title}
          </h1>

          <div className="flex items-center justify-between border-b border-white/10 pb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-lg overflow-hidden">
                {authorName[0]}
              </div>
              <div>
                <p className="font-medium">{authorName}</p>
                {article.source && (
                  <p className="text-sm text-gray-400">
                    Source: {article.source}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {article.readTime || "5 min read"}
              </div>
              <span>{publishDate}</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {article.image_url && (
          <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-12">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        {/* Article Summary */}
        {article.summary && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-10">
            <p className="text-xl text-blue-100 italic leading-relaxed">
              {article.summary}
            </p>
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none prose-p:leading-loose">
          {article.content ? (
            article.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-300 mb-6">{para}</p>
            ))
          ) : (
            <p className="text-gray-300">
              Full content for this article is not available. Please visit the original source to read more.
            </p>
          )}
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-16 flex items-center gap-4 border-t border-white/10 pt-8">
          <button
            onClick={handleShare}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            Share Article
          </button>
        </div>
      </div>
    </div>
  );
}
