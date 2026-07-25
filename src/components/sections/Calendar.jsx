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

const colors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange 
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
  const [showFilters, setShowFilters] = useState(true)
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
              min-h-32 border border-gray-700/50 p-2 cursor-pointer transition-all
              ${isCurrentMonth ? 'bg-gray-800/30 hover:bg-gray-700/50' : 'bg-gray-900/20 text-gray-600'}
              ${isToday ? 'ring-2 ring-blue-500/50' : ''}
              hover:shadow-lg hover:scale-105 relative group
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`
                text-sm font-medium
                ${isCurrentMonth ? 'text-white' : 'text-gray-500'}
                ${isToday ? 'bg-blue-500 text-white px-2 py-1 rounded-full' : ''}
              `}>
                {format(day, 'd')}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 bg-transparent border-none cursor-pointer text-white hover:text-blue-400 transition-colors"
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
                  className="text-xs p-1.5 rounded truncate cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: getEventColor(event) + "33", borderLeft: `3px solid ${getEventColor(event)}` }}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    <span className="font-medium text-white">{event.title}</span>
                  </div>
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
    <div className="overflow-hidden text-white">
      <div className="w-full mx-auto py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-2 md:p-2.5 bg-blue-500/10 rounded-lg">
                <CalendarIcon className="h-5 md:h-6 w-5 md:w-6 text-blue-400" />
              </div>
              <ShinyText
                text="Calendar"
                disabled={false}
                speed={3}
                className='text-xl md:text-2xl font-bold'
              />
            </div>
            <p className="text-gray-400 text-sm md:text-lg ml-10 md:ml-14">Plan and organize your schedule</p>
          </div>

          <div style={{ zIndex: 9 }} className="flex mx-8 flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none" data-aos='fade-left' data-aos-delay="100">
              <Button
                className="rounded-md flex gap-2 w-full sm:w-[110px] items-center justify-center hover:shadow-[0px_0px_10px_white] hover:bg-white transition-all duration-900 cursor-pointer bg-white text-black"
                size="sm"
                onClick={goToToday}
              >
                <CalendarIcon size={16} className="hover:animate-pulse" /> Today
              </Button>
            </div>
        
            <div className="flex-1 sm:flex-none" data-aos='fade-left' data-aos-delay="200">
              <ShineButton
                className="rounded-md flex gap-2 w-full sm:w-[140px] h-8.5 items-center justify-center text-white"
                label="New Event"
                icon={<Plus size={16} className="hover:animate-pulse" />}
                size="sm"
                bgColor="linear-gradient(325deg, hsl(217 100% 56%) 0%, hsl(194 100% 69%) 55%, hsl(217 100% 56%) 90%)"
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
              />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-4 md:mb-6">
          <SpotlightCard
            spotlightColor="rgba(59, 130, 246, 0.10)"
            className="backdrop-blur-xl bg-transparent relative rounded-xl md:rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            <img loading="lazy" src="/design_2.jpg" className="absolute object-cover top-0 left-0 w-full h-fit -mt-60 opacity-15" alt="" />
            <div className="p-2 md:p-4" style={{ zIndex: 99999 }}>
              <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 overflow-x-auto pb-2" data-aos='fade-left' data-aos-delay="300">
                  <ButtonGroup className="flex-shrink-0">
                    <Button
                      onClick={() => handleExportCalendar('json')}
                      className="flex gap-1 md:gap-2 items-center justify-center bg-white hover:shadow-[0px_0px_10px_white] hover:bg-white transition-all duration-800 cursor-pointer text-black border-none text-xs md:text-sm"
                    >
                      <FileJson size={14} className="hover:animate-pulse" />
                      <span className="hidden sm:inline">JSON</span>
                    </Button>
                
                    <ButtonGroupSeparator />
                
                    <Button
                      onClick={() => handleExportCalendar('csv')}
                      className="flex gap-1 md:gap-2 items-center justify-center bg-white hover:shadow-[0px_0px_10px_white] hover:bg-white transition-all duration-800 cursor-pointer text-black border-none text-xs md:text-sm"
                    >
                      <FileSpreadsheet size={14} className="hover:animate-pulse" />
                      <span className="hidden sm:inline">CSV</span>
                    </Button>
                
                    <ButtonGroupSeparator />
                
                    <Button
                      onClick={() => handleExportCalendar('ical')}
                      className="flex gap-1 md:gap-2 items-center justify-center bg-white hover:shadow-[0px_0px_10px_white] hover:bg-white transition-all duration-800 cursor-pointer text-black border-none text-xs md:text-sm"
                    >
                      <CalendarFile size={14} className="hover:animate-pulse" />
                      <span className="hidden sm:inline">iCal</span>
                    </Button>
                  </ButtonGroup>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:gap-4">
                {/* View Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3" style={{ zIndex: 99999 }}>
                  <div className="flex items-center gap-1 md:gap-2 justify-between sm:justify-start">
                    <Button
                      onClick={() => navigateMonth('prev')}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-600 hover:text-gray-950 hover:border-blue-500 p-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                
                    <h2 className="text-lg md:text-xl font-bold text-white flex-1 sm:flex-none text-center">
                      {format(currentDate, 'MMM yyyy')}
                    </h2>
                
                    <Button
                      onClick={() => navigateMonth('next')}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-600 hover:text-gray-950 hover:border-blue-500 p-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* View Tabs - Horizontal scroll on mobile */}
                  <Tabs value={filters.view} onValueChange={(value) => setFilters({ ...filters, view: value })} className="w-full sm:w-auto">
                    <TabsList style={{ zIndex: 99999 }} className="bg-gray-800/50 border border-gray-700 w-full sm:w-auto grid grid-cols-3">
                      {viewOptions.map((view) => (
                        <TabsTrigger key={view.value} value={view.value} className={`text-xs md:text-sm py-2 ${filters.view === view.value ? '' : 'text-white'}`}>
                          {view.icon}
                          <span className="hidden sm:inline ml-1">{view.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* Filter Button */}
                  <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto" style={{ zIndex: 99999 }}>
                    <div className="flex-1 sm:flex-none" data-aos='fade-left' data-aos-delay="300">
                      <Button
                        className="rounded-md flex gap-2 w-full sm:w-[130px] items-center bg-transparent hover:bg-transparent cursor-pointer justify-center text-white text-sm"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter size={16} className="hover:animate-pulse" />
                        <span className="hidden sm:inline">Filters</span>
                      </Button>
                    </div>
                
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchEvents}
                      disabled={loading}
                      className="p-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="p-3 md:p-4 border border-gray-700 rounded-lg bg-gray-800/30 relative" style={{ zIndex: 50 }}>
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
            
                    {/* Additional Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={filters.upcoming_only}
                          onCheckedChange={(checked) => setFilters({ ...filters, upcoming_only: checked })}
                        />
                        <Label className="text-xs md:text-sm text-gray-400">Upcoming only</Label>
                      </div>
                  
                      <div className="w-full sm:w-auto" data-aos='fade-left' data-aos-delay="400">
                        <ShineButton
                          className="rounded-md flex gap-2 w-full sm:w-[150px] items-center justify-center text-white text-sm"
                          label="Clear"
                          icon={<X size={14} className="hover:animate-pulse" />}
                          size="sm"
                          bgColor="linear-gradient(325deg, hsl(217 100% 56%) 0%, hsl(194 100% 69%) 55%, hsl(217 100% 56%) 90%)"
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
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Calendar View */}
        <div className="mb-6">
          {filters.view === 'month' && (
            <div className="mb-4 grid grid-cols-7 gap-px bg-gray-800 rounded-lg overflow-hidden">
              {weekDays.map((day) => (
                <div key={day} className="p-3 text-center bg-gray-800/50 border-b border-gray-700">
                  <span className="text-sm font-semibold text-gray-400">{day}</span>
                </div>
              ))}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderView()
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-700 bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-white">{events.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-700 bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Upcoming</p>
                  <p className="text-2xl font-bold text-green-400">
                    {events.filter(e => !e.is_past).length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-700 bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {events.filter(e =>
                      new Date(e.start_date).getMonth() === currentDate.getMonth() &&
                      new Date(e.start_date).getFullYear() === currentDate.getFullYear()
                    ).length}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-700 bg-gray-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {getEventsForDate(new Date()).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
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