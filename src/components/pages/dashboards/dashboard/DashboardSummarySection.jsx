import GlareHover from "@/components/ui/GlareHover";

export default function DashboardSummaryCard({ userData }) {
  console.log(userData);
  return (
    <div className="w-full my-6">
      <div className="relative overflow-hidden rounded-2xl transition-all">
        <div className="w-full">
          <div className="relative z-10">
            <GlareHover
              width="100%"
              height="100%"
              glareColor="#ffffff"
              glareOpacity={0.3}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              playOnce={true}
            >
              <div className="w-full group relative flex flex-col gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500/30 to-purple-600/30 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                <img loading="lazy" 
                  src="/design.png" 
                  className="absolute h-full w-full group-hover:opacity-50 transition-all duration-1000 -z-50 opacity-15" 
                  alt="design"
                />

                {/* Welcome Text */}
                <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    Welcome back, &nbsp;
                    <span className="relative whitespace-nowrap">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 281 40"
                        preserveAspectRatio="none"
                        className="absolute top-2/3 left-0 h-[0.6em] w-full fill-blue-500/70"
                      >
                        <path fillRule="evenodd" clipRule="evenodd" d="M240.172 22.994c-8.007 1.246-15.477 2.23-31.26 4.114-18.506 2.21-26.323 2.977-34.487 3.386-2.971.149-3.727.324-6.566 1.523-15.124 6.388-43.775 9.404-69.425 7.31-26.207-2.14-50.986-7.103-78-15.624C10.912 20.7.988 16.143.734 14.657c-.066-.381.043-.344 1.324.456 10.423 6.506 49.649 16.322 77.8 19.468 23.708 2.65 38.249 2.95 55.821 1.156 9.407-.962 24.451-3.773 25.101-4.692.074-.104.053-.155-.058-.135-1.062.195-13.863-.271-18.848-.687-16.681-1.389-28.722-4.345-38.142-9.364-15.294-8.15-7.298-19.232 14.802-20.514 16.095-.934 32.793 1.517 47.423 6.96 13.524 5.033 17.942 12.326 11.463 18.922l-.859.874.697-.006c2.681-.026 15.304-1.302 29.208-2.953 25.845-3.07 35.659-4.519 54.027-7.978 9.863-1.858 11.021-2.048 13.055-2.145a61.901 61.901 0 0 0 4.506-.417c1.891-.259 2.151-.267 1.543-.047-.402.145-2.33.913-4.285 1.707-4.635 1.882-5.202 2.07-8.736 2.903-3.414.805-19.773 3.797-26.404 4.829Z" />
                      </svg>
                      <span className="relative bg-linear-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                        {userData?.firstName || "Alex"}!
                      </span>
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-white/80 max-w-2xl text-center">
                    Here's what's happening with your startups today.
                  </p>
                </div>

                {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          {[
                          {
                            icon: "bg-green-400",
                            value: userData?.active_startups_count || 0,
                            label: "Active Startups",
                          },
                          {
                            icon: "bg-blue-400",
                            value: `$${userData?.total_revenue || 0}`,
                            label: "Revenue",
                          },
                          {
                            icon: "bg-purple-400",
                            value: `${userData?.satisfaction_percentage || "98"}%`,
                            label: "Satisfaction",
                          },
                          {
                            icon: "bg-orange-400",
                            value: userData?.last_activity_date 
                            ? new Date(userData.last_activity_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                              })
                            : "Jan 1 2026",
                            label: "Last activity",
                          },
                          ].map((stat) => (
                          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 ${stat.icon} rounded-full animate-pulse`} />
                            <span className="text-xs sm:text-sm text-white/70">
                            <strong>{stat.value}</strong>
                            </span>
                            <span className="text-xs text-white/60" style={{ fontFamily: "Trade Winds, system-ui" }}>
                            {stat.label}
                            </span>
                          </div>
                          ))}
                        </div>

                        {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <div className="flex items-center justify-center gap-2 h-10 bg-blue-400/30 border border-blue-400 px-4 rounded-full">
                    <img loading="lazy" src="/flame.jpg" alt="flame" className="w-5 sm:w-6" />
                    <small style={{ fontFamily: "Trade Winds, system-ui" }}>
                      {userData?.streak_days || 0}&nbsp;<strong>days</strong>
                    </small>
                  </div>
                  <div className="flex items-center justify-center gap-2 h-10 bg-purple-400/30 border border-purple-400 px-4 rounded-full">
                    <img loading="lazy" src="/trophy.jpg" alt="trophy" className="w-5 sm:w-6" />
                    <small style={{ fontFamily: "Trade Winds, system-ui" }}>
                      {userData?.xp_points || 0}&nbsp;<strong>XP</strong>
                    </small>
                  </div>
                </div>
              </div>
            </GlareHover>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-purple-400/10 rounded-full -translate-x-12 translate-y-12" />
      </div>
    </div>
  );
}
