import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Loader2, Sparkles, Download, Copy, Type, Image as ImageIcon, Zap, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { motion } from 'framer-motion';
import { aiAPI } from '@/utils/APIs/aiAPI';
import useGetCredits from '@/utils/hooks/useGetCredits';

const CaptionGenerator = () => {
  const [formData, setFormData] = useState({
    prompt: '',
    platform: 'Instagram',
    tone: 'casual',
    image: null
  });

  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(200);
  const [selectedModel, setSelectedModel] = useState('qwen/qwen3-32b');
  const [imagePreview, setImagePreview] = useState(null);

  const credits = useGetCredits();
  const { user } = useSelector((state) => state.auth);

  const costPerCaption = 10;
  const remainingCredits = Math.max((user?.credits || 0) - costPerCaption, 0);

  const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook', 'Pinterest'];
  const tones = ['casual', 'professional', 'humorous', 'inspirational', 'persuasive', 'educational'];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.prompt.trim()) {
      setError('Please enter a caption topic or description');
      return;
    }

    if (credits < costPerCaption) {
      setError('Insufficient credits. Please purchase more credits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.generateCaption({
        prompt: formData.prompt,
        model: selectedModel,
        platform: formData.platform,
        tone: formData.tone,
        temperature,
        maxTokens,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate captions');
      }

      setCaptions(prev => [...prev, {
        id: Date.now(),
        caption: response.data?.response || response.data || '',
        platform: formData.platform,
        timestamp: new Date(),
        tone: formData.tone
      }]);

    } catch (err) {
      console.error('Caption generation error:', err);
      setError(err.message || 'Failed to generate caption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (caption) => {
    navigator.clipboard.writeText(caption);
  };

  const downloadCaptions = () => {
    const content = captions.map((c, i) => 
      `Caption ${i + 1} (${c.platform} - ${c.tone})\n${c.caption}\n\n`
    ).join('---\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCaptions = () => {
    setCaptions([]);
    setFormData({ prompt: '', platform: 'Instagram', tone: 'casual', image: null });
    setImagePreview(null);
  };

  const SummaryCard = ({ label, value, accent = "white", suffix }) => {
    const accentColor = accent === "emerald" ? "text-emerald-400" : accent === "cyan" ? "text-cyan-400" : "text-white";
    return (
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-700/50 text-center">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className={`text-xl font-bold ${accentColor} mt-2`}>
          {value} {suffix && <span className="text-xs">{suffix}</span>}
        </p>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const quickPrompts = [
    'Product showcase for my new launch',
    'Behind-the-scenes content',
    'User testimonial/success story',
    'Educational tip or tutorial',
    'Promotional offer announcement',
    'Team/company culture moment',
    'Industry insights and trends',
    'Call-to-action for engagement'
  ];

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
                <Type className="h-8 w-8 text-blue-400" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Caption Generator
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-2">
              Create engaging captions for any platform in seconds
            </p>
            <p className="text-sm text-neutral-400">
              AI-powered caption generation tailored to your platform, tone, and content style.
            </p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <SummaryCard label="Cost Per Caption" value="10" suffix="credits" />
            <SummaryCard label="Platform" value={formData.platform} accent="emerald" />
            <SummaryCard label="Available Credits" value={credits} accent="cyan" />
          </motion.div>

          <div className="flex w-full justify-center gap-10 lg:gap-16 max-lg:flex-col">
            {/* Left Sidebar - Input & Settings */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex-1 space-y-6"
            >
              {/* Input Card */}
              <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  {/* Caption Topic */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      Caption Topic
                    </Label>
                    <Textarea
                      placeholder="Describe what your caption should be about..."
                      value={formData.prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                      rows={4}
                      className="bg-neutral-800/50 border-neutral-700/50 text-white placeholder-neutral-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Platform</Label>
                    <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                      <SelectTrigger className="bg-neutral-800/50 border-neutral-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        {platforms.map(platform => (
                          <SelectItem key={platform} value={platform} className="text-white">
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tone Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Tone</Label>
                    <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                      <SelectTrigger className="bg-neutral-800/50 border-neutral-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        {tones.map(tone => (
                          <SelectItem key={tone} value={tone} className="text-white capitalize">
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Upload Image (Optional)
                    </Label>
                    <div
                      className="relative">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="block w-full p-4 border-2 border-dashed border-neutral-700/50 rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors text-center"
                      >
                        <p className="text-sm text-neutral-400">Click to upload image</p>
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="mt-4 relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  {credits < costPerCaption ? (
                    <div className="w-full flex flex-col items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                      <p className="text-amber-400 text-sm font-medium">You need {costPerCaption} credits to generate a caption</p>
                      <a href="/store" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
                        Buy Credits
                      </a>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-11"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Caption
                        </>
                      )}
                    </Button>
                  )}

                  {error && (
                    <Alert className="bg-red-900/30 border-red-700/50 text-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </div>

              {/* Configuration Card */}
              <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Configuration</h3>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-300">Creativity</Label>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([value]) => setTemperature(value)}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                    />
                    <p className="text-xs text-gray-500">
                      {temperature < 0.3 ? '🎯 Precise' : temperature < 0.7 ? '⚖️ Balanced' : '🎨 Creative'}
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-300">Caption Length</Label>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {maxTokens}
                      </span>
                    </div>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={([value]) => setMaxTokens(value)}
                      min={50}
                      max={500}
                      step={50}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Quick Ideas</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setFormData(prev => ({ ...prev, prompt }))}
                        className="w-full text-left p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-sm text-gray-300 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Output */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex-1"
            >
              <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 p-6 min-h-[600px] flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Generated Captions</h3>
                    {captions.length > 0 && (
                      <span className="text-sm text-neutral-400">{captions.length} caption{captions.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {captions.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center">
                      <div>
                        <Type className="h-16 w-16 text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-400 mb-2">No captions generated yet</p>
                        <p className="text-sm text-neutral-500">Fill in the form and click generate to create captions</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto">
                      {captions.map((caption) => (
                        <motion.div
                          key={caption.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-blue-500/30 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {caption.platform}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                                {caption.tone}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-500">{caption.timestamp.toLocaleTimeString()}</span>
                          </div>
                          
                          <p className="text-sm text-neutral-200 mb-3 leading-relaxed">{caption.caption}</p>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyCaption(caption.caption)}
                              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {captions.length > 0 && (
                    <div className="flex gap-2 mt-6 pt-6 border-t border-neutral-700/50">
                      <Button
                        onClick={downloadCaptions}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={clearCaptions}
                        variant="outline"
                        className="flex-1 bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-700/50 text-white"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CaptionGenerator;