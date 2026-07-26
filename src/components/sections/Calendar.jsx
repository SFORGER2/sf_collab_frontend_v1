import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, 
  Filter, Search, X, Trash2, Building2, 
  Bell, MapPin, 
  CalendarDays, ListFilter, RefreshCw
} from 'lucide-react'
import SpotlightCard from '../ui/SpotlightCard'
import ShinyText from '../ui/ShinyText'
import { Button } from '../ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "../ui/button-group"
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, isSameDay, parseISO } from 'date-fns'
import { useSelector } from 'react-redux'
import { ShineButton } from '../lightswind/shine-button'
import { Download, FileJson, FileSpreadsheet, Calendar as CalendarFile } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { startupsAPI, calendarEventsAPI } from '@/utils/APIs/startupsAPI'
import { API_URL } from '@/utils/config'
import DeleteConfirmationModal from '@/utils/confirm'
import { CosmosButton } from '@/components/cosmos'

// Event colours, on the cosmos palette. These are inline style values (not
// Tailwind classes), so the global token recolour doesn't reach them.
const colors = [
  "#4fd8ff", // cyan    — structure
  "#3ee6a0", // emerald — validated
  "#ffbf5e", // gold    — the spark
  "#ff6b6b", // red     — deadline, kept unmistakably red
  "#8b6cff", // violet  — intelligence
  "#ff4fd8", // magenta — momentum
]

const isDateInRange = (date, start, end) => {
  const day = new Date(date.setHours(0, 0, 0, 0));
  const s = new Date(start.setHours(0, 0, 0, 0));
  const e = new Date((end ?? start).setHours(0, 0, 0, 0));
  return day >= s && day <= e;
};

export default function Calendar() {
  const { user, access_token } = useSelector((state) => state.auth)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(null)
  // Collapsed by default — expanded, the filter panel pushed the calendar
  // grid itself below the fold.
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    startup_id: 'all',
    view: 'month',
    upcoming_only: false,
    search: '',
    start_date: null,
    end_date: null
  })

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    all_day: false,
    category: 'event',
    color: '',
    location: '',
    startup_id: '',
    link: '',
    reminder_minutes: 30
  })

  const [userStartups, setUserStartups] = useState(user?.startups || [])

  // Event colors mapping
  const eventColors = useMemo(() => {
    return events.map((_, i) => colors[i % colors.length]);
  }, [events]);

  const getEventColor = (event) => {
    const index = events.findIndex((e) => e.id === event.id);
    return eventColors[index] || "#3B82F6";
  };

  useEffect(() => {
    if (!user) return
    async function fetchUserStartups() {
      try {
        const response = await startupsAPI.getUserStartupNames()
        if (response.success) {
          setUserStartups(response.data.startups || [])
        }
      } catch (error) {
        console.error('Error fetching user startups:', error)
      }
    }
    fetchUserStartups()
  }, [user, access_token])

  const eventCategories = [
    { value: 'meeting', label: 'Meeting', color: '#3B82F6' },
    { value: 'deadline', label: 'Deadline', color: '#EF4444' },
    { value: 'reminder', label: 'Reminder', color: '#F59E0B' },
    { value: 'event', label: 'Event', color: '#8B5CF6' }
  ]

  const viewOptions = [
    { value: 'month', label: 'Month', icon: <CalendarDays className="h-4 w-4" /> },
    { value: 'week', label: 'Week', icon: <CalendarIcon className="h-4 w-4" /> },
    { value: 'list', label: 'List', icon: <ListFilter className="h-4 w-4" /> }
  ]


  useEffect(() => {
    fetchEvents()
  }, [filters.view, filters.upcoming_only, filters.start_date, filters.end_date])
  
  useEffect(() => {
    fetchEvents()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [events, filters])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = {}
      
      if (filters.startup_id && filters.startup_id !== 'all') {
        params.startup_id = filters.startup_id
      }
      
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category
      }
      
      if (filters.start_date) {
        params.start_date = filters.start_date.toISOString()
      }
      
      if (filters.end_date) {
        params.end_date = filters.end_date.toISOString()
      }
      
      if (filters.upcoming_only) {
        params.upcoming_only = true
      }

      const data = await calendarEventsAPI.getAll(params)

      if (data.success) {
        setEvents(data.data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...events]
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category)
    }

    if (filters.startup_id !== 'all') {
      filtered = filtered.filter(event => event.startup_id === parseInt(filters.startup_id))
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.location?.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredEvents(filtered)
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => addMonths(prevDate, direction === 'next' ? 1 : -1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEventForm({
      ...eventForm,
      start_date: format(date, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(new Date(date.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
    });
    setShowEventModal(true);
    setSelectedEvent(null);
  };

  const handleEventClick = (event, color) => {
    setSelectedEvent(event)
    setSelectedColor(color)
    setEventForm({
      title: event.title,
      description: event.description || '',
      start_date: format(parseISO(event.start_date), "yyyy-MM-dd'T'HH:mm"),
      end_date: event.end_date ? format(parseISO(event.end_date), "yyyy-MM-dd'T'HH:mm") : '',
      all_day: event.all_day,
      category: event.category,
      color: color,
      location: event.location || '',
      startup_id: event.startup_id || '',
      link: event.link || '',
      reminder_minutes: event.reminder_minutes || 30
    })
    setShowEventModal(true)
  }

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        user_id: user?.id,
        start_date: new Date(eventForm.start_date).toISOString(),
        startup_id: null,
        end_date: eventForm.end_date ? new Date(eventForm.end_date).toISOString() : null
      }

      const data = await calendarEventsAPI.create(eventData)

      if (data.success) {
        toast.success('Event created successfully')
        setShowEventModal(false)
        fetchEvents()
        setEventForm({
          title: '',
          description: '',

          start_date: '',
          end_date: '',
          all_day: false,
          category: 'event',
          color: '',
          location: '',
          startup_id: null,
          link: '',
          reminder_minutes: 30
        })
      } else {
        toast.error(data.message || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return

    try {
      const eventData = {
        ...eventForm,
        start_date: new Date(eventForm.start_date).toISOString(),
        end_date: eventForm.end_date ? new Date(eventForm.end_date).toISOString() : null
      }

      const data = await calendarEventsAPI.update(selectedEvent.id, eventData)

      if (data.success) {
        toast.success('Event updated successfully')
        setShowEventModal(false)
        fetchEvents()
        setSelectedEvent(null)
      } else {
        toast.error(data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId) => {

    try {
      const data = await calendarEventsAPI.delete(eventId)

      if (data.success) {
        toast.success('Event deleted successfully')
        fetchEvents()
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(null)
          setEventForm({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            all_day: false,
            category: 'event',
            color: '',
            location: '',
            startup_id: null,
            link: '',
            reminder_minutes: 30
          })
          setShowEventModal(false)
        }
      } else {
        toast.error(data.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => {
      const eventStart = parseISO(event.start_date)
      const eventEnd = event.end_date ? parseISO(event.end_date) : eventStart
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const start = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
      const end = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
      
      return checkDate >= start && checkDate <= end
    })
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const weeks = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateEvents = getEventsForDate(day)
        const isCurrentMonth = day.getMonth() === currentDate.getMonth()
        const isToday = isSameDay(day, new Date())

        days.push(
          <div
            key={day.toISOString()}
            onClick={() => handleDateClick(day)}
            className={`
              min-h-28 border border-white/[0.07] p-2 cursor-pointer transition-colors relative group
              ${isCurrentMonth ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'bg-transparent'}
              ${isToday ? 'bg-gold/[0.06]' : ''}
            `}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span
                className={`
                  font-mono text-[11px] tabular-nums
                  ${isCurrentMonth ? 'text-star' : 'text-dim/50'}
                  ${isToday ? 'text-[#241300] bg-gold px-1.5 py-0.5 rounded-full font-medium' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 h-5 w-5 p-0 bg-transparent border-none cursor-pointer text-dim hover:text-gold transition-all"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDateClick(day)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent style={{ zIndex: 999999 }}>
                    <p>Add event</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-1 max-h-20 overflow-y-auto">
              {dateEvents.map((event, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEventClick(event, getEventColor(event))
                  }}
                  className="text-[11px] px-1.5 py-1 rounded-md truncate cursor-pointer transition-opacity hover:opacity-80"
                  style={{ backgroundColor: getEventColor(event) + "22", borderLeft: `2px solid ${getEventColor(event)}` }}
                >
                  <span className="text-star/90 truncate block leading-tight">{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        )

        day = new Date(day.getTime() + 24 * 60 * 60 * 1000)
      }
      weeks.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-px">
          {days}
        </div>
      )
      days = []
    }

    return weeks
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const days = []

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
      const dateEvents = getEventsForDate(day)
      const isToday = isSameDay(day, new Date())

      days.push(
        <div key={day.toISOString()} className="flex-1">
          <div className={`
            p-3 border-b border-gray-700 text-center
            ${isToday ? 'bg-blue-500/20' : 'bg-gray-800/30'}
          `}>
            <div className="text-sm font-medium text-gray-300">{format(day, 'EEE')}</div>
            <div className={`
              text-lg font-bold mt-1
              ${isToday ? 'text-blue-400' : 'text-white'}
            `}>
              {format(day, 'd')}
            </div>
          </div>
          <div 
            className="min-h-96 p-2 space-y-2"
            onClick={() => handleDateClick(day)}
          >
            {dateEvents.map((event, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEventClick(event, getEventColor(event))
                }}
                className="p-2 rounded-lg text-sm cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: getEventColor(event) + "33", borderLeft: `3px solid ${getEventColor(event)}` }}
              >
                <div className="font-medium text-white">{event.title}</div>
                {!event.all_day && event.end_date && (
                  <div className="text-xs opacity-90 text-white">
                    {format(parseISO(event.start_date), 'HH:mm')} - {format(parseISO(event.end_date), 'HH:mm')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="flex border border-gray-700 rounded-lg overflow-hidden">
        {days}
      </div>
    )
  }

  const renderListView = () => {
    const sortedEvents = [...filteredEvents].sort((a, b) => 
      new Date(a.start_date) - new Date(b.start_date)
    )

    return (
      <div className="space-y-3">
        {sortedEvents.map((event) => (
          <Card 
            key={event.id}
            className="border-gray-700 bg-gray-800/30 hover:bg-gray-700/50 cursor-pointer"
            onClick={() => handleEventClick(event, getEventColor(event))}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-3 h-12 rounded"
                    style={{ backgroundColor: getEventColor(event) }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{event.title}</h4>
                      <Badge variant="outline" className={`text-white text-xs`}>
                        {event.category}
                      </Badge>
                      {event.startup && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Building2 className="h-3 w-3 mr-1" />
                          {event.startup.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(parseISO(event.start_date), 'MMM d, yyyy HH:mm')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.is_ongoing && (
                    <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                      Ongoing
                    </Badge>
                  )}
                  {event.should_remind && (
                    <Bell className="h-4 w-4 text-yellow-400 animate-pulse" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderView = () => {
    switch (filters.view) {
      case 'week':
        return renderWeekView()
      case 'list':
        return renderListView()
      default:
        return renderMonthView()
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleExportCalendar = async (format) => {
    try {
      setExporting(true)
      
      const params = new URLSearchParams()
      params.append('format', format)
      
      if (filters.startup_id && filters.startup_id !== 'all') {
        params.append('startup_id', filters.startup_id)
      }
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category)
      }
      
      if (filters.start_date) {
        params.append('start_date', filters.start_date.toISOString())
      }
      
      if (filters.end_date) {
        params.append('end_date', filters.end_date.toISOString())
      }
  
      const response = await calendarEventsAPI.export(format, user?.id)
  
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `calendar_export_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const blob = response.data || response
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        
        let filename = `calendar_export_${new Date().toISOString().split('T')[0]}`
        if (format === 'csv') {
          filename += '.csv'
        } else if (format === 'ical') {
          filename += '.ics'
        }
        
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
  
      toast.success(`Calendar exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting calendar:', error)
      toast.error('Failed to export calendar')
    } finally {
      setExporting(false)
    }
  }
  
  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(null)}
        onConfirm={() => {
          handleDeleteEvent(isDeleteConfirmOpen)
          setIsDeleteConfirmOpen(null)
        }}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        type='soft'
      />
    <div className="text-white">
      <div className="w-full mx-auto">
        {/* ── Command bar ──────────────────────────────────────────────────
            One row: where you are, how you're looking at it, what you can do.
            The old header repeated the widget title in animated text and put
            three export buttons above the fold; exports now live behind the
            filter panel, where they're needed but not shouting. */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth('prev')}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <h2 className="font-display text-[1.05rem] text-star min-w-[7.5rem] text-center">
              {format(currentDate, 'MMM yyyy')}
            </h2>

            <button
              onClick={() => navigateMonth('next')}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <CosmosButton variant="quiet" size="sm" onClick={goToToday}>
            Today
          </CosmosButton>

          {/* View switcher — mono segmented control */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
            {viewOptions.map((view) => (
              <button
                key={view.value}
                onClick={() => setFilters({ ...filters, view: view.value })}
                aria-pressed={filters.view === view.value}
                className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full transition-colors ${
                  filters.view === view.value
                    ? 'bg-cyan/15 text-cyan'
                    : 'text-dim hover:text-star'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-pressed={showFilters}
              aria-label="Toggle filters"
              className={`p-1.5 rounded-lg transition-colors ${
                showFilters ? 'text-cyan bg-cyan/10' : 'text-dim hover:text-star hover:bg-white/[0.06]'
              }`}
            >
              <Filter size={16} />
            </button>

            <button
              onClick={fetchEvents}
              disabled={loading}
              aria-label="Refresh events"
              className="p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <CosmosButton
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedEvent(null)
                setEventForm({
                  title: '',
                  description: '',
                  start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                  end_date: format(new Date(new Date().getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
                  all_day: false,
                  category: 'event',
                  color: '',
                  location: '',
                  startup_id: '',
                  link: '',
                  reminder_minutes: 30
                })
                setShowEventModal(true)
              }}
            >
              <Plus size={14} /> New event
            </CosmosButton>
          </div>
        </div>

        {/* Filters — collapsed by default now; they were permanently expanded,
            pushing the actual calendar grid below the fold. */}
        <div className={showFilters ? 'mb-4' : 'hidden'}>
          <div className="cosmos-card p-3 md:p-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="cosmos-stat-label mr-1">Export</span>
                <CosmosButton variant="quiet" size="sm" onClick={() => handleExportCalendar('json')}>
                  <FileJson size={14} /> JSON
                </CosmosButton>
                <CosmosButton variant="quiet" size="sm" onClick={() => handleExportCalendar('csv')}>
                  <FileSpreadsheet size={14} /> CSV
                </CosmosButton>
                <CosmosButton variant="quiet" size="sm" onClick={() => handleExportCalendar('ical')}>
                  <CalendarFile size={14} /> iCal
                </CosmosButton>
              </div>

                {/* Advanced filters */}
                <div className="pt-3 border-t border-white/10 relative" style={{ zIndex: 50 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      {/* Category Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm text-gray-400">Category</Label>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => setFilters({ ...filters, category: value })}
                        >
                          <SelectTrigger className="border-gray-700 bg-gray-800/50 text-sm" style={{ zIndex: 60 }}>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent
                            className="bg-gray-800 border-gray-700"
                            position="popper"
                            style={{
                              zIndex: 9999999,
                              position: 'absolute'
                            }}
                          >
                            <SelectItem value="all">All Categories</SelectItem>
                            {eventCategories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value} className="flex text-white hover:text-gray-800 items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
            
                      {/* Startup Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm text-gray-400">Startup</Label>
                        <Select
                          value={filters.startup_id}
                          onValueChange={(value) => setFilters({ ...filters, startup_id: value })}
                        >
                          <SelectTrigger className="border-gray-700 bg-gray-800/50 text-sm" style={{ zIndex: 60 }}>
                            <SelectValue placeholder="All startups" />
                          </SelectTrigger>
                          <SelectContent
                            className="bg-gray-800 border-gray-700"
                            position="popper"
                            style={{
                              zIndex: 9999999,
                              position: 'absolute'
                            }}
                          >
                            <SelectItem value="all">All Startups</SelectItem>
                            {userStartups.length > 0 ? (
                              userStartups.map(startup => (
                                <SelectItem key={startup.id} value={startup.id.toString()} className="text-white hover:text-gray-800">
                                  {startup.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-startups" disabled>No startups found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
            
                      {/* Date Range */}
                      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <Label className="text-xs md:text-sm text-gray-400">Date Range</Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            className="border-gray-700 bg-gray-800/50 text-sm"
                            value={filters.start_date ? format(filters.start_date, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setFilters({
                              ...filters,
                              start_date: e.target.value ? new Date(e.target.value) : null
                            })}
                          />
                          <Input
                            type="date"
                            className="border-gray-700 bg-gray-800/50 text-sm"
                            value={filters.end_date ? format(filters.end_date, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setFilters({
                              ...filters,
                              end_date: e.target.value ? new Date(e.target.value) : null
                            })}
                          />
                        </div>
                      </div>
            
                      {/* Search */}
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm text-gray-400">Search</Label>
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search..."
                            className="pl-3 pr-8 border-gray-700 bg-gray-800/50 text-sm"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
            
                    {/* Additional filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={filters.upcoming_only}
                          onCheckedChange={(checked) => setFilters({ ...filters, upcoming_only: checked })}
                        />
                        <Label className="text-xs md:text-sm text-dim">Upcoming only</Label>
                      </div>

                      <CosmosButton
                        variant="quiet"
                        size="sm"
                        onClick={() => {
                          setFilters({
                            category: 'all',
                            startup_id: 'all',
                            view: 'month',
                            upcoming_only: false,
                            search: '',
                            start_date: null,
                            end_date: null
                          })
                          setSelectedEvent(null)
                        }}
                      >
                        <X size={14} /> Clear
                      </CosmosButton>
                    </div>
                  </div>
              </div>
            </div>
        </div>

        {/* ── Metrics strip ───────────────────────────────────────────────
            Moved above the grid: four numbers you read at a glance, in the
            cosmos stat treatment. They used to sit below the fold as four
            separate bordered cards in four unrelated colours. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total events', value: events.length, accent: '#f2effa' },
            { label: 'Upcoming', value: events.filter(e => !e.is_past).length, accent: '#3ee6a0' },
            {
              label: 'This month',
              value: events.filter(e =>
                new Date(e.start_date).getMonth() === currentDate.getMonth() &&
                new Date(e.start_date).getFullYear() === currentDate.getFullYear()
              ).length,
              accent: '#8b6cff',
            },
            { label: 'Today', value: getEventsForDate(new Date()).length, accent: '#ffbf5e' },
          ].map((s) => (
            <div key={s.label} className="cosmos-card p-3.5">
              <span className="cosmos-stat-label">{s.label}</span>
              <span className="cosmos-stat-value text-[1.5rem]" style={{ color: s.accent }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div>
          {filters.view === 'month' && (
            <div className="grid grid-cols-7 gap-px mb-px rounded-t-xl overflow-hidden border border-white/10 border-b-0">
              {weekDays.map((day) => (
                <div key={day} className="py-2.5 text-center bg-white/[0.03]">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">
                    {day.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">
                Loading events
              </span>
            </div>
          ) : (
            renderView()
          )}
        </div>
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl" style={{ zIndex: 999 }}>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedDate ? `Date: ${format(selectedDate, 'MMMM d, yyyy')}` : 'Create a new calendar event'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-white">Title *</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event title"
                className="border-gray-700 bg-gray-800/50 text-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-white">Description</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Event description"
                rows={3}
                className="border-gray-700 bg-gray-800/50 text-white"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.start_date}
                  onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                  className="border-gray-700 bg-gray-800/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.end_date}
                  onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                  className="border-gray-700 bg-gray-800/50 text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-white">Category</Label>
              <Select
                value={eventForm.category}
                onValueChange={(value) => setEventForm({ ...eventForm, category: value })}
              >
                <SelectTrigger className="border-gray-700 bg-gray-800/50 text-white" style={{ zIndex: 9999999 }}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white" style={{ zIndex: 99999999 }}>
                  {eventCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location & Link */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Location</Label>
                <Input
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Event location"
                  className="border-gray-700 bg-gray-800/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Link</Label>
                <Input
                  value={eventForm.link}
                  onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                  placeholder="https://..."
                  className="border-gray-700 bg-gray-800/50 text-white"
                />
              </div>
            </div>

            {/* Reminder */}
            <div className="space-y-2">
              <Label className="text-white">Reminder</Label>
              <Select
                value={eventForm.reminder_minutes.toString()}
                onValueChange={(value) => setEventForm({ ...eventForm, reminder_minutes: parseInt(value) })}
              >
                <SelectTrigger className="border-gray-700 bg-gray-800/50 text-white" style={{ zIndex: 9999999 }}>
                  <SelectValue placeholder="Select reminder" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white" style={{ zIndex: 99999999 }}>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* All Day Switch */}
            <div className="flex items-center gap-2">
              <Switch
                checked={eventForm.all_day}
                onCheckedChange={(checked) => setEventForm({ ...eventForm, all_day: checked })}
              />
              <Label className="text-white">All day event</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {selectedEvent && (
              <Button
                variant="destructive"
                  onClick={() => {
                    setIsDeleteConfirmOpen(selectedEvent.id)
                    setShowEventModal(false)
                  }
                  }
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          
            <Button
              variant="outline"
              onClick={() => {
                setShowEventModal(false)
                setSelectedEvent(null)
                setEventForm({
                  title: '',
                  description: '',
                  start_date: '',
                  end_date: '',
                  all_day: false,
                  category: 'event',
                  color: '',
                  location: '',
                  startup_id: '',
                  link: '',
                  reminder_minutes: 30
                })
              }}
              className="border-gray-700 text-black hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
          
            <Button
              onClick={selectedEvent ? handleUpdateEvent : handleCreateEvent}
              disabled={!eventForm.title || !eventForm.start_date}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {selectedEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
      </>
  );
};