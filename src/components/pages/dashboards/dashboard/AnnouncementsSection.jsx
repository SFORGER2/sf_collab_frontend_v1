import { useEffect, useMemo, useState } from "react";
import CrowdfundingSection from "./CrowdfundingSection";
import DonationSection from "./DonationSection";
import WaitlistSection from "./WaitlistSection";
import { useSelector } from "react-redux";
import JoinSFSection from "./JoinSFSection";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, Users, FileText, ChevronDown, Mail, Megaphone } from "lucide-react";
import InfluencerProfileSection from "./InfluencerSection";
import notificationAPI from "@/utils/APIs/notificationAPI";
import { Link } from "react-router-dom";
import { plotCount } from "@/utils/plotCount";
import { formatFriendlyDate } from "@/utils/formatFriendlyDate";

export default function AnnouncementsSection({ userRoles }) {
  const { user } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementFilter, setAnnouncementFilter] = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await notificationAPI.getAnnouncements();
        const filtered = response.announcements.filter(a => {
          return !a?.data?.startupId;
        });
        setAnnouncements(filtered);
      } catch (error) {
        console.error('Failed to fetch announcements', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const [newsletter, setNewsletter] = useState([]);
  const [newsletterFilter, setNewsletterFilter] = useState('all');

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        const response = await notificationAPI.getNewsletter();
        setNewsletter(response.newsletter || []);
      } catch (error) {
        console.error('Failed to fetch newsletter', error);
      }
    };
    
    fetchNewsletter();
  }, []);

  const hasUnreadAnnouncements = useMemo(() => 
    announcements.some(a => !a.isRead), 
    [announcements]
  );
  const hasUnreadNewsletter = useMemo(() => 
    newsletter.some(n => !n.isRead), 
    [newsletter]
  );
  console.log(announcements.some(a => !a.isRead));
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('preferences:announcementsExpanded');
    return stored === null ? true : stored === 'true';
  });

  const [activeTab, setActiveTab] = useState('crowdfunding');
  useEffect(() => {
    const setActiveTabBasedOnUnread = () => {
      if (hasUnreadAnnouncements) {
        setActiveTab('announcements');
        return
      } else if (hasUnreadNewsletter) {
        setActiveTab('newsletter');
        return
      }
    const stored = localStorage.getItem('announcements:activeTab');
      if (stored) {
        setActiveTab(stored);
        return
      }
    }
    setActiveTabBasedOnUnread();
  }, [hasUnreadAnnouncements, hasUnreadNewsletter]);

  useEffect(() => {
    if (hasUnreadAnnouncements || hasUnreadNewsletter) {
      setIsExpanded(true);
    }
  }, [hasUnreadAnnouncements, hasUnreadNewsletter]);

  useEffect(() => {
    localStorage.setItem('announcements:activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('preferences:announcementsExpanded', isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    const markAsRead = async () => {
      if (activeTab === 'announcements') {
        for (const ann of announcements.filter(a => !a.isRead)) {
          try {
            await notificationAPI.markAsRead(ann.id);
            console.log("Marked as read");
          } catch (error) {
            console.error('Failed to mark announcement as read', error);
          }
        }
      } else if (activeTab === 'newsletter') {
        for (const nl of newsletter.filter(n => !n.isRead)) {
          try {
            await notificationAPI.markAsRead(nl.id);
          } catch (error) {
            console.error('Failed to mark newsletter as read', error);
          }
        }
      }
    };

    if (isExpanded) {
      markAsRead();
    }
  }, [activeTab, isExpanded, announcements, newsletter]);

  const [hideInfluencerInfo, setHideInfluencerInfo] = useState(false);
  const [hideShowJobApplication, setHideJobApplication] = useState(false);

  const tabs = useMemo(() => [
    { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: announcements.filter(a => !a.isRead).length },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, badge: newsletter.filter(n => !n.isRead).length },
    { id: 'waitlist', label: 'Waitlist', icon: Bell },
    { id: 'crowdfunding', label: 'Crowdfunding', icon: Zap },
    { id: 'applications', label: 'Applications', icon: FileText },
  ], [announcements, newsletter]);

  const filteredAnnouncements = useMemo(() => {
    if (announcementFilter === 'all' || announcementFilter === '') return announcements;
    return announcements.filter(a => a.priority === announcementFilter);
  }, [announcements, announcementFilter]);

  const filteredNewsletter = useMemo(() => {
    if (newsletterFilter === 'all') return newsletter;
    return newsletter.filter(n => n.priority === newsletterFilter);
  }, [newsletter, newsletterFilter]);
  

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-white/[0.02]">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="p-2 bg-white/5 rounded-lg">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">
            Announcements
          </h2>
          {(hasUnreadAnnouncements || hasUnreadNewsletter) && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-white/10 rounded-full"
            >
              <span className="text-xs font-semibold text-white">
                {plotCount(announcements.filter(a => !a.isRead).length + newsletter.filter(n => !n.isRead).length)}
              </span>
            </motion.div>
          )}
        </motion.div>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-5 w-5 text-white/60" />
          </motion.div>
        </motion.button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/10 bg-white/[0.01] overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon, badge }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap relative ${
                    activeTab === id
                      ? 'bg-linear-to-br from-amber-500 via-pink-600 to-purple-500 text-white border border-white/20'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                  layout
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold"
                    >
                      {plotCount(badge)}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'announcements' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search announcements..."
                          onChange={(e) => setAnnouncementFilter(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
                        />
                      </div>
                      <div className="space-y-3">
                        {filteredAnnouncements.length > 0 ? (
                          filteredAnnouncements.slice(0, 5).map((announcement, idx) => (
                            <motion.div 
                              key={announcement.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-4 rounded-lg border transition-all ${
                                announcement.isRead 
                                  ? 'bg-white/[0.02] border-white/5' 
                                  : 'bg-white/[0.05] border-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-sm font-semibold text-white flex-1">{announcement.title}</h3>
                                {
                                  announcement.linkUrl && (
                                    <Link
                                      to={announcement.linkUrl}
                                      className="ml-2 text-xs px-3 py-1 bg-blue-400 rounded-2xl text-white hover:text-blue-300 transition-colors"
                                    >
                                      View Details
                                    </Link>
                                  )}
                              </div>
                              <p className="text-xs text-white/60 mt-1 line-clamp-2">{announcement.message}</p>
                              <span className="text-xs text-white/40 mt-2 block">
                                {formatFriendlyDate(announcement.createdAt)}
                              </span>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-center text-white/40 py-8">No announcements at this time.</p>
                        )}
                      </div>
                      {filteredAnnouncements.length > 5 && (
                        <button className="w-full py-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
                          View all announcements
                        </button>
                      )}
                    </div>
                  )}
                  {activeTab === 'newsletter' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Search newsletter..."
                        onChange={(e) => setNewsletterFilter(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
                      />

                      <div className="space-y-3">
                        {filteredNewsletter.length > 0 ? (
                          filteredNewsletter.slice(0, 5).map((item, idx) => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-4 rounded-lg border transition-all ${
                                item.isRead 
                                  ? 'bg-white/[0.02] border-white/5' 
                                  : 'bg-white/[0.05] border-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-sm font-semibold text-white flex-1">{item.title}</h3>

                              </div>
                              <p className="text-xs text-white/60 mt-1 line-clamp-2">{item.message}</p>
                              <span className="text-xs text-white/40 mt-2 block">{formatFriendlyDate(item.createdAt)}</span>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-center text-white/40 py-8">No newsletter updates at this time.</p>
                        )}
                      </div>
                      {filteredNewsletter.length > 5 && (
                        <button className="w-full py-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
                          View all newsletters
                        </button>
                      )}
                    </div>
                  )}
                  {activeTab === 'waitlist' && (
                    <div className="space-y-6">
                      <WaitlistSection />
                    </div>
                  )}
                  {activeTab === 'crowdfunding' && (
                    <div className="space-y-6">
                      <CrowdfundingSection />
                      <DonationSection />
                    </div>
                  )}
                  {activeTab === 'applications' && user && (!hideShowJobApplication || !hideInfluencerInfo) && (
                    <div className="space-y-6">
                      {!hideShowJobApplication && (
                        <JoinSFSection setHideJobApplication={setHideJobApplication} />
                      )}
                      {user && !hideInfluencerInfo && (
                        <InfluencerProfileSection userData={user} setHideInfluencerInfo={setHideInfluencerInfo} />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
