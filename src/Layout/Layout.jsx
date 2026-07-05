/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import NavBar from "../components/sections/NavBar";
import { motion } from "framer-motion";
import UserSidebar from "@/components/pages/sidebars/sidebar/GeneralSidebar";
import FounderSidebar from "@/components/pages/sidebars/founderSidebar/FounderSidebar";
import InfluencerSidebar from "@/components/pages/sidebars/influencerSidebar/InfluencerSidebar";
import BuilderSidebar from "@/components/pages/sidebars/builderSidebar/BuilderSidebar";
import InvestorSidebar from "@/components/pages/sidebars/investorSidebar/InvestorSidebar";

import useScrollHide from "../utils/hooks/useScrollHide";
import { hasPermission } from "../utils/permissionCheck";
import { waitlistAPI } from "@/utils/APIs/waitlistAPI";

import ChatDock from "@/components/chat-dock/ChatDock";
import { useChatContacts } from "@/context/ChatContactsProvider";

import useSocket from "@/components/pages/chat/useSocket";
import { toast } from "react-toastify";

import AOS from "aos";
import "aos/dist/aos.css";
import { isUserProfileComplete } from "@/utils/getUserComplete";
import EmailVerifyPopUp from "./emailVerifyPopUp";
import CompleteProfilePopUp from "./CompleteEmailPopUp";
import AIAssistant from "./AIAssistant";
import Tutorial from "./DashboardTutorial";
import { createLinks } from '@/components/pages/sidebars/sidebar/links';
import { createFounderLinks } from '@/components/pages/sidebars/founderSidebar/FounderLinks';
import { createBuilderLinks } from '@/components/pages/sidebars/builderSidebar/BuilderLinks';
import { createInfluencerLinks } from '@/components/pages/sidebars/influencerSidebar/influencerLinks';
import { createInvestorLinks } from '@/components/pages/sidebars/investorSidebar/InvestorLinks';


const Layout = ({ activeRole, setActiveRole, userRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const isRootPath = location.pathname === "/";
  const isChatRoute = location.pathname.startsWith("/chat");
  const isConnectionsRoute = location.pathname.startsWith("/connections");

  const { user, access_token } = useSelector((state) => state.auth);
  const [isAdmin] = useState(hasPermission(user, "admin_access"));
  const { friends } = useChatContacts();

  const { isHidden: isNavHidden, onScroll } = useScrollHide({
    deltaThreshold: 4,
    topReveal: 10,
  });

  const [unreadMessagesCount] = useState(0);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsRef = useRef(null);
  const navContainerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [disableNavbar, setDisableNavbar] = useState(false);
  const [isCompletePopupVisible, setIsCompletePopupVisible] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const toggleAIAssistant = useCallback(() => setIsAIAssistantOpen(prev => !prev), []);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out", once: false });
  }, []);

  // Waitlist guard
  useEffect(() => {
    if (!user || !access_token) return;

    const checkWaitlist = async () => {
      try {
        const res = await waitlistAPI.isOnWaitlist(user.email, access_token);
        if (
          !res?.on_waitlist &&
          !["/waitlist", "/waitlist-terms", "/user-profile", "/apply-influencer", "/joinsf", "/pricing"].includes(location.pathname)
        ) {
          toast.info("You should join the waitlist to access this section.");
          navigate("/waitlist");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkWaitlist();
  }, [user, access_token, location.pathname]);

  // Connection notifications via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    const handleNewConnectionRequest = (data) => {
      if (!data) return;
      const senderName = data.sender_name || `${data.sender?.first_name || ''} ${data.sender?.last_name || ''}`.trim() || 'Someone';
      toast.info(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">New Connection Request</p>
          <p className="text-sm opacity-90">{senderName} wants to connect with you</p>
        </div>,
        {
          onClick: () => navigate("/connections?tab=incoming"),
          autoClose: 5000,
        }
      );
      window.dispatchEvent(new CustomEvent('connection:new_request', { detail: data }));
    };

    const handleRequestAccepted = (data) => {
      if (!data) return;
      const accepterName = data.accepter_name || `${data.accepter?.first_name || ''} ${data.accepter?.last_name || ''}`.trim() || 'Someone';
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Connection Accepted!</p>
          <p className="text-sm opacity-90">{accepterName} accepted your connection request</p>
        </div>,
        {
          onClick: () => navigate(`/user-profile?userId=${data.accepter_id || data.accepter?.id}`),
          autoClose: 5000,
        }
      );
      window.dispatchEvent(new CustomEvent('connection:request_accepted', { detail: data }));
    };

    const handleRequestDeclined = (data) => {
      if (!data) return;
      window.dispatchEvent(new CustomEvent('connection:request_declined', { detail: data }));
    };

    const handleConnectionRemoved = (data) => {
      if (!data) return;
      window.dispatchEvent(new CustomEvent('connection:removed', { detail: data }));
    };

    socket.on('connection_request', handleNewConnectionRequest);
    socket.on('connection_request_received', handleNewConnectionRequest);
    socket.on('connection_accepted', handleRequestAccepted);
    socket.on('connection_request_accepted', handleRequestAccepted);
    socket.on('connection_declined', handleRequestDeclined);
    socket.on('connection_removed', handleConnectionRemoved);

    return () => {
      socket.off('connection_request', handleNewConnectionRequest);
      socket.off('connection_request_received', handleNewConnectionRequest);
      socket.off('connection_accepted', handleRequestAccepted);
      socket.off('connection_request_accepted', handleRequestAccepted);
      socket.off('connection_declined', handleRequestDeclined);
      socket.off('connection_removed', handleConnectionRemoved);
    };
  }, [socket, isConnected, user]);

  // Profile completion reminder
  useEffect(() => {
    if (!user) return;

    const checkProfileCompletion = async () => {
      if (!isUserProfileComplete(user) && !location.pathname.startsWith("/user-profile") && user.isEmailVerified) {
        setIsCompletePopupVisible(true);
      }
    };

    checkProfileCompletion();
  }, [user, location]);

  const links = useMemo(() => {
    const unread = 0;
    switch (activeRole) {
      case 'founder':
        return createFounderLinks(unread, userRoles, setActiveRole, activeRole);
      case 'builder':
        return createBuilderLinks(unread, userRoles, setActiveRole, activeRole);
      case 'influencer':
        return createInfluencerLinks(unread, userRoles, setActiveRole, activeRole);
      case 'investor':
        return createInvestorLinks(unread, userRoles, setActiveRole, activeRole);
      default:
        return createLinks(unread, userRoles, setActiveRole);
    }
  }, [activeRole, userRoles, setActiveRole]);

  // Sidebar resolver
  const SideBar = () => {
    const props = {
      unreadMessagesCount,
      setIsOpen,
      isOpen,
      isAdmin,
      userRoles,
      setActiveRole,
      links,
    };

    switch (activeRole) {
      case "founder":
        return <FounderSidebar {...props} />;
      case "influencer":
        return <InfluencerSidebar {...props} />;
      case "builder":
        return <BuilderSidebar {...props} />;
      case "investor":
        return <InvestorSidebar {...props} />;
      default:
        return <UserSidebar {...props} />;
    }
  };

  const handleNavAreaEnter = () => !isRootPath && setIsOptionsVisible(true);
  const handleNavAreaLeave = (e) => {
    if (isRootPath) return;
    const nextEl = e.relatedTarget;
    if (!nextEl || !(nextEl instanceof Node)) {
      setIsOptionsVisible(false);
      return;
    }
    if (optionsRef.current && optionsRef.current.contains(nextEl)) return;
    if (nextEl.closest?.(".options-container")) return;
    setIsOptionsVisible(false);
  };

  const isMobile = useMemo(() => window.matchMedia("(max-width: 1024px)").matches, []);

  // ── Regular application layout ──────────────────────────────────────────
  return (
    <>
      {location.pathname === "/dashboard" && <Tutorial activeRole={activeRole} />}
      <div className="relative min-h-screen w-screen flex flex-col">
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #0d1a36 100%)",
          }}
        />

        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && <EmailVerifyPopUp />}

        {/* Profile Completion Modal */}
        {isCompletePopupVisible && <CompleteProfilePopUp setCompletePopupVisible={setIsCompletePopupVisible} />}

        {/* Top Nav */}
        {!isRootPath && !disableNavbar && (
          <div
            ref={navContainerRef}
            className={`w-full overflow-hidden transition-[max-height] duration-300 ease-in-out ${isNavHidden ? "h-0" : "h-[60px]"}`}
          >
            <NavBar
              setIsOpen={setIsOpen}
              isOpen={isOpen}
              isHidden={isNavHidden}
              isAdmin={isAdmin}
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              userRoles={userRoles}
              links={links}
              isAIAssistantOpen={isAIAssistantOpen}
              toggleAIAssistant={toggleAIAssistant}
            />
          </div>
        )}

        <motion.div className="relative flex-1 w-full flex overflow-hidden">
          {/* Left sidebar */}
          {!isRootPath && <SideBar />}

          {/* Main content area */}
          <div className="text-white relative flex flex-col items-center w-full overflow-hidden lg:ml-0">
            <div
              className={`relative w-full h-full overflow-y-auto scrollbar-hide scroll-smooth overflow-x-hidden`}
              onScroll={isRootPath ? undefined : onScroll}
            >
              <Outlet />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat docks */}
      {(location.pathname !== "/chat") && (
        <>
          <AIAssistant
            isOpen={isAIAssistantOpen}
            onClose={() => setIsAIAssistantOpen(false)}
            isMobile={isMobile}
            callback={() => isMobile ? setDisableNavbar(!disableNavbar) : null}
          />
          <ChatDock
            maxWindows={isMobile ? 1 : 2}
            isMobile={isMobile}
            callback={() => (isMobile ? setDisableNavbar(!disableNavbar) : null)}
          />
        </>
      )}
    </>
  );
};

export default Layout;