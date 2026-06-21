import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";

export default function ActivityItem({ activity }) {
  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInMins = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="p-4 border border-gray-800 bg-gray-900/50 flex gap-4 h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-20">
        <TrendingUp className="w-24 h-24" />
      </div>
      <div className="mt-1 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start gap-2">
           <h4 className="text-sm font-semibold text-white">
             {activity?.startupName || 'Startup Activity'}
           </h4>
           <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 whitespace-nowrap">
             <Clock className="w-3 h-3" />
             {formatTimestamp(activity?.timestamp)}
           </span>
        </div>
        
        <p className="text-sm text-gray-300 font-medium">
          {activity?.milestone || 'Completed a milestone'}
        </p>
        
        {activity?.details && (
           <p className="text-xs text-gray-500 line-clamp-2 mt-1">
             {activity.details}
           </p>
        )}
      </div>
    </Card>
  );
}
