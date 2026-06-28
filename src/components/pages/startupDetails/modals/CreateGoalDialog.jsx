import { useEffect, useState } from "react";
import { useDraft, useModalDraftGuard } from "@/utils/hooks/useDraft";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { projectGoalsAPI } from "@/utils/APIs/startupsAPI";
import { useSelector } from "react-redux";
import { Check } from "lucide-react";
import { toast } from "react-toastify";
import { getProfilePicture } from "@/utils/getProfilePicture";
const emptyGoalForm = {
  title: "",
  description: "",
  start_date: "",
  target_date: "",
  next_milestone: "",
  members_involved: [],
  visible_by: "team",
}
export default function CreateGoalDialog({
  open,
  onClose,
  startupId,
  setGoals,
  teamMembers = [],
  editMode = false,
  goal = null,
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // B5 FIX: auto-save goal form draft (skip in edit mode)
  const [form, setForm, clearGoalDraft, hasGoalDraft] = useDraft(
    editMode ? `edit_goal_${goal?.id}` : "create_goal",
    editMode && goal ? goal : emptyGoalForm
  );

  const [milestones, setMilestones] = useState(["", "", ""]);

  useEffect(() => {
    if (!open) {
      setForm(emptyGoalForm);
      setMilestones(["", "", ""]);
    }
  }, [open]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMember(memberId) {
    setForm((prev) => {
      const exists = prev.members_involved.includes(memberId);
      return {
        ...prev,
        members_involved: exists
          ? prev.members_involved.filter((id) => id !== memberId)
          : [...prev.members_involved, memberId],
      };
    });
  }

  function updateMilestone(index, value) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? value : m))
    );
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, ""]);
  }

  async function handleCreate() {
    try {
      setLoading(true);
      for (const milestone of milestones) {
        if (!milestone.trim()) {
          toast.error("Please fill in all milestone fields or remove empty ones.");
          setLoading(false);
          return;
        }
      }

      if (form.title.trim().length === 0) {
        toast.error("Title is required.");
        setLoading(false);
        return;
      }
      if (form.start_date && form.target_date) {
        const start = new Date(form.start_date);
        const target = new Date(form.target_date);
        if (start > target) {
          toast.error("Start date cannot be after target date.");
          setLoading(false);
          return;
        }
      }
      if (!form.target_date) {
        toast.error("Please set a target date for the goal.");
        setLoading(false);
        return;
      }
      let response
      if (editMode && goal) {
        response = await projectGoalsAPI.update(goal.id, {
          startup_id: startupId,
          title: form.title,
          description: form.description,
          start_date: form.start_date || null,
          target_date: form.target_date || null,
          next_milestone: milestones[0] || form.next_milestone,
          status: "active",
          team_size: form.members_involved.length,
          milestones: milestones,
          members_involved: form.members_involved,
          milestones_total: milestones.length,
          milestones_completed: 0,
          progress_percentage: 0,
          is_on_track: true,
          visible_by: form.visible_by,
        })
      } else {
        response = await projectGoalsAPI.create({
          startup_id: startupId,
          title: form.title,
          description: form.description,
          start_date: form.start_date || null,
          target_date: form.target_date || null,
          completed_date: null,
          next_milestone: milestones[0] || form.next_milestone,
          status: "active",
          team_size: form.members_involved.length,
          milestones: milestones,
          members_involved: form.members_involved,
          milestones_total: milestones.length,
          milestones_completed: 0,
          progress_percentage: 0,
          is_on_track: true,
          visible_by: form.visible_by,
        });
      }

      if (!response?.success) {
        throw new Error(editMode ? "Failed to update goal" : "Failed to create goal");
      }

      setGoals((prev) => [...prev, response.data.project_goal]);
      onClose();
    } catch (err) {
      toast.error(err?.error ? err.error : editMode ? "Failed to update goal" : "Failed to create goal");
      console.error(editMode ? "Failed to update goal" : "Failed to create goal", err);
    } finally {
      setLoading(false);
    }
  }
  function isoToDateInput(value) {
    if (!value) return "";
    return value.split("T")[0];
  }

  useEffect(() => {
    if (editMode && goal) {
      setForm({
        title: goal.title || "",
        description: goal.description || "",
        start_date: isoToDateInput(goal.start_date) || "",
        target_date: isoToDateInput(goal.target_date) || "",
        next_milestone: goal.next_milestone || "",
        members_involved: goal.members_involved || [],
        visible_by: goal.visible_by || "team",
      });
      const goalMilestones = goal.milestones ? goal.milestones.map((m) => m.title) : [];
      setMilestones(goalMilestones.length > 0 ? goalMilestones : ["", "", ""]);
    }
  }, [editMode, goal]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Goal" : "Create New Goal"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Launch MVP"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="What does success look like?"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
              />
            </div>

            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                value={form.target_date}
                onChange={(e) => updateField("target_date", e.target.value)}
              />
            </div>
          </div>

          {/* Milestones */}
          <div>
            <Label>Milestones</Label>
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto rounded border border-gray-700 bg-gray-800 p-2">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-2"> 
                <Input
                  key={i}
                  value={milestone}
                  onChange={(e) => updateMilestone(i, e.target.value)}
                  placeholder={`Milestone ${i + 1}`}
                  className="text-sm"
                  />
                  <div

                    className={`arrow-up border-gray-400 cursor-pointer ${i === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => {
                    if (i === 0) return;
                    setMilestones((prev) => {
                      const newMilestones = [...prev];
                      [newMilestones[i - 1], newMilestones[i]] = [newMilestones[i], newMilestones[i - 1]];
                      return newMilestones;
                    });
                  }}>▲</div>
                  <div className={`arrow-down border-gray-400 cursor-pointer ${i === milestones.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => {
                    if (i === milestones.length - 1) return;
                    setMilestones((prev) => {
                      const newMilestones = [...prev];
                      [newMilestones[i + 1], newMilestones[i]] = [newMilestones[i], newMilestones[i + 1]];
                      return newMilestones;
                    });
                  }}>▼

                  </div>
                  <div className="remove border-gray-400 cursor-pointer" onClick={() => {
                    setMilestones((prev) => prev.filter((_, index) => index !== i));
                  }}>✕</div>
                  </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-black"
              onClick={addMilestone}
            >
              + Add Milestone
            </Button>
          </div>

          {/* Team Members */}
          <div>
            <Label>
              Team Members{" "}
              <span className="text-xs text-gray-400">
                ({form.members_involved.length} selected)
              </span>
            </Label>

            <div className="mt-2 max-h-45 overflow-y-auto rounded border border-gray-700 bg-gray-800">
              {teamMembers.length === 0 && (
                <div className="p-3 text-sm text-gray-400">
                  No team members available
                </div>
              )}

              {teamMembers.map((member, index) => {
                const selected = form.members_involved.includes(member.id);

                return (
                  <div
                    key={index}
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm
                      ${selected ? "bg-blue-600/20" : "hover:bg-gray-700"}
                    `}
                  >
                    <div className="flex items-center">
                      <div className="inline-block">
                        <img
                          src={getProfilePicture(member)}
                          alt={member.fullName}
                          className="w-6 h-6 rounded-full mr-2 inline-block"
                        />
                      </div>
                      <div>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-xs text-gray-400">
                        {member.role}
                        </div>
                        </div>
                      </div>
                    {selected && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Visibility */}
          <div>
            <Label>Visibility</Label>
            <select
              value={form.visible_by}
              onChange={(e) => updateField("visible_by", e.target.value)}
              className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="team">Visible to Team</option>
              <option value="public">Public</option>
              <option value="private">Just Me</option>
            </select>
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || !form.title}
            >
              {loading ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Goal" : "Create Goal")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}