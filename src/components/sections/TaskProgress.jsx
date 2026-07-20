import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Filter, RefreshCw, Building2, Flag } from 'lucide-react'
import ShinyText from '../ui/ShinyText'
import SpotlightCard from '../ui/SpotlightCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { useSelector } from 'react-redux'
import { format, subDays, startOfMonth } from 'date-fns'

// Import shadcn charts
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { AreaChart, Area, BarChart, Bar, XAxis, CartesianGrid } from "recharts"

export default function TaskProgress() {
  const { user, access_token } = useSelector((state) => state.auth)
  const [tasks, setTasks] = useState([])
  const [statsData, setStatsData] = useState(null)
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    startup_id: 'all',
    status: 'all',
    priority: 'all',
    show_overdue_only: false,
    time_range: '30d'
  })

  const userStartups = user?.relationships?.startups || []
  const API_URL = import.meta.env.VITE_API_URL || ''

  // Fetch tasks on component mount and when filters change
  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [filters.time_range, filters.startup_id])

  // Apply filters when tasks change
  useEffect(() => {
    applyFilters()
  }, [tasks, filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.startup_id && filters.startup_id !== 'all') {
        params.append('startup_id', filters.startup_id)
      }
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      
      if (filters.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority)
      }
      
      if (filters.show_overdue_only) {
        params.append('show_overdue_only', 'true')
      }

      const url = `${API_URL}/tasks?${params.toString()}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setTasks(data.data?.tasks || [])
        // alert(JSON.stringify(data.data?.tasks))
      } else {
        console.error('API Error:', data.message)
        setTasks([])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams()
      params.append('time_range', filters.time_range)
      
      if (filters.startup_id && filters.startup_id !== 'all') {
        params.append('startup_id', filters.startup_id)
      }

      const url = `${API_URL}/tasks/stats?${params.toString()}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setStatsData(data.data)
      } else {
        console.error('Stats API Error:', data.message)
        setStatsData(null)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStatsData(null)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Apply startup filter
    if (filters.startup_id !== 'all') {
      filtered = filtered.filter(task => task.startup_id === parseInt(filters.startup_id))
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    // Apply overdue filter
    if (filters.show_overdue_only) {
      filtered = filtered.filter(task => task.is_overdue)
    }

    // Apply time range filter
    const cutoffDate = getCutoffDate(filters.time_range)
    filtered = filtered.filter(task => {
      const taskDate = new Date(task.created_at)
      return taskDate >= cutoffDate
    })

    setFilteredTasks(filtered)
  }

  const getCutoffDate = (range) => {
    const now = new Date()
    switch(range) {
      case '7d':
        return subDays(now, 7)
      case '30d':
        return subDays(now, 30)
      case '90d':
        return subDays(now, 90)
      case 'month':
        return startOfMonth(now)
      default:
        return subDays(now, 30)
    }
  }

  // Calculate statistics from filtered tasks
  const calculateStats = () => {
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length
    const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress').length
    const overdueTasks = filteredTasks.filter(task => task.is_overdue).length
    const todayTasks = filteredTasks.filter(task => task.status === 'today').length
    
    const totalTasks = filteredTasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    // Calculate on-time completion rate
    const completedOnTime = filteredTasks.filter(task => 
      task.status === 'completed' && task.is_on_time
    ).length
    const onTimeRate = completedTasks > 0 ? Math.round((completedOnTime / completedTasks) * 100) : 0
    
    return {
      completedTasks,
      inProgressTasks,
      overdueTasks,
      todayTasks,
      totalTasks,
      completionRate,
      onTimeRate,
      completedOnTime
    }
  }

  const stats = calculateStats()

  // Use stats data from API or calculate from filtered tasks
  const chartData = statsData?.daily_data || prepareChartDataFromTasks()
  const priorityDistribution = statsData?.stats?.priority_distribution || preparePriorityDataFromTasks()

  // Prepare chart data from tasks if no API data
  function prepareChartDataFromTasks() {
    const days = filters.time_range === '7d' ? 7 : filters.time_range === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      const dayTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.created_at)
        return format(taskDate, 'yyyy-MM-dd') === dateStr
      })
      
      const completed = dayTasks.filter(task => task.status === 'completed').length
      const inProgress = dayTasks.filter(task => task.status === 'in_progress').length
      const overdue = dayTasks.filter(task => task.is_overdue).length
      
      data.push({
        date: dateStr,
        displayDate: format(date, 'MMM dd'),
        completed,
        inProgress,
        overdue,
        total: dayTasks.length
      })
    }
    
    return data
  }

  // Prepare priority data from tasks if no API data
  // Prepare priority data from tasks if no API data
  function preparePriorityDataFromTasks() {
    const priorityCounts = {
      high: 0,
      medium: 0,
      low: 0
    }
    
    filteredTasks.forEach(task => {
      if (priorityCounts[task.priority] !== undefined) {
        priorityCounts[task.priority]++
      }
    })
    
    // Return as object (matching the API response format)
    return priorityCounts
  }

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "var(--chart-1)", // Green
    },
    inProgress: {
      label: "In Progress",
      color: "var(--chart-2)", // Blue
    },
    overdue: {
      label: "Overdue",
      color: "var(--chart-3)", // Red
    },
  }

  const PROGRESS_ITEMS = [
    {
      id: 1,
      title: "Total Tasks Completed",
      current: stats.completedTasks,
      total: stats.totalTasks,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      ringColor: "ring-emerald-500/20",
      textColor: "text-emerald-400",
      icon: <CheckCircle2 className="h-5 w-5" />
    },
    {
      id: 2,
      title: "Tasks On-time",
      current: stats.completedOnTime,
      total: stats.completedTasks || 1,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      ringColor: "ring-amber-500/20",
      textColor: "text-amber-400",
      icon: <Clock className="h-5 w-5" />
    },
    {
      id: 3,
      title: "Tasks Overdue",
      current: stats.overdueTasks,
      total: stats.totalTasks,
      color: "from-rose-500 to-red-600",
      bgColor: "bg-rose-500/10",
      ringColor: "ring-rose-500/20",
      textColor: "text-rose-400",
      icon: <AlertCircle className="h-5 w-5" />
    }
  ]

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Refresh both tasks and stats
  const handleRefresh = () => {
    fetchTasks()
    fetchStats()
  }

  return (
    <div className="overflow-hidden  text-white">
      <div className="w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-linear-to-br from-emerald-500/10 to-green-600/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <ShinyText 
              text="Task Progress" 
              disabled={false} 
              speed={3} 
              className='text-2xl font-bold' 
            />
          </div>
          <p className="text-gray-400 text-lg ml-14">Track your task completion and performance metrics</p>
        </div>

        {/* Filters and Controls */}
        <SpotlightCard
          spotlightColor='rgba(20, 181, 138, 0.20)'
          className="mb-6 bg-transparent relative backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
        >
            <img loading="lazy" src="/design.jpg" className=" absolute object-cover top-0 left-0  w-full h-fit -mt-40 opacity-15" alt="" />
        
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500/30 to-green-600/30"></div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Task Analytics Dashboard</h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {stats.totalTasks} tasks
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-700 hover:border-emerald-500  text-gray-900"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {showFilters && <span className="ml-2 text-emerald-400">✓</span>}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Startup Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Startup</Label>
                    <Select
                      value={filters.startup_id}
                      onValueChange={(value) => handleFilterChange('startup_id', value)}
                    >
                      <SelectTrigger className="border-gray-700 bg-gray-800/50">
                        <SelectValue placeholder="All startups" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Startups</SelectItem>
                        {userStartups.map(startup => (
                          <SelectItem key={startup.id} value={startup.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {startup.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger className="border-gray-700 bg-gray-800/50">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Priority</Label>
                    <Select
                      value={filters.priority}
                      onValueChange={(value) => handleFilterChange('priority', value)}
                    >
                      <SelectTrigger className="border-gray-700 bg-gray-800/50">
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3 text-red-400" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3 text-yellow-400" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3 text-green-400" />
                            Low
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Time Range</Label>
                    <Select
                      value={filters.time_range}
                      onValueChange={(value) => handleFilterChange('time_range', value)}
                    >
                      <SelectTrigger className="border-gray-700 bg-gray-800/50">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={filters.show_overdue_only}
                      onCheckedChange={(checked) => handleFilterChange('show_overdue_only', checked)}
                    />
                    <Label className="text-sm text-gray-400">Show overdue only</Label>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        startup_id: 'all',
                        status: 'all',
                        priority: 'all',
                        show_overdue_only: false,
                        time_range: '30d'
                      })
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SpotlightCard>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-700 bg-gray-800/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Completion Rate</p>
                      <p className="text-3xl font-bold text-emerald-400">{stats.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.completedTasks} of {stats.totalTasks} tasks completed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-800/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">On-time Rate</p>
                      <p className="text-3xl font-bold text-amber-400">{stats.onTimeRate}%</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <Clock className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.completedOnTime} tasks completed on time
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-800/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">In Progress</p>
                      <p className="text-3xl font-bold text-blue-400">{stats.inProgressTasks}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.todayTasks} tasks scheduled for today
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-800/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Overdue Tasks</p>
                      <p className="text-3xl font-bold text-rose-400">{stats.overdueTasks}</p>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-rose-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Requires immediate attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Area Chart for Task Trends */}
              <Card className="border-gray-700 bg-gray-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Task Completion Trends</CardTitle>
                  <CardDescription className="text-gray-400">
                    Daily task completion over {filters.time_range === '7d' ? '7 days' : filters.time_range === '30d' ? '30 days' : filters.time_range === '90d' ? '90 days' : 'this month'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <AreaChart 
                      data={chartData} 
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      width={500}
                      height={250}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" />
                      <XAxis
                        dataKey="displayDate"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={50}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent 
                            className="bg-gray-800 border-gray-700"
                            labelClassName="text-gray-300"
                            formatter={(value, name) => [
                              value, 
                              name === 'completed' ? 'Completed' : 
                              name === 'inProgress' ? 'In Progress' : 
                              'Overdue'
                            ]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="var(--chart-1)"
                        fill="url(#colorCompleted)"
                        strokeWidth={2}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="inProgress"
                        stroke="var(--chart-2)"
                        fill="url(#colorInProgress)"
                        strokeWidth={2}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="overdue"
                        stroke="var(--chart-3)"
                        fill="url(#colorOverdue)"
                        strokeWidth={2}
                        stackId="1"
                      />
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Bar Chart for Priority Distribution */}
              {/* Bar Chart for Priority Distribution */}
              <Card className="border-gray-700 bg-gray-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Task Priority Distribution</CardTitle>
                  <CardDescription className="text-gray-400">
                    Breakdown of tasks by priority level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {priorityDistribution && (
                    <>
                      <ChartContainer config={chartConfig}>
                        <BarChart 
                          data={[
                            { priority: 'High', value: priorityDistribution.high || 0, color: '#EF4444' },
                            { priority: 'Medium', value: priorityDistribution.medium || 0, color: '#F59E0B' },
                            { priority: 'Low', value: priorityDistribution.low || 0, color: '#10B981' }
                          ]} 
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          width={500}
                          height={250}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" vertical={false} />
                          <XAxis
                            dataKey="priority"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent 
                                className="bg-gray-800 border-gray-700"
                                labelClassName="text-gray-300"
                                formatter={(value) => [`${value} tasks`, 'Count']}
                              />
                            }
                          />
                          <Bar 
                            dataKey="value" 
                            fill={(entry) => entry.color || '#6B7280'}
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                          />
                        </BarChart>
                      </ChartContainer>
                      
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }} />
                          <span className="text-sm text-gray-300">High</span>
                          <span className="text-sm font-semibold text-white">{priorityDistribution.high || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }} />
                          <span className="text-sm text-gray-300">Medium</span>
                          <span className="text-sm font-semibold text-white">{priorityDistribution.medium || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }} />
                          <span className="text-sm text-gray-300">Low</span>
                          <span className="text-sm font-semibold text-white">{priorityDistribution.low || 0}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Bars */}
            <Card className="border-gray-700 bg-gray-800/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Detailed Progress Breakdown</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your performance across key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {PROGRESS_ITEMS.map((item) => {
                    const percentage = item.total > 0 ? Math.round((item.current / item.total) * 100) : 0
                    
                    return (
                      <div key={item.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.bgColor} ring-1 ${item.ringColor}`}>
                              <div className={item.textColor}>
                                {item.icon}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-white">{item.title}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="ml-2 bg-gray-700/50 text-gray-300 border-gray-600">
                                      {percentage}%
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{item.current} of {item.total}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{item.current}</div>
                            <div className="text-sm text-gray-400">of {item.total}</div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full bg-linear-to-r ${item.color} rounded-full transition-all duration-1000 ease-out relative`}
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="bg-gray-700/50" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className="border-gray-700 bg-gray-800/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Tasks</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest tasks with their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            task.priority === 'high' ? 'bg-rose-500/10 ring-1 ring-rose-500/20' :
                            task.priority === 'medium' ? 'bg-amber-500/10 ring-1 ring-amber-500/20' :
                            'bg-emerald-500/10 ring-1 ring-emerald-500/20'
                          }`}>
                            <Flag className={`h-4 w-4 ${
                              task.priority === 'high' ? 'text-rose-400' :
                              task.priority === 'medium' ? 'text-amber-400' :
                              'text-emerald-400'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${
                                task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                task.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                'bg-gray-500/10 text-gray-400 border-gray-500/30'
                              }`}>
                                {task.status}
                              </Badge>
                              {task.due_date && (
                                <span className="text-xs text-gray-400">
                                  Due: {format(new Date(task.due_date), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Progress</div>
                          <div className="text-lg font-bold text-white">{task.progress_percentage}%</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks found with current filters</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => {
                          setFilters({
                            startup_id: 'all',
                            status: 'all',
                            priority: 'all',
                            show_overdue_only: false,
                            time_range: '30d'
                          })
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        :root {
          --chart-1: #10B981;
          --chart-2: #3B82F6;
          --chart-3: #EF4444;
        }
      `}</style>
    </div>
  )
}