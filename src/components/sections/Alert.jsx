import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react';
import '../style/Alert.css';

const Alert = ({
  variant = 'info',
  title,
  message,
  showIcon = true,
  dismissible = false,
  actions,
  onDismiss,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  const variantConfig = {
    success: {
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      bgOverlay: 'bg-emerald-500/5'
    },
    error: {
      icon: XCircle,
      gradient: 'from-red-500/20 to-rose-500/20',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      bgOverlay: 'bg-red-500/5'
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      bgOverlay: 'bg-amber-500/5'
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      bgOverlay: 'bg-blue-500/5'
    },
    neutral: {
      icon: Sparkles,
      gradient: 'from-slate-500/20 to-gray-500/20',
      border: 'border-slate-500/30',
      iconColor: 'text-slate-400',
      bgOverlay: 'bg-slate-500/5'
    }
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        ${config.border} border
        backdrop-blur-xl
        bg-gradient-to-br ${config.gradient}
        shadow-2xl shadow-black/10
        transition-all duration-300
        ${isExiting ? 'animate-fadeOut' : 'animate-fadeIn'}
        hover:shadow-3xl hover:scale-[1.01]
        ${className}
      `}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      {/* Glass overlay */}
      <div className={`absolute inset-0 ${config.bgOverlay}`} />
      
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      
      {/* Content container */}
      <div className="relative px-6 py-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {showIcon && (
            <div className={`flex-shrink-0 ${config.iconColor} animate-iconBounce`}>
              <IconComponent className="w-6 h-6" strokeWidth={2} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">
                {title}
              </h3>
            )}
            {message && (
              <p className="text-sm text-gray-200/90 leading-relaxed">
                {message}
              </p>
            )}

            {/* Actions */}
            {actions && (
              <div className="mt-4 flex flex-wrap gap-2">
                {actions}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 hover:rotate-90 transform"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r ${config.gradient} opacity-50`} />
    </div>
  );
};

// Demo Component
const AlertDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Futuristic Alert System
          </h1>
          <p className="text-gray-400">Premium glassmorphism alerts for B2B SaaS</p>
        </div>

        {/* Success Alert */}
        <Alert
          variant="success"
          title="Deployment Successful"
          message="Your application has been deployed to production successfully. All systems are operational."
          showIcon={true}
          dismissible={true}
          actions={
            <>
              <button className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition-all duration-200 border border-emerald-500/30">
                View Details
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all duration-200">
                Dismiss
              </button>
            </>
          }
        />

        {/* Error Alert */}
        <Alert
          variant="error"
          title="Authentication Failed"
          message="Unable to verify your credentials. Please check your email and password."
          showIcon={true}
          dismissible={true}
          actions={
            <button className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium transition-all duration-200 border border-red-500/30">
              Retry Login
            </button>
          }
        />

        {/* Warning Alert */}
        <Alert
          variant="warning"
          title="Storage Limit Approaching"
          message="You've used 85% of your storage quota. Consider upgrading your plan or removing unused files."
          showIcon={true}
          dismissible={true}
          actions={
            <>
              <button className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium transition-all duration-200 border border-amber-500/30">
                Upgrade Plan
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all duration-200">
                Manage Storage
              </button>
            </>
          }
        />

        {/* Info Alert */}
        <Alert
          variant="info"
          title="New Feature Available"
          message="We've just released advanced analytics for your dashboard. Check it out now!"
          showIcon={true}
          dismissible={true}
          actions={
            <button className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium transition-all duration-200 border border-blue-500/30">
              Learn More
            </button>
          }
        />

        {/* Neutral Alert */}
        <Alert
          variant="neutral"
          title="System Maintenance"
          message="Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM UTC."
          showIcon={true}
          dismissible={false}
        />

        {/* Minimal Alert (no icon, no title) */}
        <Alert
          variant="success"
          message="Changes saved automatically"
          showIcon={false}
          dismissible={true}
        />

        {/* Floating Toast Example */}
        <div className="fixed top-6 right-6 w-96">
          <Alert
            variant="info"
            title="Toast Notification"
            message="This alert can be positioned anywhere on the screen."
            showIcon={true}
            dismissible={true}
          />
        </div>
      </div>


    </div>
  );
};

export default Alert;