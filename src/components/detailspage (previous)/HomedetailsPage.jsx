import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { BriefcaseBusiness, CheckCheck, LocateIcon, User, Calendar, Clock, ArrowLeft, Share2, BookmarkPlus, Users, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

const HomedetailsPage = () => {
  const [isJoined, setIsJoined] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinReason, setJoinReason] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)

  const projectDetails = {
    id: 1,
    header: 'ABC - Marketing side',
    content: `ABC is an application for parents, to make their life easier by helping them organize and track each task. Now we're looking for effective marketers. We are leaning towards female market.`,
    people: '10',
    technology: 'technology',
    location: 'Location',
    createdAt: '6/3/2025',
    tasks: 'Tasks',
    stage: 'IDEA Stage',
    description: `ABC is a comprehensive parenting app designed to simplify the lives of busy parents. Our platform helps parents organize their daily tasks, track their children's activities, and manage family schedules efficiently. We're currently in the early stages of development and are seeking talented marketers to help us reach our target audience effectively.

    Our primary focus is on the female market, as research shows that mothers are the primary decision-makers when it comes to family-related apps and services. We're looking for marketers who understand this demographic and can help us create compelling campaigns that resonate with our target audience.`,
    requirements: [
      'Experience in digital marketing and social media management',
      'Understanding of the parenting/family market',
      'Strong communication and content creation skills',
      'Experience with marketing automation tools',
      'Analytical mindset with focus on data-driven decisions'
    ],
    team: [
      {
        name: 'John Doe',
        role: 'Project Lead',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        name: 'Jane Smith',
        role: 'Product Manager',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      {
        name: 'Mike Johnson',
        role: 'Tech Lead',
        avatar: 'https://i.pravatar.cc/150?img=3'
      }
    ],
    metrics: {
      progress: '25%',
      deadline: '3 months',
      budget: '$50K'
    }
  }

  const handleJoin = () => {
    if (joinReason.trim()) {
      setIsJoined(true)
      setShowJoinModal(false)
      setJoinReason('')
    }
  }

  const handleBookmark = () => {
    setIsBookmarked((prev) => !prev);
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/project/${projectDetails.id}`;
      if (navigator.share) {
        await navigator.share({
          title: projectDetails.header,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Projects</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button 
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? "bg-blue-500/10 text-blue-400" 
                    : "hover:bg-white/10"
                }`}
                onClick={handleBookmark}
                aria-label="Bookmark"
              >
                <Bookmark
                  className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Rest of the code remains exactly the same */}
      <div className="max-w-7xl mx-auto px-4 max-sm:px-2 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Project Header */}
            <div className="bg-[#1A1A1A] rounded-2xl sm:rounded-4xl p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">{projectDetails.header}</h1>
                <div className="flex items-center gap-3">
                  <button className="bg-red-700 text-sm px-3 py-1 font-medium rounded-sm">
                    {projectDetails.stage}
                  </button>
                  <button
                    onClick={() => !isJoined && setShowJoinModal(true)}
                    className={`${
                      isJoined 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-sm px-4 py-1 font-medium rounded-full transition-colors flex items-center gap-2`}
                  >
                    <Users size={16} />
                    {isJoined ? 'Joined' : 'Join Now'}
                  </button>
                </div>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                {projectDetails.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-gray-400" />
                  <span className="text-xs sm:text-base">{projectDetails.people} Roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-gray-400" />
                  <span className="text-xs sm:text-base">{projectDetails.technology}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LocateIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-gray-400" />
                  <span className="text-xs sm:text-base">{projectDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-gray-400" />
                  <span className="text-xs sm:text-base">Created: {projectDetails.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-[#1A1A1A] rounded-2xl sm:rounded-4xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Requirements</h2>
              <ul className="space-y-3 sm:space-y-4">
                {projectDetails.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCheck className="h-5 w-5 text-green-500 mt-1" />
                    <span className="text-sm sm:text-base">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Team & Info */}
          <div className="space-y-4 sm:space-y-8">
            {/* Team Section */}
            <div className="bg-[#1A1A1A] rounded-2xl sm:rounded-4xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Team</h2>
              <div className="space-y-4 sm:space-y-6">
                {projectDetails.team.map((member, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">{member.name}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-[#1A1A1A] rounded-2xl sm:rounded-4xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Quick Info</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Status</span>
                  <span className="text-green-500 text-xs sm:text-base">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Posted</span>
                  <span className="text-xs sm:text-base">{projectDetails.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Location</span>
                  <span className="text-xs sm:text-base">{projectDetails.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Team Size</span>
                  <span className="text-xs sm:text-base">{projectDetails.people} members</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Progress</span>
                  <span className="text-xs sm:text-base">{projectDetails.metrics.progress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Deadline</span>
                  <span className="text-xs sm:text-base">{projectDetails.metrics.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-base">Budget</span>
                  <span className="text-xs sm:text-base">{projectDetails.metrics.budget}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-2xl sm:rounded-4xl p-4 sm:p-8 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Join Project</h2>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              Please tell us why you want to join this project and what value you can bring to the team.
            </p>
            <textarea
              value={joinReason}
              onChange={(e) => setJoinReason(e.target.value)}
              placeholder="Share your motivation and relevant experience..."
              className="w-full h-32 bg-[#2A2A2A] rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={!joinReason.trim()}
                className={`px-4 py-2 rounded-full text-sm sm:text-base ${
                  joinReason.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                } transition-colors`}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomedetailsPage