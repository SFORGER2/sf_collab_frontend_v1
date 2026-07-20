// ============================================
// AVATAR COMPONENT

import { Globe, Shield, Users } from "lucide-react"

// ============================================
export default function NotificationAvatar({ src, name, type }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Different styles for different conversation types
  const typeStyles = {
    general: 'from-emerald-500 to-teal-600',
    team: 'from-violet-500 to-purple-600',
    group: 'from-blue-500 to-indigo-600',
    direct: 'from-amber-500 to-orange-600'
  };

  const TypeIcon = {
    general: Globe,
    team: Shield,
    group: Users,
    direct: null
  }[type];

  if (!src && TypeIcon && (type === "general" || type === "team")) {
    return (
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${typeStyles[type]} flex items-center justify-center shadow-lg`}>
        <TypeIcon size={22} className="text-white" />
      </div>
    );
  }



  return src ? (
    <img loading="lazy" 
      src={src} 
      alt={name} 
      className="w-12 h-12 rounded-2xl object-cover shadow-lg ring-2 ring-white/10" 
    />
  ) : (
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${typeStyles[type] || typeStyles.direct} flex items-center justify-center shadow-lg font-semibold text-white`}>
      {initials}
    </div>
  );
};