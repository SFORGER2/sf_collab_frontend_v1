// Import required icons and utilities
import { Ban, Briefcase, Calendar, Camera, Edit, Globe, GraduationCap, Mail, MapPin, Phone, Plus, Save, Star, Trash2, Users, X, ThumbsUp, MessageCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { allimg } from "../../utils";

const EditModal = ({ item, type, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    item || (type === 'work'
      ? { company: '', period: '', description: '' }
      : { school: '', degree: '', period: '', description: '' })
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const fields = type === 'work'
    ? [
        { name: 'company', label: 'Company', type: 'text' },
        { name: 'period', label: 'Period (e.g., 2022–2025)', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    : [
        { name: 'school', label: 'School/University', type: 'text' },
        { name: 'degree', label: 'Degree', type: 'text' },
        { name: 'period', label: 'Period (e.g., 2017–2019)', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-full">
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold mb-4 capitalize">{item ? 'Edit' : 'Add'} {type}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="text-sm font-medium text-gray-400 mb-1 block">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('work')
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState(null);
  // State for profile data, edit mode, and bio text
  const [profileData, setProfileData] = useState({
    avatar: allimg.profileImg,
    cover: "https://images.unsplash.com/photo-1504805572947-34fad45a283f?q=80&w=2070&auto=format&fit=crop",
    name: "Lipp Tom",
    handle: "@lipptom",
    bio: "Engineer, founder, CEO & developer often found in coffee houses, crafting code and building ideas into reality.",
    info: {
      location: "San Francisco, CA",
      email: "lipp.tom@example.com",
      phone: "+1 123-456-7890",
      website: "lipptom.dev",
      joinDate: "Joined January 2023",
    },
    stats: {
      following: 340,
      followers: 1250,
    },
    workExperience: [
      { id: 1, company: "Google", period: "2022–2025", description: "Worked on scalable systems and product improvements across multiple teams.", title: "Senior Software Engineer" },
      { id: 2, company: "Amazon", period: "2019–2022", description: "Led feature development and enhanced system performance for e-commerce platforms." },
      { id: 3, company: "Apple", period: "2019–2022", description: "Collaborated on UI/UX design systems and implemented responsive frontend solutions." },
      { id: 4, company: "Microsoft", period: "2019–2022", description: "Developed cloud services and contributed to open-source internal tools." },
    ],
    education: [
      { id: 1, school: "Stanford University", degree: "Master of Science in Computer Science", period: "2017–2019", description: "Specialized in Artificial Intelligence and Machine Learning. Graduated with honors." },
      { id: 2, school: "MIT", degree: "Bachelor of Science in Computer Engineering", period: "2013–2017", description: "Focused on Software Engineering and Data Structures. Dean's List recipient." },
    ],
    posts: [
      {
        id: 1,
        type: 'text',
        caption: 'Just launched a new project! Check it out and let me know what you think. #webdev #react',
        timestamp: '2 days ago',
        likes: 12,
        comments: 3,
      },
      {
        id: 2,
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
        caption: 'Late night coding session for our new project. The future is bright! 💡 #devlife #startup',
        timestamp: '5 days ago',
        likes: 128,
        comments: 12,
      },
    ],
  });
  const [modalState, setModalState] = useState({ isOpen: false, type: null, item: null });

  const coverImageRef = useRef(null);
  const profileImageRef = useRef(null);

  const infoItems = [
    { name: 'location', icon: MapPin, text: profileData.info.location },
    { name: 'email', icon: Mail, text: profileData.info.email, href: `mailto:${profileData.info.email}` },
    { name: 'phone', icon: Phone, text: profileData.info.phone, href: `tel:${profileData.info.phone}` },
    { name: 'website', icon: Globe, text: profileData.info.website, href: `https://${profileData.info.website}` },
    { name: 'joinDate', icon: Calendar, text: profileData.info.joinDate },
  ]

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleInfoChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      info: {
        ...prev.info,
        [name]: value,
      },
    }));
  }, []);

  const handleEditClick = () => {
    setOriginalProfileData(profileData); // Save the original state
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setProfileData(originalProfileData); // Restore original data
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save the changes?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save',
      background: '#1E1E1E',
      color: '#FFFFFF'
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, you'd call an API to save data here
        setIsEditing(false);
        setOriginalProfileData(null); // Clear original data
        Swal.fire('Saved!', 'Your profile has been updated.', 'success');
      }
    });
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, [imageType]: reader.result }));
        // Here you would call an API to upload the file.
        // e.g., `filesAPI.uploadFile(file, 'user_avatar', { type: 'user', id: userId })`
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = (item) => {
    const { type } = modalState;
    const listKey = type === 'work' ? 'workExperience' : 'education';

    if (item.id) { // Update existing item
      setProfileData(prev => ({
        ...prev,
        [listKey]: prev[listKey].map(i => i.id === item.id ? item : i)
      }));
    } else { // Add new item
      const newItem = { ...item, id: Date.now() }; // Use a better ID in a real app
      setProfileData(prev => ({
        ...prev,
        [listKey]: [...prev[listKey], newItem]
      }));
    }
    setModalState({ isOpen: false, type: null, item: null });
  };

  const handleDeleteItem = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type} entry?`)) {
      const listKey = type === 'work' ? 'workExperience' : 'education';
      setProfileData(prev => ({
        ...prev,
        [listKey]: prev[listKey].filter(i => i.id !== id)
      }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white p-4 sm:p-6"
    >
      {modalState.isOpen && (
        <EditModal
          item={modalState.item}
          type={modalState.type}
          onSave={handleSaveItem}
          onClose={() => setModalState({ isOpen: false, type: null, item: null })}
        />
      )}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg shadow-blue-500/5">
          {/* Cover Image */}
          <div className="relative h-48 sm:h-64 rounded-t-2xl group">
            <img loading="lazy" src={profileData.cover} alt="Cover" className="w-full h-full object-cover rounded-t-2xl" />
            <input type="file" ref={coverImageRef} hidden accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-900/80 to-transparent" />
            {isEditing && (
              <button
                onClick={() => coverImageRef.current.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change cover image"
              >
                <Camera size={32} />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              <div className="relative -mt-20 sm:-mt-24 w-32 h-32 sm:w-36 sm:h-36 group">
                <img loading="lazy" src={profileData.avatar} alt="Profile" className="rounded-full w-full h-full object-cover border-4 border-zinc-900 shadow-lg shadow-blue-500/20" />
                <input type="file" ref={profileImageRef} hidden accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} />
                <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/50 ring-offset-4 ring-offset-zinc-900 animate-pulse" style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}></div>
                {isEditing && (
                  <button
                    onClick={() => profileImageRef.current.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Change profile image"
                  >
                    <Camera size={24} />
                  </button>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:pb-4 grow">
                {isEditing ? (
                  <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="bg-zinc-800 text-2xl sm:text-3xl font-bold text-white p-1 rounded-md w-full" />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{profileData.name}</h1>
                )}
                {isEditing ? (
                  <input type="text" name="handle" value={profileData.handle} onChange={handleProfileChange} className="bg-zinc-800 text-sm text-blue-400 p-1 rounded-md w-full mt-1" />
                ) : (
                  <p className="text-sm text-blue-400">{profileData.handle}</p>
                )}
              </div>
              <div className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 sm:pb-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleCancelClick} className="flex items-center gap-2 px-4 py-2 bg-zinc-600 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors">
                      <Ban size={16} /> Cancel
                    </button>
                    <button onClick={handleSaveClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-500/30">
                      <Save size={16} /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                    <Edit size={16} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <motion.div initial={false} animate={isEditing ? "open" : "closed"}>
              {isEditing ? (
                <motion.textarea
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className="mt-4 w-full bg-zinc-800 text-zinc-300 text-sm leading-relaxed p-2 rounded-md border border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows="3"
                />
              ) : (
                <p className="mt-4 text-zinc-300 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {profileData.bio}
                </p>
              )}
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-zinc-400 w-full sm:w-auto">
                  <item.icon size={16} className="text-blue-400 shrink-0" />
                  {isEditing ? (
                    <motion.input
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      type="text"
                      name={item.name}
                      value={item.text}
                      onChange={handleInfoChange}
                      className="bg-zinc-800 text-sm text-white p-1 rounded-md w-full border border-zinc-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    item.href ? (
                      <a href={item.href} className="hover:text-white hover:underline transition-colors">{item.text}</a>
                    ) : (
                      <span>{item.text}</span>
                    )
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{profileData.stats.following}</span>
                <span className="text-zinc-400">Following</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{profileData.stats.followers}</span>
                <span className="text-zinc-400">Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience and Education Tabs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('work')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'work' 
                    ? 'bg-blue-600/20 text-blue-300' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Work Experience
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'education' 
                    ? 'bg-blue-600/20 text-blue-300' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Education
              </button>
            </div>
            <button onClick={() => setModalState({ isOpen: true, type: activeTab, item: null })} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-700 transition-colors">
              <Plus size={14} /> Add New
            </button>
          </div>

          {activeTab === 'work' ? (
            <div className="space-y-4">
              {profileData.workExperience.map((job) => (
                <div key={job.id} className="group flex flex-col sm:flex-row gap-4 py-4 border-b border-zinc-800 last:border-b-0">
                  <div className="w-full sm:w-1/4">
                    <p className="font-semibold text-white">{job.company}</p>
                    <p className="text-zinc-400 text-xs">{job.period}</p>
                  </div>
                  <div className="w-full sm:w-3/4 flex justify-between items-start">
                    <p className="text-zinc-300 text-sm">{job.description}</p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModalState({ isOpen: true, type: 'work', item: job })} className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-md"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteItem(job.id, 'work')} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {profileData.education.map((edu) => (
                <div key={edu.id} className="group flex flex-col sm:flex-row gap-4 py-4 border-b border-zinc-800 last:border-b-0">
                  <div className="w-full sm:w-1/4">
                    <p className="font-semibold text-white">{edu.school}</p>
                    <p className="text-zinc-400 text-xs">{edu.period}</p>
                  </div>
                  <div className="w-full sm:w-3/4 flex justify-between items-start">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">{edu.degree}</p>
                      <p className="text-zinc-300 text-sm mt-1">{edu.description}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModalState({ isOpen: true, type: 'education', item: edu })} className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-md"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteItem(edu.id, 'education')} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
          <div className="space-y-6">
            {profileData.posts.map((post) => (
              <div key={post.id} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-start gap-4">
                  <img loading="lazy" src={profileData.avatar} alt={profileData.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-white">{profileData.name}</p>
                      <p className="text-xs text-zinc-500">{post.timestamp}</p>
                    </div>
                    <p className="mt-1 text-zinc-300 text-sm">{post.caption}</p>
                    {post.type === 'image' && post.mediaUrl && (
                      <img loading="lazy" src={post.mediaUrl} alt="Post content" className="mt-3 rounded-lg w-full object-cover max-h-72" />
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp size={14} />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
