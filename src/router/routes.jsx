import PitchDeckHome from "../components/pages/pitch-deck/PitchDeckHome.jsx";
import PitchDeckCreate from "../components/pages/pitch-deck/PitchDeckCreate.jsx";
import MyDecks from "../components/pages/pitch-deck/MyDecks.jsx";
import { createBrowserRouter } from "react-router-dom";
import Home from "../components/pages/Home.jsx";
import Layout from "../Layout/Layout.jsx";
import Project from "../components/pages/Project.jsx";
// import Profile from "../components/pages/Profile.jsx";
import Dashboard from "@/components/pages/dashboards/dashboard/dashboard.jsx";
import Ideation from "../components/pages/ideation/Ideation.jsx";
import Knowledge from "../components/pages/knowledge/Knowledge.jsx";
import Setting from "../components/pages/Setting.jsx";
import ProfileSetting from "../components/pages/ProfileSetting.jsx";
import Pricing from "../components/pages/pricing.jsx";
import Preferences from "../components/pages/Preferences.jsx";
import AccountandSecurity from "../components/pages/AccountandSecurity.jsx";
import Login from "../components/auth/Login.jsx";
import SignUp from "../components/auth/SignUp.jsx";
import OAuthCallback from "../components/auth/OAuthCallback.jsx";
import RegisterStartUp from "../components/pages/register-startup/RegisterStartUp.jsx";
import StartUp from "../components/pages/StartUp.jsx";
import HomedetailsPage from "../components/detailspage (previous)/HomedetailsPage.jsx";
import Idationdetails from "../components/pages/ideation/Ideationdetails.jsx";
import Knowledgedetails from "../components/detailspage (previous)/Knowledgedetails.jsx";
import ProjectDetails from "../components/detailspage (previous)/ProjectDetails.jsx";
import Posts from "../components/pages/posts/Posts.jsx";
import AINewsPage from "../components/pages/ai-news/AINewsPage.jsx";
import StartUpdetails from "../components/detailspage (previous)/StartUpdetails.jsx";
import Help from "../components/pages/Help.jsx";
import ProjectManagement from "../components/pages/ProjectManagement.jsx";
import VideoTutorials from "../components/pages/VideoTutorials.jsx";
import Notifications from "../components/pages/Notifications.jsx";
import NotFound from "../components/NotFound.jsx";
import GettingStarted from "../components/pages/QucikGuides/gettingStarted.jsx";
import TeamCollaboration from "../components/pages/QucikGuides/teamCollaboration.jsx";
import { ProtectedRoute, AuthRoute } from "../components/ProtectedRoute.jsx";
import SavedIdeas from "@/components/pages/ideation/SavedIdeas.jsx";
import ChatPage from "../components/pages/chat/ChatPage.jsx";
import BusinessIdeaGenerator from "../components/pages/Business_plan_generator/premium-business-generator.jsx";
import WebsiteGenerator from "../components/pages/WebsiteGenerator.jsx";
import ScraperForm from "../components/pages/Data_scraper/ScraperForm.jsx";
import PDFSigningApp from "@/components/pages/PDF_Signing/PDFSigningApp.jsx";

// import TimezoneConverter from "../components/pages/TimezoneConverter/TimezoneConverter.jsx";
import ChatComponent from "@/components/chat (previous)/ChatComponent.jsx";

import DiscoverStartups from "../components/pages/discoverStartups/DiscoverStartups.jsx";
import StartupDetailPage from "../components/pages/startupDetails/StartupDetailPage.jsx";
import Profile from "../components/pages/Profile/user-profile/Profile.jsx";
import ProfileSetup from "../components/pages/ProfileSetup.jsx";
import AssistantChatPage from "../components/pages/assistant/AssistantChatPage.jsx";
import DocumentsPage from "../components/pages/assistant/DocumentsPage.jsx";
import VersionHistoryPage from "../components/pages/assistant/VersionHistoryPage.jsx";
import MatchCardDemo from "../components/pages/MatchCardDemo.jsx";
import AINews from "../components/pages/ai-news/AINews.jsx";

export const router = createBrowserRouter([
  {
    path: "/generator-delivery",
    element: (
      <DeliveryPanel
        projectId="test-id"
        token="test-token"
        slug="my-generated-site"
      />
    ),
  },
  // Authentication routes (accessible only when not logged in)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },

  // Profile setup route - shown after signup/login
  {
    path: "/profile-setup",
    element: (
      <ProtectedRoute>
        <ProfileSetup />
      </ProtectedRoute>
    ),
  },

  // OAuth callback route
  // {
  //   path: "/auth/callback",
  //   element: <OAuthCallback />,
  // },
  // Routes are now public for development
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    // element: <Layout />,
    children: [
      {
        path: "/projects",
        element: <Project />,
      },

      // ── SF Assistant ────────────────────────────────────────────────────
      {
        path: "/assistant",
        element: <AssistantChatPage />,
      },
      {
        path: "/assistant/documents",
        element: <DocumentsPage />,
      },
      {
        path: "/assistant/documents/:id/versions",
        element: <VersionHistoryPage />,
      },

      {
        path: "/project-management",
        element: <ProjectManagement />,
      },

      {
        path: "/video-tutorials",
        element: <VideoTutorials />,
      },

      {
        path: "/website-generator",
        element: <WebsiteGenerator />,
      },

      {
        path: "/pricing",
        element: <Pricing />,
      },

      //todo: need to be fixed it's working but slow
      {
        path: "/business-plan",
        element: <BusinessIdeaGenerator />,
      },

      { path: "/pitch-deck", element: <PitchDeckHome /> },
      // TODO (Module 3)  — { path: "/pitch-deck/create",   element: <PitchDeckCreate /> },
      // TODO (Module 10) — { path: "/pitch-deck/my-decks", element: <MyDecks /> },

      //todo: need to be fixed
      {
        path: "/data-scraper",
        element: <ScraperForm />,
      },

      //? FIXED
      {
        path: "/chat",
        element: <ChatComponent />,
      },

      //!fixed
      {
        path: "/dashboard",
        element: <Dashboard />,
      },

      {
        path: "/ai-news",
        element: <AINews />,
      },

      {
        path: "/pitch-deck",
        element: <PitchDeckHome />,
      },

      {
        path: "/pitch-deck/create",
        element: <PitchDeckCreate />,
      },

      {
        path: "/pitch-deck/my-decks",
        element: <MyDecks />,
      },
      //!fixed
      // {
      //   path: "/startup",
      //   element: <StartUp />,
      // },

      //? FIXED
      {
        path: "/register-startup",
        element: <RegisterStartUp />,
      },

      //? FIXED
      {
        path: "/discover-startups",
        element: <DiscoverStartups />,
      },

      //? FIXED
      {
        path: "/startup-details/:id",
        element: <StartupDetailPage />,
      },

      //todo: need to be fixed
      {
        path: "/user-profile",
        element: <Profile />,
      },

      {
        path: "/ideation",
        element: <Ideation />,
      },

      {
        path: "/knowledge",
        element: <Knowledge />,
      },

      {
        path: "/posts",
        element: <Posts />,
      },
      {
        path: "/community/ai-news",
        element: <AINewsPage />,
      },

      {
        path: "/saved",
        element: <SavedIdeas />,
      },

      {
        path: "/help",
        element: <Help />,
      },

      {
        path: "/notifications",
        element: <Notifications />,
      },

      {
        path: "/matchcard-demo",
        element: <MatchCardDemo />,
      },

      {
        path: "/home-details",
        element: <HomedetailsPage />,
      },

      {
        path: "/ideation-details",
        element: <Idationdetails />,
      },

      {
        path: "/knowledge-details",
        element: <Knowledgedetails />,
      },

      {
        path: "/project-details",
        element: <ProjectDetails />,
      },

      // {
      //   path: "/startup-details",
      //   element: <StartUpdetails />,
      // },

      // {
      //   path: "/messages",
      //   element: <ChatPage />,
      // },

      {
        path: "/erp/warnings",
        element: <WarningDashboard />,
      },

      {
        path: "/getting-started",
        element: <GettingStarted />,
      },

      {
        path: "/team-collaboration",
        element: <TeamCollaboration />,
      },

      {
        path: "/setting",
        element: <Setting />,
        children: [
          {
            path: "/setting/",
            element: <ProfileSetting />,
          },
          {
            path: "/setting/preferences",
            element: <Preferences />,
          },
          {
            path: "/setting/account",
            element: <AccountandSecurity />,
          },
        ],
      },
    ],
  },
  // Catch all unmatched routes
  {
    path: "*",
    element: (
      <ProtectedRoute>
        <NotFound />
      </ProtectedRoute>
    ),
  },
]);
