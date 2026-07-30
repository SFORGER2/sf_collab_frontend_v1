import React, { useState, useRef } from 'react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Loader2, Send, Sparkles, Download, Zap, Film, Play, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import useGetCredits from '@/utils/hooks/useGetCredits';
import { aiAPI } from '@/utils/APIs/aiAPI';
import { motion } from 'framer-motion';

const VideoGenerator = () => {
  const [mode, setMode] = useState('text-to-video'); // 'text-to-video' or 'image-to-video'
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(10);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const fileInputRef = useRef(null);
  const { user, access_token } = useSelector((state) => state.auth);
  const credits = useGetCredits();
  
  const costPerVideo = 100;
  const totalCost = costPerVideo;
  const remainingCredits = credits - totalCost;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const styleOptions = [
    { value: 'cinematic', label: '🎬 Cinematic' },
    { value: 'realistic', label: '📷 Realistic' },
    { value: 'anime', label: '✨ Anime' },
    { value: 'cartoon', label: '🎨 Cartoon' },
    { value: 'abstract', label: '🌀 Abstract' },
    { value: 'documentary', label: '📹 Documentary' }
  ];

  function SummaryCard({ label, value, accent = "white", suffix }) {
    const accentColor = accent === "emerald" ? "text-emerald-400" : accent === "cyan" ? "text-cyan-400" : "text-white";

    return (
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-700/50 text-center">
        <div className="flex flex-col items-center justify-between gap-2">
          <p className="text-xs text-neutral-400">{label}</p>
          <p className={`text-xl font-bold ${accentColor}`}>
            {value} {suffix && <span className="text-xs">{suffix}</span>}
          </p>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const downloadVideo = async (filename) => {
    try {
      const blob = await aiAPI.downloadVideo(filename);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download video');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!access_token) {
      setError('Please log in to generate videos');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt or description');
      return;
    }

    if (mode === 'image-to-video' && uploadedFiles.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (credits < totalCost) {
      setError(`Insufficient SF Coins. You need ${totalCost} coins but only have ${credits}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.generateVideo({
        mode,
        prompt: prompt.trim(),
        style,
        duration,
        files: uploadedFiles.length > 0 ? uploadedFiles : null
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate video');
      }

      const videoData = response.data || {};
      setGeneratedVideos([...generatedVideos, {
        url: videoData.video_url || '',
        filename: videoData.video_url ? videoData.video_url.split('/').pop() : '',
        mode: videoData.mode || mode,
        duration: videoData.duration || duration,
        remaining: videoData.remaining_today,
        generated_at: videoData.generated_at || new Date().toISOString()
      }]);
      setPrompt('');
      setUploadedFiles([]);
    } catch (err) {
      console.error('Video generation error:', err);
      setError(err.message || 'Failed to generate video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-8 px-4 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-pink-600/5 to-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                <Film className="h-8 w-8 text-blue-400" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Video Generator
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-2">
              Create stunning videos from text or images using AI
            </p>
            <p className="text-sm text-neutral-400">
              Transform your ideas into professional-quality videos in minutes.
            </p>
          </motion.div>

          {/* Credits and Mode Selection */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <SummaryCard
              label="Duration"
              value={`${duration}s`}
            />
            <SummaryCard
              label="Cost"
              value={`${totalCost}`}
              accent="emerald"
              suffix="SF Coins"
            />
            <SummaryCard
              label="Remaining SF Coins"
              value={credits}
              accent="cyan"
            />
          </div>

          {generatedVideos.length === 0 ? (
            <div className="flex w-full justify-center gap-10 lg:gap-16 max-lg:flex-col">
              {/* Settings Sidebar */}
              <div className="flex-1 space-y-6">
                {/* Mode Selection */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6"
                >
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Generation Mode</h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode('text-to-video')}
                        className={`flex-1 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          mode === 'text-to-video'
                            ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-400 text-white border-transparent shadow-lg'
                            : 'border-neutral-600/50 text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        Text to Video
                      </button>
                      <button
                        onClick={() => setMode('image-to-video')}
                        className={`flex-1 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          mode === 'image-to-video'
                            ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white border-transparent shadow-lg'
                            : 'border-neutral-600/50 text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        Image to Video
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Configuration Card */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ ...containerVariants, transition: { delay: 0.1 } }}
                  className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6"
                >
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-white">Settings</h3>
                    </div>

                    {/* Style Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-300">
                        Video Style
                      </Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger className="bg-neutral-800/50 border-neutral-600/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                          {styleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-white">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-neutral-300">
                          Duration
                        </Label>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {duration}s
                        </span>
                      </div>
                      <Slider
                        value={[duration]}
                        onValueChange={([value]) => setDuration(value)}
                        min={5}
                        max={60}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-neutral-500">
                        Short videos (5-15s) are perfect for social media
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* File Upload for Image-to-Video */}
                {mode === 'image-to-video' && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ ...containerVariants, transition: { delay: 0.2 } }}
                    className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6"
                  >
                    <div className="relative z-10 space-y-4">
                      <Label className="text-sm font-medium text-neutral-300">
                        Upload Images
                      </Label>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-neutral-600/50 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Film className="h-6 w-6 mx-auto mb-2 text-neutral-400 group-hover:text-blue-400" />
                          <p className="text-sm text-neutral-300">Click to upload images</p>
                          <p className="text-xs text-neutral-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      </button>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-400">{uploadedFiles.length} file(s) selected</p>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded-lg">
                              <span className="text-xs text-neutral-300 truncate">{file.name}</span>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Main Input Section */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ ...containerVariants, transition: { delay: 0.3 } }}
                className="flex-1"
              >
                <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />

                  <div className="relative z-10 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {mode === 'text-to-video' ? 'Describe Your Video' : 'Describe the Video Transformation'}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        {mode === 'text-to-video'
                          ? 'Write a detailed description of the video you want to create'
                          : 'Describe how you want the images to be transformed'}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-neutral-300">
                          Prompt
                        </Label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={
                            mode === 'text-to-video'
                              ? 'e.g., A cinematic shot of a sunset over the ocean with waves crashing on the shore...'
                              : 'e.g., Add smooth camera movement and dynamic lighting effects...'
                          }
                          rows={6}
                          className="bg-neutral-800/50 border-neutral-600/50 text-white placeholder-neutral-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      {error && (
                        <Alert className="bg-red-900/20 border-red-700/50">
                          <AlertDescription className="text-red-200">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {credits < totalCost ? (
                        <div className="w-full flex flex-col items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                          <p className="text-amber-400 text-sm font-medium">You need {totalCost} SF Coins to generate a video</p>
                          <a href="/store" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
                            Buy SF Coins
                          </a>
                        </div>
                      ) : (
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating Video...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Generate Video
                            </>
                          )}
                        </Button>
                      )}
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Output Section */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">Generated Videos</h2>
                <Button
                  onClick={() => {
                    setGeneratedVideos([]);
                    setPrompt('');
                    setUploadedFiles([]);
                  }}
                  variant="outline"
                  className="border-neutral-600/50 text-neutral-300 hover:text-white"
                >
                  Generate Another
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedVideos.map((video, index) => (
                  <div key={index} className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />

                    <div className="relative z-10 space-y-4">
                      <div className="aspect-video bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-700/50">
                        {video.url ? (
                          <video src={video.url} controls className="w-full h-full rounded-lg" />
                        ) : (
                          <div className="text-center p-6">
                            <Film className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                            <p className="text-neutral-400 text-sm">Video generated — URL pending server config</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-neutral-400 line-clamp-2">
                          <span className="font-semibold text-neutral-300">Prompt:</span> {prompt}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Generated at {new Date().toLocaleTimeString()}
                        </p>
                      </div>

                      <Button
                        onClick={() => downloadVideo(video.filename)}
                        variant="outline"
                        className="w-full border-neutral-600/50 text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoGenerator;