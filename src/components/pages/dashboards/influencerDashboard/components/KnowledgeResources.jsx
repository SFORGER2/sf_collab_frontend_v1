import { useState } from 'react';
import {
  BookOpen,
  Users,
  Play,
  Heart,
  MessageCircle,
  Search,
  Filter,
  Star,
  TrendingUp,
  Bookmark,
  ChevronRight,
  Clock,
  Zap,
  Award,
} from 'lucide-react';

export default function KnowledgeResources() {
  const [activeTab, setActiveTab] = useState('sf-approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [likes, setLikes] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  // Mock data for different resource types
  const sfApprovedResources = [
    {
      id: 1,
      title: 'Building Scalable Startups: SF Framework',
      category: 'Startup Growth',
      instructor: 'Sarah Chen',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 324,
      comments: 28,
      duration: '45 min',
      level: 'Intermediate',
      rating: 4.8,
      type: 'video',
    },
    {
      id: 2,
      title: 'Founder Mindset Masterclass',
      category: 'Mindset',
      instructor: 'Alex Rodriguez',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 512,
      comments: 45,
      duration: '60 min',
      level: 'Beginner',
      rating: 4.9,
      type: 'video',
    },
    {
      id: 3,
      title: 'Fundraising Essentials: A-Z Guide',
      category: 'Fundraising',
      instructor: 'Victoria Lee',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 289,
      comments: 19,
      duration: '90 min',
      level: 'Advanced',
      rating: 4.7,
      type: 'document',
    },
  ];

  const communityKnowledge = [
    {
      id: 4,
      title: 'Marketing Hacks for Bootstrapped Startups',
      category: 'Marketing',
      instructor: 'Jamie Park',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 456,
      comments: 67,
      duration: '35 min',
      level: 'Intermediate',
      rating: 4.6,
      type: 'video',
    },
    {
      id: 5,
      title: 'Legal Considerations for Early-Stage Founders',
      category: 'Legal',
      instructor: 'Marcus Johnson',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 178,
      comments: 12,
      duration: '55 min',
      level: 'Beginner',
      rating: 4.5,
      type: 'document',
    },
  ];

  const tutorials = [
    {
      id: 6,
      title: 'Setup Your First Product Launch in 7 Days',
      category: 'Product',
      instructor: 'Emma Wilson',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 342,
      comments: 34,
      duration: '120 min',
      level: 'Intermediate',
      rating: 4.8,
      type: 'video',
    },
    {
      id: 7,
      title: 'Customer Retention Strategies',
      category: 'Business',
      instructor: 'David Brown',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300',
      likes: 267,
      comments: 22,
      duration: '75 min',
      level: 'Advanced',
      rating: 4.7,
      type: 'document',
    },
  ];

  const allResources = {
    'sf-approved': sfApprovedResources,
    'community': communityKnowledge,
    'tutorials': tutorials,
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = Object.values(allResources)
      .flat()
      .filter(
        (resource) =>
          resource.title.toLowerCase().includes(query.toLowerCase()) ||
          resource.category.toLowerCase().includes(query.toLowerCase()) ||
          resource.instructor.toLowerCase().includes(query.toLowerCase())
      );
    setFilteredResources(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilteredResources([]);
  };

  const currentResources =
    searchQuery.length > 0
      ? filteredResources
      : allResources[activeTab] || [];

  const toggleLike = (resourceId) => {
    setLikes((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  const toggleBookmark = (resourceId) => {
    setBookmarks((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  const tabConfig = [
    { id: 'sf-approved', label: 'SF Approved', icon: Star },
    { id: 'community', label: 'Community Knowledge', icon: Users },
    { id: 'tutorials', label: 'Tutorials', icon: Play },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg blur-lg opacity-30" />
            <BookOpen className="w-8 h-8 text-pink-300 relative" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              Knowledge Resources
            </h2>
            <p className="text-xs text-white/40 mt-0.5">Curated learning from experts and community</p>
          </div>
        </div>
        <p className="text-white/60 max-w-3xl text-sm">
          Learn from industry experts, access community insights, and master new skills. Like your favorite resources and bookmark them for later.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400/50 group-focus-within:text-pink-400 transition-colors" />
          <input
            type="text"
            placeholder="Search resources, instructors, categories..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-400/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-lg text-white/80 hover:border-pink-400/30 hover:bg-white/20 transition-all duration-300 group">
          <Filter className="w-5 h-5 group-hover:text-pink-300 transition-colors" />
          <span className="hidden sm:inline text-sm">Filter</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {tabConfig.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-all duration-300 relative group ${
              activeTab === id
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-white/60 hover:text-white/80'
            }`}
          >
            <Icon className={`w-4 h-4 transition-transform ${activeTab === id ? 'scale-110' : 'group-hover:scale-105'}`} />
            <span className="text-sm font-medium">{label}</span>
            {activeTab === id && (
              <div className="absolute inset-0 bg-pink-400/5 rounded blur-md -z-10" />
            )}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {currentResources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {currentResources.map((resource) => (
            <div
              key={resource.id}
              onMouseEnter={() => setHoveredCard(resource.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <ResourceCard
                resource={resource}
                isLiked={likes[resource.id] || false}
                isBookmarked={bookmarks[resource.id] || false}
                isHovered={hoveredCard === resource.id}
                onLike={() => toggleLike(resource.id)}
                onBookmark={() => toggleBookmark(resource.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
    </div>
  );
}

function EmptyState({ searchQuery }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
      <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">
        {searchQuery ? 'No resources found' : 'No resources yet'}
      </h3>
      <p className="text-white/60 text-sm">
        {searchQuery
          ? `Try adjusting your search for "${searchQuery}"`
          : 'Resources will appear here soon'}
      </p>
    </div>
  );
}

function ResourceCard({
  resource,
  isLiked,
  isBookmarked,
  isHovered,
  onLike,
  onBookmark,
}) {
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/10 hover:border-pink-400/30 transition-all duration-300 group h-full flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
        <img
          src={resource.image}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/90 text-white flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {resource.rating}
          </span>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white">
            {resource.type === 'video' ? '▶ Video' : '📄 Document'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        <span className="text-xs text-pink-300 font-semibold uppercase tracking-wider mb-2">
          {resource.category}
        </span>

        {/* Title */}
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-300 transition-colors">
          {resource.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {resource.duration}
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {resource.level}
          </div>
        </div>

        {/* Instructor */}
        <p className="text-xs text-white/50 mb-3">By {resource.instructor}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-white/60 border-t border-white/10 pt-3 mb-3">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {resource.likes}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {resource.comments}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={onLike}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${
              isLiked
                ? 'bg-pink-500/30 border border-pink-400/50 text-pink-300'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={onBookmark}
            className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isBookmarked
                ? 'bg-purple-500/30 border border-purple-400/50 text-purple-300'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
