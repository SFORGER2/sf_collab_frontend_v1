import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, Crown, Hammer, Megaphone, Shield, Wallet, BellOff } from "lucide-react";
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

import { useNotifications } from "../../contexts/NotificationContext";
import NotificationItem from "../notifications/NotificationItem";
import { Grid, Search, Plus, Sparkles } from 'lucide-react';
import AppLauncher from '@/components/app-launcher/AppLauncher';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CosmosButton } from '@/components/cosmos';

// Simple icon components
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

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

const NavBar = ({
  isOpen,
  setIsOpen,
  isHidden = false,
  links,
  isAIAssistantOpen,
  toggleAIAssistant,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { notifications: notifUnread, messages: msgUnread } = useUnreadCounts();
  console.log("msgUnread =", msgUnread);
  console.log("notifUnread =", notifUnread);
  const [loaderState, setLoaderState] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { notifications: rawNotifications, markAllAsRead } = useNotifications();
  const notifications = getNotificationsWithPreferences(rawNotifications, user);
  const unreadCount = notifications.filter(n => !n.is_read).length;

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

  const location = useLocation();

  useEffect(() => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  if (loaderState) return (
    <nav
      className={`flex px-6 items-center w-full h-16 justify-between relative transition-transform duration-300 will-change-transform ${isHidden ? "-translate-y-full" : "translate-y-0"
        } lg:translate-y-0`}
      style={{ zIndex: 10000 }}
    >
      <div className="absolute inset-0 z-0 cosmos-atmosphere-chrome" aria-hidden="true" />
    </nav>
  );

  return (
    <nav className={`fixed top-0 z-100 left-0 flex px-3 sm:px-6 items-center w-full h-16 justify-between border-b border-white/10 transition-transform duration-300 will-change-transform overflow-hidden ${isHidden ? "-translate-y-full" : "translate-y-0"}`}>
      {/* Cosmos chrome — translucent void with blur, as on the landing page nav */}
      <div className="absolute inset-0 z-0 cosmos-atmosphere-chrome" aria-hidden="true" />

      <div className="flex items-center gap-2.5 z-50">
        {/* The spark — the brand's anchor mark across landing page and app */}
        <span
          aria-hidden="true"
          className="hidden sm:block w-[9px] h-[9px] rounded-full bg-gold shrink-0"
          style={{ boxShadow: '0 0 12px 2px rgba(255,191,94,0.8)' }}
        />
        <div className="logo h-8 sm:h-10 w-20 sm:w-auto">
          <Link to={user?.id ? `/dashboard` : '/'} className="group h-full cursor-pointer flex items-center">
            <img loading="lazy" data-aos="fade-right" data-aos-duration="600" src="/logo_white.svg" className="w-full h-full object-contain" alt="sf collab" />
          </Link>
        </div>
      </div>

      <div className="flex items-center h-full gap-1.5 sm:gap-3 z-50">
        {user ? (
          <>


            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search…"
                className="w-48 pl-8 pr-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-star placeholder-dim transition-colors focus:outline-none focus:border-violet focus:bg-white/[0.06]"
              />
            </div>

            {/* Quick Create */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
                  <Plus size={22} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1a] border border-[#262626] rounded-lg">
                <DropdownMenuItem onClick={() => navigate('/register-startup')} className="text-white hover:bg-white/10">
                  New Startup
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/posts')} className="text-white hover:bg-white/10">
                  New Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* App Launcher */}
            <AppLauncher links={links} />

            {/* AI Assistant */}
            {/* Violet is the intelligence layer's colour — anything AI wears it */}
            <button
              onClick={toggleAIAssistant}
              aria-label="Toggle AI assistant"
              aria-pressed={isAIAssistantOpen}
              className={`p-2 rounded-lg transition-colors ${isAIAssistantOpen
                ? 'bg-violet/20 text-violet ring-1 ring-violet/40'
                : 'hover:bg-violet/10 text-slate-300 hover:text-violet'
                }`}
            >
              <Sparkles size={22} />
            </button>

            {/* Chat */}
            <Tippy content="Chat" placement="bottom">
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className={`relative p-2 rounded-lg transition-colors ${location.pathname === '/chat'
                  ? 'bg-blue-600/30 text-blue-400'
                  : 'hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                aria-label="Open chat"
              >
                <IoChatbubbles size={22} />

                {msgUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border border-[#0a0a0a]">
                    {msgUnread > 99 ? '99+' : msgUnread}
                  </span>
                )}
              </button>
            </Tippy>
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
                          {unreadCount > 0 && (
                            <>
                              <span className="px-2.5 py-1 bg-red-600/10 text-rose-400 text-xs font-semibold rounded-full ring-1 ring-rose-500/20">
                                {plotCount(unreadCount)} New
                              </span>
                              <button
                                type="button"
                                onClick={markAllAsRead}
                                className="px-2.5 py-1 bg-blue-600/10 text-blue-400 text-xs font-semibold rounded-full ring-1 ring-blue-500/20 cursor-pointer hover:bg-blue-600/20"
                              >
                                Mark all as read
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto p-3 space-y-3.5 bg-slate-900/30">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border-b border-slate-800/50">
                            <div className="p-3 rounded-full bg-slate-800/50 text-slate-500 mb-3 ring-1 ring-slate-700/50">
                              <BellOff className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-300">No new notifications</p>
                            <p className="text-xs text-slate-500 mt-1">When you receive alerts, they will appear here.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <NotificationItem key={notif.id} notification={notif} />
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
                  aria-label="Notifications"
                  aria-expanded={isNotificationsOpen}
                  aria-haspopup="true"
                  className="relative p-2 rounded-lg bg-blue-500/10 text-slate-300 hover:text-white"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 text-xs bg-red-500 rounded-full px-1" aria-label={`${unreadCount} unread notifications`}>
                      {plotCount(unreadCount)}
                    </span>
                  )}
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
                        <div className="w-full mx-auto bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-md flex items-center gap-3">
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
                        {user?.isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors duration-200">
                            <Shield size={18} /> <span className="text-sm font-medium">Admin</span>
                          </Link>
                        )}
                        <Link to="/setting" className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors duration-200">
                          <SettingsIcon /> <span className="text-sm font-medium">Settings</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-slate-700/50 bg-slate-900/50">
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
                  aria-label="User profile menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  className="w-10 h-10 rounded-lg overflow-hidden"
                >
                  <img loading="lazy" src={getProfilePicture(user)} className="w-full h-full object-cover" alt={`${user?.firstName} ${user?.lastName}`} />
                </button>
              </Tippy>
            </div>

            {/* Was carrying copy-pasted panel padding (p-8 md:p-10) on a 15px
                icon, which blew the button out past the nav height. */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isOpen}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 backdrop-blur-lg transition-colors hover:bg-white/[0.08] hover:text-star"
            >
              <TiThMenu size={16} />
            </button>
          </>
        ) : (
          <div className="hidden lg:flex gap-3 items-center">
            <CosmosButton variant="quiet" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </CosmosButton>
            <CosmosButton variant="primary" size="sm" onClick={() => navigate('/signup')}>
              Create a Vision
            </CosmosButton>
          </div>
        )}
      </div >
    </nav >
  );
};

export default NavBar;