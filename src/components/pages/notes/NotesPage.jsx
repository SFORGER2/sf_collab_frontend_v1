import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  Archive,
  Share2,
  Pin,
  Clock,
  Tag,
  Users,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeClosed,
} from 'lucide-react';

const NotesPage = () => {
  const { id: startupId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotesFromStorage();
  }, [startupId]);

  useEffect(() => {
    let filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || note.category === filterCategory;
      const matchesVisibility =
        filterVisibility === 'all' || note.visibility === filterVisibility;

      return matchesSearch && matchesCategory && matchesVisibility;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'oldest':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'pinned':
          return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, filterCategory, filterVisibility, sortBy]);

  const loadNotesFromStorage = () => {
    try {
      const storageKey = `notes_startup_${startupId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    }
  };

  const saveNotesToStorage = (notesToSave) => {
    try {
      const storageKey = `notes_startup_${startupId}`;
      localStorage.setItem(storageKey, JSON.stringify(notesToSave));
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleCreateNote = (noteData) => {
    const newNote = {
      id: Date.now().toString(),
      ...noteData,
      createdBy: user?.id || 'unknown',
      createdByName: user?.firstName || 'Unknown User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
      collaborators: [],
      attachments: [],
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setIsCreateModalOpen(false);
    toast.success('Note created successfully');
  };

  const handleUpdateNote = (noteData) => {
    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id
        ? {
            ...note,
            ...noteData,
            updatedAt: new Date().toISOString(),
          }
        : note
    );

    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setIsEditModalOpen(false);
    setSelectedNote(null);
    toast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      toast.success('Note deleted');
    }
  };

  const handleTogglePin = (noteId) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    );
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
  };

  const handleToggleArchive = (noteId) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId
        ? { ...note, isArchived: !note.isArchived }
        : note
    );
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    toast.success('Note archived');
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditModalOpen(true);
  };

  const categories = ['all', 'general', 'meeting', 'ideas', 'todo', 'decision'];
  const visibilityOptions = ['all', 'private', 'team', 'public'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Notes
                </h1>
              </div>
              <p className="text-sm text-gray-400 ml-15">
                {filteredNotes.length} of {notes.length} notes
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Note
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-white/20"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 hover:border-white/20 transition-all"
              >
                {categories.map((cat) => (
                  <option className="bg-gray-900 text-white" key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Visibility
              </label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 hover:border-white/20 transition-all"
              >
                {visibilityOptions.map((vis) => (
                  <option className="bg-gray-900 text-white" key={vis} value={vis}>
                    {vis.charAt(0).toUpperCase() + vis.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 hover:border-white/20 transition-all"
              >
                <option className="bg-gray-900 text-white" value="recent">Most Recent</option>
                <option className="bg-gray-900 text-white" value="oldest">Oldest First</option>
                <option className="bg-gray-900 text-white" value="alphabetical">Alphabetical</option>
                <option className="bg-gray-900 text-white" value="pinned">Pinned First</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterVisibility('all');
                  setSortBy('recent');
                }}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-white/20 transition-all font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl inline-block mb-4">
              <AlertCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No notes found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first note to get started'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <CreateNoteModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateNote}
        />
      )}

      {isEditModalOpen && selectedNote && (
        <EditNoteModal
          note={selectedNote}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedNote(null);
          }}
          onUpdate={handleUpdateNote}
        />
      )}
    </div>
  );
};

// ============= NOTE CARD COMPONENT =============
const NoteCard = ({
  note,
  index,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}) => {
  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-500/20 text-blue-400',
      meeting: 'bg-purple-500/20 text-purple-400',
      ideas: 'bg-yellow-500/20 text-yellow-400',
      todo: 'bg-emerald-500/20 text-emerald-400',
      decision: 'bg-red-500/20 text-red-400',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400';
  };

  const getVisibilityIcon = (visibility) => {
    const icons = {
      private: <Eye className="w-4 h-4 text-red-400" />,
      team: <Users className="w-4 h-4 text-blue-400" />,
      public: <Eye className="w-4 h-4 text-green-400" />,
    };
    return icons[visibility] || null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="relative h-full bg-[#1A1A1A] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-[#212121] transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-3 w-3 rounded-full ${getCategoryColor(note.category).split(' ')[0]}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${getCategoryColor(note.category)}`}>
                {note.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white line-clamp-2">
              {note.title}
            </h3>
          </div>

          {note.isPinned && (
            <Pin className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          )}
        </div>

        {/* Content Preview */}
        <p className="text-gray-300 text-sm line-clamp-3 mb-4 flex-1">
          {note.content}
        </p>

        {/* Meta Info */}
        <div className="space-y-3 mb-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {new Date(note.updatedAt).toLocaleDateString()}
            </div>
            {getVisibilityIcon(note.visibility)}
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-md hover:bg-white/10 transition-colors text-xs"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="px-2 py-1 bg-white/5 text-gray-400 rounded-md text-xs">
                  +{note.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(note)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 hover:border-blue-500/50 transition-all text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTogglePin(note.id)}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/30 hover:text-yellow-400 transition-all"
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleArchive(note.id)}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
            title={note.isArchived ? 'Restore' : 'Archive'}
          >
            <Archive className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(note.id)}
            className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ============= CREATE NOTE MODAL =============
const CreateNoteModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    visibility: 'team',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    onCreate(formData);
  };

  return (
    <NoteModal
      title="Create New Note"
      onClose={onClose}
      onSubmit={handleSubmit}
      formData={formData}
      handleChange={handleChange}
      tagInput={tagInput}
      setTagInput={setTagInput}
      handleAddTag={handleAddTag}
      handleRemoveTag={handleRemoveTag}
    />
  );
};

// ============= EDIT NOTE MODAL =============
const EditNoteModal = ({ note, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: note.title,
    content: note.content,
    category: note.category,
    visibility: note.visibility,
    tags: note.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    onUpdate(formData);
  };

  return (
    <NoteModal
      title="Edit Note"
      onClose={onClose}
      onSubmit={handleSubmit}
      formData={formData}
      handleChange={handleChange}
      tagInput={tagInput}
      setTagInput={setTagInput}
      handleAddTag={handleAddTag}
      handleRemoveTag={handleRemoveTag}
      isEdit
    />
  );
};

// ============= NOTE MODAL SHARED COMPONENT =============
const NoteModal = ({
  title,
  onClose,
  onSubmit,
  formData,
  handleChange,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  isEdit,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A1A1A] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#1A1A1A] backdrop-blur-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Note title..."
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-white/20"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Note content..."
              rows="8"
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none hover:border-white/20"
            />
          </div>

          {/* Category and Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all hover:border-white/20"
              >
                <option className="bg-gray-900 text-white" value="general">General</option>
                <option className="bg-gray-900 text-white" value="meeting">Meeting</option>
                <option className="bg-gray-900 text-white" value="ideas">Ideas</option>
                <option className="bg-gray-900 text-white" value="todo">To-Do</option>
                <option className="bg-gray-900 text-white" value="decision">Decision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all hover:border-white/20"
              >
                <option className="bg-gray-900 text-white" value="private">Private</option>
                <option className="bg-gray-900 text-white" value="team">Team</option>
                <option className="bg-gray-900 text-white" value="public">Public</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all hover:border-white/20"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-white/20 transition-all font-medium"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
            >
              {isEdit ? 'Update Note' : 'Create Note'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NotesPage;