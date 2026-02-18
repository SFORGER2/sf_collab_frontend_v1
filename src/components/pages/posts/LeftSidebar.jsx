
import {
  Video,
  Send,
  Heart,
  Home,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { BarChart3, Settings } from "./Icons";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { usersAPI } from "@/utils/APIs/userAPI";
import { userSocialAPI } from "@/utils/APIs/socialAPI";

// Left Sidebar Component - NEW
export default function LeftSidebar({ activeTab, onTabChange, onSettingsClick }) {
  const { user, access_token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (user && access_token) {
        try {
          const followersRes = await usersAPI.getFollowersCount(user.id, access_token);
          const followingRes = await usersAPI.getFollowingCount(user.id, access_token);
          setFollowersCount(followersRes.data.followersCount);
          setFollowingCount(followingRes.data.followingCount);
        } catch (error) {
          console.error('Error fetching follow counts:', error);
        }
      }
    };
    fetchCounts();
  }, [user, access_token]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (user && access_token) {
        try {
          const res = await userSocialAPI.getSuggestions(5);
          setSuggestions(res.suggestions || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }
    };
    fetchSuggestions();
  }, [user, access_token]);

  const menuItems = [
    { icon: Home, label: "Feed", id: "feed" },
    { icon: Search, label: "Explore", id: "explore" },
    { icon: Heart, label: "My Favorites", id: "favorites" },
    { icon: Send, label: "Direct", id: "direct" },
    { icon: Video, label: "16 TV", id: "tv" },
    { icon: BarChart3, label: "Stats", id: "stats" },
    { icon: Settings, label: "Setting", id: "settings" },
  ];

  const handleMenuClick = (item) => {
    if (item.id === "settings") {
      onSettingsClick();
      return;
    }

    if (item.id === "direct") {
      // navigate to chat page
      navigate("/chat");
      return;
    }

    onTabChange(item.id);
  };

  const handleFollowUser = async (suggestedUser) => {
    try {
      await userSocialAPI.followUser(suggestedUser._id);
      // Remove from suggestions after following
      setSuggestions(suggestions.filter(s => s._id !== suggestedUser._id));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await userSocialAPI.searchUsers(query);
      setSearchResults(res.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="w-80 space-y-2">
      {/* Search Card */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm outline-none border border-zinc-700 focus:border-blue-400"
            />
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  className="flex items-center justify-between p-2 hover:bg-zinc-800/30 rounded cursor-pointer"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={result.picture} />
                      <AvatarFallback>{result.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {result.firstName} {result.lastName}
                      </p>
                      <p className="text-xs text-zinc-400">{result.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleFollowUser(result)}
                    variant="outline"
                    className="text-xs border-blue-400/50 text-gray-200 bg-gray-900 hover:bg-blue-600 hover:text-white"
                  >
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-blue-400/50">
              <AvatarImage src={getProfilePicture(user)} />
              <AvatarFallback>{user?.firstName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-white">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-zinc-400">{user?.location || 'Location not set'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <p className="font-bold text-white">{followersCount}</p>
              <p className="text-xs text-zinc-400">Followers</p>
            </div>
            <div>
              <p className="font-bold text-white">{followingCount}</p>
              <p className="text-xs text-zinc-400">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => handleMenuClick(item)}
                className={`w-full justify-start mb-2 ${
                  (activeTab === item.id || item.id === "settings")
                    ? "bg-gray-700 text-white border-blue-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <h3 className="font-semibold text-white">Suggestions for you</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {suggestions.length > 0 ? suggestions.map((suggestedUser) => (
              <div
                key={suggestedUser._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={suggestedUser.profile?.picture} />
                    <AvatarFallback>{suggestedUser.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {suggestedUser.firstName} {suggestedUser.lastName}
                    </p>
                    <p className="text-xs text-zinc-400">Not following</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleFollowUser(suggestedUser)}
                  variant="outline"
                  className="text-xs border-blue-400/50 text-gray-200 bg-gray-900 hover:bg-blue-600 hover:text-white hover:cursor-pointer"
                >
                  Follow
                </Button>
              </div>
            )) : 
            <p className="text-sm text-zinc-400">No suggestions available.</p>
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
