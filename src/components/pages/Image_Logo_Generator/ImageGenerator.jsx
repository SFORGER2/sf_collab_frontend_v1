import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Loader2, Upload, X, Sparkles, ImageIcon, TextIcon, Download, InfoIcon, ArrowRight, FileImage, Type, Image as ImageLucide, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'react-toastify';
import useGetCredits from '@/utils/hooks/useGetCredits';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ImageGenerator = () => {
  const [activeTab, setActiveTab] = useState('text-to-text');
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const credits = useGetCredits();
  const { user, access_token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = access_token;
    if (!token) {
      setError('Please log in to generate content');
      return;
    }

    if (activeTab === 'text-to-text' || activeTab === 'text-to-image') {
      if (!inputText.trim()) {
        setError('Text prompt is required');
        return;
      }
    }

    if (activeTab === 'image-to-image' && !selectedFile && !imageUrl) {
      setError('Please upload an image or provide an image URL');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      let endpoint = `${API_URL}/ai/generate`;
      let body = {};
      
      if (activeTab === 'text-to-text' || activeTab === 'text-to-image') {
        body = JSON.stringify({ 
          text: inputText,
          generate_image: activeTab === 'text-to-image'
        });
      } else if (activeTab === 'image-to-image') {
        const formData = new FormData();
        formData.append('text', inputText || 'Transform this image');
        if (selectedFile) formData.append('image_file', selectedFile);
        if (imageUrl) formData.append('image_url', imageUrl);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Generation failed');
        }
        
        if (!data.success) {
          throw new Error(data.error || 'Unknown error occurred');
        }
        
        setResponse(data);
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message)
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const clearAll = () => {
    setInputText('');
    setImageUrl('');
    setSelectedFile(null);
    setResponse(null);
    setError('');
  };

  const downloadImage = () => {
    if (response?.generated_image) {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${response.generated_image}`;
      link.download = `ai_generated_${Date.now()}.jpg`;
      link.click();
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    clearAll();
  };

  const tabConfig = {
    'text-to-text': {
      icon: Type,
      label: 'Text Generation',
      shortLabel: 'Generate',
      color: 'from-blue-400 to-cyan-400',
      borderColor: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-500/50',
      gradient: 'from-blue-600 to-cyan-600'
    },
    'text-to-image': {
      icon: ImageLucide,
      label: 'Image Generation',
      shortLabel: 'Create',
      color: 'from-purple-400 to-pink-400',
      borderColor: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/50',
      gradient: 'from-purple-600 to-pink-600'
    },
    'image-to-image': {
      icon: FileImage,
      label: 'Image Transformation',
      shortLabel: 'Transform',
      color: 'from-emerald-400 to-teal-400',
      borderColor: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-500/50',
      gradient: 'from-emerald-600 to-teal-600'
    }
  };

  const currentConfig = tabConfig[activeTab];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-8 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-linear-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-pink-600/5 to-blue-600/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 mt-6 flex-wrap">
              <div className="p-3 bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                AI Content Generator
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-neutral-300 mb-2">
              Create stunning content instantly
            </p>
            <p className="text-sm text-neutral-400">
              Generate text, images, or transform images with cutting-edge AI
            </p>
          </motion.div>

          {/* Credits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
          >
            {[
              { label: 'Your Credits', value: credits, icon: Sparkles, color: 'text-yellow-400' },
              { label: 'Text Gen', value: '1-2', suffix: 'credits', icon: Type, color: 'text-blue-400' },
              { label: 'Txt→Img', value: '40', suffix: 'credits', icon: ImageLucide, color: 'text-purple-400' },
              { label: 'Img→Img', value: '50', suffix: 'credits', icon: FileImage, color: 'text-emerald-400' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  className="relative p-4 sm:p-5 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-linear-to-r ${stat.color === 'text-yellow-400' ? 'from-yellow-600/0 to-yellow-600/0 group-hover:from-yellow-600/5 group-hover:to-yellow-600/10' : stat.color === 'text-blue-400' ? 'from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/10' : stat.color === 'text-purple-400' ? 'from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:to-purple-600/10' : 'from-emerald-600/0 to-emerald-600/0 group-hover:from-emerald-600/5 group-hover:to-emerald-600/10'} transition-all duration-300`} />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-400 font-medium">{stat.label}</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        {stat.suffix && <p className="text-xs text-neutral-500">{stat.suffix}</p>}
                      </div>
                    </div>
                    <Icon className={`h-6 w-6 ${stat.color} flex-shrink-0`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Tabs defaultValue="text-to-text" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-xl p-1 gap-1">
                {Object.entries(tabConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className={`relative data-[state=active]:bg-linear-to-r ${config.color} data-[state=active]:text-white text-neutral-400 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="sm:hidden">{config.shortLabel}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.keys(tabConfig).map((tabKey) => (
                <TabsContent key={tabKey} value={tabKey} className="mt-6">
                  {/* Process Flow Card */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 relative p-5 sm:p-6 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/10 hidden sm:block overflow-hidden group"
                  >
                    <div className={`absolute inset-0 bg-linear-to-r ${tabConfig[tabKey].color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <div className="relative flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
                      {tabKey === 'text-to-text' && (
                        <>
                          <FlowStep number={1} title="Enter Prompt" desc="Ask questions" color="from-blue-600 to-cyan-600" />
                          <ArrowRight className="h-4 w-4 text-blue-400 hidden lg:block" />
                          <FlowStep number={2} title="AI Generates" desc="Written content" color="from-blue-600 to-cyan-600" />
                          <ArrowRight className="h-4 w-4 text-blue-400 hidden lg:block" />
                          <FlowStep number={3} title="Use Result" desc="Copy & paste" color="from-blue-600 to-cyan-600" />
                        </>
                      )}
                      {tabKey === 'text-to-image' && (
                        <>
                          <FlowStep number={1} title="Describe" desc="Be specific" color="from-purple-600 to-pink-600" />
                          <ArrowRight className="h-4 w-4 text-purple-400 hidden lg:block" />
                          <FlowStep number={2} title="AI Creates" desc="Artwork" color="from-purple-600 to-pink-600" />
                          <ArrowRight className="h-4 w-4 text-purple-400 hidden lg:block" />
                          <FlowStep number={3} title="Download" desc="Save image" color="from-purple-600 to-pink-600" />
                        </>
                      )}
                      {tabKey === 'image-to-image' && (
                        <>
                          <FlowStep number={1} title="Upload" desc="Source image" color="from-emerald-600 to-teal-600" />
                          <ArrowRight className="h-4 w-4 text-emerald-400 hidden lg:block" />
                          <FlowStep number={2} title="Instruct" desc="Describe change" color="from-emerald-600 to-teal-600" />
                          <ArrowRight className="h-4 w-4 text-emerald-400 hidden lg:block" />
                          <FlowStep number={3} title="Transform" desc="Get result" color="from-emerald-600 to-teal-600" />
                        </>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group">
                <div className={`absolute inset-0 bg-linear-to-r ${currentConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className={`absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-300 rounded-2xl pointer-events-none`} />
                
                <div className="relative">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {React.createElement(currentConfig.icon === Type ? Type : currentConfig.icon === ImageLucide ? ImageLucide : FileImage, {
                        className: `h-6 w-6 text-neutral-300`
                      })}
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{currentConfig.label}</h3>
                    </div>
                    <p className="text-sm text-neutral-400">
                      {activeTab === 'text-to-text' && 'Enter your prompt to generate AI-written content'}
                      {activeTab === 'text-to-image' && 'Describe the image you want to create'}
                      {activeTab === 'image-to-image' && 'Upload an image and describe the transformation'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Text Input */}
                    {(activeTab === 'text-to-text' || activeTab === 'text-to-image' || activeTab === 'image-to-image') && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="text-input" className="text-sm font-semibold text-white">
                            {activeTab === 'image-to-image' ? 'Instructions *' : 'Prompt *'}
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-white/10 transition-colors">
                                <InfoIcon className="h-4 w-4 text-neutral-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white text-sm max-w-xs">
                              {activeTab === 'text-to-text' && <p>Be specific about topics, tone, and format for best results.</p>}
                              {activeTab === 'text-to-image' && <p>Include style, colors, lighting, composition, and mood for better results.</p>}
                              {activeTab === 'image-to-image' && <p>Clearly describe the transformation you want applied.</p>}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          id="text-input"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder={
                            activeTab === 'text-to-text' 
                              ? "What would you like me to write?"
                              : activeTab === 'text-to-image'
                              ? "A serene mountain landscape, sunset, cinematic lighting..."
                              : "Transform this into a watercolor painting style..."
                          }
                          rows={activeTab === 'image-to-image' ? 3 : 5}
                          className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-all duration-300 resize-none text-sm sm:text-base"
                        />
                      </div>
                    )}

                    {/* Image Upload/URL - Show for image-to-image tab */}
                    {activeTab === 'image-to-image' && (
                      <>
                        {/* File Upload */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="file-upload" className="text-sm font-semibold text-white">
                              Upload Image *
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="rounded-full p-1 hover:bg-white/10 transition-colors">
                                  <InfoIcon className="h-4 w-4 text-neutral-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white text-sm max-w-xs">
                                <p>Max file size: 10MB. Supports PNG, JPG, WebP.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400/50 transition-all duration-300">
                            <Input
                              id="file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <motion.label
                              htmlFor="file-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <Upload className="h-8 w-8 text-emerald-400" />
                              <p className="text-sm font-semibold text-white">Click to upload</p>
                              <p className="text-xs text-neutral-400">PNG, JPG, WebP up to 10MB</p>
                            </motion.label>
                          </div>
                          
                          {selectedFile && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <ImageIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-sm font-medium text-white block truncate">{selectedFile.name}</span>
                                  <span className="text-xs text-neutral-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                              </div>
                              <motion.button
                                type="button"
                                onClick={removeSelectedFile}
                                whileHover={{ scale: 1.1 }}
                                className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4 text-neutral-400" />
                              </motion.button>
                            </motion.div>
                          )}
                        </div>

                        {/* OR Separator */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-3 bg-white/[0.05] text-xs text-neutral-400 font-medium">OR</span>
                          </div>
                        </div>

                        {/* Image URL Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="image-url" className="text-sm font-semibold text-white">
                              Image URL
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="rounded-full p-1 hover:bg-white/10 transition-colors">
                                  <InfoIcon className="h-4 w-4 text-neutral-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white text-sm max-w-xs">
                                <p>Paste a direct URL to an image online.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="image-url"
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-all duration-300"
                          />
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                          loading
                            ? 'opacity-50 cursor-not-allowed'
                            : `bg-linear-to-r ${currentConfig.color} hover:shadow-lg hover:shadow-blue-500/25 text-white`
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="hidden sm:inline">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5" />
                            <span className="hidden sm:inline">{currentConfig.label}</span>
                            <span className="sm:hidden">{currentConfig.shortLabel}</span>
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={clearAll}
                        className="flex-1 sm:flex-initial py-3 px-6 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                      >
                        Clear
                      </motion.button>
                    </div>
                  </form>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                    >
                      <p className="text-sm text-red-300 font-medium flex items-center gap-2">
                        <InfoIcon className="h-4 w-4" />
                        {error}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="relative sticky top-8 p-6 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className={`absolute inset-0 bg-linear-to-r ${currentConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className={`absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-300 rounded-2xl pointer-events-none`} />
                
                <div className="relative">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {React.createElement(currentConfig.icon === Type ? TextIcon : currentConfig.icon === ImageLucide ? ImageIcon : FileImage, {
                        className: `h-5 w-5 text-neutral-300`
                      })}
                      <h3 className="text-lg font-bold text-white line-clamp-1">
                        {activeTab === 'text-to-text' && 'Generated Text'}
                        {activeTab === 'text-to-image' && 'Generated Image'}
                        {activeTab === 'image-to-image' && 'Transformed Image'}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {activeTab === 'text-to-text' && 'Your AI-generated content'}
                      {activeTab === 'text-to-image' && 'Your created image'}
                      {activeTab === 'image-to-image' && 'Your transformed result'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {response ? (
                      <>
                        {/* Text Response */}
                        {(activeTab === 'text-to-text' || response.answer) && (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-neutral-300">Text</Label>
                            <div className="p-4 bg-white/[0.05] rounded-lg border border-white/10 max-h-64 overflow-y-auto">
                              <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                                {response.answer || 'No text generated'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Image Response */}
                        {response.generated_image && (
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-neutral-300">Result</Label>
                            <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 p-2">
                              <img loading="lazy" 
                                src={`data:image/jpeg;base64,${response.generated_image}`}
                                alt="Generated by AI"
                                className="w-full h-auto rounded-md"
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={downloadImage}
                                className="w-full mt-3 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <div className={`p-3 bg-linear-to-r ${currentConfig.color} rounded-full mb-3 opacity-20`}>
                          {React.createElement(currentConfig.icon, { className: 'h-6 w-6' })}
                        </div>
                        <h3 className="font-semibold text-neutral-300 mb-1">No Content Yet</h3>
                        <p className="text-xs text-neutral-500">Fill the form and submit to see results</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-neutral-500">
              Powered by <span className="text-blue-400 font-semibold">Qwen 2.5</span> & <span className="text-purple-400 font-semibold">Stable Diffusion XL</span>
            </p>
            <p className="text-xs text-neutral-600 mt-2">Premium AI Generation • 100% Free Access</p>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Helper Component
function FlowStep({ number, title, desc, color }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-r ${color} text-white text-sm font-bold shadow-lg`}>
        {number}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <p className="text-xs text-neutral-400">{desc}</p>
      </div>
    </div>
  );
}

export default ImageGenerator;
