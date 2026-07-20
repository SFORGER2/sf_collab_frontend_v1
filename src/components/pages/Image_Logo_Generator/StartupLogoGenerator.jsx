import React, { useState } from 'react';
import { Button } from '../../ui/button';

import { Sparkles, ImageIcon, Building2, Download, Minus, Plus } from 'lucide-react';
import { TooltipProvider } from '../../ui/tooltip';
import { motion } from 'framer-motion';
import StepsTimeline from './StepsTimeline';
import InputSection from './InputSection';
import OutputSection from './OutputSection';

import useGetCredits from '@/utils/hooks/useGetCredits';

const StartupLogoGenerator = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    subtitle: '',
    industry: 'Technology',
    style_preference: 'Modern and Minimalist',
    color_palette: 'Blue and White',
    additional_notes: ''
  });
  
  const [logos, setLogos] = useState([
  ]); // array of images
  const credits = useGetCredits();
  const [imagesAmount, setImagesAmount] = useState(2);
  const [sloganDesigns, setSloganDesigns] = useState([]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const costPerImage = 50;
  const imageCount = imagesAmount;
  const totalCost = imageCount * costPerImage;
  // credits comes from useGetCredits() which fetches from /api/payments/credits (real-time)
  const hasEnoughCredits = credits >= totalCost;
  function SummaryCard({ label, value, accent = "white", suffix, edit = false }) {
  const accentColor =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "cyan"
      ? "text-cyan-400"
      : "text-white";

  return (
    <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-700/50 text-center">
      <div className="flex flex-col items-center justify-between gap-2">
        <p className="text-xs text-neutral-400">{label}</p>
        {edit ? (
          <div className="flex items-center justify-center">
            <Minus 
              onClick={() => setImagesAmount(Math.max(1, imagesAmount - 1))}
              className="inline-block w-3 h-3 mr-2 text-neutral-400" />
            <input
              value={imagesAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (!isNaN(value) && value.trim() !== '') {
                  setImagesAmount(Math.max(1, parseInt(value)));
                }
              }}
              className="w-12 text-center bg-neutral-800 text-white rounded-md p-1 border border-neutral-700 focus:border-blue-500 focus:outline-none"
            />
            <Plus
              onClick={() => setImagesAmount(imagesAmount + 1)}
              className="inline-block w-3 h-3 ml-2 text-neutral-400" />
          </div>
        ) : (
      <p className={`text-xl font-bold ${accentColor}`}>
        {value} {suffix && <span className="text-xs">{suffix}</span>}
      </p> 
        )}
      </div>
    </div>
  );
}
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-8 px-4 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-linear-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-linear-to-r from-pink-600/5 to-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6 mt-10">
              <div className="p-4 bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Logo Generator
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-2">
              Create stunning, AI-powered startup logos in seconds
            </p>
            <p className="text-sm text-neutral-400">
              No design skills needed.  Just enter your company details and get
              instant logo concepts.
            </p>
          </motion.div>

          {/* Steps Timeline */}
          <StepsTimeline containerVariants={containerVariants} />

            <div className="grid grid-cols-3 gap-4 mb-8">
            <SummaryCard
              label="Images"
              edit={true}
              value={imagesAmount} />
              <SummaryCard
                label="Cost"
                value={`${totalCost}`}
                accent="emerald"
                suffix="credits"
              />
              <SummaryCard
                label="Remaining Credits"
                value={credits}
                accent="cyan"
              />
            </div>
            <div className="flex w-full justify-center gap-10 lg:gap-16 max-lg:flex-col">
            {
              logos.length === 0 ? (
                !hasEnoughCredits ? (
                  <div className="w-full flex flex-col items-center gap-3 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                    <p className="text-amber-400 font-medium">You need {totalCost} credits to generate {imageCount} logo{imageCount > 1 ? 's' : ''}</p>
                    <p className="text-gray-400 text-sm">Your balance: {credits} credits</p>
                    <a href="/store" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors">Buy Credits</a>
                  </div>
                ) : (
                <InputSection formData={formData} setFormData={setFormData} setLogos={setLogos} containerVariants={containerVariants} imagesAmount={imagesAmount} setImagesAmount={setImagesAmount} setSloganDesigns={setSloganDesigns} />
              )) : (
                <OutputSection formData={formData} logos={logos} setLogos={setLogos} sloganDesigns={sloganDesigns} />
              )
            }
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StartupLogoGenerator;