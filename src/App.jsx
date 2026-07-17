// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { FolderExplorerUI } from "./components/explorer/FolderExplorerUI";
import { AutoTranslateProvider } from "./components/AutoTranslateProvider.jsx";
import Layout from "./Layout/Layout.jsx";
import Project from "./components/pages/Project.jsx";
import Ideation from "./components/pages/ideation/Ideation.jsx";
import Knowledge from "./components/pages/knowledge/Knowledge.jsx";
import Setting from "./components/pages/Setting.jsx";
import ProfileSetting from "./components/pages/ProfileSetting.jsx";
import Preferences from "./components/pages/Preferences.jsx";
import AccountandSecurity from "./components/pages/AccountandSecurity.jsx";
import Login from "./components/auth/Login.jsx";
import SignUp from "./components/auth/SignUp.jsx";
import RegisterStartUp from "./components/pages/register-startup/RegisterStartUp.jsx";
import RegisterExistingStartup from "./components/pages/register-startup/RegisterExistingStartup.jsx";
import Ideationdetails from "./components/pages/ideation/Ideationdetails.jsx";
import Knowledgedetails from "./components/detailspage (previous)/Knowledgedetails.jsx";
import ProjectDetails from "./components/detailspage (previous)/ProjectDetails.jsx";
import Posts from "./components/pages/posts/Posts.jsx";
import Help from "./components/pages/Help.jsx";
import ProjectManagement from "./components/pages/ProjectManagement.jsx";
import VideoTutorials from "./components/pages/VideoTutorials.jsx";
import NotFound from "./components/NotFound.jsx";
import GettingStarted from "./components/pages/QucikGuides/gettingStarted.jsx";
import TeamCollaboration from "./components/pages/QucikGuides/teamCollaboration.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import BusinessIdeaGenerator from "./components/pages/Business_plan_generator/premium-business-generator.jsx";
import Test from "./components/pages/Test.jsx";
import ScraperForm from "./components/pages/Data_scraper/ScraperForm.jsx";
import DiscoverStartups from "./components/pages/discoverStartups/DiscoverStartups.jsx";
import StartupDetailPage from "./components/pages/startupDetails/StartupDetailPage.jsx";
import Profile from "./components/pages/Profile/user-profile/Profile.jsx";
import MatchCardDemo from "./components/pages/MatchCardDemo.jsx";
import ImageGenerator from "./components/pages/Image_Logo_Generator/ImageGenerator.jsx";
import StartupLogoGenerator from "./components/pages/Image_Logo_Generator/StartupLogoGenerator.jsx";
import QwenChat from "./components/pages/QwenChat/QwenChat";
import Waitlist from "./components/waitlist/Waitlist.jsx";
import ReferPage from "./components/waitlist/referAndRanking/refer.jsx";
import TermsAndConditions from "./components/pages/termsAndConditions/legalTerms.jsx";
import PrivacyPolicy from "./components/pages/termsAndConditions/legalPrivacy.jsx";
import DataCollection from "./components/pages/termsAndConditions/legalDataCollection.jsx";
import LandingPage from "./components/landing-page/pages/Home.jsx";
import AboutPage from "./components/landing-page/pages/About.jsx";
import TeamPage from "./components/landing-page/pages/team/TeamPage.jsx";
import ContactPage from "./components/landing-page/pages/ContactPage.jsx";
import StartupPage from "./components/landing-page/pages/StartupPage.jsx";
import ProductsPage from "./components/landing-page/pages/Products.jsx";
import Pricing from "./components/pages/Pricing/Pricing.jsx";
import MembershipBenefits from "./components/landing-page/pages/MembershipBenefits.jsx";
import ImplementationPlans from "./components/landing-page/pages/ImplementationPlans.jsx";
import FeaturedProjects from "./components/landing-page/pages/FeaturedProjects.jsx";
import PDFSigningApp from "./components/pages/PDF_Signing/PDFSigningApp.jsx";
import ChatPage from "./components/pages/chat/ChatPage.jsx";
import Explore_Section from "./components/landing-page/pages/Explore_Section.jsx";
import { ToastContainer } from "react-toastify";
import WaitlistTerms from "./components/pages/termsAndConditions/waitlistTerms.jsx";
import AdminPage from "./components/pages/admin/admin.jsx";
import DiscoverUsers from "./components/discover-users/DiscoverUsers.jsx";
import VerifyEmail from "./components/pages/verifyEmail/VerifyEmail.jsx";
import JoinSF from "./components/pages/joinSF/JoinSF.jsx";
import Influencer from "./components/pages/influencer/Influencer.jsx";
import ProfileSetup from "./components/pages/ProfileSetup.jsx";
import GlobalLanguageSelector from "./components/GlobalLanguageSelector.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState, useLayoutEffect } from "react";
import { usersAPI } from "./utils/APIs/userAPI.js";
import Dashboard from "./components/pages/dashboards/dashboard/dashboard.jsx";
import InfluencerDashboard from "./components/pages/dashboards/influencerDashboard/InfluencerDashboard.jsx";
import BuilderDashboard from "./components/pages/dashboards/builderDashboard/BuilderDashboard.jsx";
import FounderDashboard from "./components/pages/dashboards/founderDashboard/FounderDashboard.jsx";
import InvestorDashboard from "./components/pages/dashboards/investorDashboard/InvestorDashboard.jsx";
import AIDashboard from "./components/pages/dashboards/aiDashboard/AIDashboard.jsx";
import ContributionPage from "./components/pages/contribution/ContributionPage.jsx";
import InfluencerApplication from "./components/pages/influencerApplication/InfluencerApplication.jsx";
import ChatNotificationProvider from "./components/pages/chat/Chatnotificationprovider.jsx";
import ContributionIdeasPage from "./components/pages/contribution/ContributionIdeasPage.jsx";
import { SocketProvider } from "@/context/SocketProvider.jsx";
import { ChatContactsProvider } from "@/context/ChatContactsProvider.jsx";
import ContributionPollsPage from "./components/pages/contribution/ContributionPollsPage.jsx";
import Crowdfunding from "./components/pages/crowdfunding/Crowdfunding.jsx";
import Checkout from "./components/pages/checkout/Checkout.jsx";
import ReturnPage from "./components/pages/checkout/CheckoutReturnPage.jsx";
import Donate from "./components/pages/donate/Donate.jsx";

// Vision & Startup Workspace (Vision -> Startup progression system)
import VisionWorkspacePage from "./components/pages/vision/VisionWorkspacePage.jsx";
import StartupWorkspaceLayout from "./components/pages/startupWorkspace/StartupWorkspaceLayout.jsx";
import StartupWorkspaceDashboard from "./components/pages/startupWorkspace/StartupWorkspaceDashboard.jsx";
import StartupScoringPage from "./components/pages/startupWorkspace/StartupScoringPage.jsx";
import FinancialManagementPage from "./components/pages/startupWorkspace/FinancialManagementPage.jsx";
import CRMPage from "./components/pages/startupWorkspace/CRMPage.jsx";
import HiringPage from "./components/pages/startupWorkspace/HiringPage.jsx";
import InvestorPortalPage from "./components/pages/startupWorkspace/InvestorPortalPage.jsx";
import BusinessIntelligencePage from "./components/pages/startupWorkspace/BusinessIntelligencePage.jsx";
import AutomationPage from "./components/pages/startupWorkspace/AutomationPage.jsx";
import IntegrationsPage from "./components/pages/startupWorkspace/IntegrationsPage.jsx";
import StartupMentorsPage from "./components/pages/startupWorkspace/StartupMentorsPage.jsx";
import StartupCandidatesPage from "./components/pages/startupWorkspace/StartupCandidatesPage.jsx";

// SF Meet
import MeetingRoom from "./components/ui/meeting-room.jsx";
import MeetingDetailPage from "./components/pages/meet/MeetingDetailPage.jsx";
import MeetingsTab from "./components/pages/meet/MeetingsTab.jsx";
import PostMeetingSummaryPage from "./components/pages/meet/PostMeetingSummaryPage.jsx";
import ConnectionsPage from "./components/pages/connections/ConnectionsPage";

// Builder Dashboard Routes - Phase 2
import SavedStartups from "./components/pages/dashboards/builderDashboard/SavedStartups.jsx";
import MyApplications from "./components/pages/dashboards/builderDashboard/MyApplications.jsx";
import MyWork from "./components/pages/dashboards/builderDashboard/MyWork.jsx";
import Rewards from "./components/pages/dashboards/builderDashboard/Rewards.jsx";
import SkillProfile from "./components/pages/dashboards/builderDashboard/SkillProfile.jsx";
import UserPage from "./components/pages/usersPage/UsersPage.jsx";
import { NotificationProvider } from "./contexts/NotificationContext";
import ToastNotification from "./components/notifications/ToastNotification.jsx";
import NotificationPage from "./components/notifications/NotificationPage.jsx";
import ToolsDashboard from "./components/pages/dashboards/toolsDashboard/ToolsDashboard.jsx";
import CalculatorPage from "./components/pages/calculatorPage/CalculatorPage.jsx";
import NotesPage from "./components/pages/notes/NotesPage.jsx";
import WalletDashboard from "./components/pages/wallet/WalletDashboard";
import StorePage from "./components/pages/store/StorePage";
import LeaderboardPage from "./components/pages/leaderboard/LeaderboardPage";
import CaptionGenerator from "./components/pages/captionGenerator/CaptionGenerator.jsx";
import VideoGenerator from "./components/pages/videoGenerator/VideoGenerator.jsx";
import FounderManageApplications from "./components/pages/founder/manageApplications/FounderManageApplications.jsx";
import FounderManageTeam from "./components/pages/founder/manageTeam/FounderManageTeam.jsx";
import FounderManageTasks from "./components/pages/founder/manageTasks/FounderManageTasks.jsx";
import SavedIdeas from "./components/pages/ideation/SavedIdeas.jsx";
import AIToolsGuard from "./components/ai/AIToolsGuard.jsx";
import BuilderStartups from "./components/pages/builderStartups/BuilderStartups.jsx";
import BuilderMatchingStartupsPage from "./components/pages/builderStartups/BuilderMatchingStartupsPage.jsx";
import InviteToStartup from "./components/pages/inviteToStartup/InviteToStartup.jsx";
import MarketplacePage from "./components/pages/marketplace/MarketplacePage";
import MentorshipDiscovery from "./components/pages/Mentorship/MentorDiscoveryPage.jsx";
import MentorDashboard from "./components/pages/Mentorship/MentorDashboard";
import MyMentorshipRequests from "./components/pages/Mentorship/MyMentorshipRequests";
import {
  MyAttendancePage,
  WorkspaceAttendancePage,
} from "./components/pages/erp/AttendancePage.jsx";
import { AlertsPage } from "./components/pages/erp/AlertsPage.jsx";
import { AnalyticsDashboard } from "./components/pages/erp/AnalyticsDashboard.jsx";
import { ActivityMonitorPage } from "./components/pages/erp/ActivityMonitorPage.jsx";
import ERPDashboard from "./components/pages/erp/erp-dashboard";
import ERPUpdates from "./components/pages/erp/erp-updates";
import DocumentsPage from "./components/pages/erp/erp-document-page";
import TaskBoard from "./components/pages/erp/TaskBoard";
import PayoutPage from "./components/pages/erp/PayoutPage";
import MemberAnalyticsPage from "./components/pages/erp/MemberAnalyticsPage";
import AdminAnalyticsPage from "./components/pages/erp/AdminAnalyticsPage";
import AdminSettings from "./components/pages/erp/AdminSettings";
import FileDetailPage from "./components/pages/drive/fileDetails";
import MilestonePage from "./components/pages/milestones/MilestonePage.jsx";
import AdminRevenuePools from "./components/pages/erp/AdminRevenuePools";
import AdminRevenuePoolDetail from "./components/pages/erp/AdminRevenuePoolDetail";
import AdminPayouts from "./components/pages/erp/AdminPayouts";
import TaskApproval from "./components/pages/erp/TaskApproval";
import MemberDashboard from "./components/pages/erp/MemberDashboard";
import PointsDashboard from "./components/pages/erp/PointsDashboard";
import TaskDetail from "./components/pages/erp/TaskDetail";
import WorkspaceDashboard from "./components/pages/erp/WorkspaceDashboard";
import { WarningActionsPage } from "./components/pages/erp/WarningActionsPage";
import { FlagsPage } from "./components/pages/erp/FlagsPage";
import { AuditLogsPage } from "./components/pages/erp/AuditLogsPage";

// Pitch Deck Generator
import PitchDeckHome from "./components/pages/pitch-deck/PitchDeckHome";
import PitchDeckCreate from "./components/pages/pitch-deck/PitchDeckCreate";
import MyDecks from "./components/pages/pitch-deck/MyDecks";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { NewsletterProvider } from "./contexts/NewsletterContext";

import { ERPLayout } from "./components/erp/layout/ERPLayout";

export default function App() {
  const { access_token, user } = useSelector((state) => state.auth);
  const [userRoles, setUserRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(localStorage.getItem("activeRole") || "member");

  useEffect(() => {
    localStorage.setItem("activeRole", activeRole);
  }, [activeRole]);

  if (import.meta.env.PROD) {
    console.log = () => {};
    console.warn = () => {};
  }

  useEffect(() => {
    async function fetchUserRoles() {
      try {
        const response = await usersAPI.getMyRoles();
        setUserRoles([...response.data.map((role) => role.role)]);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    }
    const location = window.location;
    if (
      !["/login", "/signup", "/verify-email"].includes(location.pathname) ||
      (location.pathname !== "/" && access_token)
    )
      fetchUserRoles();
  }, [access_token]);

  function ScrollToTop() {
    const { pathname } = useLocation();
    useLayoutEffect(() => {
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.body.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname]);
    return null;
  }

  return (
    <BrowserRouter>
      <AutoTranslateProvider>
        <SocketProvider token={access_token}>
          <ChatNotificationProvider>
            <ChatContactsProvider token={access_token}>
              <NotificationProvider>
                <AnnouncementProvider>
                  <NewsletterProvider>
                    <GlobalLanguageSelector />
                    <ScrollToTop />
                    <Routes>
                      {/* ────── Public Routes ────── */}
                      <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/startuppage" element={<StartupPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/explore_section" element={<Explore_Section />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/membership-benefits" element={<MembershipBenefits />} />
                <Route path="/implementation-plans" element={<ImplementationPlans />} />
                <Route path="/featured-projects" element={<FeaturedProjects />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/data-collection-and-tracking" element={<DataCollection />} />
                    <Route path="/pricing" element={<Pricing />} />
                <Route path="/waitlist" element={<Waitlist />} />
                <Route path="/waitlist-terms" element={<WaitlistTerms />} />


                {/* ────── Protected Routes ────── */}
                <Route element={<ProtectedRoute />}>
                  {/* === Main Application (with global Layout) === */}
                  <Route
                    element={
                      <Layout
                        activeRole={activeRole}
                        setActiveRole={setActiveRole}
                        userRoles={userRoles}
                      />
                    }
                  >
                    {/* Dashboard (role-based) */}
                    <Route
                      path="dashboard"
                      element={
                        user && activeRole === "influencer" ? (
                          <InfluencerDashboard
                            activeRole={activeRole}
                            setActiveRole={setActiveRole}
                            userRoles={userRoles}
                            setUserRoles={setUserRoles}
                          />
                        ) : user && activeRole === "builder" ? (
                          <BuilderDashboard
                            activeRole={activeRole}
                            setActiveRole={setActiveRole}
                            userRoles={userRoles}
                            setUserRoles={setUserRoles}
                          />
                        ) : user && activeRole === "founder" ? (
                          <FounderDashboard
                            activeRole={activeRole}
                            setActiveRole={setActiveRole}
                            userRoles={userRoles}
                            setUserRoles={setUserRoles}
                          />
                        ) : user && activeRole === "investor" ? (
                          <InvestorDashboard
                            activeRole={activeRole}
                            setActiveRole={setActiveRole}
                            userRoles={userRoles}
                            setUserRoles={setUserRoles}
                          />
                        ) : (
                          <Dashboard
                            activeRole={activeRole}
                            setActiveRole={setActiveRole}
                            userRoles={userRoles}
                          />
                        )
                      }
                    />

                    {/* Builder Routes */}
                    <Route path="builder/my-applications" element={<MyApplications />} />
                    <Route path="builder/my-work" element={<MyWork />} />
                    <Route path="builder/rewards" element={<Rewards />} />
                    <Route path="builder/my-startups" element={<BuilderStartups myStartupsOnly={true} />} />
                    <Route path="builder/matching-startups" element={<BuilderMatchingStartupsPage />} />
                    <Route path="builder/profile-skills" element={<SkillProfile />} />
                    <Route path="builder/profile" element={<SkillProfile />} />

                    {/* Founder Routes */}
                    <Route path="founder/my-applications" element={<FounderManageApplications />} />
                    <Route path="founder/my-team" element={<FounderManageTeam />} />
                    <Route path="founder/manage-tasks" element={<FounderManageTasks />} />

                    {/* AI & Tools */}
                    <Route path="ai-dashboard" element={<AIToolsGuard><AIDashboard /></AIToolsGuard>} />
                    <Route path="tools-dashboard" element={<ToolsDashboard />} />

                    {/* Users & Profiles */}
                    <Route path="influencer" element={<Influencer />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="refer" element={<ReferPage />} />
                    <Route path="join-sf" element={<JoinSF />} />
                    <Route path="apply-influencer" element={<InfluencerApplication />} />
                    <Route path="profile-setup" element={<ProfileSetup />} />
                    <Route path="users/:id" element={<UserPage />} />
                    <Route path="user-profile" element={<Profile />} />

                    {/* Projects & Ideation */}
                    <Route path="projects" element={<Project />} />
                    <Route path="project-management" element={<ProjectManagement />} />
                    <Route path="project-details" element={<ProjectDetails />} />
                    <Route path="ideation" element={<Ideation activeRole={activeRole} />} />
                    <Route path="saved-ideas" element={<SavedIdeas />} />
                    <Route path="ideation-details" element={<Ideationdetails />} />

                    {/* Knowledge */}
                    <Route path="knowledge" element={<Knowledge />} />
                    <Route path="knowledge-details" element={<Knowledgedetails />} />

                    {/* Help */}
                    <Route path="help" element={<Help />} />
                    <Route path="video-tutorials" element={<VideoTutorials />} />

                    {/* Chat & Social */}
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="connections" element={<ConnectionsPage />} />
                    <Route path="notifications" element={<NotificationPage />} />
                    <Route path="posts" element={<Posts />} />

                    {/* Contribution */}
                    <Route path="contribution" element={<ContributionPage />} />
                    <Route path="contribution-ideas" element={<ContributionIdeasPage />} />
                    <Route path="contribution-polls" element={<ContributionPollsPage />} />

                    {/* Crowdfunding & Payments */}
                    <Route path="crowdfunding" element={<Crowdfunding />} />
                    <Route path="checkout/:tierId" element={<Checkout />} />
                    <Route path="checkout/return" element={<ReturnPage />} />
                    <Route path="donate" element={<Donate />} />

                    {/* Quick Guides */}
                    <Route path="getting-started" element={<GettingStarted />} />
                    <Route path="team-collaboration" element={<TeamCollaboration />} />

                    {/* Test */}
                    <Route path="test" element={<Test />} />

                    {/* Startups */}
                    <Route path="register-startup" element={<RegisterStartUp />} />
                    <Route path="register-existing-startup" element={<RegisterExistingStartup />} />
                    <Route path="discover-startups" element={<DiscoverStartups />} />
                    <Route path="matchcard-demo" element={<MatchCardDemo />} />
                    <Route path="my-startups" element={<DiscoverStartups myStartupsOnly={true} />} />
                    <Route path="startup-details/:id" element={<StartupDetailPage />} />
                    <Route path="vision/:id" element={<VisionWorkspacePage />} />
                    <Route path="pitch-deck" element={<PitchDeckHome />} />
                    <Route path="pitch-deck/create" element={<PitchDeckCreate />} />
                    <Route path="pitch-deck/my-decks" element={<MyDecks />} />
                    <Route path="saved-startups" element={<SavedStartups />} />
                    <Route path="invitations" element={<InviteToStartup />} />

                    {/* AI Tools */}
                    <Route path="business-plan" element={<AIToolsGuard><BusinessIdeaGenerator /></AIToolsGuard>} />
                    <Route path="multimodal-images" element={<AIToolsGuard><ImageGenerator /></AIToolsGuard>} />
                    <Route path="logo-generator" element={<AIToolsGuard><StartupLogoGenerator /></AIToolsGuard>} />
                    <Route path="data-scraper" element={<AIToolsGuard><ScraperForm /></AIToolsGuard>} />
                    <Route path="qwen-chat" element={<AIToolsGuard><QwenChat /></AIToolsGuard>} />
                    <Route path="caption-generator" element={<AIToolsGuard><CaptionGenerator /></AIToolsGuard>} />
                    <Route path="video-generator" element={<AIToolsGuard><VideoGenerator /></AIToolsGuard>} />

                    {/* Wallet & Store */}
                    <Route path="wallet" element={<WalletDashboard />} />
                    <Route path="store" element={<StorePage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="marketplace" element={<MarketplacePage />} />

                    {/* Tools */}
                    <Route path="pdf-signing" element={<PDFSigningApp />} />
                    <Route path="calculator" element={<CalculatorPage />} />
                    <Route path="notes" element={<NotesPage />} />

                    {/* Discover */}
                    <Route path="discover-users" element={<DiscoverUsers />} />

                    {/* Mentorship */}
                    <Route path="mentors" element={<MentorshipDiscovery />} />
                    <Route path="mentor-dashboard" element={<MentorDashboard />} />
                    <Route path="mentors/dashboard" element={<Navigate to="/mentor-dashboard" replace />} />
                    <Route path="my-mentorship-requests" element={<MyMentorshipRequests />} />

                    {/* Milestones */}
                    <Route path="milestones" element={<MilestonePage />} />

                    {/* SF Drive */}
                    <Route path="drive/file/:id" element={<FileDetailPage />} />
                    <Route path="sf-drive" element={<FolderExplorerUI />} />

                    {/* SF Meet (inside Layout) */}
                    <Route path="meet" element={<MeetingsTab />} />
                    <Route path="meet/:id" element={<MeetingDetailPage />} />
                    <Route path="meet/:id/summary" element={<PostMeetingSummaryPage />} />

                    {/* Settings */}
                    <Route path="setting" element={<Setting />}>
                      <Route index element={<ProfileSetting />} />
                      <Route path="preferences" element={<Preferences />} />
                      <Route path="account" element={<AccountandSecurity />} />
                    </Route>
                  </Route>

                  {/* === ERP Workspace (separate layout, no global navigation) === */}
                  <Route
                    path="erp"
                    element={<ERPLayout activeRole={activeRole} userRoles={userRoles} user={user} />}
                  >
                    <Route index element={<ERPDashboard />} />
                    <Route path="attendance" element={<MyAttendancePage />} />
                    <Route path="attendance/workspace" element={<WorkspaceAttendancePage />} />
                    <Route path="alerts" element={<AlertsPage />} />
                    <Route path="activity" element={<ActivityMonitorPage />} />
                    <Route path="updates" element={<ERPUpdates />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="tasks" element={<TaskBoard />} />
                    <Route path="payouts" element={<PayoutPage />} />
                    <Route path="my-analytics" element={<MemberAnalyticsPage />} />
                    <Route path="admin-analytics" element={<AdminAnalyticsPage />} />
                    <Route path="admin-settings" element={<AdminSettings />} />
                    <Route path="admin/revenue-pools" element={<AdminRevenuePools />} />
                    <Route path="admin/revenue-pools/:poolId" element={<AdminRevenuePoolDetail />} />
                    <Route path="admin/payouts" element={<AdminPayouts />} />
                    <Route path="task-approval" element={<TaskApproval />} />
                    <Route path="member-dashboard" element={<MemberDashboard />} />
                    <Route path="points" element={<PointsDashboard />} />
                    <Route path="tasks/:taskId" element={<TaskDetail />} />
                    <Route path="workspace-dashboard" element={<WorkspaceDashboard />} />
                    <Route path="warnings" element={<WarningActionsPage />} />
                    <Route path="flags" element={<FlagsPage />} />
                    <Route path="audit-logs" element={<AuditLogsPage />} />
                  </Route>

                  {/* === Startup Workspace (separate layout, no global navigation) === */}
                  <Route path="startup-workspace/:id" element={<StartupWorkspaceLayout />}>
                    <Route index element={<StartupWorkspaceDashboard />} />
                    <Route path="scoring" element={<StartupScoringPage />} />
                    <Route path="crm" element={<CRMPage />} />
                    <Route path="hiring" element={<HiringPage />} />
                    <Route path="financials" element={<FinancialManagementPage />} />
                    <Route path="investor-portal" element={<InvestorPortalPage />} />
                    <Route path="business-intelligence" element={<BusinessIntelligencePage />} />
                    <Route path="automation" element={<AutomationPage />} />
                    <Route path="integrations" element={<IntegrationsPage />} />
                    <Route path="mentors" element={<StartupMentorsPage />} />
                    <Route path="candidates" element={<StartupCandidatesPage />} />
                  </Route>
                </Route>

                {/* ────── 404 ────── */}
                <Route path="*" element={<NotFound />} />

                {/* ────── SF Meet Room (fullscreen, no sidebar) ────── */}
                <Route
                  path="/meet/room/:id"
                  element={
                    <ProtectedRoute>
                      <MeetingRoom />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                style={{ bottom: "20px" }}
              />
              <ToastNotification />
              </NewsletterProvider>
              </AnnouncementProvider>
            </NotificationProvider>
          </ChatContactsProvider>
        </ChatNotificationProvider>
      </SocketProvider>
    </AutoTranslateProvider>
  </BrowserRouter>
  );
}
