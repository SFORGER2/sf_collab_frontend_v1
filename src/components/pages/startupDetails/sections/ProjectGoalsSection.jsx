
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Eye, EyeClosed, Grid3x3, List, PlayCircle, Plus, Settings, SquarePlus, Target, Trash2 } from "lucide-react";
import { Progress } from '../../../ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '../../../ui/badge';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CreateGoalDialog from "../modals/CreateGoalDialog";
import { projectGoalsAPI } from "@/utils/APIs/startupsAPI";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "@/utils/confirm";

// Project Goals Section
export default function ProjectGoalsSection({ goals, isAdmin, startupId, setGoals, teamMembers = [] }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [view, setView] = useState(localStorage.getItem("projectGoalsView") || "list"); // New state for view
  useEffect(() => {
    localStorage.setItem("projectGoalsView", view);
  }, [view]);
  const { access_token } = useSelector((state) => state.auth);

    async function handleMilestoneCompletion(milestoneId, e) {
    try {
      const checked = e.target.checked;
      let response
      const goal = goals.find(goal =>
        goal.milestones.find(milestone => milestone.id === milestoneId)
      );
      goal.milestones = goal.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return { ...milestone, is_completed: checked };
        }
        return milestone;
      })
      goal.milestones_completed = goal.milestones.filter(m => m.is_completed).length;
      const total = goal.milestones.length;
      goal.progress_percentage = Math.round((goal.milestones_completed / total) * 100);
      goal.status = goal.progress_percentage === 100 ? 'completed' : (goal.is_on_track ? 'on_track' : 'needs_attention');
      goal.is_completed = goal.progress_percentage === 100;
      setGoals(prevGoals => prevGoals.map(g => g.id === goal.id ? goal : g));
      if (checked) {
        response = await projectGoalsAPI.completeMilestone(milestoneId, access_token);
      } else {
        response = await projectGoalsAPI.uncompleteMilestone(milestoneId, access_token);
      }
      if (!response.success) {
        throw new Error('Failed to update milestone status');
      }
      toast.success('Milestone status updated successfully');
    } catch {
      toast.error('Error updating milestone status');

      }
  };
  async function handleDeleteGoal(goalId) {
    try {
      console.log(selectedGoal);
      const response = await projectGoalsAPI.delete(goalId);
      if (response.success) {
        console.log(response);
        setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
        toast.success('Project goal deleted successfully');
      } else {
        toast.error('Failed to delete project goal');
      }
    } catch (err) {
      toast.error('Error deleting project goal');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <motion.h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Project Goals
        </motion.h2>
      <div className="flex gap-2">
        <Button onClick={() => setView("grid")} variant={view === "grid" ? "default" : "ghost"}>
        <Grid3x3 className="w-4 h-4"/>
        </Button>
        <Button onClick={() => setView("list")} variant={view === "list" ? "default" : "ghost"}>
        <List className="w-4 h-4"/>
        </Button>
        {isAdmin && (
        <Button onClick={() => setOpenCreate(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all">
          <SquarePlus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
        )}
      </div>
      </div>
      <div className={`grid ${view === "grid" ? "grid-cols-2 gap-6" : "gap-6"}`}>
      {goals.slice().reverse().map((goal, index) => (
        <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 20 }} 
        transition={{ duration: 0.3 }}
        >
        <Card className={`bg-gray-800 border-gray-700 ${goal.status === 'completed' ? 'border-green-500' : goal.is_on_track ? 'border-blue-500' : 'border-yellow-500'}`}>
          <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            {goal.title}
            </CardTitle>
            <div>
            <Badge className={
              goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              goal.is_on_track ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
            }>
              {goal.status === 'completed' ? 'Completed' : goal.is_on_track ? 'On Track' : 'Needs Attention'}
            </Badge>
            <Badge className="ml-2 bg-white/10 text-white text-sm">
              {
              goal.visible_by === 'public' ? (
                <Eye className="w-4 h-4 mr-1 inline-block text-green-400" />
              ) : (
                <EyeClosed className="w-4 h-4 mr-1 inline-block text-red-400" />
              )
              }
              {goal.visible_by.charAt(0).toUpperCase() + goal.visible_by.slice(1)}
            </Badge>
            </div>
          </div>
          <CardDescription className="text-gray-400">
            {goal.description}
          </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">{goal.progress_percentage}%</span>
            </div>
            <Progress value={goal.progress_percentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
            <span className="text-gray-400">Milestones: </span>
            <span className="text-white">{goal.milestones_completed}/{goal.milestones_total}</span>
            </div>
            <div>
            <span className="text-gray-400">Next: </span>
            <span className="text-white">{goal.next_milestone}</span>
            </div>
          </div>

          {/* Milestones Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="milestones">
            <AccordionTrigger className="text-gray-400 hover:text-white">
              View Milestones ({goal.milestones.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
              {goal.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/50">
                {milestone.is_completed ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
                <span className={`flex-1 ${milestone.is_completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {milestone.title}
                </span>
                <input
                  type="checkbox"
                  checked={milestone.is_completed}
                  onClick={(e) => handleMilestoneCompletion(milestone.id, e)}
                  readOnly
                  className="w-4 h-4 accent-green-500"
                />
                <Badge variant="outline" className="text-xs text-white">
                  #{milestone.order}
                </Badge>
                </div>
              ))}
              </div>
            </AccordionContent>
            </AccordionItem>
          </Accordion>
          </CardContent>
          <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-400">
            Due: {new Date(goal.target_date).toLocaleDateString()}
          </div>
          {isAdmin && (
            <motion.div className="flex gap-2" whileHover={{ scale: 1.02 }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
              setEditMode(true);
              setSelectedGoal(goal);
              setOpenCreate(true);
              }}
              className="border-gray-600 bg-gray-700 text-white hover:border-blue-500 hover:text-blue-400 transition-all"
            >
              <Settings className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(goal?.id)}
              className="border-red-600/50 bg-red-600 text-white hover:bg-white hover:text-red-500 hover:border-red-500 transition-all"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
            </motion.div>
          )}
          </CardFooter>
        </Card>
        </motion.div>
      ))}
      </div>
      <CreateGoalDialog
      open={openCreate}
      onClose={() => setOpenCreate(false)}
      editMode={editMode}
      goal={editMode ? selectedGoal : null}
      startupId={startupId}
      setGoals={setGoals}
      teamMembers={teamMembers}
      />
      <DeleteConfirmationModal
        isOpen={!!isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(null)}
        onConfirm={() => {
          handleDeleteGoal(isConfirmDeleteOpen);
          setIsConfirmDeleteOpen(null);
        }}
        title="Confirm Goal Deletion"
        message="Are you sure you want to delete this goal?"
        type="soft"
      />
    </div>
    );
};