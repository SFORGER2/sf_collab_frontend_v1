import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, Award, ExternalLink, Plus, Edit2, X } from 'lucide-react';
import { builderProfileAPI, builderTasksAPI } from '@/services/builderAPI';

const SkillProfile = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [badges, setBadges] = useState([
    { id: 1, icon: '⭐', name: 'Rising Star', description: 'Completed first project' },
    { id: 2, icon: '🚀', name: 'Quick Learner', description: '3+ skills added' },
    { id: 3, icon: '🎯', name: 'Achiever', description: '5+ projects completed' },
    { id: 4, icon: '👑', name: 'Expert', description: 'Rated 5 stars' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner', years_of_experience: 0 });
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    url: '', 
    image_url: '',
    project_type: 'web',
    skills_used: []
  });

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !access_token) return;

      setLoading(true);
      setError(null);
      try {
        const response = await builderProfileAPI.getProfile(access_token);
        if (response.success && response.data) {
          setProfile(response.data);
          setSkills(response.data.skills || []);
          setPortfolio(response.data.portfolio_items || []);
        } else {
          setError(response.error || 'Failed to fetch profile');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, access_token]);

  const handleAddSkill = async () => {
    if (!newSkill.name || !access_token) return;
    
    try {
      const response = await builderProfileAPI.addSkill(newSkill, access_token);
      if (response.success) {
        setSkills([...skills, response.data]);
        setNewSkill({ name: '', level: 'beginner', years_of_experience: 0 });
        setShowAddSkill(false);
      } else {
        setError(response.error || 'Failed to add skill');
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
      setError('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!access_token) return;
    
    try {
      const response = await builderProfileAPI.removeSkill(skillId, access_token);
      if (response.success) {
        setSkills(skills.filter(s => s.id !== skillId));
      } else {
        setError(response.error || 'Failed to delete skill');
      }
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setError('Failed to delete skill');
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.description || !access_token) {
      setError('Please fill in title and description');
      return;
    }
    
    try {
      const response = await builderProfileAPI.addPortfolioItem(newProject, access_token);
      if (response.success) {
        setPortfolio([...portfolio, response.data]);
        setNewProject({ 
          title: '', 
          description: '', 
          url: '', 
          image_url: '',
          project_type: 'web',
          skills_used: []
        });
        setShowAddProject(false);
        setError(null);
      } else {
        setError(response.error || 'Failed to add project');
      }
    } catch (err) {
      console.error('Failed to add project:', err);
      setError('Failed to add project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!access_token) return;
    
    try {
      const response = await builderProfileAPI.removePortfolioItem(projectId, access_token);
      if (response.success) {
        setPortfolio(portfolio.filter(p => p.id !== projectId));
      } else {
        setError(response.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="w-full mx-auto space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        ) : !profile ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400">No profile data</p>
          </div>
        ) : (
          <>
        {/* Header & Profile */}
        <div className="relative">
          {/* Background Banner */}
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20" />

          <div className="relative pt-8 px-6">
            <div className="flex items-end gap-6 mb-6">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-1">{profile.title || `${user?.firstName} ${user?.lastName}`}</h1>
                <p className="text-xl text-gray-300 mb-3">{profile.bio || 'Professional builder'}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(profile.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{profile.rating?.toFixed(1) || '0'}</span>
                  <span className="text-gray-400">({profile.review_count || 0} reviews)</span>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-gray-400">Completed Projects</p>
                    <p className="text-2xl font-bold text-white">{profile.completed_projects || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-400">${(profile.total_earnings || 0).toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Bio */}
            <p className="text-gray-400 max-w-2xl">{profile.bio}</p>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Skills</h2>
            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>

          {/* Add Skill Form */}
          {showAddSkill && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Skill name (e.g., React)"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner" className="bg-slate-900">Beginner</option>
                  <option value="intermediate" className="bg-slate-900">Intermediate</option>
                  <option value="advanced" className="bg-slate-900">Advanced</option>
                  <option value="expert" className="bg-slate-900">Expert</option>
                </select>
                <input
                  type="number"
                  placeholder="Years of experience"
                  value={newSkill.years_of_experience}
                  onChange={(e) => setNewSkill({...newSkill, years_of_experience: parseInt(e.target.value) || 0})}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills && skills.length > 0 ? (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{skill.name}</h3>
                    <div className="flex items-center gap-2">
                      {skill.is_verified && (
                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30">
                          ✓ Verified
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 capitalize mb-2">{skill.level}</p>
                  <p className="text-xs text-gray-500">{skill.years_of_experience} years experience</p>
                  {skill.endorsement_count > 0 && (
                    <p className="text-xs text-blue-400 mt-2">{skill.endorsement_count} endorsements</p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-gray-400">No skills added yet. Start building your profile!</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Portfolio</h2>
              <p className="text-gray-400">Showcase of completed projects and work</p>
            </div>
            <button 
              onClick={() => setShowAddProject(true)}
              className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio && portfolio.length > 0 ? (
              portfolio.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Project Image */}
                  <div className="relative w-full h-48 rounded-t-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                    {project.image_url ? (
                      <img loading="lazy" src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="text-6xl">📦</div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
                    </div>

                    {/* Skills Tags */}
                    {project.skills_used && project.skills_used.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.skills_used.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {skill}
                          </span>
                        ))}
                        {project.skills_used.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-400">+{project.skills_used.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Stats and Link */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>👀 {project.views || 0}</span>
                        <span>❤️ {project.likes || 0}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete project"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-gray-400">No portfolio items yet. Add your first project!</p>
              </div>
            )}
          </div>
        </div>

        {/* Badges Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Badges & Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-yellow-500/50 transition-all hover:bg-yellow-500/10"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-400">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add Project Modal */}
        {showAddProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Add Portfolio Project</h3>
                <button
                  onClick={() => setShowAddProject(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g., E-commerce Dashboard"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project and what you built..."
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project URL</label>
                <input
                  type="url"
                  value={newProject.url}
                  onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={newProject.image_url}
                  onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Type</label>
                <select
                  value={newProject.project_type}
                  onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="web">Web App</option>
                  <option value="mobile">Mobile App</option>
                  <option value="design">Design</option>
                  <option value="backend">Backend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProject}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Add Project
                </button>
                <button
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default SkillProfile;