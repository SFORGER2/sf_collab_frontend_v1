import React, { useState, useRef } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Upload, Download, RefreshCw, Sparkles, Image as ImageIcon, Wand2, Palette, Heart, Zap, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AnimeConverter = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [animeImage, setAnimeImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('standard');
  const [progress, setProgress] = useState(0);
  const [styles, setStyles] = useState([]);
  
  const fileInputRef = useRef(null);

  // Available anime styles
  const animeStyles = [
    { id: 'standard', name: 'Standard Anime', icon: Sparkles, color: 'from-blue-400 to-blue-600' },
    { id: 'shonen', name: 'Shonen Style', icon: Zap, color: 'from-blue-400 to-cyan-400' },
    { id: 'shojo', name: 'Shojo Style', icon: Heart, color: 'from-pink-400 to-rose-400' },
    { id: 'chibi', name: 'Chibi Style', icon: Star, color: 'from-yellow-400 to-orange-400' },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setAnimeImage(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToAnime = async () => {
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
      formData.append('image', blob, 'photo.png');
      formData.append('style', selectedStyle);

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

      const response = await fetch(`${API_URL}/anime-converter/convert-advanced`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert to anime');
      }

      // Get the anime image
      const blobResult = await response.blob();
      const imageUrl = URL.createObjectURL(blobResult);
      setAnimeImage(imageUrl);

    } catch (err) {
      setError(err.message);
      console.error('Anime conversion error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadImage = () => {
    if (animeImage) {
      const link = document.createElement('a');
      link.href = animeImage;
      link.download = `anime-${selectedStyle}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAll = () => {
    setOriginalImage(null);
    setAnimeImage(null);
    setError('');
    setProgress(0);
  };

  const StyleCard = ({ style }) => {
    const Icon = style.icon;
    return (
      <button
        onClick={() => setSelectedStyle(style.id)}
        className={`relative p-4 rounded-xl w-full border-2 transition-all ${
          selectedStyle === style.id
            ? `border-blue-400 bg-linear-to-br ${style.color} bg-opacity-10 backdrop-blur-sm`
            : 'border-gray-600 hover:border-blue-400/50 bg-gray-700/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-linear-to-br ${style.color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold ${selectedStyle === style.id ? 'text-white' : 'text-gray-200'}`}>
              {style.name}
            </h3>
            <p className="text-sm text-gray-400">
              {style.id === 'standard' && 'Classic anime style'}
              {style.id === 'shonen' && 'Bold, action-oriented'}
              {style.id === 'shojo' && 'Soft, romantic style'}
              {style.id === 'chibi' && 'Cute, big head style'}
            </p>
          </div>
        </div>
        {selectedStyle === style.id && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen py-8">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-linear-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Anime AI Converter 
              </h1>
              <p className="text-gray-300 mt-1">
                Transform your photos into anime characters instantly!
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 relative p-2">
          <div className='absolute bg-gray-500/10 w-full h-full backdrop-blur-sm rounded-md p-2 flex justify-center items-center' style={{zIndex:99999999}}><span className='text-sm bg-blue-500 text-blue-200 rounded-full p-1 px-2  w-fit'>Coming soon</span></div>
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg h-fit sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Palette className="h-5 w-5 text-blue-400" />
                  Anime Styles
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Choose your anime transformation style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Style Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-white">
                    Select Style
                  </Label>
                  <div className="space-y-2">
                    {animeStyles.map((style) => (
                      <StyleCard key={style.id} style={style} />
                    ))}
                  </div>
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
                    className="w-full bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0 shadow-lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  
                  <Button
                    onClick={convertToAnime}
                    disabled={!originalImage || loading}
                    className="w-full bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0 shadow-lg"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Transforming...' : 'Transform to Anime!'}
                  </Button>

                  <Button
                    onClick={downloadImage}
                    disabled={!animeImage}
                    variant="outline"
                    className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Anime
                  </Button>

                  <Button
                    onClick={resetAll}
                    variant="outline"
                    className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>

                {/* Tips */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold mb-2 text-white">Tips for Best Results</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        ✨
                      </div>
                      <span>Use clear, well-lit photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        🎨
                      </div>
                      <span>Try different styles for different looks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        ⚡
                      </div>
                      <span>Shonen style works best for action poses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs mt-0.5">
                        💖
                      </div>
                      <span>Shojo style adds soft, romantic effects</span>
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
                  <Wand2 className="h-6 w-6 text-blue-400" />
                  Anime Transformation
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {originalImage 
                    ? 'See your photo transform into anime!' 
                    : 'Upload a photo to begin your anime transformation'
                  }
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
                      <span>Transforming to anime...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-gray-700" />
                  </div>
                )}

                {/* Image Display */}
                {!originalImage ? (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-400/30 rounded-xl bg-gray-700/30">
                    <div className="w-24 h-24 rounded-full bg-linear-to-r from-blue-400/10 to-blue-600/10 flex items-center justify-center mb-4">
                      <ImageIcon className="h-12 w-12 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Ready for Anime Transformation!
                    </h3>
                    <p className="text-gray-400 text-center mb-6 max-w-sm">
                      Upload your photo and choose an anime style to transform into a character
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0 shadow-lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Before/After Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Original Photo */}
                      <div>
                        <Label className="text-sm font-semibold mb-2 block text-white">
                          Original Photo
                        </Label>
                        <div className="border-2 border-gray-600 rounded-xl p-3 bg-gray-700/30">
                          <img
                            src={originalImage}
                            alt="Original"
                            className="w-full h-auto max-h-[350px] object-contain rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Anime Result */}
                      <div>
                        <Label className="text-sm font-semibold mb-2 block text-white">
                          {animeImage ? 'Anime Version' : 'Anime Preview'}
                        </Label>
                        <div className={`border-2 rounded-xl p-3 ${
                          animeImage 
                            ? 'border-blue-400/30 bg-linear-to-br from-blue-400/10 to-blue-600/10' 
                            : 'border-gray-600 bg-gray-700/30'
                        }`}>
                          {animeImage ? (
                            <>
                              <img
                                src={animeImage}
                                alt="Anime Version"
                                className="w-full h-auto max-h-[350px] object-contain rounded-lg"
                              />
                              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-400">
                                <Sparkles className="h-4 w-4" />
                                <span>Anime transformation complete!</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[350px]">
                              <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-400/10 to-blue-600/10 flex items-center justify-center mb-4">
                                <Wand2 className="h-8 w-8 text-blue-400 animate-pulse" />
                              </div>
                              <p className="text-gray-400 text-center">
                                Click "Transform to Anime!" to see the magic
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Style Info */}
                    {originalImage && (
                      <div className="p-4 bg-linear-to-r from-blue-400/10 to-blue-600/10 rounded-xl border border-blue-400/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">
                              Selected Style: {animeStyles.find(s => s.id === selectedStyle)?.name}
                            </h4>
                            <p className="text-sm text-gray-300">
                              {selectedStyle === 'standard' && 'Classic anime style with enhanced colors and edges'}
                              {selectedStyle === 'shonen' && 'Bold, high-contrast style perfect for action scenes'}
                              {selectedStyle === 'shojo' && 'Soft, romantic style with glowing effects'}
                              {selectedStyle === 'chibi' && 'Cute style with big head and small body proportions'}
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg bg-linear-to-r ${
                            animeStyles.find(s => s.id === selectedStyle)?.color
                          }`}>
                            {React.createElement(animeStyles.find(s => s.id === selectedStyle)?.icon, {
                              className: "h-6 w-6 text-white"
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Examples Gallery */}
        {!originalImage && (
          <Card className="mt-8 bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Example Transformations
              </CardTitle>
              <CardDescription className="text-gray-300">
                See what others have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { before: '👤 Portrait', after: '🎨 Anime', style: 'Standard' },
                  { before: '🤵 Formal', after: '⚡ Shonen', style: 'Shonen' },
                  { before: '👩 Selfie', after: '💖 Shojo', style: 'Shojo' },
                  { before: '👶 Casual', after: '⭐ Chibi', style: 'Chibi' },
                ].map((example, idx) => (
                  <div key={idx} className="text-center p-4 rounded-lg border border-gray-600 hover:border-blue-400/50 transition-colors bg-gray-700/30">
                    <div className="mb-2">
                      <div className="text-lg font-semibold text-white">{example.before}</div>
                      <div className="text-sm text-gray-400">→</div>
                      <div className="text-lg font-semibold text-blue-400">{example.after}</div>
                    </div>
                    <div className="text-xs text-gray-400 px-2 py-1 rounded-full bg-gray-600">
                      {example.style} Style
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnimeConverter;