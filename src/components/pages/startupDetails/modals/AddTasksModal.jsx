import { useState, useEffect } from "react";
import { useDraft } from "@/utils/hooks/useDraft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { tasksAPI } from "@/utils/APIs/startupsAPI";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { startupAPI } from "../startUpAPI";
import { useSelector } from "react-redux";

const emptyTaskForm = {
  title:           "",
  description:     "",
  priority:        "medium",
  status:          "in_progress",
  due_date:        "",
  estimated_hours: "",
  assigned_to:     "",
  visible_by:      "team",
  tags:            [],
  labels:          [],
  urgent:          false,
};

export default function AddTaskModal({
  isOpen,
  onClose,
  teamMembers,
  startupId,
  editMode = false,
  task     = null,
  setTasks,
}) {
  const [team,       setTeam]       = useState(teamMembers || []);
  const [loading,    setLoading]    = useState(false);
  const [tagInput,   setTagInput]   = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [labelColor, setLabelColor] = useState("#3B82F6");
  const { user } = useSelector((state) => state.auth || {});

  // B5 FIX: useDraft replaces raw localStorage — auto-saves on every keystroke,
  // restores on reopen, clears on successful submit.
  // Edit mode uses a task-specific key so it never collides with create drafts.
  const draftKey = editMode ? `edit_task_${task?.id}` : "create_task";
  const draftInitial = editMode && task ? task : emptyTaskForm;
  const [form, setForm, clearTaskDraft] = useDraft(draftKey, draftInitial);

  // When switching to edit mode, seed the form with the task being edited
  useEffect(() => {
    if (editMode && task) {
      setForm({
        title:           task.title           || "",
        description:     task.description     || "",
        priority:        task.priority        || "medium",
        status:          task.status          || "in_progress",
        due_date:        (task.deadline || task.due_date) ? (task.deadline || task.due_date).split("T")[0] : "",
        estimated_hours: task.estimated_hours || "",
        assigned_to:     task.assigned_to     || null,
        visible_by:      task.visible_by      || "team",
        tags:            task.tags            || [],
        labels:          task.labels          || [],
        urgent:          task.urgent          || false,
      });
    }
  }, [editMode, task?.id]);

  // Fetch team members for the assign-to dropdown
  useEffect(() => {
    if (!startupId) return;
    startupAPI.getMembers({ page: 1, per_page: 100, startup_id: startupId, user_id: user?.id || null })
      .then(res => { if (res.success) setTeam(res.data.members || []); })
      .catch(err => console.error("Error fetching team members:", err));
  }, [startupId]);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  function removeTag(index) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  }

  function addLabel() {
    if (labelInput.trim()) {
      setForm(prev => ({ ...prev, labels: [...prev.labels, { name: labelInput.trim(), color: labelColor }] }));
      setLabelInput("");
      setLabelColor("#3B82F6");
    }
  }

  function removeLabel(index) {
    setForm(prev => ({ ...prev, labels: prev.labels.filter((_, i) => i !== index) }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      const payload = {
        title:           form.title,
        description:     form.description,
        priority:        form.priority,
        status:          form.status,
        due_date:        form.due_date        || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        assigned_to:     form.assigned_to,
        visible_by:      form.visible_by,
        tags:            form.tags,
        labels:          form.labels,
        urgent:          form.urgent,
        startup_id:      startupId,
      };

      let response;
      if (editMode && task) {
        response = await tasksAPI.update(task.id, payload);
        toast.success("✅ Task updated successfully!");
      } else {
        response = await tasksAPI.create(payload);
        toast.success("✅ Task created successfully!");
      }

      setTasks(prev => {
        if (editMode) return prev.map(t => t.id === task.id ? { ...t, ...payload } : t);
        return [...prev, response.data.task];
      });

      // Clear draft on success
      clearTaskDraft();
      onClose();
    } catch (err) {
      toast.error(err?.error || "An error occurred while saving the task");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editMode ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div>
            <Label className="text-sm font-semibold mb-2">Title *</Label>
            <Input
              value={form.title}
              onChange={e => updateField("title", e.target.value)}
              placeholder="Enter task title"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-semibold mb-2">Description</Label>
            <Textarea
              value={form.description}
              onChange={e => updateField("description", e.target.value)}
              placeholder="Describe the task..."
              className="bg-gray-800 border-gray-700 text-white min-h-25"
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2">Priority</Label>
              <Select value={form.priority} onValueChange={v => updateField("priority", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2">Status</Label>
              <Select value={form.status} onValueChange={v => updateField("status", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date + Est. Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2">Due Date</Label>
              <Input type="date" value={form.due_date}
                onChange={e => updateField("due_date", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white" />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2">Est. Hours</Label>
              <Input type="number" placeholder="0.0" step="0.5" value={form.estimated_hours}
                onChange={e => updateField("estimated_hours", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white" />
            </div>
          </div>

          {/* Urgent + Assign To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2">Urgent</Label>
              <Select value={form.urgent ? "true" : "false"} onValueChange={v => updateField("urgent", v === "true")}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 w-full">
              <Label className="text-sm font-semibold mb-2">Assign To</Label>
              <Select
                value={form.assigned_to?.toString() || ""}
                onValueChange={v => updateField("assigned_to", v && v !== "unassigned" ? parseInt(v) : null)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white overflow-hidden">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {team.map(member => (
                    <SelectItem key={member.id} value={member.userId.toString()}>
                      <img loading="lazy" src={getProfilePicture(member)} alt="" className="h-3 rounded-full inline mr-1" />
                      {member.fullName || `${member.firstName} ${member.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <Label className="text-sm font-semibold mb-2">Visibility</Label>
            <Select value={form.visible_by} onValueChange={v => updateField("visible_by", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="private">Just Me</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-semibold mb-2">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                placeholder="Add tag..." className="bg-gray-800 border-gray-700 text-white text-sm"
                onKeyPress={e => e.key === "Enter" && addTag()} />
              <Button onClick={addTag} variant="outline" size="sm" className="text-black">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {tag}
                  <X size={12} className="cursor-pointer" onClick={() => removeTag(idx)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <Label className="text-sm font-semibold mb-2">Labels</Label>
            <div className="flex gap-2 mb-2">
              <Input value={labelInput} onChange={e => setLabelInput(e.target.value)}
                placeholder="Label name..." className="bg-gray-800 border-gray-700 text-white text-sm flex-1" />
              <input type="color" value={labelColor} onChange={e => setLabelColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer" />
              <Button onClick={addLabel} variant="outline" size="sm" className="text-black">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.labels.map((label, idx) => (
                <Badge key={idx} style={{ backgroundColor: label.color }} className="gap-1">
                  {label.name}
                  <X size={12} className="cursor-pointer" onClick={() => removeLabel(idx)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-700 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim()}
            className="bg-blue-600 hover:bg-blue-700">
            {loading
              ? (editMode ? "Updating..." : "Creating...")
              : (editMode ? "Update Task" : "Create Task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}