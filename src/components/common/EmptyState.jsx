import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

/**
 * Reusable EmptyState Component
 * 
 * Props:
 * @param {string} [title="Nothing found"] - Main heading
 * @param {string} [description="No data available right now."] - Short details paragraph
 * @param {string} [buttonText="Complete Your Profile"] - CTA button text
 * @param {function} [onButtonClick] - Custom click handler (defaults to navigating to profile-setup)
 * @param {React.Component} [icon=Sparkles] - Lucide icon component to show at the top
 */
export default function EmptyState({
  title = "Nothing found",
  description = "No data available right now.",
  buttonText = "Complete Your Profile",
  onButtonClick,
  icon = Sparkles,
}) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      // Navigate to existing profile completion route
      navigate('/profile-setup');
    }
  };

  const IconComponent = icon;

  return (
    <div
      className="flex flex-col items-center justify-center p-8 md:p-12 text-center 
                 bg-slate-900/40 border border-slate-700/30 rounded-2xl backdrop-blur-md 
                 max-w-lg mx-auto w-full my-8 shadow-xl animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Centered Graphic Box */}
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
          <IconComponent className="w-10 h-10" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      <Button
        onClick={handleButtonClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 
                   rounded-xl transition-all shadow-lg shadow-blue-500/15 flex items-center gap-2"
      >
        {buttonText}
      </Button>
    </div>
  );
}
