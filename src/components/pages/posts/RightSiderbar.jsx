import { motion } from "framer-motion";
import {
  MoreHorizontal,

  Search
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";

// Right Sidebar Component - NEW
export default function RightSidebar({ socialProfile }) {
  const trending = [
    // { hashtag: "#WebDevelopment", posts: "24.3K" },
    // { hashtag: "#ReactJS", posts: "18.7K" },
    // { hashtag: "#UIUX", posts: "12.4K" },
    // { hashtag: "#Startup", posts: "9.8K" },
  ];
  const usersActive = []
  return (
    <div className="w-80 space-y-2 ">
      {/* Search */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trending Feeds */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Trending Feeds</h3>
            
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {trending.map((trend, index) => (
              <div
                key={trend.hashtag}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-black rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {trend.hashtag}
                    </p>
                    <p className="text-xs text-zinc-400">{trend.posts} posts</p>
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-zinc-400" />
              </div>
            ))}
            {
              trending.length === 0 && (
                <p className="text-sm text-zinc-400">No trending feeds available.</p>
              )
            }
          </div>
        </CardContent>
      </Card>

      {/* Profile Activity */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <h3 className="font-semibold text-white">Profile Activity</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-800 mx-auto mb-2">
                  <img
                    src={socialProfile?.profile?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(socialProfile?.firstName || 'U')}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Active indicator */}
                { (socialProfile?.isOnline || (socialProfile?.lastActive && (new Date() - new Date(socialProfile.lastActive) < 1000 * 60 * 5))) ? (
                  <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                ) : (
                  <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-zinc-600 rounded-full border-2 border-zinc-900"></div>
                )}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white">{socialProfile?.followersCount || 0}</p>
                <p className="text-sm text-zinc-400">{socialProfile && socialProfile.followersCount !== 1 ? "Followers" : "Follower"}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-4">
            <p className="text-sm text-blue-300 font-medium mb-2">
              Active now on your profile
            </p>
            <p className="text-xs text-zinc-400">
              Apply for a feature following the link in our bio and we will
              publish your photos in our account: @travelsfever
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Online Friends */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <h3 className="font-semibold text-white">Active Now</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            {usersActive.map((i) => (
              <div key={i} className="text-center">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-green-500">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?img=${i + 20}`}
                    />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                </div>
                <p className="text-xs text-zinc-400 mt-1">User{i}</p>
              </div>
            ))}
            {
              usersActive.length === 0 && (
                <p className="text-sm text-zinc-400">No friends online.</p>
              )
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
