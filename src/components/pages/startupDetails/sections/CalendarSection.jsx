import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDays, List, Columns, Clock, Pencil, Trash2, Eye, EyeOff, Plus, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EventDetailsModal from "../modals/EventDetails";
import { toast } from "react-toastify";
import { calendarEventsAPI } from "@/utils/APIs/startupsAPI";
import { useSelector } from "react-redux";
import AddEventModal from "../modals/AddEvent";

const toDate = (d) => new Date(d);
const colors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange 
];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isDateInRange = (date, start, end) => {
  const day = new Date(date.setHours(0, 0, 0, 0));
  const s = new Date(start.setHours(0, 0, 0, 0));
  const e = new Date((end ?? start).setHours(0, 0, 0, 0));
  return day >= s && day <= e;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};


const CalendarSection = ({
  calendarEvents,
  setCalendarEvents,
  isAdmin
}) => {
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [view, setView] = useState(localStorage.getItem("calendarView") || "agenda");
  useEffect(() => {
    localStorage.setItem("calendarView", view);
  }, [view]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const openEvent = (event, color) => {
    setSelectedEvent(event);
    setSelectedColor(color);
    setModalOpen(true);
  };

  const handleEditEvent = async () => {
    // Implement event editing logic here
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await calendarEventsAPI.delete(eventId);
      if (response.success) {
        toast.success('Event deleted successfully');
        setCalendarEvents(calendarEvents.filter(event => event?.id !== eventId));
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      toast.error('Error deleting event');
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Calendar
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            Track meetings, deadlines, and milestones.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
          {/* View switch */}
          <div className="flex rounded-lg bg-gray-800 md:bg-transparent border border-gray-700 overflow-hidden">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-none">
              <Button
                size="sm"
                variant={view === "agenda" ? "default" : "ghost"}
                onClick={() => setView("agenda")}
                className={`w-full md:w-auto ${view === "agenda" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}`}
              >
                <List className="w-4 h-4" />
                <span className="md:hidden text-xs ml-1">Agenda</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-none">
              <Button
                size="sm"
                variant={view === "week" ? "default" : "ghost"}
                onClick={() => setView("week")}
                className={`w-full md:w-auto ${view === "week" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}`}
              >
                <Columns className="w-4 h-4" />
                <span className="md:hidden text-xs ml-1">Week</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-none">
              <Button
                size="sm"
                variant={view === "month" ? "default" : "ghost"}
                onClick={() => setView("month")}
                className={`w-full md:w-auto ${view === "month" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}`}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="md:hidden text-xs ml-1">Month</span>
              </Button>
            </motion.div>
          </div>

          {isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto">
              <Button
                size="sm"
                onClick={() => setIsAddEventModalOpen(true)}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Views */}
      {view === "agenda" && (
        <CalendarAgendaView
          calendarEvents={calendarEvents}
          isAdmin={isAdmin}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onOpenEvent={openEvent}
        />
      )}

      {view === "week" && (
        <CalendarWeekView
          calendarEvents={calendarEvents}
          onEditEvent={handleEditEvent}
          onOpenEvent={openEvent}
        />
      )}

      {view === "month" && (
        <CalendarMonthView
          calendarEvents={calendarEvents}
          colors={colors}
          onEditEvent={handleEditEvent}
          onOpenEvent={openEvent}
        />
      )}

      <EventDetailsModal
        event={selectedEvent}
        open={modalOpen}
        onClose={setModalOpen}
        isAdmin={isAdmin}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        color={selectedColor}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        setIsAddEventModalOpen={setIsAddEventModalOpen}
        setCalendarEvents={setCalendarEvents}
      />
    </div>
  );
};

export default CalendarSection;

const CalendarAgendaView = ({
  calendarEvents,
  isAdmin,
  onEditEvent,
  onDeleteEvent,
  onOpenEvent
}) => {
  const eventColors = useMemo(() => {
    return calendarEvents.map((_, i) => colors[i % colors.length]);
  }, [calendarEvents]);

  const getEventColor = (event) => {
    const index = calendarEvents.findIndex((e) => e.id === event.id);
    return eventColors[index] || "#3B82F6";
  };

  if (calendarEvents.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <CalendarDays className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mb-3" />
        <p className="text-gray-400 text-base md:text-lg font-medium">No events scheduled</p>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Create your first event to get started</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-2 md:space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {calendarEvents.map((event) => (
        <motion.div key={event.id} variants={itemVariants}>
          <Card
            onClick={() => onOpenEvent(event, getEventColor(event))}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all duration-200"
          >
            <CardContent className="p-3 md:p-4 flex gap-3 md:gap-4">
              <div
                className="w-1 md:w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getEventColor(event) }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="text-white font-semibold text-sm md:text-base break-words">
                    {event.title}
                  </h3>
                  {event.visible_by && (
                    <Badge variant="outline" className="text-xs text-white border-gray-600 flex-shrink-0">
                      {event.visible_by === 'public' ? (
                        <Eye className="w-3 h-3 mr-1 text-green-400" />
                      ) : (
                        <EyeOff className="w-3 h-3 mr-1 text-red-400" />
                      )}
                      <span className="hidden sm:inline">
                        {event.visible_by.charAt(0).toUpperCase() + event.visible_by.slice(1)}
                      </span>
                    </Badge>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs md:text-sm text-gray-300 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 md:mt-3 text-xs md:text-sm text-gray-400">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
                    {event.end_date && (
                      <> → {new Date(event.end_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}</>
                    )}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <motion.div className="flex gap-1 flex-shrink-0" whileHover={{ scale: 1.05 }}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-gray-700 h-8 w-8 md:h-10 md:w-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const daysMobile = ["M", "T", "W", "T", "F", "S", "S"];

const CalendarWeekView = ({ calendarEvents, onOpenEvent }) => {
  const startOfWeek = (() => {
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const eventColors = useMemo(() => {
    return calendarEvents.map((_, i) => colors[i % colors.length]);
  }, [calendarEvents]);

  const getEventColor = (event) => {
    const index = calendarEvents.findIndex((e) => e.id === event.id);
    return eventColors[index] || "#3B82F6";
  };

  return (
    <motion.div
      className="grid grid-cols-7 gap-1 md:gap-2 overflow-x-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {days.map((label, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);

        const dayEvents = calendarEvents.filter((e) =>
          isDateInRange(
            new Date(date),
            toDate(e.start_date),
            e.end_date ? toDate(e.end_date) : null
          )
        );

        return (
          <motion.div
            key={label}
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-2 md:p-3 min-h-[150px] md:min-h-[200px]"
          >
            <div className="text-xs md:text-sm font-semibold text-gray-300 mb-2 md:mb-3">
              <span className="md:hidden">{daysMobile[index]}</span>
              <span className="hidden md:inline">{label}</span>
            </div>

            <div className="space-y-1">
              {dayEvents.map((event) => {
                return (
                  <motion.div
                    key={event.id}
                    onClick={() => onOpenEvent(event, getEventColor(event))}
                    className="text-xs truncate text-white rounded px-2 py-1 cursor-pointer transition-all hover:shadow-md line-clamp-2"
                    style={{
                      backgroundColor: getEventColor(event) + "33",
                      borderLeft: `3px solid ${getEventColor(event)}`
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {event.title}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const daysInMonth = (year, month) =>
  new Date(year, month + 1, 0).getDate();

const CalendarMonthView = ({ calendarEvents, onOpenEvent, colors }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = daysInMonth(year, month);

  const eventColors = useMemo(() => {
    return calendarEvents.map((_, i) => colors[i % colors.length]);
  }, [calendarEvents, colors]);

  const getEventColor = (event) => {
    const index = calendarEvents.findIndex((e) => e.id === event.id);
    return eventColors[index] || "#3B82F6";
  };

  return (
    <motion.div
      className="grid grid-cols-7 gap-1 md:gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {[...Array(days)].map((_, i) => {
        const date = new Date(year, month, i + 1);

        const dayEvents = calendarEvents.filter((e) =>
          isDateInRange(
            new Date(date),
            toDate(e.start_date),
            e.end_date ? toDate(e.end_date) : null
          )
        );

        return (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-2 md:p-3 min-h-[100px] md:min-h-[150px]"
          >
            <div className="text-xs md:text-sm font-semibold text-gray-400 mb-1 md:mb-2">
              {i + 1}
            </div>

            <div className="space-y-0.5 md:space-y-1">
              {dayEvents.slice(0, 2).map((event) => {
                return (
                  <motion.div
                    key={event.id}
                    onClick={() => onOpenEvent(event, getEventColor(event))}
                    className="text-xs truncate text-white rounded px-2 py-0.5 md:py-1 cursor-pointer transition-all hover:shadow-md"
                    style={{
                      backgroundColor: getEventColor(event) + "33",
                      borderLeft: `3px solid ${getEventColor(event)}`
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {event.title}
                  </motion.div>
                )
              })}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500 px-2">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
