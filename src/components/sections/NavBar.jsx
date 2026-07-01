import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, Crown, Hammer, Megaphone, Shield, Wallet } from "lucide-react";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import GlareHover from "../ui/GlareHover";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth/authThunks";
import { useDispatch, useSelector } from "react-redux";
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import { IoChatbubbles } from "react-icons/io5";
import { TiThMenu } from "react-icons/ti";
import { ShineButton } from '../lightswind/shine-button';
import { getProfilePicture } from "@/utils/getProfilePicture";
import getNotificationsWithPreferences from "@/utils/getNotificationsWithPreferences";
import { notificationAPI } from "@/utils/APIs/notificationAPI";
import { useUnreadCounts } from "@/utils/hooks/useUnreadCounts";
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { plotCount } from "@/utils/plotCount";

// Simple icon components
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ROLE_META = {
  founder: { label: "Founder Mode", icon: Crown },
  builder: { label: "Builder Mode", icon: Hammer },
  influencer: { label: "Influencer Mode", icon: Megaphone },
  admin: { label: "Admin Mode", icon: Shield },
};

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);


const NavBar = ({ isOpen, setIsOpen, isHidden = false }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { notifications: notifUnread, messages: msgUnread } = useUnreadCounts();
  const [loaderState, setLoaderState] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    setLoaderState(true);
    try {
      setTimeout(() => {
        window.location.href = "/login";
        setLoaderState(false);
      }, 1000);
      dispatch(logoutUser());
      
    } catch (err) {
      console.error("Logout error:", err);
      setLoaderState(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out", once: false });
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!activeDropdown) return;
    const handleClickOutside = (event) => {
      if (
        (activeDropdown === "notification" && notificationRef.current && !notificationRef.current.contains(event.target)) ||
        (activeDropdown === "profile" && profileRef.current && !profileRef.current.contains(event.target))
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const response = await notificationAPI.getAll();
      const notificationsData = response?.notifications || [];
      
      const formattedNotifications = notificationsData
        .map(notif => ({
          id: notif.id,
          title: notif.title,
          text: notif.message,
          time: notif.createdAt,
          unread: !notif.isRead,
          type: notif.notification_type,
          linkUrl: notif.linkUrl
        }));
        
      setNotifications(getNotificationsWithPreferences(formattedNotifications, user));
      
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      if (user?.notifications) {
        const fallback = user.notifications
          .map(notif => ({
            id: notif.id,
            title: notif.title,
            text: notif.message,
            time: notif.createdAt,
            unread: !notif.isRead,
            type: notif.notification_type
          }));
        setNotifications(getNotificationsWithPreferences(fallback, user));
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);
  const location = useLocation();

  useEffect(() => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prevNotifs => prevNotifs.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  if (loaderState) return (
    <nav
      className={`flex px-6 items-center w-full h-16 justify-between relative transition-transform duration-300 will-change-transform ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      } lg:translate-y-0`}
      style={{ zIndex: 10000 }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(125% 125% at 50% 90%, #000000 40%, #0d1a36 100%)" }}
      />
    </nav>
  );

  // Derived count to fall back cleanly if hook values aren't populated yet
  const calculatedUnreadCount = notifUnread > 0 ? notifUnread : notifications.filter(n => n.unread).length;

  return (
    <nav className={`fixed top-0 z-100 left-0 flex px-6 items-center w-full h-16 justify-between transition-transform duration-300 will-change-transform ${isHidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(125% 125% at 50% 90%, #000000 40%, #0d1a36 100%)" }}
      />

      <div className="logo h-full z-50 scale-140">
        <Link to={user?.id ? `/dashboard` : '/'} className="group h-full cursor-pointer flex items-center">
          <img loading="lazy" data-aos="fade-right" data-aos-duration="600" src="/logo_white.svg" className="w-full h-full" alt="sf collab" />
        </Link>
      </div>

      <div className="flex items-center h-full gap-3 z-50">
        {user ? (
          <>
            <WorkspaceSwitcher />
            <Link to="/chat" className="chat p-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-slate-300 hover:text-white hover:from-blue-500/30 hover:to-cyan-500/20 border border-blue-500/20 transition-all duration-200">
              <div className="relative inline-flex">
                <IoChatbubbles size={23} />
                {msgUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border border-[#0a0a0a]">
                    {msgUnread > 99 ? '99+' : msgUnread}
                  </span>
                )}
              </div>
            </Link>
            
            <div id="notification-dropdown" className="relative" ref={notificationRef}>
              {/* 🔔 NOTIFICATIONS */}
              <Tippy
                content={
                  <GlareHover
                    width="100%"
                    height="100%"
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    style={{ background: "rgba(58, 58, 58, 0.6)", backdropFilter: "blur(10px)", borderRadius: '15px' }}
                  >
                    <div style={{ borderRadius: '15px' }} className="w-80 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-700/50">
                        <div className="flex flex-wrap items-center justify-between">
                          <h3 className="text-lg font-bold text-white">Notifications</h3>
                          {calculatedUnreadCount > 0 && (
                            <>
                              <span className="px-2.5 py-1 bg-red-600/10 text-rose-400 text-xs font-semibold rounded-full ring-1 ring-rose-500/20">
                                {plotCount(calculatedUnreadCount)} New
                              </span>
                              <span
                                onClick={markAllRead}
                                className="px-2.5 py-1 bg-blue-600/10 text-blue-400 text-xs font-semibold rounded-full ring-1 ring-blue-500/20 cursor-pointer">
                                Mark all as read
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-slate-400 text-sm">No new notifications</p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              onClick={() => {
                                if (notif?.linkUrl) {
                                  navigate(notif.linkUrl)
                                } else {
                                  navigate('/notifications')
                                }
                              }}
                              key={notif.id} className="p-4 hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                                  <div className="relative">
                                    {/* FIXED: Removed the secondary global badge here */}
                                    <BellIcon />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-md text-white font-medium">{notif.title}</p>
                                  <p className="text-sm text-slate-400">{notif.text}</p>
                                  <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                </div>
                                {notif.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
                        <button onClick={() => navigate('/notifications')} className="w-full py-2 text-sm font-semibold text-blue-400 hover:text-blue-300">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </GlareHover>
                }
                visible={isNotificationsOpen}
                interactive
                placement="bottom"
                appendTo={document.body}
                onClickOutside={() => setIsNotificationsOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsNotificationsOpen(v => !v);
                  }}
                  className="relative p-2 rounded-lg bg-blue-500/10 text-slate-300 hover:text-white"
                >
                  <div className="relative">
                    <BellIcon />
                    {/* FIXED: Consolidated into a single clean notification badge */}
                    {calculatedUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border border-[#0a0a0a]">
                        {calculatedUnreadCount > 99 ? '99+' : calculatedUnreadCount}
                      </span>
                    )}
                  </div>
                </button>
              </Tippy>
            </div>

            <div className="relative" ref={profileRef}>
              {/* 👤 PROFILE */}
              <Tippy
                content={
                  <GlareHover
                    width="100%"
                    height="100%"
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    style={{ background: "rgba(58, 58, 58, 0.6)", backdropFilter: "blur(10px)", borderRadius: '15px' }}
                  >
                    <div style={{ borderRadius: '15px' }} className="w-80 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/30">
                            <img
                              className="h-full w-full object-cover"
                              src={getProfilePicture(user)}
                              alt="profile"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-slate-400">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link to="/user-profile" className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors duration-200">
                          <UserIcon /> <span className="text-sm font-medium">Profile</span>
                        </Link>
                        <Link to="/wallet" className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors duration-200">
                          <Wallet size={18} /> <span className="text-sm font-medium">Wallet</span>
                        </Link>
                        <Link to="/help" className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors duration-200">
                          <HelpCircle size={18} /> <span className="text-sm font-medium">Help</span>
                        </Link>
                        <Link to="/user-profile?page=settings" className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors duration-200">
                          <SettingsIcon /> <span className="text-sm font-medium">Settings</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-slate-700/50">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors duration-200">
                          <LogoutIcon /> <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </GlareHover>
                }
                visible={isProfileOpen}
                interactive
                placement="bottom"
                appendTo={document.body}
                onClickOutside={() => setIsProfileOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setIsProfileOpen(v => !v);
                  }}
                  className="w-10 h-10 rounded-lg overflow-hidden"
                >
                  <img loading="lazy" src={getProfilePicture(user)} className="w-full h-full object-cover" alt="avatar" />
                </button>
              </Tippy>
            </div>

            <div className="lg:hidden border border-blue-500/20 rounded-lg">
              <ShineButton
                onClick={() => setIsOpen(!isOpen)}
                icon={<TiThMenu size={15} />}
                size="sm"
                className=" border border-blue-500/20 rounded-lg"
                bgColor="linear-gradient(325deg, #2563eb 0%, #60a5fa 55%, #2563eb 90%)"
              />
            </div>
          </>
        ) : (
          <div className="hidden lg:flex gap-3">
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200">
              Login
            </button>
            <button onClick={() => navigate('/signup')} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400/30 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;