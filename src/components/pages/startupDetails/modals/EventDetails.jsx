import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Clock, MapPin, Pencil, Trash2, Repeat2, Bell, Link } from "lucide-react";
import { useMemo } from "react";

export default function EventDetailsModal({
  event, open, onClose, isAdmin, onEdit, onDelete, color
}) {
  
  const timeLeft = useMemo(() => {
    if (event?.end_date) {
      const now = new Date();
      const end = new Date(event.end_date);
      const diffMs = end - now;
      
      if (diffMs <= 0) return "Ended";
      
      const diffSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(diffSecs / 86400);
      const hours = Math.floor((diffSecs % 86400) / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      
      return parts.length > 0 ? parts.join(" ") : "Less than a minute";
    }
    return "";
  }, [event]);
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  if (!event) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }} />
            {event.title}
          </DialogTitle>
          <span 
            className="text-xs text-white font-semibold px-2 py-1 rounded w-fit mt-2"
            style={{ backgroundColor: color + "33", }}
          >
            {event.category}
          </span>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & Time */}
          <div className="text-sm text-gray-300 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color }} />
              <div>
                <p className="font-semibold">{formatDateTime(event.start_date)}</p>
                {event.end_date && (
                  <p className="text-xs text-gray-400">
                    Until {formatDateTime(event.end_date)} ({timeLeft})
                  </p>
                )}
                {event.all_day && <p className="text-xs text-gray-400">All day event</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5" style={{ color }} />
              <p className="text-gray-300">{event.location}</p>
            </div>
          )}
          {/* Link */}
          {event.link && (
            <div className="flex items-start gap-2 text-sm">
              <Link className="w-4 h-4 mt-0.5" style={{ color }} />
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
                style={{ color }}
              >
                Link to event
              </a>
            </div>
          )}
          {/* Description */}
          {event.description && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color }}>Description</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-2 rounded">
                {event.description}
              </p>
            </div>
          )}

          {/* Recurring */}
          {event.is_recurring && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Repeat2 className="w-4 h-4" style={{ color }} />
              <span>Recurring event</span>
            </div>
          )}

          {/* Reminder */}
          {event.reminder_minutes > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Bell className="w-4 h-4" style={{ color }} />
              <span>Reminder {event.reminder_minutes} min before</span>
            </div>
          )}

          {/* Status */}
          {event.is_past && (
            <p className="text-xs text-gray-500 italic">Past event</p>
          )}
          {event.is_ongoing && (
            <p className="text-xs font-semibold" style={{ color }}>Ongoing</p>
          )}

          {/* Actions */}
          {isAdmin && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={() => {
                  onClose(false);
                  onDelete(event.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
