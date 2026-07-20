import { Card } from "@/components/ui/card";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { useMemo, useState } from "react";
import { getAvatarUrl } from '@/utils/getMediaUrl';

export default function UserCard({
  user,
  subtitle,
  actions,
  onClick,
  isLoading,
}) {
  const [imageError, setImageError] = useState(false);

  const fullName = user
    ? `${user.first_name || user.firstName || ""} ${
        user.last_name || user.lastName || ""
      }`.trim() || "Unknown"
    : "Unknown";

  const initials = `${(user?.first_name || user?.firstName || "")
    .charAt(0)}${(user?.last_name || user?.lastName || "")
    .charAt(0)}`.toUpperCase();

  const avatarUrl = useMemo(() => getProfilePicture(user), [user]);
  const showImage = avatarUrl && !imageError;

  return (
    <Card
      onClick={onClick}
      className={`p-3 my-2 sm:p-5 bg-slate-800/50 border-slate-700 cursor-pointer transition ${isLoading ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          {showImage ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-base sm:text-lg">{initials || "?"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm sm:text-base">{fullName}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 truncate">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:ml-auto" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}
