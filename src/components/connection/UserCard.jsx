import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LinkIcon, MapPin, Users, MessageCircle } from 'lucide-react';
import { ConnectionButton } from '@/components/connection/ConnectionButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_HOST = API_URL.replace(/\/api\/?$/, "");


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function UserCard({
  user,
  index,
  onUserClick,
  onSendMessage,
  currentUser,
}) {
  const isCurrentUser = currentUser?.id === user.id;

  // Get full name
  const fullName = user.fullName || 
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
    'Unknown User';

  // Get avatar URL
  const getAvatarUrl = () => {
  const pic =
    user.avatar_url ||
    user.profile?.picture ||
    user.profile_picture ||
    user.profile?.avatar ||
    user.profilePicture ||
    null;

  if (!pic) return null;

  const s = String(pic);

  // already absolute
  if (s.startsWith("http")) return s;

  // relative path -> use host (NOT /api)
  return `${API_HOST}${s.startsWith("/") ? "" : "/"}${s}`;
};



  const avatarUrl = getAvatarUrl();
  const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  // Get location
  const location = user.location || 
    (user.profile?.city ? `${user.profile.city}${user.profile.country ? `, ${user.profile.country}` : ''}` : null);

  return (
    <motion.div variants={cardVariants} key={index}>
      <Card
        onClick={() => onUserClick(user.id)}
        className="group relative h-full overflow-hidden bg-slate-800/50 backdrop-blur-xl 
                   border border-slate-700/50 hover:border-blue-500/30 rounded-2xl 
                   transition-all duration-300 hover:-translate-y-1 hover:shadow-xl 
                   hover:shadow-blue-500/10 cursor-pointer"
      >
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-600/0 to-pink-500/0 
                        group-hover:from-blue-500/5 group-hover:via-purple-600/5 group-hover:to-pink-500/5 
                        transition-all duration-300" />

        <div className="relative p-6 flex flex-col h-full">
          {/* Avatar & Header */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br 
                         from-blue-500 to-purple-600 ring-2 ring-slate-700 shadow-lg"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ee.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 
                           flex items-center justify-center text-white font-bold text-lg
                           ${avatarUrl ? 'hidden' : 'flex'}`}
              >
                {initials || '?'}
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 
                           transition-colors truncate">
                {fullName}
              </h3>
              {(user.title || user.profile?.title) && (
                <p className="text-sm text-blue-400 font-medium truncate">
                  {user.title || user.profile?.title}
                </p>
              )}
              {(user.company || user.profile?.company) && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                  <LinkIcon className="w-3 h-3 flex-shrink-0" />
                  {user.company || user.profile?.company}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {(user.bio || user.profile?.bio) && (
            <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
              {user.bio || user.profile?.bio}
            </p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {location && (
              <Badge variant="outline" className="text-xs bg-slate-700/50 border-slate-600 text-slate-300">
                <MapPin className="w-3 h-3 mr-1" />
                {location}
              </Badge>
            )}
            {user.expertise && (
              <Badge variant="outline" className="text-xs bg-blue-500/20 border-blue-500/40 text-blue-300">
                {user.expertise}
              </Badge>
            )}
            {user.role && user.role !== 'member' && (
              <Badge variant="outline" className="text-xs bg-purple-500/20 border-purple-500/40 text-purple-300 capitalize">
                {user.role}
              </Badge>
            )}
          </div>

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {user.skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs bg-slate-700/50 border-slate-600 text-slate-300"
                >
                  {skill}
                </Badge>
              ))}
              {user.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-slate-700/50 border-slate-600 text-slate-300">
                  +{user.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 
                         py-3 border-t border-b border-slate-700">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {user.followers || user.connections_count || 0} connections
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {user.contributions || user.posts_count || 0} posts
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-4">
            {!isCurrentUser ? (
              <>
                {/* Message Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendMessage(user.id, e);
                  }}
                  className="flex-1 text-xs border-slate-600 text-slate-300 
                           hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Message
                </Button>

                {/* Connection Button - Handles all states automatically */}
                <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                  <ConnectionButton
                    userId={user.id}
                    size="sm"
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="w-full text-xs border-slate-600 text-slate-500 cursor-default"
              >
                Your Profile
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
