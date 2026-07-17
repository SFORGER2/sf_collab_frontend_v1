import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Sparkles, Star, Briefcase, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '../../common/EmptyState';

const MOCK_MENTORS = [
  {
    id: 1,
    rating: 4.9,
    experience: "12 Years",
    expertise: "Product Strategy",
    pricing: "Free"
  },
  {
    id: 2,
    rating: 4.8,
    experience: "9 Years",
    expertise: "AI & ML",
    pricing: "Paid"
  },
  {
    id: 3,
    rating: 4.6,
    experience: "15 Years",
    expertise: "Marketing",
    pricing: "Free"
  },
  {
    id: 4,
    rating: 4.7,
    experience: "7 Years",
    expertise: "Finance",
    pricing: "Paid"
  }
];

export default function StartupMentorsPage() {
  const context = useOutletContext();
  const startupId = context?.startupId || 'demo-startup-id';
  const navigate = useNavigate();

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-400" /> Mentor Recommendations
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Personalized mentor recommendations matching your startup's industry, growth stage, and technical needs.
        </p>
      </div>

      {/* Recommended Mentors Section Container */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-6">Recommended Mentors</h2>
        
        {MOCK_MENTORS.length === 0 ? (
          <EmptyState
            title="No Recommended Mentors"
            description="We couldn't find any mentor recommendations for your startup at this time."
            buttonText="Back to Dashboard"
            onButtonClick={() => {
              if (startupId === 'demo-startup-id') {
                navigate('/test');
              } else {
                navigate(`/startup-workspace/${startupId}`);
              }
            }}
            icon={Sparkles}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {MOCK_MENTORS.map((mentor) => (
              <Card
                key={mentor.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/25 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/30"
              >
                <CardContent className="p-0 flex flex-col gap-6">
                  {/* Card Header Section */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Recommendation
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        mentor.pricing === 'Free'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold rounded-full'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold rounded-full'
                      }
                    >
                      {mentor.pricing}
                    </Badge>
                  </div>

                  {/* Card Content Row Details */}
                  <div className="space-y-4">
                    {/* Rating Row */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
                          Rating
                        </span>
                        <span className="text-base font-bold text-white">
                          {mentor.rating} / 5.0
                        </span>
                      </div>
                    </div>

                    {/* Experience Row */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
                          Experience
                        </span>
                        <span className="text-base font-bold text-white">
                          {mentor.experience}
                        </span>
                      </div>
                    </div>

                    {/* Expertise Row */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Tag className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
                          Expertise
                        </span>
                        <span className="text-base font-bold text-white break-words">
                          {mentor.expertise}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
