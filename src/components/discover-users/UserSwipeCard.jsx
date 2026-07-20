import { API_URL } from "@/utils/config";
import { 
  MapPin, Briefcase, 
  Users, 
  Eye,
  Badge
} from 'lucide-react';
export default function UserSwipeCard({ user, onViewProfile }) {
  // Determine role color
  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-700 border-red-200',
      'moderator': 'bg-purple-100 text-purple-700 border-purple-200',
      'member': 'bg-blue-100 text-blue-700 border-blue-200',
      'founder': 'bg-green-100 text-green-700 border-green-200',
      'investor': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="absolute w-full h-[400px] cursor-grab select-none"  
      onMouseDown={(e) => {
        e.target.classList.remove('cursor-grab');
        e.target.classList.add('cursor-grabbing');
      }}
      onMouseUp={(e) => {
        e.target.classList.remove('cursor-grabbing');
        e.target.classList.add('cursor-grab');
      }}
    >
      <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 
                      rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/90 z-10" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col p-6 z-20">
          {/* Avatar section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              {user?.profile?.picture ? (
                <img
                  src={`${API_URL}${user?.profile?.picture}`}
                  alt={user?.fullName}
                  className="w-20 h-20 rounded-full border-4 border-slate-700 shadow-lg bg-slate-800 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center text-white font-bold text-2xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              )}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center text-white font-bold text-2xl hidden">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${user?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} rounded-full border-4 border-slate-900`} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user?.fullName}</h2>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Briefcase size={14} />
                <span className="text-sm">{user?.profile?.company || 'No company'}</span>
              </div>
              <Badge className={`text-xs border ${getRoleColor(user?.role)}`}>
                {user?.role}
              </Badge>
            </div>
          </div>

          {/* Bio */}
          <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {user?.profile?.bio || `${user?.fullName} is an active member of the community.`}
          </p>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-white">{user?.xp_points || 0}</div>
              <div className="text-xs text-slate-400">XP</div>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-white">{user?.streak_days || 0}</div>
              <div className="text-xs text-slate-400">Streak</div>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-green-400">{user?.satisfaction_percentage || 100}%</div>
              <div className="text-xs text-slate-400">Satisfaction</div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="text-sm">
                  {user?.profile?.city ? `${user?.profile.city}, ${user?.profile.country}` : 'Location not set'}
                </span>
              </div>
              <span className="text-sm">·</span>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span className="text-sm">{user?.active_startups_count || 0} startups</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(user);
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-500/50 
                       hover:to-purple-500/50 text-white rounded-xl border border-blue-500/20 
                       transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              View Full Profile
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};