import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays, MapPin, Bell, Link } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { calendarEventsAPI } from "@/utils/APIs/startupsAPI";

const defaultEvent = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  all_day: false,
  category: "event",
  color: "#3B82F6",
  location: "",
  visible_by: "team",
  reminder_minutes: 30,
};

const AddEventModal = ({ isOpen, setCalendarEvents, setIsAddEventModalOpen }) => {
  const [event, setEvent] = useState(defaultEvent);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isOpen) {
      setEvent(defaultEvent);
    }
  }, [isOpen]);

  const handleChange = (key, value) => {
    setEvent((prev) => ({ ...prev, [key]: value }));
  };
  const handleCreateEvent = async (eventData) => {
      try {
        const body = {
          ...eventData,
          startup_id: id,
          user_id: user?.id || user?.userId || user?.user_id,
        }
        const response = await calendarEventsAPI.create(body);
        
        if (response.success || response.event) {
          toast.success('Event created successfully');
          setIsAddEventModalOpen(false);
          setCalendarEvents((prevEvents) => [...prevEvents, response.data?.event || response.event]);
        } else {
          throw new Error(response.error || 'Failed to create event');
        }
      } catch (error) {
        toast.error('Error creating event');
        console.error('Error creating event:', error);
      }
    }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event.title || !event.start_date) return;

    try {
      setLoading(true);

      await handleCreateEvent({
        ...event,
        id, 
        start_date: new Date(event.start_date).toISOString(),
        end_date: event.end_date
          ? new Date(event.end_date).toISOString()
          : null,
      });

      setIsAddEventModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddEventModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-1000 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl shadow-xl">

              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  Create Event
                </h3>
                <Button size="icon" variant="ghost" onClick={() => setIsAddEventModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Sprint Planning"
                    value={event.title}
                    onChange={(e) =>
                      handleChange("title", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Discuss roadmap and priorities"
                    value={event.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Start</Label>
                    <Input
                      type="datetime-local"
                      value={event.start_date}
                      onChange={(e) =>
                        handleChange("start_date", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>End</Label>
                    <Input
                      type="datetime-local"
                      value={event.end_date}
                      onChange={(e) =>
                        handleChange("end_date", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* All day */}
                <div className="flex items-center justify-between">
                  <motion.div className="flex gap-2 items-center">
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    <span>All day</span>
                  </motion.div>
                  <Switch
                    checked={event.all_day}
                    onCheckedChange={(v) =>
                      handleChange("all_day", v)
                    }
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select
                      value={event.category}
                      onValueChange={(v) =>
                        handleChange("category", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='text-white bg-gray-900 z-10000 w-full'>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Visible by</Label>
                    <Select
                      value={event.visible_by}
                      onValueChange={(v) =>
                        handleChange("visible_by", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='text-white bg-gray-900 z-10000'>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Just Me</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <motion.div className="flex gap-2 items-center">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Location</span>
                  </motion.div>
                  <Input
                    placeholder="Google Meet / Office"
                    value={event.location}
                    onChange={(e) =>
                      handleChange("location", e.target.value)
                    }
                  />
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <motion.div className="flex gap-2 items-center">
                    <Link className="w-4 h-4 shrink-0" />

                    <span>Link</span>
                  </motion.div>
                  <Input
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={event.link}
                    onChange={(e) =>
                      handleChange("link", e.target.value)
                    }
                  />
                </div>

                {/* Reminder */}
                <div className="space-y-1">
                  <motion.div className="flex gap-2 items-center">
                    <Bell className="w-4 h-4 shrink-0" />
                    <span>Reminder (minutes before)</span>
                  </motion.div>
                  <Input
                    type="number"
                    min={0}
                    value={event.reminder_minutes}
                    onChange={(e) =>
                      handleChange(
                        "reminder_minutes",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddEventModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
