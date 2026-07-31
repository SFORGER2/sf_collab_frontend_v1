// sections/AchievementSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Check } from 'lucide-react';

const AchievementSection = ({ achievements }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        Achievements & Badges
      </h3>
      
      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-amber-400/40" />
          </div>
          <p className="text-sm font-medium text-slate-400">No achievements unlocked yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">Complete platform milestones and activities to earn badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((item, index) => {
            const info = item.achievement || {};
            const unlocked = item.is_completed;
            const progress = item.progress_percentage || 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4.5 rounded-xl border transition-all duration-300 ${
                  unlocked
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-teal-950/30 border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-800/40 hover:bg-slate-800/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                    unlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}>
                    {unlocked ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm sm:text-base flex flex-wrap items-center gap-2">
                      {info.icon && <span>{info.icon}</span>}
                      <span>{info.title || 'Achievement'}</span>
                      {unlocked && (
                        <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {info.description}
                    </p>
                    {info.rarity && (
                      <span className="text-[10px] font-semibold mt-2 inline-block px-2 py-0.5 rounded-full border border-white/10" style={{ backgroundColor: `${info.badge_color}22`, color: info.badge_color }}>
                        {info.rarity}
                      </span>
                    )}

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
                        <span>{info.points || 0} XP</span>
                        <span className="font-mono">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            unlocked ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500/80'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementSection;