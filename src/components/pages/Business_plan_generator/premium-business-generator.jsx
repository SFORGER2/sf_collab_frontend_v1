import React, { useState, useRef, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Lightbulb, 
  BarChart3, 
  Mic, 
  Square, 
  Download, 
  Building2,
  DollarSign,
  MapPin,
  Cpu,
  Target,
  Sparkles,
  Loader2,
  Check,
  Shield,
  Clock
} from 'lucide-react';
import ShinyText from "../../ui/ShinyText";
import VoiceInput from './VoiceInput';
import { aiAPI } from '@/utils/APIs/aiAPI';

import { useSelector } from 'react-redux';
import ResponsePrompt from './ResponsePrompt';
import { API_BASE_URL_NO_API } from '@/utils/config';
import { paymentAPI } from '@/utils/APIs/paymentAPI';
import useGetCredits from '@/utils/hooks/useGetCredits';

export default function BusinessIdeaGenerator() {
  const [mode, setMode] = useState('ideas');
  const { user, access_token } = useSelector((state) => state.auth);
  const credits = useGetCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    businessIdea: '',
    industry: '',
    budget: '',
    location: '',
    tech: ''
  });
  
  const inputGrid = [
    {
      fieldName: 'businessIdea',
      label: 'Business Concept',
      icon: <Sparkles className="h-4 w-4" />,
      placeholder: 'Briefly describe your business vision and goals',
      value: formData.businessIdea,
      btnId: '1'

    },
    {
      fieldName: 'industry',
      label: 'Industry Focus',
      icon: <Building2 className="h-4 w-4" />,
      placeholder: 'e.g., HealthTech, FinTech, Sustainable Energy',
      value: formData.industry,
      btnId: '2'
    },
    {
      fieldName: 'budget',
      label: 'Investment Range',
      icon: <DollarSign className="h-4 w-4" />,
      placeholder: 'e.g., $5,000 - $50,000',
      value: formData.budget,
      btnId: '3'
    },
    {
      fieldName: 'location',
      label: 'Market Location',
      icon: <MapPin className="h-4 w-4" />,
      placeholder: 'e.g., North America, Remote, EU Market',
      value: formData.location,
      btnId: '4'
    },
    {
      fieldName: 'tech',
      label: 'Technology Stack',
      icon: <Cpu className="h-4 w-4" />,
      placeholder: 'e.g., AI/ML, Blockchain, Cloud Native',
      value: formData.tech,
      btnId: '5'
    }
  ];
  

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const body = {
      content_type: mode === 'ideas' ? 'business_ideas' : 'business_plan',
      max_tokens: mode === 'ideas' ? 2048 : 4096,
      metadata: {
        business_idea: formData.businessIdea,
        industry: formData.industry,
        budget: formData.budget,
        location: formData.location,
        tech: formData.tech
      }
      
    }
    try {
      setIsLoading(true);

      const response = await aiAPI.generateBusinessIdeas({
        contentType: mode === 'ideas' ? 'business_ideas' : 'business_plan',
        maxTokens: mode === 'ideas' ? 2048 : 4096,
        metadata: {
          business_idea: formData.businessIdea,
          industry: formData.industry,
          budget: formData.budget,
          location: formData.location,
          tech: formData.tech
        }
      });
      if (!response?.success) {
        throw new Error(response?.error || 'Generation failed');
      }
      setResults({
        type: mode,
        content: `Generated ${mode === 'ideas' ? 'Business Ideas' : 'Business Plan'} based on your inputs...`,
        response: response?.data?.response || '',
        pdfLink: '',
        mdLink: response?.data?.download_links?.md || ''
      });
    } catch (error) {
      toast.error("Error generating content: " + error.message);

    } finally {
      setIsLoading(false);
    }
      

  };
  const isMobile = window.matchMedia("(max-width: 640px)").matches;


  return (
    <>
    <div className="min-h-screen  p-2 md:p-8">
      <div className="w-full mx-auto">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        {/* Premium AI Business Plan Generator Header */}
        <div className="relative overflow-hidden">
            <div className="text-center">

              {/* Main Hero Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 mt-4 animate-slide-up">
                <span className="bg-linear-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  AI Business Plan
                </span>
                <br />
                <span className=" relative">
                  <span className='mt-4 z-50 bg-linear-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent '>
                  Generator
                  </span>
                  {/* Animated underline */}
                  {/* <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent animate-shimmer" /> */}
                  <span className='absolute z-10 top-16 right-1 w-full flex justify-center mt-2'>
                    <svg aria-hidden="true" viewBox="0 0 418 42" className=" h-[0.70em] w-96 fill-blue-400/50" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
                  </span>
                </span>
              </h1>
        
              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Transform your vision into investor-ready business plans with our advanced AI. 
                <span className="bg-linear-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text font-semibold"> Generate comprehensive strategies,</span>
                financial projections, 
                and market analysis in minutes.
              </p>
        
              {/* Feature Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                {[
                  { icon: <img loading="lazy" src='/thounder.jpg' alt='Generation'/>, label: '90-Second Generation', value: 'Lightning Fast' },
                  { icon: <img loading="lazy" src='/brain.jpg' alt='Generation'/>, label: 'Smart Market Analysis', value: 'AI-Powered' },
                  { icon: <img loading="lazy" src='/investor.jpg' alt='Generation'/>, label: 'Investor-Ready Output', value: 'Professional' },
                  { icon: <img loading="lazy" src='/recycle.jpg' alt='Generation'/>, label: 'Multi-Step Planning', value: 'Comprehensive' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="text-2xl w-10  group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">{stat.label}</div>
                      <div className="text-slate-400 text-xs">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
        
              
            </div>
        
          {/* Animated Scan Line */}
          <div className="absolute bottom-0  left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent animate-scan" />
        </div>
        {/* Credits Cost Section */}
        <div className="relative mt-8 mb-8">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5 blur-xl rounded-2xl" />
          
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Cost Info */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Credit Cost
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-white/10">
                    <div className="text-sm text-slate-400">Business Ideas</div>
                    <div className="text-2xl font-bold text-amber-400">5 Credits</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-white/10">
                    <div className="text-sm text-slate-400">Business Plan</div>
                    <div className="text-2xl font-bold text-blue-400">10 Credits</div>
                  </div>
                </div>
              </div>
              
              {/* Credits Balance */}
              <div className="flex-1 md:border-l border-white/10 md:pl-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Your Credits
                </h4>
                <div className="p-4 bg-linear-to-br from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
                  <div className="text-4xl font-bold text-white">
                    {credits || 0}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Credits Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mode Selector */}
        <div className="relative">
          <div className="absolute inset-0 -top-4 -bottom-4 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5 blur-xl rounded-3xl" />
          
          <div className="relative flex flex-wrap gap-2 p-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md mx-auto my-12">
            
            {/* Ideas Button */}
            <button
              onClick={() => setMode('ideas')}
              className={`cursor-pointer relative flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 group ${
                mode === 'ideas'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {/* Icon Container */}
              <div className={`relative transition-transform duration-300 group-hover:scale-110 ${
                mode === 'ideas' ? 'text-yellow-400' : 'text-slate-500 group-hover:text-yellow-300'
              }`}>
                <div className={`absolute inset-0 rounded-lg blur-sm transition-opacity duration-300 ${
                  mode === 'ideas' ? 'bg-yellow-400/50 opacity-100' : 'bg-yellow-400/0 opacity-0 group-hover:opacity-50'
                }`} />
                <Lightbulb className="h-5 w-5 relative" />
              </div>
              
              <span className="relative text-sm font-medium whitespace-nowrap">
                Business Ideas
              </span>
              
              {/* Active State Glow */}
              {/* {mode === 'ideas' && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 shadow-inner" />
              )} */}
            </button>
        
            {/* Plan Button */}
            <button
              onClick={() => setMode('plan')}
              className={`cursor-pointer relative flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 group ${
                mode === 'plan'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {/* Icon Container */}
              <div className={`relative transition-transform duration-300 group-hover:scale-110 ${
                mode === 'plan' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-300'
              }`}>
                <div className={` absolute inset-0 rounded-lg blur-sm transition-opacity duration-300 ${
                  mode === 'plan' ? 'bg-blue-400/50 opacity-100' : 'bg-blue-400/0 opacity-0 group-hover:opacity-50'
                }`} />
                <BarChart3 className="h-5 w-5 relative" />
              </div>
              
              <span className="relative text-sm font-medium whitespace-nowrap">
                Business Plan
              </span>
              
              {/* Active State Glow */}
              {/* {mode === 'plan' && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/20 shadow-inner" />
              )} */}
            </button>
          </div>
        
          {/* Feature Highlights */}
          <div className="flex justify-center  mt-6 animate-fade-in">
            <div className='w-[80%] flex flex-wrap justify-around '>
              {[
                { 
                  mode: 'ideas', 
                  icon: <img loading="lazy" src="/idea.jpg" className='w-30' alt="idea" />, 
                  title: 'Ideation Mode', 
                  features: ['Market Gaps', 'Creative Concepts', 'Quick Brainstorming'] 
                },
                { 
                  mode: 'plan', 
                  icon: <img loading="lazy" src="/chart.jpg" className='w-30' alt="plan" />, 
                  title: 'Planning Mode', 
                  features: ['Financial Models', 'Investor Docs', 'Full Strategy'] 
                }
              ].map((item) => (
                <div 
                  key={item.mode}
                  className={`flex w-full transition-all duration-500 ${
                    mode === item.mode ? 'opacity-100 scale-105' : 'opacity-40 scale-95'
                  }`}
                >
                  <div className="w-full flex justify-center text-2xl mb-2">{item.icon}</div>
                  <div className="w-full text-xs text-slate-500 space-y-0.5">
                    <div className="text-sm font-semibold text-slate-300 mb-1">{item.title}</div>
                    {item.features.map((feature, index) => (
                      <div key={index} className='flex items-center gap-2'><Check size={10}/>{feature}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        {/* Premium Form Section */}
          <div className="relative">
            {/* Background Glow Effects */}
            <div className="absolute -inset-4 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 blur-3xl rounded-3xl" />
            <div className="absolute -inset-2 bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl" />
            
            <div className="relative bg-linear-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 mb-4">
                  <div className="p-1.5 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
                    {mode === 'ideas' ? 
                      <Lightbulb className="h-4 w-4 text-white" /> : 
                      <BarChart3 className="h-4 w-4 text-white" />
                    }
                  </div>
                  <span className="text-sm font-semibold text-slate-300">
                    {mode === 'ideas' ? 'Business Ideation' : 'Strategic Planning'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {mode === 'ideas' ? 'Describe Your Vision' : 'Build Your Business Plan'}
                </h3>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                  {mode === 'ideas' 
                    ? 'Provide key details to generate innovative business concepts tailored to your goals'
                    : 'Enter comprehensive information to create a detailed, investor-ready business plan'
                  }
                </p>
              </div>
          
              {/* Business Idea (only for plan mode) */}
              
          
              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {inputGrid.filter(field => mode === 'ideas' ? field.fieldName !== 'businessIdea' : true).map((field, index) => (
                  <div key={field.fieldName} className={`animate-fade-in ${field.fieldName === 'businessIdea' ? 'md:col-span-2' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-slate-700/50 rounded-lg border border-white/5">
                        {field.icon}
                      </div>
                      <label className="text-sm font-semibold text-slate-300">{field.label}</label>
                    </div>
                    <VoiceInput
                      fieldName={field.fieldName}
                      label={field.label}
                      type={field.fieldName === 'businessIdea' ? 'textarea' : 'text'}
                      setFormData={setFormData}
                      // icon={field.icon}
                      placeholder={field.placeholder}
                      value={field.value}
                      btnId={field.btnId}
                      className="bg-slate-800/30 border-white/10 hover:border-white/20 focus:border-blue-500/30 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
          
              {/* Generate Button */}
              <div className="relative group">
                {/* Button Glow Effect */}
                <div className="absolute -inset-1 bg-linear-to-r from-amber-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
                
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="relative w-full bg-linear-to-r from-slate-900 to-slate-800 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group/btn"
                >
                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-amber-500 via-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  
                  {/* Button Content */}
                  <div className="relative flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 bg-white rounded-full blur-sm animate-pulse" />
                          <Loader2 className="h-5 w-5 text-white animate-spin relative" />
                        </div>
                        <span className="font-semibold">
                          {mode === 'ideas' ? 'Generating Ideas...' : 'Creating Business Plan...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-1 bg-white/10 rounded-lg group-hover/btn:bg-white/20 transition-colors">
                          {mode === 'ideas' ? 
                            <Lightbulb className="h-5 w-5 text-amber-400" /> : 
                            <BarChart3 className="h-5 w-5 text-blue-400" />
                          }
                        </div>
                        <span className="font-semibold text-lg">
                          {mode === 'ideas' ? 'Generate Business Ideas' : 'Create Business Plan'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Loading Progress Bar */}
                  {isLoading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 via-purple-500 to-blue-500 rounded-b-2xl animate-pulse" />
                  )}
                </button>
              </div>
          
              {/* Form Footer */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Enterprise-Grade Security</span>
                </div>
                <div className="w-px h-4 bg-slate-600" />
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3" />
                  <span>AI-Powered Analysis</span>
                </div>
                <div className="w-px h-4 bg-slate-600" />
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>90-Second Generation</span>
                </div>
              </div>
            </div>
          </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <span className="text-slate-300">
                {mode === 'ideas' ? 'Generating innovative ideas...' : 'Creating your detailed business plan...'}
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="mt-8">
            
            
            {/* Download Buttons */}
            <div className="flex gap-4 justify-center my-6">
              {results.pdfLink && (
                  <a
                  target='_blank'
                  href={`${API_BASE_URL_NO_API}${results.pdfLink}`}
                  download
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </a>
              )}
              {results.mdLink && (
                  <a
                  target='_blank'
                  href={`${API_BASE_URL_NO_API}${results.mdLink}`}
                  download
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-5 w-5" />
                  Download Markdown
                </a>
              )}
              </div>
              <ResponsePrompt results={results}/>
          </div>
        )}
      </div>
    </div>
  </>
  );
}