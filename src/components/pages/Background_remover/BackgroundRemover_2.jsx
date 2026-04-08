import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Upload, Download, Trash2, Sparkles, Image as ImageIcon, RefreshCw, Check, Camera, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('general');
  const [enhance, setEnhance] = useState(false);
  const [outputFormat, setOutputFormat] = useState('png');
  const [progress, setProgress] = useState(0);
  const [availableModels, setAvailableModels] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('loading');
  const [imageSize, setImageSize] = useState(null);
  
  const fileInputRef = React.useRef(null);

  // Load available models on component mount
  useEffect(() => {
    loadModels();
    checkServiceStatus();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_URL}/background-remover/models`);
      const data = await response.json();
      if (data.success) {
        setAvailableModels(data.data.models);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/background-remover/models`);
      if (response.ok) {
        setServiceStatus('ready');
      } else {
        setServiceStatus('error');
      }
    } catch (err) {
      setServiceStatus('error');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      
      setImageSize(file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setProcessedImage(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!originalImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    try {
      // Convert base64 to blob
      const base64Response = await fetch(originalImage);
      const blob = await base64Response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'image.png');
      formData.append('model', selectedModel);
      formData.append('enhance', enhance.toString());
      formData.append('format', outputFormat);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_URL}/background-remover/remove`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove background');
      }

      // Get the processed image
      const imageUrl = `${API_URL}${data.data.image_url.replace('/api', '')}`;
      setProcessedImage(imageUrl);

    } catch (err) {
      setError(err.message);
      console.error('Background removal error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `background-removed-${Date.now()}.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAll = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError('');
    setProgress(0);
    setImageSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const modelsInfo = {
    'general': { color: 'bg-green-500/20 text-green-400', description: 'General purpose images' },
    'anime': { color: 'bg-purple-500/20 text-purple-400', description: 'Anime & cartoons' },
    'portrait': { color: 'bg-blue-500/20 text-blue-400', description: 'Portraits and people' },
    'product': { color: 'bg-orange-500/20 text-orange-400', description: 'Product photos' }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-linear-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Background Remover
              </h1>
              <p className="text-gray-300 mt-1">
                Remove background from images instantly with AI
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
              {serviceStatus === 'ready' ? 'Service Ready' :
               serviceStatus === 'loading' ? 'Checking Status...' :
               'Service Error'}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg h-fit sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  Settings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure background removal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-3">
                  <Label htmlFor="model-select" className="text-sm font-semibold text-white">
                    AI Model
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full border-gray-600 bg-gray-700/50 text-white">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          <div className="flex items-center justify-between w-full">
                            <span className="capitalize">{model}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${modelsInfo[model]?.color || 'bg-gray-500/20'}`}>
                              {model}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">
                    {modelsInfo[selectedModel]?.description}
                  </p>
                </div>

                {/* Output Format */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-white">
                    Output Format
                  </Label>
                  <div className="flex gap-2">
                    {['png', 'jpg'].map((format) => (
                      <Button
                        key={format}
                        type="button"
                        variant={outputFormat === format ? "default" : "outline"}
                        onClick={() => setOutputFormat(format)}
                        className={`flex-1 border-gray-600 ${
                          outputFormat === format 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700/50 text-white hover:bg-gray-600'
                        }`}
                      >
                        {format.toUpperCase()}
                        {outputFormat === format && <Check className="h-4 w-4 ml-2" />}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG supports transparency, JPEG is smaller
                  </p>
                </div>

                {/* Enhance Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enhance-toggle" className="text-sm font-semibold text-white">
                      Enhance Image
                    </Label>
                    <Switch
                      id="enhance-toggle"
                      checked={enhance}
                      onCheckedChange={setEnhance}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Improve contrast and sharpness of processed image
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  
                  <Button
                    onClick={removeBackground}
                    disabled={!originalImage || loading}
                    className="w-full bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Processing...' : 'Remove Background'}
                  </Button>

                  <Button
                    onClick={downloadImage}
                    disabled={!processedImage}
                    variant="outline"
                    className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Result
                  </Button>

                  <Button
                    onClick={resetAll}
                    variant="outline"
                    className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                </div>

                {/* Image Info */}
                {originalImage && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-white">Image Info</h4>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium text-blue-400">
                          {imageSize ? (imageSize / 1024).toFixed(2) + ' KB' : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="font-medium text-blue-400">{outputFormat.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium text-blue-400 capitalize">{selectedModel}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
                <TabsTrigger value="preview" className="text-white data-[state=active]:bg-blue-500">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="howto" className="text-white data-[state=active]:bg-blue-500">
                  How to Use
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
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
                          <span>Processing image...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-gray-700" />
                      </div>
                    )}

                    {/* Image Display */}
                    {!originalImage ? (
                      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-600 rounded-xl bg-gray-700/30">
                        <div className="w-24 h-24 rounded-full bg-linear-to-r from-blue-400/10 to-blue-600/10 flex items-center justify-center mb-4">
                          <Camera className="h-12 w-12 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Image Uploaded
                        </h3>
                        <p className="text-gray-400 text-center mb-6 max-w-sm">
                          Upload an image to remove its background. Supports JPG, PNG, and WebP formats.
                        </p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Image
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original Image */}
                        <div>
                          <Label className="text-sm font-semibold mb-2 block text-white">
                            Original Image
                          </Label>
                          <div className="border-2 border-gray-600 rounded-lg p-2 bg-gray-700/30">
                            <img
                              src={originalImage}
                              alt="Original"
                              className="w-full h-auto max-h-[400px] object-contain rounded"
                            />
                          </div>
                        </div>

                        {/* Processed Image */}
                        <div>
                          <Label className="text-sm font-semibold mb-2 block text-white">
                            {processedImage ? 'Background Removed' : 'Result Preview'}
                          </Label>
                          <div className={`border-2 rounded-lg p-2 ${
                            processedImage 
                              ? 'border-green-400/30 bg-green-400/10' 
                              : 'border-gray-600 bg-gray-700/30'
                          }`}>
                            {processedImage ? (
                              <>
                                <div className="bg-[repeating-linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),repeating-linear-gradient(45deg,#f0f0f0_25%,#f9f9f9_25%,#f9f9f9_75%,#f0f0f0_75%,#f0f0f0)] bg-size-[20px_20px] bg-position-[0_0,10px_10px] rounded">
                                  <img
                                    src={processedImage}
                                    alt="Background Removed"
                                    className="w-full h-auto max-h-[400px] object-contain rounded"
                                  />
                                </div>
                                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                                  <span>Format: {outputFormat.toUpperCase()}</span>
                                  <span>Transparent background</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[400px]">
                                <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-400/10 to-blue-600/10 flex items-center justify-center mb-4">
                                  <Sparkles className="h-8 w-8 text-blue-400" />
                                </div>
                                <p className="text-gray-400 text-center">
                                  Click "Remove Background" to see the result
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="howto">
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">How to Use</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-sm shrink-0">
                              1
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">Upload Image</h4>
                              <p className="text-sm text-gray-400">Click "Upload Image" and select a PNG, JPG, or WebP file (max 10MB).</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-sm shrink-0">
                              2
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">Configure Settings</h4>
                              <p className="text-sm text-gray-400">Select the AI model based on your image type and choose output format.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-sm shrink-0">
                              3
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">Process Image</h4>
                              <p className="text-sm text-gray-400">Click "Remove Background" and wait for processing to complete.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-sm shrink-0">
                              4
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">Download Result</h4>
                              <p className="text-sm text-gray-400">Download your processed image with transparent background.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-700">
                        <h3 className="text-lg font-semibold text-white">AI Models</h3>
                        <div className="space-y-2">
                          {Object.entries(modelsInfo).map(([model, info]) => (
                            <div key={model} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30">
                              <div className={`w-3 h-3 rounded-full ${info.color.split(' ')[0]}`} />
                              <div>
                                <p className="text-sm font-medium text-white capitalize">{model}</p>
                                <p className="text-xs text-gray-400">{info.description}</p>
                              </div>
                            </div>
                          ))}
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

export default BackgroundRemover;