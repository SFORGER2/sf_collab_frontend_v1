import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Flame,
  Gift
} from "lucide-react";

const POINTS_DATA = {
  totalPoints: 2847,
  weeklyChange: 12.5,
  monthlyChange: 28.3,
  taskBreakdown: [
    {
      id: 1,
      task: "Frontend Development",
      points: 850,
      percentage: 29.8,
      completedTasks: 12,
      totalTasks: 15,
      trend: "up",
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      recentPoints: [
        { date: "Today", points: 50, task: "Login page redesign" },
        { date: "Yesterday", points: 75, task: "API integration" },
      ]
    },
    {
      id: 2,
      task: "Backend Development",
      points: 720,
      percentage: 25.3,
      completedTasks: 8,
      totalTasks: 12,
      trend: "up",
      icon: Activity,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      recentPoints: [
        { date: "Today", points: 40, task: "Database optimization" },
        { date: "2 days ago", points: 60, task: "Authentication system" },
      ]
    },
    {
      id: 3,
      task: "UI/UX Design",
      points: 560,
      percentage: 19.7,
      completedTasks: 6,
      totalTasks: 10,
      trend: "stable",
      icon: Star,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      recentPoints: [
        { date: "Yesterday", points: 35, task: "Design system update" },
        { date: "3 days ago", points: 45, task: "Mobile wireframes" },
      ]
    },
    {
      id: 4,
      task: "Testing & QA",
      points: 420,
      percentage: 14.8,
      completedTasks: 5,
      totalTasks: 8,
      trend: "down",
      icon: Target,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      recentPoints: [
        { date: "Today", points: 30, task: "Bug fixes" },
        { date: "4 days ago", points: 25, task: "Test cases" },
      ]
    },
    {
      id: 5,
      task: "Documentation",
      points: 297,
      percentage: 10.4,
      completedTasks: 4,
      totalTasks: 6,
      trend: "up",
      icon: Award,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      recentPoints: [
        { date: "2 days ago", points: 20, task: "API docs" },
        { date: "5 days ago", points: 15, task: "README update" },
      ]
    }
  ],
  consistencyPoints: {
    current: 450,
    total: 500,
    streak: 7,
    longestStreak: 12,
    dailyAverage: 65,
    weeklyData: [
      { day: "Mon", points: 85, target: 70 },
      { day: "Tue", points: 72, target: 70 },
      { day: "Wed", points: 90, target: 70 },
      { day: "Thu", points: 45, target: 70 },
      { day: "Fri", points: 68, target: 70 },
      { day: "Sat", points: 55, target: 50 },
      { day: "Sun", points: 35, target: 50 }
    ]
  }
};

export default function PointsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTask, setSelectedTask] = useState(null);

  const getTrendIcon = (trend) => {
    if (trend === "up") return <ArrowUpRight className="size-4 text-emerald-400" />;
    if (trend === "down") return <ArrowDownRight className="size-4 text-red-400" />;
    return <ArrowUpRight className="size-4 text-zinc-400 rotate-90" />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0f0f12]">
        <div className="mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold flex items-center gap-3 bg-gradient-to-r text-transparent bg-clip-text from-white to-gray-600">
                Points Dashboard
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Track your performance and rewards</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-zinc-600 bg-gray-900 p-4"
              >
                <Calendar className="size-4 mr-2" />
                This Week
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-6 lg:px-8 py-8">
        {/* Total Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[#18181b] to-[#1c1c20] border-zinc-800 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10">
                      <Trophy className="size-8 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Total Points Earned</p>
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-5xl bg-gradient-to-r text-transparent bg-clip-text from-white to-gray-600 font-bold">{POINTS_DATA.totalPoints.toLocaleString()}</h2>
                        <span className="text-emerald-400 text-sm flex items-center gap-1">
                          <ArrowUpRight className="size-4" />
                          {POINTS_DATA.weeklyChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-zinc-400">
                      Monthly: <span className="text-emerald-400">+{POINTS_DATA.monthlyChange}%</span>
                    </span>
                    <span className="text-zinc-400">
                      This week: <span className="text-white">+450 pts</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center px-4 py-3 rounded-xl bg-zinc-900">
                    <CheckCircle2 className="size-5 mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs text-zinc-400">Completed</p>
                    <p className="text-lg text-gray-500 font-semibold">35</p>
                  </div>
                  <div className="text-center px-4 py-3 rounded-xl bg-zinc-900">
                    <Star className="size-5 mx-auto mb-1 text-amber-400" />
                    <p className="text-xs text-zinc-400">Avg/Task</p>
                    <p className="text-lg text-gray-500 font-semibold">81</p>
                  </div>
                  <div className="text-center px-4 py-3 rounded-xl bg-zinc-900">
                    <TrendingUp className="size-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-xs text-zinc-400">Rank</p>
                    <p className="text-lg text-gray-500 font-semibold">#12</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-[#18181b] border-zinc-800 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl bg-gradient-to-br text-transparent bg-clip-text from-white to-gray-600 font-semibold">Task Breakdown</h3>
                    <p className="text-zinc-400 text-sm">Points distributed by task category</p>
                  </div>
                  <BarChart3 className="size-5 text-zinc-500" />
                </div>

                <div className="space-y-4">
                  {POINTS_DATA.taskBreakdown.map((task, index) => {
                    const Icon = task.icon;
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div 
                          className={`p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-all cursor-pointer ${
                            selectedTask === task.id ? 'ring-2 ring-white/20' : ''
                          }`}
                          onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${task.bgColor}`}>
                                <Icon className={`size-5 ${task.color}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-300 text-sm">{task.task}</p>
                                <p className="text-xs text-zinc-500">
                                  {task.completedTasks}/{task.totalTasks} tasks
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-400">{task.points} pts</p>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(task.trend)}
                                <span className="text-xs text-zinc-500">{task.percentage}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${task.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full rounded-full ${
                                task.color === 'text-blue-400' ? 'bg-blue-500' :
                                task.color === 'text-purple-400' ? 'bg-purple-500' :
                                task.color === 'text-amber-400' ? 'bg-amber-500' :
                                task.color === 'text-emerald-400' ? 'bg-emerald-500' :
                                'bg-rose-500'
                              }`}
                            />
                          </div>

                          {selectedTask === task.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-4 pt-4 border-t border-zinc-800 space-y-2"
                            >
                              <p className="text-xs text-zinc-500 mb-2">Recent Activity</p>
                              {task.recentPoints.map((point, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-zinc-400">{point.task}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-500">{point.date}</span>
                                    <span className="font-medium text-emerald-400">+{point.points} pts</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consistency Points */}
          <div>
            <Card className="bg-[#18181b] border-zinc-800 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl bg-gradient-to-b text-transparent bg-clip-text from-white to-gray-600 font-semibold">Consistency</h3>
                    <p className="text-zinc-400 text-sm">Streak & daily performance</p>
                  </div>
                  <Flame className="size-5 text-orange-400" />
                </div>

                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="size-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-zinc-800"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        className="text-orange-400"
                        initial={{ pathLength: 0 }}
                        animate={{ 
                          pathLength: (POINTS_DATA.consistencyPoints.current / POINTS_DATA.consistencyPoints.total) 
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - POINTS_DATA.consistencyPoints.current / POINTS_DATA.consistencyPoints.total)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl text-gray-200 font-bold">{POINTS_DATA.consistencyPoints.current}</span>
                      <span className="text-xs text-zinc-500">/ {POINTS_DATA.consistencyPoints.total}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-zinc-900/50 text-center">
                    <Flame className="size-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-sm text-gray-200 font-semibold">{POINTS_DATA.consistencyPoints.streak} days</p>
                    <p className="text-xs text-zinc-500">Current Streak</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/50 text-center">
                    <Trophy className="size-5 mx-auto mb-1 text-amber-400" />
                    <p className="text-sm text-gray-200 font-semibold">{POINTS_DATA.consistencyPoints.longestStreak} days</p>
                    <p className="text-xs text-zinc-500">Longest Streak</p>
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Daily Average</span>
                    <span className="font-semibold text-gray-500">{POINTS_DATA.consistencyPoints.dailyAverage} pts/day</span>
                  </div>
                  <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(POINTS_DATA.consistencyPoints.dailyAverage / 100) * 100}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Weekly Breakdown */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-3">This Week</p>
                  <div className="space-y-2">
                    {POINTS_DATA.consistencyPoints.weeklyData.map((day, index) => (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-zinc-400 w-8">{day.day}</span>
                        <div className="flex-1 mx-3">
                          <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(day.points / day.target) * 100}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                day.points >= day.target ? 'bg-emerald-500' : 'bg-orange-500'
                              }`}
                            />
                          </div>
                        </div>
                        <span className={`w-12 text-right ${
                          day.points >= day.target ? 'text-emerald-400' : 'text-orange-400'
                        }`}>
                          {day.points}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
                    <span>Target: 70 pts</span>
                    <span>Average: 64 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Tasks Completed", value: "35", icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
            { label: "Current Streak", value: "7 days", icon: Flame, color: "text-orange-400", bgColor: "bg-orange-500/10" },
            { label: "Points Today", value: "120", icon: Zap, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
            { label: "Rewards Available", value: "3", icon: Gift, color: "text-pink-400", bgColor: "bg-pink-500/10" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-[#18181b] border-zinc-800 hover:border-zinc-700 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`size-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                        <p className="text-lg text-gray-400 font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}