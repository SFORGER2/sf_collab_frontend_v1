import { motion } from "framer-motion";
import { Clock, ArrowRight, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { aiNewsAPI } from "../../../utils/APIs/aiNewsAPI";
import { useNavigate } from "react-router-dom";

export default function BlogHomepage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          aiNewsAPI.getArticles({ limit: 7 }),
          aiNewsAPI.getCategories()
        ]);
        
        if (articlesRes?.success && articlesRes?.data?.articles) {
          setArticles(articlesRes.data.articles);
        }
        
        if (categoriesRes?.success && categoriesRes?.data) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch blog data:", error);
      }
    };

    fetchData();
  }, []);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const latestArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#05070F] text-white relative">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0F1C]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="text-2xl font-semibold tracking-tighter">SF Blog</a>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              <a href="/blog" className="text-white">All Posts</a>
              <a href="/blog/categories" className="hover:text-blue-400 transition-colors">Categories</a>
              <a href="/blog/authors" className="hover:text-blue-400 transition-colors">Authors</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="relative w-80 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full bg-[#111827] border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[10000] md:hidden">
          {/* Dark Overlay */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={toggleMobileMenu}
          />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <a href="/" className="text-2xl font-semibold tracking-tighter">SF Blog</a>
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-white hover:text-blue-400 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col px-6 py-8 text-lg font-medium">
              <a
                href="/blog"
                className="py-5 border-b border-white/10 hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Posts
              </a>
              <a
                href="/blog/categories"
                className="py-5 border-b border-white/10 hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </a>
              <a
                href="/blog/authors"
                className="py-5 border-b border-white/10 hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Authors
              </a>
            </nav>

            {/* Mobile Search */}
            <div className="mt-auto px-6 pb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full bg-[#111827] border border-white/10 pl-12 py-4 rounded-2xl text-base focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Article */}
      <section className="relative h-[680px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070F] via-[#05070F]/90 to-transparent z-10" />
        <img
          src={featuredArticle?.image_url || "/images/blog/featured.jpg"}
          alt={featuredArticle?.title || "Featured"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm mb-6 border border-white/10">
            Featured
          </div>
          <h1 className="text-4xl md:text-6xl leading-[1.1] font-semibold tracking-tighter mb-6 line-clamp-3">
            {featuredArticle?.title || "The Complete Guide to Modern Startup Formation in 2026"}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8 line-clamp-2">
            {featuredArticle?.summary || "How forward-thinking founders are using SF Startup OS to go from idea to incorporated in record time."}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 overflow-hidden">
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-sm font-bold">
                  {(featuredArticle?.author || "A")[0]}
                </div>
              </div>
              <div>
                <p className="font-medium">{featuredArticle?.author || "Alex Thompson"}</p>
                <p className="text-sm text-gray-400">
                  {featuredArticle ? new Date(featuredArticle.published_at || featuredArticle.scraped_at).toLocaleDateString() : "May 20, 2026"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              {featuredArticle?.readTime || "14 min read"}
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => {
                if (featuredArticle?.id) {
                  navigate(`/blog/article/${featuredArticle.id}`);
                } else {
                  navigate('/blog/article/1');
                }
              }}
              className="mt-10 inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 rounded-2xl font-semibold text-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Read Featured Article
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-b border-white/10">
        <h3 className="text-xs uppercase tracking-[3px] text-gray-400 mb-6">TOPICS</h3>
        <div className="flex flex-wrap gap-3">
          {(categories.length > 0 ? categories : ["Formation", "Legal", "Fundraising", "Product", "Growth", "Engineering", "Team"]).map((cat) => {
            const catName = typeof cat === 'string' ? cat : (cat.name || cat.label || cat);
            const catId = typeof cat === 'string' ? cat : (cat.id || cat.slug || catName);
            return (
              <button
                key={catId}
                onClick={() => navigate(`/community/ai-news?category=${encodeURIComponent(catId)}`)}
                className="px-6 py-3 bg-[#111827] hover:bg-[#1F2937] border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all text-sm cursor-pointer"
              >
                {catName}
              </button>
            );
          })}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Latest Insights</h2>
          <a href="/community/ai-news" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm md:text-base">
            View all <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {(latestArticles.length > 0 ? latestArticles : [1, 2, 3, 4, 5, 6]).map((item, index) => {
            const isMock = typeof item === 'number';
            const articleId = isMock ? item : item.id;
            
            return (
              <motion.article
                key={articleId}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/blog/article/${articleId}`)}
                className="group bg-[#0A0F1C] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                <div className="h-56 bg-gradient-to-br from-gray-900 to-[#111827] relative overflow-hidden shrink-0">
                  {(!isMock && item.image_url) ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  )}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/20 backdrop-blur-sm overflow-hidden flex items-center justify-center text-xs font-bold text-white/70">
                      {isMock ? "SF" : (item.author?.[0] || item.source?.[0] || "A")}
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs uppercase text-gray-400 mb-4">
                    <span>{isMock ? "Formation" : (item.category || item.categoryLabel || "News")}</span>
                    <span>·</span>
                    <span>{isMock ? "9 min read" : (item.readTime || "5 min read")}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-4 group-hover:text-blue-400 transition-colors line-clamp-3">
                    {isMock ? "Why Every Founder Should Incorporate Before Their First Hire" : item.title}
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base line-clamp-3 mb-6 flex-grow">
                    {isMock ? "The legal and operational advantages of getting your structure right from day one." : item.summary}
                  </p>
                  <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 truncate max-w-[120px]">
                        {isMock ? "Sarah Chen" : (item.author || item.source || "SF Writer")}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {isMock ? "May 18, 2026" : new Date(item.published_at || item.scraped_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

    </div>
  );
}