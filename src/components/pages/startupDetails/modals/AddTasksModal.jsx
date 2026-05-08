import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { tasksAPI } from "@/utils/APIs/startupsAPI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/utils/config";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { startupAPI } from "../startUpAPI";
import { useSelector } from "react-redux";

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "medium",
  status: "in_progress",
  due_date: "",
  estimated_hours: "",
  assigned_to: "",
  visible_by: "team",
  tags: [],
  labels: [],
  urgent: false
};

export default function AddTaskModal({
  isOpen,
  onClose,
  teamMembers,
  startupId,
  editMode = false,
  task = null,
  setTasks
}) {
  const [team, setTeam] = useState(teamMembers || []);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(localStorage.getItem("taskForm") ? JSON.parse(localStorage.getItem("taskForm")) : emptyTaskForm);
  const [tagInput, setTagInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [labelColor, setLabelColor] = useState("#3B82F6");
  const { user } = useSelector((state) => state.auth || {});
  useEffect(() => {
    localStorage.setItem("taskForm", JSON.stringify(form));
  }, [form]);
  useEffect(() => {
    if (!isOpen) {
      setForm(emptyTaskForm);
      localStorage.removeItem("taskForm");
      setTagInput("");
      setLabelInput("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (editMode && task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "in_progress",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        estimated_hours: task.estimated_hours || "",
        assigned_to: task.assigned_to || null,
        visible_by: task.visible_by || "team",
        tags: task.tags || [],
        labels: task.labels || [],
        urgent: task.urgent || false
      });
    }
  }, [editMode, task]);
  useEffect(() => {
    const getTeamMembers = async () => {
      try {
        const args = {
          page: 1,
          per_page: 100,
          startup_id: startupId,
          user_id: user?.id || null,
        }
        const response = await startupAPI.getMembers(args);
        console.log("Team members response:", response);
        if (response.success) {
          // Assuming the API returns an array of members in response.data.members
          setTeam(response.data.members || []);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    }
    getTeamMembers();
  }, [startupId]);
  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  }

  function removeTag(index) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }

  function addLabel() {
    if (labelInput.trim()) {
      const newLabel = {
        name: labelInput.trim(),
        color: labelColor,
      };
      setForm((prev) => ({
        ...prev,
        labels: [...prev.labels, newLabel],
      }));
      setLabelInput("");
      setLabelColor("#3B82F6");
    }
  }

  function removeLabel(index) {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      if (!form.title.trim()) {
        toast.error("Title is required");
        setLoading(false);
        return;
      }
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        assigned_to: form.assigned_to,
        visible_by: form.visible_by,
        tags: form.tags,
        labels: form.labels,
        urgent: form.urgent,
        startup_id: startupId,
      };
      let response;
      if (editMode && task) {
        response = await tasksAPI.update(task.id, payload);
        toast.success("✅ Task updated successfully!");
      } else {
        response = await tasksAPI.create(payload);
        toast.success("✅ Task created successfully!");
      }

      setTasks((prevTasks) => {
        if (editMode) {
          return prevTasks.map(t => t.id === task.id ? { ...t, ...payload } : t);
        } else {
          return [...prevTasks, response.data.task]; // Assuming response.data contains the new task
        }
      });
      onClose();
      setForm(emptyTaskForm);
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
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter task title"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-semibold mb-2">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the task..."
              className="bg-gray-800 border-gray-700 text-white min-h-25"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2">Priority</Label>
              <Select value={form.priority} onValueChange={(value) => updateField("priority", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2">Status</Label>
              <Select value={form.status} onValueChange={(value) => updateField("status", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2">Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2">Est. Hours</Label>
              <Input
                type="number"
                placeholder="0.0"
                step="0.5"
                value={form.estimated_hours}
                onChange={(e) => updateField("estimated_hours", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Assign To */}
          <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold mb-2">Urgent</Label>
            <Select value={form.urgent ? "true" : "false"} onValueChange={(value) => updateField("urgent", value === "true")}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div  className="col-span-1 w-full">
            <Label className="text-sm font-semibold mb-2">Assign To</Label>
            <Select value={form.assigned_to?.toString() || ""} onValueChange={(value) => updateField("assigned_to", value ? parseInt(value) : null)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white overflow-hidden">
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {team.map((member) => (
                  <SelectItem key={member.id} value={member.userId.toString()}>
                    <img loading="lazy" src={
                      getProfilePicture(member)} alt="Profile picture" className="h-3 rounded-full" />
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
            <Select value={form.visible_by} onValueChange={(value) => updateField("visible_by", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
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
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="bg-gray-800 border-gray-700 text-white text-sm"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag} variant="outline" size="sm" className="text-black">
                Add
              </Button>
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
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Label name..."
                className="bg-gray-800 border-gray-700 text-white text-sm flex-1"
              />
              <input
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Button onClick={addLabel} variant="outline" size="sm" className="text-black">
                Add
              </Button>
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
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim()} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (editMode ? "Updating..." : "Creating...") : editMode ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};