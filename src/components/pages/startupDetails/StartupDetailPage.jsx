/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Calendar, TrendingUp, Heart, Share2, ChevronRight, Home, Trash2, UserPlus, BarChart3,
  FileText, Target, MessageSquare,CheckCircle2Icon,XIcon,
  Bookmark,
  ClipboardList
} from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "../../ui/alert"
  
// shadcn/ui components
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader} from '../../ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import ShinyText from '../../ui/ShinyText';

import { useSelector } from 'react-redux';

import { calendarEventsAPI, projectGoalsAPI, startupsAPI, tasksAPI } from '@/utils/APIs/startupsAPI';
import { toast } from 'react-toastify';
import SendJoinRequestModal from './modals/SendJoinRequestModal';
import ManageJoinRequestsModal from './modals/ManageJoinRequestsModal';
import AcceptInvitationModal from './modals/AcceptInvitationModal';
import ProjectGoalsSection from './sections/ProjectGoalsSection';
import CalendarSection from './sections/CalendarSection';
import AddMemberModal from './modals/AddMember';
import DocumentsSection from './sections/DocumentsSection';
import TeamSection from './sections/TeamSection';
import DescriptionSection from './sections/DescriptionSection';
import TechStackSection from './sections/TechStackSection';
import HeroSection from './sections/HeroSection';
import StartupDetailSkeleton from './StartupDetailsSkeleton';
import ProjectTasksSection from './sections/ProjectTasksSection';
import AddTaskModal from './modals/AddTasksModal';
import StartupAnnouncementsSection from './sections/StartupAnnouncementsSection';
import { plotCount } from '@/utils/plotCount';
import DeleteConfirmationModal from '@/utils/confirm';

/**
 * ManageJoinRequestsModal - For FOUNDERS/CREATORS to manage join requests
 * 
 * This modal displays pending join requests from users who want to join the startup.
 * The founder/creator can accept or reject each request.
 */


const StartupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);

  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSendJoinRequestModalOpen, setIsSendJoinRequestModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteStartupModalOpen, setIsDeleteStartupModalOpen] = useState(false);
  const [isDemoteModalOpen, setIsDemoteModalOpen] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [alertDescription, setAlertDescription] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  
  const [showAlert, setShowAlert] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectGoals, setProjectGoals] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const {user,access_token,refreshToken} = useSelector((state) => state.auth);

  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    message: '',
    portfolio: '',
    linkedin: '',
    github: ''
  });

  
const [pendingInvitation, setPendingInvitation] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const joinRequestCountRef = useRef(0);

   // Fetch startup data
  const fetchStartupData = async () => {
    try {
      setLoading(true);

  
      const args = {
        startup_id: id,
        per_page: 100,
        page: 1,
        user_id: user?.id,
        include_milestones: true
      }
      const [startupResult, membersResult, documentsResult, statsResult, goalsResult, eventsResult, bookmarkResult, tasksResult] = await Promise.all([
        startupsAPI.getById(id, user?.id).catch(err => { console.error('❌ getById failed:', err?.response?.status, err?.message); return { success: false, error: err }; }),
        startupsAPI.getMembers(id).catch(err => { console.error('❌ getMembers failed:', err?.message); return { success: false, error: err }; }),
        startupsAPI.getDocuments(id).catch(err => { console.error('❌ getDocuments failed:', err?.message); return { success: false, error: err }; }),
        startupsAPI.getStats(id).catch(err => { console.error('❌ getStats failed:', err?.message); return { success: false, error: err }; }),
        projectGoalsAPI.getAll(args).catch(err => { console.error('❌ getGoals failed:', err?.message); return { success: false, error: err }; }),
        calendarEventsAPI.getAll(args).catch(err => { console.error('❌ getEvents failed:', err?.message); return { success: false, error: err }; }),
        startupsAPI.getBookmarkStatus({ startupId: id, userId: user?.id }).catch(err => ({ success: false, error: err })),
        tasksAPI.getAll(args).catch(err => { console.error('❌ getTasks failed:', err?.message); return { success: false, error: err }; }),
      ]);

      console.log('📦 Raw API results:', { startupResult, membersResult, statsResult });

      // startupResult is the full axios response shape: { success, data: { startup }, message }
      // Only show "not found" if we got a real 404 — not a network/auth error
      if (startupResult.success) {
        setStartup(startupResult.data?.startup || null);
      } else {
        // error.response?.status covers axios errors
        // error?.status covers some transformed errors  
        // If neither exists, it's a network/interceptor issue — don't show "not found"
        const errStatus = startupResult.error?.response?.status || startupResult.error?.status;
        if (errStatus === 404) {
          console.error('❌ Startup not found (404)');
          setStartup(null);
        } else if (errStatus) {
          console.error('❌ Could not load startup. Status:', errStatus);
          setStartup(null);
        } else {
          // No status = network error or interceptor transformed the error
          // Try again after a short delay rather than showing "not found"
          console.error('❌ Could not load startup (no status — likely network/interceptor issue):', startupResult.error);
          setStartup(null);
        }
      }

      if (membersResult.success) setMembers(membersResult.data?.members || []);
      if (documentsResult.success) setDocuments(documentsResult.data?.documents || []);
      if (statsResult.success) setStats(statsResult.data?.stats || {});
      if (goalsResult.success) setProjectGoals(goalsResult.data?.project_goals || []);
      if (eventsResult.success) setCalendarEvents(eventsResult.data?.events || []);
      if (tasksResult.success) setProjectTasks(tasksResult.data?.tasks || []);
      if (bookmarkResult.success) setIsFavorited(bookmarkResult.data?.bookmarked || false);
    } catch (error) {
      console.error('❌ Unexpected error in fetchStartupData:', error);
    } finally {
      setLoading(false);
    }
  };

const fetchUserInvitation = useCallback(async () => {
  // Skip if user is already an admin/member — they don't need to see an invitation banner
  if (!user || !id || isAdmin) return;

  try {
    // Use the dedicated /mine endpoint which doesn't require manager role
    const response = await startupsAPI.getMyInvitation(id);
    const invitation = response?.data?.invitation || null;
    setPendingInvitation(invitation);
  } catch (error) {
    // Silently ignore — 404 means route not yet registered on this backend,
    // plain object rejections mean interceptor transformed the error
    setPendingInvitation(null);
  }
}, [user, id, isAdmin]);
const fetchJoinRequests = useCallback(async () => {

    
    if (!isAdmin || !access_token || !id) {

      setJoinRequests([]);
      return;
    }
    try {
      let response = await startupsAPI.getJoinRequests(id, { status: 'pending', per_page: 20 });
      response = response.data
      // Handle multiple possible response structures from backend
      // The API returns response.data.data which should be { join_requests: [...], ... }
      let pending = [];
      if (Array.isArray(response)) {
        pending = response; // Direct array
      } else if (response?.join_requests && Array.isArray(response.join_requests)) {
        pending = response.join_requests; // Wrapped in join_requests key
      } else if (response?.requests && Array.isArray(response.requests)) {
        pending = response.requests; // Wrapped in requests key
      } else {
        console.warn('⚠️ Could not find requests in response. Full response:', JSON.stringify(response, null, 2));
      }
      setJoinRequests(pending);
    } catch (error) {
      console.error('❌ Failed to load join requests:', error);
      setJoinRequests([]);
    }
  }, [isAdmin, access_token, id]);

  useEffect(() => {
    if (id) {
      fetchStartupData();

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); 

  useEffect(() => {
  fetchUserInvitation();
}, [fetchUserInvitation]);



  const getStageBadgeVariant = (stage) => {
    const variants = {
      idea: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      seed: 'bg-green-500/20 text-green-400 border-green-400/30',
      early: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      growth: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
      scale: 'bg-purple-500/20 text-purple-400 border-purple-400/30'
    };
    return variants[stage] || 'bg-gray-500/20 text-gray-400 border-gray-400/30';
  };

  const handleAcceptJoinRequest = async (request) => {
    const requestId = request?.id || request?.request_id;
    if (!requestId) return;
    try {

      await startupsAPI.acceptJoinRequest(id, requestId);
      toast.success(`${request?.full_name || `${request?.first_name ?? ''} ${request?.last_name ?? ''}`.trim() || 'Member'} has been added.`);
      // Remove from list immediately for better UX
      setJoinRequests(prev => prev.filter(r => (r.id || r.request_id) !== requestId));
      // Refresh data to ensure consistency
      fetchJoinRequests();
      fetchStartupData();
    } catch (error) {
      console.error('❌ Accept join request failed', error);
      toast.error('Unable to accept the request right now.');
    }
  };

  const handleRejectJoinRequest = async (request) => {
    const requestId = request?.id || request?.request_id;
    if (!requestId) return;
    try {
      await startupsAPI.rejectJoinRequest(id, requestId);
      toast.info(`Join request from ${request?.fullName || `${request?.firstName} ${request?.lastName}`} has been rejected.`);
      // Remove from list immediately for better UX
      setJoinRequests(prev => prev.filter(r => (r.id || r.request_id) !== requestId));
      // Refresh data to ensure consistency
      fetchJoinRequests();
    } catch (error) {
      console.error('❌ Reject join request failed', error);
      toast.error('Unable to reject the request right now.');
    }
  };
  const handleBookmarkClick = async () => {
    try {
        // Remove bookmark
        const response = await startupsAPI.toggleBookmarkStartup({ startupId: id, userId: user?.id });
        if (response.success) {
          setIsFavorited(response.data.bookmarked);
          toast.info(`Startup ${response.data.bookmarked ? 'added to' : 'removed from'} favorites`);
        } else {
          throw new Error('Failed to remove bookmark');
        }
    } catch {
        toast.error('Error updating favorite status');
    }
  };
 const handleAcceptInvitation = async () => {
  if (!pendingInvitation) return;

  try {
    await startupsAPI.acceptInvitation(id, pendingInvitation.id);
    toast.success("You are now a member!");

    setPendingInvitation(null);
    fetchStartupData();

  } catch (error) {
    toast.error("Failed to accept invitation");
  }
};

const handleDeclineInvitation = async () => {
  if (!pendingInvitation) return;

  try {
    await startupsAPI.declineInvitation(id, pendingInvitation.id);
    toast.info("Invitation declined");

    setPendingInvitation(null);

  } catch (error) {
    toast.error("Failed to decline invitation");
  }
};

  useEffect(() => {
    if (user && startup) {
      // Try to get userId from different possible fields
      const userId = user?.id || user?.userId || user?.user_id;
      
      // Check 1: Is user the startup creator?
      // FIX: use == not === to handle string/int type mismatch from API
      const isStartupCreator = String(startup?.creator?.id) === String(userId);
      console.log("Checking members for userId:", userId, "Members list:", members);
      // Check 2: Is user a member with creator/founder role?
      const isMemberWithRole = members.find(m => String(m.userId) === String(userId) && (['creator', 'founder', 'owner'].includes(m.role) || m.admin));
    
      // User is creator if they are the startup creator OR have member founder role
      const isAdminUser = isStartupCreator || !!isMemberWithRole;
      setIsAdmin(isAdminUser);
      setIsFounder(isStartupCreator || (isMemberWithRole && ['creator', 'founder', 'owner'].includes(isMemberWithRole.role)));
    }
  }, [members, user, startup]);

  useEffect(() => {
    if (isAdmin) {
      fetchJoinRequests();
    } else {
      setJoinRequests([]);
    }
  }, [isAdmin, fetchJoinRequests]);

  // Also fetch when modal opens
  useEffect(() => {
    if (isJoinModalOpen && isAdmin && access_token) {
      fetchJoinRequests();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJoinModalOpen, access_token, isAdmin]);

  useEffect(() => {
    if (joinRequests.length > 0 && joinRequests.length > joinRequestCountRef.current) {
      setAlertTitle('Pending Join Requests');
      setAlertDescription(`You have ${joinRequests.length} pending team request${joinRequests.length > 1 ? 's' : ''}.`);
      setAlertVariant('warning');
      setShowAlert(true);
    }
    joinRequestCountRef.current = joinRequests.length;
  }, [joinRequests.length]);
  // Delete startup
  const handleDeleteStartup = async () => {
    try {
      const response = await startupsAPI.delete(id, access_token);

      
      if (response.success) {
        navigate('/discover-startups');
      } 
    } catch (error) {
      toast.error('Error deleting startup');
      console.error('Error deleting startup:', error);
    }
  };

  // Convert solo startup → Vision
  const handleDemoteToVision = async () => {
    setDemoting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/activation/startups/${id}/demote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success('Startup converted to Vision');
        setIsDemoteModalOpen(false);
        if (data.idea?.id) {
          navigate(`/ideation/details?id=${data.idea.id}`);
        } else {
          navigate('/ideation');
        }
      } else {
        toast.error(data.error || 'Conversion failed');
      }
    } catch (e) {
      toast.error('Failed to convert startup to Vision');
    } finally {
      setDemoting(false);
    }
  };
  const handleCreateTask = async (taskData) => {
    try {
      const response = await tasksAPI.create({
        ...taskData,
        startup_id: id,
        user_id: user?.id || user?.userId || user?.user_id,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create task');
      }
      toast.success('Task created successfully');
      setIsAddTaskModalOpen(false);
      setProjectTasks([...projectTasks, response.data?.task || response.task]);
    } catch (error) {
      toast.error('Error creating task');
      console.error('Error creating task:', error);
    }
  }
  if (loading) {
    return <StartupDetailSkeleton />;
  }

  if (!startup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 bg-gray-800 border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Startup Not Found</h2>
          <p className="text-gray-400 mb-4">
            This startup doesn't exist, or there was a problem loading it.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={fetchStartupData}>Try Again</Button>
            <Button onClick={() => navigate('/discover-startups')}>Back to Discover</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-50  w-full"
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center justify-evenly gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/discover-startups')}
                className="text-gray-300 hover:text-white cursor-pointer bg-transparent hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discover
              </Button>
              
              <div className="hidden sm:flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <Home className="w-4 h-4" />
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-medium">{startup.name}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap h-auto items-center gap-2">
              {isAdmin && (
                <>
                  {
                    isFounder && <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/register-startup?id=${startup?.id}`)}
                      className="relative text-gray-300"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Edit Startup
                    
                    </Button>
                  }

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsJoinModalOpen(true)}
                    className="relative text-gray-300"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Join Requests
                    {joinRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold text-white bg-red-500 rounded-full">
                        {plotCount(joinRequests.length)}
                      </span>
                    )}
                  </Button>
                  {
                    isFounder && (
                  
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteStartupModalOpen(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>)
                  }
                  {/* Convert to Vision — only for solo founders */}
                  {isFounder && members.length <= 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDemoteModalOpen(true)}
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20"
                    >
                      ⟳ Convert to Vision
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookmarkClick()}
                className="text-gray-300 hover:text-yellow-500"
              >
                <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </Button>

            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection
        startup={startup}
        onJoinClick={() => isAdmin ? setIsJoinModalOpen(true) : setIsSendJoinRequestModalOpen(true)}
        members={members}
        isAdmin={isAdmin}
        getStageBadgeVariant={getStageBadgeVariant}
        setAlertDescription={setAlertDescription}
        setShowAlert={setShowAlert}
        setAlertTitle={setAlertTitle}
        setAlertVariant={setAlertVariant}
      />

      {/* Main Content with Tabs */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-6 bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm">
            <TabsTrigger value="overview" className="rounded-lg text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              <ShinyText
                text="Overview"
                disabled={false}
                speed={3}
              //   className='custom-title' 
              />
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-lg text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              <ShinyText
                text="Members"
                disabled={false}
                speed={3}
              //   className='custom-title' 
              />
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              <ShinyText
                text="Documents"
                disabled={false}
                speed={3}
              //   className='custom-title' 
              />
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ClipboardList className="w-4 h-4 mr-2" />
              <ShinyText
                text="Project Tasks"
                disabled={false}
                speed={3}
              //   className='custom-title' 
              />
             
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-lg text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              <ShinyText
                text="Project Goals"
                disabled={false}
                speed={3}
              //   className='custom-title' 
              />
             
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <ShinyText
                text="Calendar"
                disabled={false}
                speed={3}
              //   className='custom-title' 
              />
              
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <StartupAnnouncementsSection startup={startup} />
            <GamifiedStatsOverview startup={startup} stats={stats} goals={projectGoals} />
            <DescriptionSection startup={startup} />
            
            <TechStackSection startup={startup} />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <TeamSection
              members={members}
              setMembers={setMembers}
              startupId={id}
              isFounder={isFounder}
              isAdmin={isAdmin}
              callback={fetchStartupData}
              roles={startup.roles}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentsSection
              documents={documents}
              isAdmin={isAdmin}
              id={id}
              fetchStartupData={fetchStartupData}
            />
          </TabsContent>
          <TabsContent value="tasks">
            <ProjectTasksSection
              tasks={projectTasks}
              isAdmin={isAdmin}
              setTasks={setProjectTasks}
              startupId={id}
              teamMembers={members}
            />
          </TabsContent>
          {/* Project Goals Tab */}
          <TabsContent value="goals">
            <ProjectGoalsSection
              goals={projectGoals}
              isAdmin={isAdmin}
              setGoals={setProjectGoals}
              startupId={id}
              teamMembers={members}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CalendarSection
              calendarEvents={calendarEvents}
              setCalendarEvents={setCalendarEvents}
              isAdmin={isAdmin}

            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {!isAdmin && (
        <SendJoinRequestModal
          isOpen={isSendJoinRequestModalOpen}
          onClose={() => setIsSendJoinRequestModalOpen(false)}
          startupId={id}
          startupRoles={startup?.roles || []}
          startupName={startup?.name || ''}
          onSuccess={() => {
            setIsSendJoinRequestModalOpen(false);
            toast.success('Join request sent successfully!');
          }}
        />
      )}
      {pendingInvitation && !isAdmin && (
  <AcceptInvitationModal
    isOpen={true}
    onClose={() => setPendingInvitation(null)}
    startupName={startup?.name}
    onAccept={handleAcceptInvitation}
    onDecline={handleDeclineInvitation}
  />
)}
      {isAdmin &&
        <>
          <DeleteConfirmationModal
            isOpen={isDeleteStartupModalOpen}
            onClose={() => setIsDeleteStartupModalOpen(false)}
            onConfirm={() => {
              handleDeleteStartup();
              setIsDeleteStartupModalOpen(false);
              navigate('/discover-startups');
              toast.success('Startup deleted successfully');
            }}
            title="Delete Startup"
            message="Are you sure you want to delete this startup? This action cannot be undone."
            type="hard"
          />

          {/* Convert to Vision confirmation modal */}
          <DeleteConfirmationModal
            isOpen={isDemoteModalOpen}
            onClose={() => setIsDemoteModalOpen(false)}
            onConfirm={handleDemoteToVision}
            title="Convert to Vision"
            message={`"${startup?.name}" will be converted to a Vision so you can attract collaborators before re-activating as a startup. The startup will be archived.`}
            type="soft"
          />
          <ManageJoinRequestsModal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            startupName={startup?.name || 'Your Startup'}
            founderName={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'You'}
            joinRequests={joinRequests}
            loading={loading}
            onAccept={handleAcceptJoinRequest}
            onReject={handleRejectJoinRequest}
          />
          
          <AddTaskModal
            isOpen={isAddTaskModalOpen}
            onClose={() => setIsAddTaskModalOpen(false)}
            onCreate={handleCreateTask}
            teamMembers={members}
          />
        </>
      }

      {showAlert && (
        <div className="w-full max-w-lg fixed top-46 right-6">
          <Alert className={'relative '}>
                    
            <CheckCircle2Icon />
            <AlertTitle>{alertTitle}</AlertTitle>
            <AlertDescription>
              {alertDescription}
            </AlertDescription>
            <button className='cursor-pointer absolute right-2 top-1 pointer-events-auto' onClick={() => setShowAlert(false)}>
              <XIcon className='size-5' />
              <span className='sr-only'>Close</span>
            </button>
          </Alert>
        </div>
      )
      }

    </div>
  );
};




  
// Gamified Stats Overview
const GamifiedStatsOverview = ({ goals, startup, stats }) => {
  const milestoneProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    let progress = 0;
    const totalMilestonesCompleted = goals.reduce((count, goal) => {
      return count + goal.milestones_completed
    }, 0);
    const totalMilestones = goals.reduce((count, goal) => {
      return count + goal.milestones_total
    }, 0);
    progress = totalMilestones === 0 ? 0 : Math.floor((totalMilestonesCompleted / totalMilestones) * 100);
    return progress
  }, [goals]);
  const gamifiedStats = [
    {
      label: "Team Level",
      value: Math.floor((stats?.member_count || 1) / 2) + 1,
      icon: Users,
      progress: ((stats?.member_count || 1) % 2) * 50,
      color: "from-blue-500 to-cyan-500",
      description: "Growth Stage"
    },
    {
      label: "Engagement XP",
      value: (stats?.views || 0) * 10,
      icon: TrendingUp,
      progress: Math.min(((stats?.views || 0) * 10) % 1000, 100),
      color: "from-green-500 to-emerald-500",
      description: "Active Community"
    },
    {
      label: "Progress Score",
      value: milestoneProgress,
      icon: Target,
      progress: milestoneProgress,
      color: "from-purple-500 to-violet-500",
      description: "Milestone Tracker"
    },
    {
      label: "Achievements",
      value: Math.floor((stats?.member_count || 0) / 3) + (startup.funding_amount > 0 ? 1 : 0),
      icon: Trophy,
      progress: 100,
      color: "from-orange-500 to-red-500",
      description: "Badges Unlocked"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {gamifiedStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-black/20 text-gray-300 border-gray-600">
                  Lvl {stat.value}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
                <Progress value={stat.progress} className="h-2 bg-gray-700" />
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};





// Add the Trophy icon component
const Trophy = (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
export default StartupDetailPage;