import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowLeft 
} from "lucide-react";

const MOCK_WARNINGS = [
  {
    id: 1,
    title: "3 builders have not submitted daily updates for the marketing campaign review and strategy session",
    description: "Sarah, Mike, Priya from the design team have not submitted their daily progress updates for the last 4 hours",
    severity: "high",
    status: "active",
    time: "Just now",
    icon: AlertTriangle,
    color: "text-red-400"
  },
  {
    id: 2,
    title: "Project budget for Q2 exceeded by 8%",
    description: "Finance flag • Budget variance detected",
    severity: "medium",
    status: "active",
    time: "2 hours ago",
    icon: AlertTriangle,
    color: "text-amber-400"
  },
  {
    id: 3,
    title: "Pitch deck v2 is overdue and needs immediate attention from the design lead",
    description: "Due 2 days ago • Blocker for investor meeting • This is a critical deliverable that requires immediate attention from the entire team",
    severity: "high",
    status: "active",
    time: "Yesterday",
    icon: AlertTriangle,
    color: "text-red-400"
  },
  {
    id: 4,
    title: "CI/CD pipeline blocked due to configuration errors in the deployment scripts",
    description: "Deployment to staging failed • 3 attempts • Build errors detected in the latest commit",
    severity: "medium",
    status: "acknowledged",
    time: "5 hours ago",
    icon: AlertTriangle,
    color: "text-amber-400"
  },
];

export default function WarningDashboard() {
  const [warnings, setWarnings] = useState(MOCK_WARNINGS);
  const [filter, setFilter] = useState("all");

  const filteredWarnings = warnings.filter(w => {
    if (filter === "active") return w.status === "active";
    if (filter === "acknowledged") return w.status === "acknowledged";
    return w.status !== "dismissed";
  });

  const handleAction = (id, action) => {
    setWarnings(prev => prev.map(w => {
      if (w.id === id) {
        if (action === "resolve") return { ...w, status: "resolved" };
        if (action === "acknowledge") return { ...w, status: "acknowledged" };
        if (action === "dismiss") return { ...w, status: "dismissed" };
      }
      return w;
    }));
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return "bg-red-500/10 text-red-400 border-red-500/30";
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  };

  const getStatusBadge = (status) => {
    if (status === "resolved") return <Badge className="bg-emerald-500/10 text-emerald-400">Resolved</Badge>;
    if (status === "acknowledged") return <Badge className="bg-blue-500/10 text-blue-400">Acknowledged</Badge>;
    if (status === "dismissed") return <Badge className="bg-zinc-600 text-zinc-400">Dismissed</Badge>;
    return <Badge className="bg-red-500/10 text-red-400">Active</Badge>;
  };

  const activeCount = warnings.filter(w => w.status === "active").length;
  const acknowledgedCount = warnings.filter(w => w.status === "acknowledged").length;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0f0f12]">
        <div className="mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-gray-700">
                <ArrowLeft className="size-5" />
              </Button>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <h1 className="text-3xl font-semibold">Warnings</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Monitor • {activeCount} active, {acknowledgedCount} acknowledged
                </p>
              </div>
            </div>
            <div className="text-sm text-zinc-400 hidden sm:block">Last updated: Just now</div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <Button 
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={`bg-gray-700 text-white hover:bg-gray-400 hover:text-gray-200 ${filter === "all" ? "bg-white text-black" : "border-zinc-700"}`}
          >
            All
          </Button>
          <Button 
            onClick={() => setFilter("active")}
            variant={filter === "active" ? "default" : "outline"}
            className={`bg-gray-700 text-white hover:bg-gray-400 hover:text-gray-200 ${filter === "active" ? "bg-white text-black" : "border-zinc-700"}`}
          >
            Active ({activeCount})
          </Button>
          <Button 
            onClick={() => setFilter("acknowledged")}
            variant={filter === "acknowledged" ? "default" : "outline"}
            className={`bg-gray-700 text-white hover:bg-gray-400 hover:text-gray-200 ${filter === "acknowledged" ? "bg-white text-black" : "border-zinc-700"}`}
          >
            Acknowledged ({acknowledgedCount})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarnings.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <CheckCircle className="size-16 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-xl font-medium">All clear</h3>
              <p className="text-zinc-500">No warnings match your filter</p>
            </div>
          ) : (
            filteredWarnings.map((warning, index) => {
              const Icon = warning.icon;
              return (
                <motion.div
                  key={warning.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <Card className="bg-[#18181b] border-zinc-800 hover:border-zinc-700 transition-all duration-300 group h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className={`p-3 rounded-xl bg-zinc-900 shrink-0 ${warning.color}`}>
                          <Icon className="size-5" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Badge className={getSeverityColor(warning.severity)}>
                            {warning.severity}
                          </Badge>
                          {getStatusBadge(warning.status)}
                        </div>
                      </div>

                      <div className="flex-1 min-h-0">
                        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">
                          {warning.title}
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                          {warning.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-4 pt-4 border-t border-zinc-800">
                        <Clock className="size-4 shrink-0" />
                        <span className="truncate">{warning.time}</span>
                      </div>

                      {/* Action Buttons*/}
                      <div className="mt-3">
                        {warning.status === "active" && (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-700 hover:bg-zinc-800 hover:text-gray-200 flex-1 text-xs sm:text-sm"
                                onClick={() => handleAction(warning.id, "acknowledge")}
                              >
                                <Eye className="size-3.5 mr-1.5 shrink-0" />
                                <span className="truncate">Acknowledge</span>
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 text-xs sm:text-sm"
                                onClick={() => handleAction(warning.id, "resolve")}
                              >
                                <CheckCircle className="size-3.5 mr-1.5 shrink-0" />
                                <span className="truncate">Resolve</span>
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 w-full text-xs sm:text-sm border border-zinc-700 hover:border-none"
                              onClick={() => handleAction(warning.id, "dismiss")}
                            >
                              <XCircle className="size-3.5 mr-1.5 shrink-0" />
                              <span className="truncate">Dismiss</span>
                            </Button>
                          </div>
                        )}

                        {warning.status === "acknowledged" && (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full text-xs sm:text-sm"
                              onClick={() => handleAction(warning.id, "resolve")}
                            >
                              <CheckCircle className="size-3.5 mr-1.5 shrink-0" />
                              <span className="truncate">Resolve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 w-full text-xs sm:text-sm border border-zinc-700 hover:border-none"
                              onClick={() => handleAction(warning.id, "dismiss")}
                            >
                              <XCircle className="size-3.5 mr-1.5 shrink-0" />
                              <span className="truncate">Dismiss</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}