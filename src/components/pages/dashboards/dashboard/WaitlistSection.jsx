import { Link } from "react-router-dom";

export default function WaitlistSection() {
  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 backdrop-blur-sm p-5">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            
      {/* Content */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Get Early Access</h1>
      <div className="relative m-2 z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          
          <p className="text-white/70">Join our waitlist for anticipated access to premium features. Be among the first to unlock exclusive benefits.</p>
        </div>
              
        <div className="md:absolute md:bottom-1 md:right-1 flex flex-wrap gap-4 flex-shrink-0">
          {/*                 
                <a href="/waitlist" className="w-full sm:w-auto group relative px-6 py-3 bg-blue-500/80 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 border border-blue-400/50 hover:border-blue-300">
                  <span className="relative flex items-center gap-2">
                    Join Waitlist
                    <span className="text-xs bg-blue-400/40 px-2 py-1 rounded-full ml-2">Anticipated</span>
                  </span>
                </a>
                 */}
          <Link to="/refer" className="w-full sm:w-auto group relative px-6 py-3 bg-purple-500/80 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 border border-purple-400/50 hover:border-purple-300">
            <span className="relative flex items-center gap-2">
              Refer & Earn
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};