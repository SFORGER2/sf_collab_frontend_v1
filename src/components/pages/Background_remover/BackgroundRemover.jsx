import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Upload, Download, Trash2, Sparkles, Image as ImageIcon, RefreshCw, Check, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';
import { Progress } from '../../ui/progress';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  
  const fileInputRef = React.useRef(null);

  // Load available models on component mount
  React.useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_URL}/background-remover/models`);
      const data = await response.json();
      if (data.success) {
        setAvailableModels(data.models);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove background');
      }

      // Get the processed image
      const blobResult = await response.blob();
      const imageUrl = URL.createObjectURL(blobResult);
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
  };

  const modelsInfo = {
    'general': { color: 'bg-green-500/20 text-green-400', description: 'General purpose' },
    'anime': { color: 'bg-purple-500/20 text-purple-400', description: 'Anime & cartoons' },
  };

  return (
    <div className="min-h-screen py-8 ">
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
                            <span className={`text-xs px-2 py-1 ml-40 rounded-full ${modelsInfo[model]?.color}`}>
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
                        className="flex-1 border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
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

                {/* Info Panel */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold mb-2 text-white">How to Use</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        1
                      </div>
                      <span>Upload an image (max 10MB)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        2
                      </div>
                      <span>Select model type based on image content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        3
                      </div>
                      <span>Click "Remove Background" to process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        4
                      </div>
                      <span>Download the result</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ImageIcon className="h-6 w-6 text-blue-400" />
                  Image Preview
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {originalImage ? 'Original and processed images' : 'Upload an image to begin'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
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
                            <img
                              src={processedImage}
                              alt="Background Removed"
                              className="w-full h-auto max-h-[400px] object-contain rounded"
                            />
                            <div className="mt-2 text-xs text-gray-400">
                              Format: {outputFormat.toUpperCase()} • Transparent background
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

                {/* Image Info */}
                {originalImage && (
                  <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <h4 className="text-sm font-semibold mb-2 text-white">Processing Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Model:</span>
                        <span className="ml-2 font-medium text-blue-400 capitalize">{selectedModel}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Enhancement:</span>
                        <span className="ml-2 font-medium text-blue-400">{enhance ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Output Format:</span>
                        <span className="ml-2 font-medium text-blue-400 uppercase">{outputFormat}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 font-medium ${
                          processedImage ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {processedImage ? 'Completed' : 'Ready to Process'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;