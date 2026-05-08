import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  FileText,
  Calendar,
  User,
  Tag,
  Download,
  Eye,
  ThumbsUp,
  MessageSquare,
  Send,
  Clock,
  Building2,
  FileCode,
  BarChart3,
  Globe,
  ChevronRight,
  FileUp,
  Users,
  Award,
  Star,
  Zap,
  BookOpen,
  Layers,
  Target,
  TrendingUp,
  CheckCircle,
  X,
  AlertCircle,
  InfoIcon,
  Mail
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { allimg } from "../../utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const mockKnowledgeData = [
  {
    id: 101,
    title: "How to Build a Scalable Backend Architecture for Modern SaaS",
    titleDescription: "A comprehensive guide to designing, implementing, and scaling microservices-based backend systems with enterprise-grade reliability and performance.",
    contentPreview: `Building a scalable backend requires careful planning across multiple dimensions:

## Core Principles
1. Microservices Architecture - Decompose by business capability
2. Event-Driven Communication - Use message brokers for loose coupling
3. Distributed Caching - Implement Redis/Memcached for performance
4. Container Orchestration - Kubernetes for deployment and scaling
5. Observability - Comprehensive logging, metrics, and tracing

## Best Practices
- Implement circuit breakers and retry logic
- Use API gateways for request routing
- Implement rate limiting and throttling
- Design for horizontal scaling
- Use database connection pooling

## Performance Optimization
- Implement CDN for static assets
- Use database indexing strategically
- Implement background job processing
- Optimize database queries
- Use connection pooling`,
    category: "Engineering",
    tags: ["Backend", "Architecture", "Scalability", "Microservices", "DevOps", "Kubernetes", "Docker", "AWS"],
    views: 1520,
    downloads: 320,
    likes: 230,
    createdAt: "2025-02-10T12:30:00Z",
    updatedAt: "2025-02-12T10:05:00Z",
    fileUrl: "backend-guide.pdf",
    author: {
      id: 201,
      firstName: "Aman",
      lastName: "Khan",
      role: "Senior Architect",
      company: "TechCorp",
      expertise: "Cloud Infrastructure",
      contributions: 42,
      followers: 1200,
      avatar: "https://i.pravatar.cc/150?u=aman"
    },
    attachments: [
      { id: 1, name: "backend-architecture-guide.pdf", url: "#", size: "2.4 MB", pages: 48 },
      { id: 2, name: "architecture-diagram.fig", url: "#", size: "1.8 MB", type: "Design" },
      { id: 3, name: "code-samples.zip", url: "#", size: "3.2 MB", type: "Code" },
    ],
    expertiseLevel: "Advanced",
    readTime: "15 min",
    difficulty: "Hard",
    rating: 4.8,
    reviews: 42,
    prerequisites: ["Basic understanding of APIs", "Familiarity with cloud concepts", "Knowledge of databases"],
    learningOutcomes: [
      "Design scalable microservices architecture",
      "Implement event-driven systems",
      "Configure monitoring and observability",
      "Deploy containerized applications"
    ]
  },
];

const commentsKey = (id) => `mock_comments_${id}`;
const bookmarksKey = "mock_bookmarks";

function loadCommentsFromStorage(id) {
  try {
    const raw = localStorage.getItem(commentsKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse comments from localStorage", e);
    return [];
  }
}

function saveCommentsToStorage(id, comments) {
  try {
    localStorage.setItem(commentsKey(id), JSON.stringify(comments));
  } catch (e) {
    console.error("Failed to save comments to localStorage", e);
  }
}

function loadBookmarksFromStorage() {
  try {
    const raw = localStorage.getItem(bookmarksKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse bookmarks from localStorage", e);
    return [];
  }
}

function saveBookmarksToStorage(bookmarks) {
  try {
    localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
  } catch (e) {
    console.error("Failed to save bookmarks to localStorage", e);
  }
}

function getFileTypeLabel(urlOrName) {
  if (!urlOrName) return "file";
  const ext = String(urlOrName).split(".").pop().toLowerCase();
  if (!ext) return "file";
  return ext;
}

function getFileIcon(type) {
  const ext = type.toLowerCase();
  if (["pdf", "doc", "docx"].includes(ext)) return FileText;
  if (["xlsx", "xls", "csv"].includes(ext)) return BarChart3;
  if (["zip", "rar", "tar", "gz"].includes(ext)) return FileCode;
  if (["fig", "sketch", "xd"].includes(ext)) return Layers;
  return FileText;
}

export default function Knowledgedetails() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idParam = params.get("id");
  const id = idParam ? Number(idParam) : mockKnowledgeData[0].id;

  const item = mockKnowledgeData.find((m) => Number(m.id) === Number(id)) || mockKnowledgeData[0];

  const [comments, setComments] = useState(() => loadCommentsFromStorage(item.id));
  const [commentText, setCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(() => {
    const b = loadBookmarksFromStorage();
    return b.includes(item.id);
  });
  const [likes, setLikes] = useState(item.likes || 0);
  const [localViews, setLocalViews] = useState(item.views || 0);
  const [bookmarkNotification, setBookmarkNotification] = useState({ show: false, message: "" });

  useEffect(() => {
    setLocalViews((v) => v + 1);
  }, []);

  useEffect(() => {
    saveCommentsToStorage(item.id, comments);
  }, [comments, item.id]);

  const handlePostComment = () => {
    const trimmed = (commentText || "").trim();
    if (!trimmed) return;

    const user = (() => {
      try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } 
      catch {
        return null;
      }
    })();

    const author = user
      ? { 
          id: user?.id, 
          name: `${user?.firstName} ${user?.lastName}`, 
          avatar: user?.avatar || allimg.profileImg,
          role: user?.role || "Member"
        }
      : { id: "guest", name: "Guest User", avatar: allimg.profileImg, role: "Visitor" };

    const newComment = {
      id: Date.now(),
      resource_id: item.id,
      content: trimmed,
      author,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  const toggleBookmark = () => {
    const current = loadBookmarksFromStorage();
    let updated;
    if (current.includes(item.id)) {
      updated = current.filter((x) => x !== item.id);
      setIsBookmarked(false);
      setBookmarkNotification({ show: true, message: "Removed from bookmarks", type: "info" });
    } else {
      updated = [item.id, ...current];
      setIsBookmarked(true);
      setBookmarkNotification({ show: true, message: "Added to bookmarks", type: "success" });
    }
    saveBookmarksToStorage(updated);
    setTimeout(() => setBookmarkNotification({ show: false, message: "" }), 3000);
  };

  const toggleLike = () => {
    setLikes((l) => (l || 0) + 1);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/knowledge-details?id=${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setBookmarkNotification({ show: true, message: "Link copied to clipboard!", type: "success" });
        setTimeout(() => setBookmarkNotification({ show: false, message: "" }), 3000);
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Engineering: "bg-blue-500/20 text-blue-400 border-blue-400/30",
      Business: "bg-green-500/20 text-green-400 border-green-400/30",
      Design: "bg-purple-500/20 text-purple-400 border-purple-400/30",
      Marketing: "bg-pink-500/20 text-pink-400 border-pink-400/30",
      Default: "bg-gray-500/20 text-gray-400 border-gray-400/30",
    };
    return colors[category] || colors.Default;
  };

  const getExpertiseColor = (level) => {
    const colors = {
      Beginner: "bg-green-500/20 text-green-400 border-green-400/30",
      Intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
      Advanced: "bg-red-500/20 text-red-400 border-red-400/30",
      Default: "bg-gray-500/20 text-gray-400 border-gray-400/30",
    };
    return colors[level] || colors.Default;
  };

  const getDifficultyColor = (level) => {
    const colors = {
      Easy: "bg-green-500/20 text-green-400",
      Medium: "bg-yellow-500/20 text-yellow-400",
      Hard: "bg-red-500/20 text-red-400",
      Default: "bg-gray-500/20 text-gray-400",
    };
    return colors[level] || colors.Default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const Notification = () => {
    if (!bookmarkNotification.show) return null;

    const styles = {
      success: 'border-green-400/30 bg-green-500/10 text-green-200',
      info: 'border-blue-400/30 bg-blue-500/10 text-blue-200',
      error: 'border-red-400/30 bg-red-500/10 text-red-200'
    };

    const icons = {
      success: <CheckCircle size={20} />,
      info: <InfoIcon size={20} />,
      error: <AlertCircle size={20} />
    };

    return (
      <div style={{zIndex: 9999}} className="fixed top-20 left-4 z-50">
        <div className={`rounded-xl border p-4 backdrop-blur-sm ${styles[bookmarkNotification.type]}`}>
          <div className="flex items-center gap-3">
            {icons[bookmarkNotification.type]}
            <span className="font-medium">{bookmarkNotification.message}</span>
            <button 
              onClick={() => setBookmarkNotification({ show: false, message: "" })}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen  text-white">
      <Notification />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/knowledge"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 group-hover:border-blue-400/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="hidden sm:inline">Back to Knowledge Base</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-400/10 text-blue-400 border-blue-400/30">
                <Eye className="h-3 w-3 mr-1" /> {localViews} views
              </Badge>
              <Badge className="bg-green-400/10 text-green-400 border-green-400/30">
                <Download className="h-3 w-3 mr-1" /> {item.downloads} downloads
              </Badge>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/30 rounded-full px-4 py-2 mb-4">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Knowledge Resource</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Expert <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Knowledge</span> Hub
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Dive deep into specialized knowledge curated by industry experts. 
            <span className="text-white font-semibold"> Average learning improvement: 68%.</span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Author & Stats */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Author Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={item.author.avatar}
                    alt={item.author.firstName}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-400/30"
                  />
                  <h3 className="text-xl font-bold text-white mb-1">
                    {item.author.firstName} {item.author.lastName}
                  </h3>
                  <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 mb-2">
                    {item.author.role}
                  </Badge>
                  <p className="text-gray-400 text-sm mb-4">{item.author.company}</p>
                  
                  <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{item.author.contributions}</div>
                      <div className="text-xs text-gray-400">Contributions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{item.author.followers}</div>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Author
                  </Button>
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Expertise Level</span>
                    <Badge className={getExpertiseColor(item.expertiseLevel)}>
                      {item.expertiseLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Difficulty</span>
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Read Time</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-white">{item.readTime}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Quality Rating</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
                        />
                      ))}
                      <span className="ml-2 text-white font-medium">{item.rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">({item.reviews} reviews)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Resource Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Engagement Score</span>
                    <span className="text-blue-400 font-bold">94%</span>
                  </div>
                  <Progress value={94} className="h-2 bg-gray-700 [&>div]:bg-gradient-to-r from-blue-400 to-blue-600" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white">{likes}</div>
                    <div className="text-xs text-gray-400">Likes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white">{comments.length}</div>
                    <div className="text-xs text-gray-400">Comments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Content - Main Article */}
          <div className="lg:col-span-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <Badge className={getExpertiseColor(item.expertiseLevel)}>
                    {item.expertiseLevel}
                  </Badge>
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                    <Clock className="h-3 w-3 mr-1" /> {item.readTime} read
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                  {item.title}
                </CardTitle>
                
                <CardDescription className="text-lg text-gray-300">
                  {item.titleDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Topics Covered</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600 transition-colors cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Content Overview</h2>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {item.contentPreview.split('\n').map((line, index) => {
                          if (line.startsWith('## ')) {
                            return <h3 key={index} className="text-xl font-semibold text-white mt-4 mb-2">{line.replace('## ', '')}</h3>;
                          }
                          if (line.startsWith('- ')) {
                            return <li key={index} className="ml-4 text-gray-300 mb-1">{line.replace('- ', '')}</li>;
                          }
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <strong key={index} className="text-white">{line.replace(/\*\*/g, '')}</strong>;
                          }
                          if (line.trim() === '') {
                            return <br key={index} />;
                          }
                          return <p key={index} className="mb-3">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prerequisites & Outcomes */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-blue-400" />
                        Prerequisites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {item.prerequisites.map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Award className="h-5 w-5 text-blue-400" />
                        Learning Outcomes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {item.learningOutcomes.map((outcome, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-300">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Attachments */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Resources & Downloads</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {item.attachments.map((attachment) => {
                      const FileIcon = getFileIcon(getFileTypeLabel(attachment.name));
                      return (
                        <Card key={attachment.id} className="border-gray-600 bg-gray-700/30 hover:bg-gray-700/50 transition-all hover:border-blue-400/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-400/10 border border-blue-400/30 flex items-center justify-center">
                                  <FileIcon className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white mb-1">{attachment.name}</div>
                                  <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span>{attachment.size}</span>
                                    <span>•</span>
                                    <span>{getFileTypeLabel(attachment.name).toUpperCase()}</span>
                                    {attachment.pages && (
                                      <>
                                        <span>•</span>
                                        <span>{attachment.pages} pages</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Discussion Section */}
                <div className="space-y-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">Community Discussion</h2>
                    </div>
                    <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                      {comments.length} comments
                    </Badge>
                  </div>

                  {/* New Comment Form */}
                  <Card className="border-gray-600 bg-gray-700/30">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={allimg.profileImg}
                          alt="You"
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400/30"
                        />
                        <div className="flex-1">
                          <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts, ask questions, or provide feedback..."
                            className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl p-4 min-h-[100px] resize-none"
                          />
                          <div className="flex justify-between items-center mt-3">
                            <div className="text-sm text-gray-400">
                              Share your expertise or questions
                            </div>
                            <Button
                              onClick={handlePostComment}
                              disabled={!commentText.trim()}
                              className="bg-blue-400 hover:bg-blue-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <Card className="border-gray-600 bg-gray-700/30">
                        <CardContent className="py-8 text-center">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
                          <p className="text-gray-400">Be the first to start the discussion!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      comments.map((comment) => (
                        <Card key={comment.id} className="border-gray-600 bg-gray-700/30">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img
                                src={comment.author.avatar || allimg.profileImg}
                                alt={comment.author.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-medium text-white">
                                      {comment.author.name}
                                    </div>
                                    <Badge variant="outline" className="bg-gray-600/50 text-gray-300 border-gray-500 text-xs">
                                      {comment.author.role}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                <div className="text-gray-300 whitespace-pre-wrap">
                                  {comment.content}
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-white">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {comment.likes || 0}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-white">
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={toggleLike}
                      variant="outline"
                      className="border-gray-600 hover:border-blue-400 hover:bg-blue-400/10"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Like ({likes})
                    </Button>
                    <Button
                      onClick={toggleBookmark}
                      variant="outline"
                      className={`border ${isBookmarked ? 'border-blue-400 bg-blue-400/10 text-blue-400' : 'border-gray-600 hover:border-blue-400'}`}
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </div>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="border-gray-600 hover:border-blue-400 hover:bg-blue-400/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Sidebar - Related Info */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <InfoIcon className="w-5 h-5 text-blue-400" />
                  Resource Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Published Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className="text-white">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Last Updated</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-white">{formatDate(item.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Resource Type</span>
                    <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30">
                      Guide
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Format</span>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-white">PDF + Resources</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Community Impact</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Helpful Votes</span>
                      <span className="text-green-400">92%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="text-blue-400">87%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Avg. Time Spent</span>
                      <span className="text-white">14.5 min</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Key Insights</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Resources with detailed architecture guides receive <span className="text-blue-400 font-medium">3x more engagement</span> from engineering teams and are 68% more likely to be implemented in production environments.
                  </p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Popularity Trend</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Weekly Views</span>
                      <span className="text-green-400">+24%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Downloads</span>
                      <span className="text-green-400">+18%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Engagement</span>
                      <span className="text-green-400">+31%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Topics */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Related Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.tags.slice(0, 8).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Explore related resources by clicking on these topics. Our AI will recommend similar content based on your interests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .prose {
          color: #d1d5db;
        }
        .prose h3 {
          color: white;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .prose li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .prose strong {
          color: white;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}