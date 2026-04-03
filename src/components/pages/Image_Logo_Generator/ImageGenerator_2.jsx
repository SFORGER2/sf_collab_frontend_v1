import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Download, Sparkles, Zap, Palette, Loader2, Eye, Check, RefreshCw, Image as ImageIcon, Wand2, Settings, Info } from 'lucide-react';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Switch } from '../../ui/switch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ImageGenerator = () => {
  const [model, setModel] = useState('flux');
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [availableModels, setAvailableModels] = useState({});
  const [serviceStatus, setServiceStatus] = useState('loading');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [negativePrompt, setNegativePrompt] = useState('');

  // Load models and check service status
  useEffect(() => {
    checkServiceStatus();
    loadModels();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/cf/health`);
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.success ? 'ready' : 'error');
      } else {
        setServiceStatus('error');
      }
    } catch (err) {
      setServiceStatus('error');
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_URL}/cf/models`);
      const data = await response.json();
      if (data.success) {
        setAvailableModels(data.models);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const handleGenerate = async (retryCount = 0) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      return;
    }

    setLoading(true);
    setError('');
    setImage(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(`${API_URL}/cf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          width,
          height,
          negative_prompt: negativePrompt
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 500 && retryCount < 2) {
          setTimeout(() => handleGenerate(retryCount + 1), 2000);
          return;
        }
        throw new Error(data.error || 'Failed to generate image');
      }

      setImage(data.image);
      
      // Add to history
      setGenerationHistory(prev => [{
        id: Date.now(),
        prompt,
        model,
        image: data.image,
        timestamp: new Date().toISOString(),
        dimensions: `${width}x${height}`
      }, ...prev.slice(0, 4)]); // Keep last 5 generations

      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Reset progress after delay
      setTimeout(() => setProgress(0), 1000);

    } catch (err) {
      setError(err.message);
      console.error('Generation error:', err);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `ai-generated-${model}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presetSizes = [
    { label: '512×512', w: 512, h: 512, aspect: '1:1' },
    { label: '768×768', w: 768, h: 768, aspect: '1:1' },
    { label: '1024×1024', w: 1024, h: 1024, aspect: '1:1' },
    { label: '1024×768', w: 1024, h: 768, aspect: '4:3' },
    { label: '768×1024', w: 768, h: 1024, aspect: '3:4' },
    { label: '1280×720', w: 1280, h: 720, aspect: '16:9' },
    { label: '720×1280', w: 720, h: 1280, aspect: '9:16' }
  ];

  const promptExamples = [
    "A majestic dragon soaring over mountains at sunset, cinematic lighting, 4k quality, epic fantasy",
    "Cyberpunk cityscape at night with neon lights, rain-soaked streets, flying cars, Blade Runner style",
    "Cute anime character in magical forest, studio Ghibli style, soft lighting, detailed background",
    "Minimalist logo for a tech startup, geometric design, blue and white color scheme, professional",
    "Portrait of an astronaut in space station, dramatic lighting, reflections in helmet, realistic",
    "Steampunk mechanical owl with brass gears and glowing eyes, intricate details, concept art"
  ];

  const modelsInfo = {
    flux: { color: 'from-purple-400 to-pink-400', icon: Sparkles },
    sdxl: { color: 'from-blue-400 to-cyan-400', icon: Zap },
    sd15: { color: 'from-green-400 to-emerald-400', icon: Palette }
  };

  const ModelIcon = modelsInfo[model]?.icon || Sparkles;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-3 bg-gradient-to-r ${modelsInfo[model]?.color || 'from-blue-400 to-blue-600'} rounded-2xl shadow-lg`}>
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                AI Image Generator
              </h1>
              <p className="text-gray-300 mt-1">
                Powered by Cloudflare Workers AI - Free Forever
              </p>
            </div>
          </div>
          
          {/* Service Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-blue-400/30 shadow-sm mb-4 backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full ${
              serviceStatus === 'ready' ? 'bg-green-500' :
              serviceStatus === 'loading' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium text-white">
              {serviceStatus === 'ready' ? 'Cloudflare AI Ready' :
               serviceStatus === 'loading' ? 'Checking Status...' :
               'Service Error'}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Panel - Settings */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg h-fit sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Settings className="h-5 w-5 text-blue-400" />
                  Generator Settings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure your image generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-3">
                  <Label htmlFor="model-select" className="text-sm font-semibold text-white">
                    AI Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-full border-gray-600 bg-gray-700/50 text-white">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      {Object.entries(availableModels).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded bg-gradient-to-r ${modelsInfo[key]?.color || 'from-gray-400 to-gray-600'}`}>
                                {React.createElement(modelsInfo[key]?.icon || Sparkles, { className: "h-3 w-3 text-white" })}
                              </div>
                              <span>{info.name}</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 text-blue-300">
                              {info.speed}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableModels[model] && (
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>{availableModels[model].description}</p>
                      <p className="text-blue-300">Best for: {availableModels[model].best_for.join(', ')}</p>
                    </div>
                  )}
                </div>

                {/* Advanced Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="advanced-toggle" className="text-sm font-semibold text-white">
                      Advanced Settings
                    </Label>
                    <Switch
                      id="advanced-toggle"
                      checked={showAdvanced}
                      onCheckedChange={setShowAdvanced}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {showAdvanced ? 'Advanced settings shown' : 'Show advanced image settings'}
                  </p>
                </div>

                {/* Dimensions */}
                {showAdvanced && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Dimensions: {width} × {height}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-400">Width</Label>
                          <Slider
                            value={[width]}
                            onValueChange={([value]) => setWidth(value)}
                            min={256}
                            max={2048}
                            step={64}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Height</Label>
                          <Slider
                            value={[height]}
                            onValueChange={([value]) => setHeight(value)}
                            min={256}
                            max={2048}
                            step={64}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Negative Prompt
                      </Label>
                      <Textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="What to avoid in the image..."
                        rows={2}
                        className="text-sm resize-none border-gray-600 bg-gray-700/50 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Sizes */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-white">
                    Quick Sizes
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {presetSizes.map((size) => (
                      <Button
                        key={size.label}
                        type="button"
                        variant={width === size.w && height === size.h ? "default" : "outline"}
                        onClick={() => {
                          setWidth(size.w);
                          setHeight(size.h);
                        }}
                        className={`text-xs h-auto py-2 ${width === size.w && height === size.h ? 'bg-blue-500' : 'border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600'}`}
                      >
                        {size.label}
                        {width === size.w && height === size.h && <Check className="h-3 w-3 ml-1" />}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || loading}
                    className={`w-full bg-gradient-to-r ${modelsInfo[model]?.color || 'from-blue-400 to-blue-600'} hover:opacity-90 text-white border-0`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ModelIcon className="h-4 w-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>

                  {image && (
                    <Button
                      onClick={downloadImage}
                      variant="outline"
                      className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generation History */}
            {generationHistory.length > 0 && (
              <Card className="mt-6 bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <RefreshCw className="h-5 w-5 text-blue-400" />
                    Recent Generations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {generationHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-gray-600 bg-gray-700/30 hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setImage(item.image);
                        setPrompt(item.prompt);
                        setModel(item.model);
                      }}
                    >
                      <img
                        src={item.image}
                        alt="Generated"
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.prompt}</p>
                        <p className="text-xs text-gray-400">{item.model} • {item.dimensions}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
                <TabsTrigger value="generator" className="text-white data-[state=active]:bg-blue-500">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generator
                </TabsTrigger>
                <TabsTrigger value="examples" className="text-white data-[state=active]:bg-blue-500">
                  <Info className="h-4 w-4 mr-2" />
                  Prompt Examples
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generator">
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg min-h-[600px]">
                  <CardContent className="pt-6">
                    {error && (
                      <Alert variant="destructive" className="mb-4 bg-red-400/10 border-red-400/30">
                        <AlertDescription className="text-red-300 text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Progress Bar */}
                    {loading && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Generating image with {availableModels[model]?.name || model}...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-gray-700" />
                      </div>
                    )}

                    {/* Prompt Input */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold mb-2 block text-white">
                        Describe Your Vision
                      </Label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A majestic dragon soaring over mountains at sunset, cinematic lighting, 4k quality..."
                        rows={4}
                        className="resize-none border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400"
                        disabled={loading}
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {prompt.length}/1000 characters
                        </span>
                        <span className="text-xs text-blue-400">
                          Tip: Be specific for better results
                        </span>
                      </div>
                    </div>

                    {/* Image Display */}
                    {!image ? (
                      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-600 rounded-xl bg-gray-700/30">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/10 to-blue-600/10 flex items-center justify-center mb-4">
                          <ImageIcon className="h-12 w-12 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Image Generated Yet
                        </h3>
                        <p className="text-gray-400 text-center mb-6 max-w-sm">
                          Enter a detailed prompt and click "Generate Image" to create your AI masterpiece.
                        </p>
                        <Button
                          onClick={() => {
                            const example = promptExamples[Math.floor(Math.random() * promptExamples.length)];
                            setPrompt(example);
                          }}
                          variant="outline"
                          className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Use Example Prompt
                        </Button>
                      </div>
                    ) : (
                      <div id="result" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              Generated Image
                            </h3>
                            <p className="text-sm text-gray-400">
                              {availableModels[model]?.name || model} • {width}×{height} pixels
                            </p>
                          </div>
                          <Button
                            onClick={downloadImage}
                            variant="outline"
                            className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-700/30">
                          <img
                            src={image}
                            alt="Generated"
                            className="w-full h-auto max-h-[500px] object-contain"
                          />
                        </div>
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2 text-white">Generation Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Model:</span>
                              <span className="ml-2 font-medium text-blue-400">
                                {availableModels[model]?.name || model}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Dimensions:</span>
                              <span className="ml-2 font-medium text-blue-400">
                                {width} × {height}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Prompt:</span>
                              <span className="ml-2 font-medium text-blue-400 truncate block">
                                {prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <span className="ml-2 font-medium text-green-400">
                                Complete
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples">
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Prompt Examples</h3>
                        <p className="text-sm text-gray-400">
                          Try these example prompts to get started. Click any prompt to use it.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {promptExamples.map((example, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border border-gray-600 bg-gray-700/30 hover:border-blue-400 hover:bg-blue-400/10 cursor-pointer transition-all group"
                            onClick={() => {
                              setPrompt(example);
                              setModel(['flux', 'sdxl', 'sd15'][index % 3]); // Cycle through models
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-sm flex-shrink-0 group-hover:bg-blue-400/30">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-white text-sm mb-2">{example}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 text-blue-300">
                                    {['Flux', 'SDXL', 'SD1.5'][index % 3]}
                                  </span>
                                  <span className="text-xs text-gray-400">Click to use</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Tips for Better Results</h3>
                        <div className="space-y-2 text-sm text-gray-400">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Be specific about style, lighting, and composition</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Include keywords like "cinematic", "4k", "detailed", "professional"</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Use negative prompts to exclude unwanted elements</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Different models excel at different styles - experiment!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;