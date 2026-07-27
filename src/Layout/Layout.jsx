/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RouteBoundary } from "@/components/cosmos/RouteErrorBoundary";
import { StickyTopAd } from "@/components/cosmos/StickyTopAd";
import { placementFor, wantsTopAd } from "@/components/cosmos/adPlacements";
import { useSelector } from "react-redux";

import NavBar from "../components/sections/NavBar";
import SkipToContent from "@/components/accessibility/SkipToContent";
import { motion } from "framer-motion";
const MotionDiv = motion.div;
import UserSidebar from "@/components/pages/sidebars/sidebar/GeneralSidebar";
import FounderSidebar from "@/components/pages/sidebars/founderSidebar/FounderSidebar";
import InfluencerSidebar from "@/components/pages/sidebars/influencerSidebar/InfluencerSidebar";
import BuilderSidebar from "@/components/pages/sidebars/builderSidebar/BuilderSidebar";
import InvestorSidebar from "@/components/pages/sidebars/investorSidebar/InvestorSidebar";
import MentorSidebar from "@/components/pages/sidebars/mentorSidebar/MentorSidebar";

import useScrollHide from "../utils/hooks/useScrollHide";
import { hasPermission } from "../utils/permissionCheck";
import { waitlistAPI } from "@/utils/APIs/waitlistAPI";

import ChatDock from "@/components/chat-dock/ChatDock";


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
import { createMentorLinks } from '@/components/pages/sidebars/mentorSidebar/MentorLinks';


const Layout = ({ activeRole, setActiveRole, userRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const isRootPath = location.pathname === "/";

  const { user, access_token } = useSelector((state) => state.auth);
  const [isAdmin] = useState(hasPermission(user, "admin_access"));

  const { isHidden: isNavHidden, onScroll } = useScrollHide({
    deltaThreshold: 4,
    topReveal: 10,
  });

  const [unreadMessagesCount] = useState(0);
  const navContainerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [disableNavbar, setDisableNavbar] = useState(false);
  const [isCompletePopupVisible, setIsCompletePopupVisible] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const toggleAIAssistant = useCallback(() => setIsAIAssistantOpen(prev => !prev), []);
  // Allow any page to open the assistant via window event (used by AskAIButton)
  useEffect(() => {
    const handler = () => setIsAIAssistantOpen(true);
    window.addEventListener('sfassistant:open', handler);
    return () => window.removeEventListener('sfassistant:open', handler);
  }, []);

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
      case 'mentor':
        return createMentorLinks(unread, userRoles, setActiveRole, activeRole);
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
      case "mentor":
        return <MentorSidebar {...props} />;
      default:
        return <UserSidebar {...props} />;
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1024px)");
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // ── Regular application layout ──────────────────────────────────────────
  return (
    <>
      {location.pathname === "/dashboard" && <Tutorial activeRole={activeRole} />}
      <SkipToContent />
      <div className="relative min-h-screen w-screen flex flex-col">
        {/* Background — cosmos atmosphere: three nebula blobs over the void,
            matching the landing page. Fixed so it doesn't scroll away. */}
        <div className="fixed inset-0 z-0 cosmos-atmosphere" aria-hidden="true" />
        <div className="fixed inset-0 z-0 cosmos-vignette pointer-events-none" aria-hidden="true" />

        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && <EmailVerifyPopUp />}

        {/* Profile Completion Modal */}
        {isCompletePopupVisible && <CompleteProfilePopUp setCompletePopupVisible={setIsCompletePopupVisible} />}

        {/* Top Nav - Header with banner landmark */}
        {!isRootPath && !disableNavbar && (
          <header
            ref={navContainerRef}
            role="banner"
            className={`w-full overflow-hidden transition-[max-height] duration-300 ease-in-out ${isNavHidden ? "h-0" : "h-16"}`}
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
          </header>
        )}

        <MotionDiv className="relative flex-1 w-full flex">
          {/* Left sidebar - Aside with complementary landmark */}
          {!isRootPath && (
            <aside aria-label="Sidebar navigation">
              <SideBar />
            </aside>
          )}

          {/* Main content area - Main landmark */}
          <main
            id="main-content"
            role="main"
            tabIndex={-1}
            className="text-white relative flex flex-col items-center w-full overflow-hidden lg:ml-0"
          >
            <div
              className={`relative w-full scroll-smooth overflow-x-hidden`}
              onScroll={isRootPath ? undefined : onScroll}
            >
              {/* Shared top ad. Placed here rather than per-page so it is
                  always in the same position, always above the fold, and the
                  route policy lives in one file instead of twenty. */}
              {/* Stays on screen while you scroll — see StickyTopAd for why
                  this can't be `position: sticky` here. */}
              {wantsTopAd(location.pathname) && (
                <StickyTopAd placement={placementFor(location.pathname)} />
              )}

              {/* Inner crash net: a page that throws loses the page, not the
                  navigation. The boundary in App.jsx is the outer backstop for
                  anything that fails above the layout. */}
              <RouteBoundary>
                <Outlet />
              </RouteBoundary>
            </div>
          </main>
        </MotionDiv>
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