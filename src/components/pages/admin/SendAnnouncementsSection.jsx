import React, { useState } from 'react';
import { notificationAPI } from '@/utils/APIs/notificationAPI';
import { toast } from 'react-toastify';

const AdminSendAnnouncementSection = () => {
  const [announcementType, setAnnouncementType] = useState('announcement');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('announcement');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        content: announcementType === 'newsletter' ? content : undefined,
        message: announcementType === 'announcement' ? content : undefined,
        priority: announcementType === 'announcement' ? priority : undefined,
        category: announcementType === 'announcement' ? category : undefined,
        link_url: linkUrl,
        data: {},
      };

      let response;
      if (announcementType === 'announcement') {
        response = await notificationAPI.createAnnouncement(payload);
      } else {
        response = await notificationAPI.createNewsletter(payload);
      }

      if (response) {
        toast.success(
          `${announcementType === 'announcement' ? 'Announcement' : 'Newsletter'} created successfully`
        );
        setTitle('');
        setContent('');
        setPriority('medium');
        setCategory('announcement');
        setLinkUrl('');
      }
    } catch (err) {
      console.error(err);
      toast.error(
        `Failed to create ${announcementType === 'announcement' ? 'announcement' : 'newsletter'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">📢 Send Announcement / Newsletter</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="announcement"
              checked={announcementType === 'announcement'}
              onChange={(e) => setAnnouncementType(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-300">Announcement</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="newsletter"
              checked={announcementType === 'newsletter'}
              onChange={(e) => setAnnouncementType(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-300">Newsletter</span>
          </label>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content..."
            rows="5"
            className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition resize-none"
          />
        </div>

        {/* Link URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Link URL (optional)</label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="reset"
            onClick={() => {
              setTitle('');
              setContent('');
              setLinkUrl('');
              setPriority('medium');
              setCategory('announcement');
            }}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition text-gray-300"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg disabled:opacity-50 transition font-medium text-white"
          >
            {loading
              ? `Sending ${announcementType === 'announcement' ? 'Announcement' : 'Newsletter'}...`
              : `Send ${announcementType === 'announcement' ? 'Announcement' : 'Newsletter'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSendAnnouncementSection;