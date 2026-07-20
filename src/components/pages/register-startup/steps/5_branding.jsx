import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/utils/config";
import { Image, InfoIcon, Upload, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { aiAPI } from "@/utils/APIs/aiAPI";
import { toast } from "react-toastify";
import useGetCredits from "@/utils/hooks/useGetCredits";

export default function Branding({
  logoFile,
  existingLogo,
  bannerFile,
  existingBanner,
  logoInputRef,
  bannerInputRef,
  handleFileChange,
  formData
}) {
  const [showLogoGenerator, setShowLogoGenerator] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState([]);
  const [sloganDesigns, setSloganDesigns] = useState([]);
  const [logoGeneratorFormData, setLogoGeneratorFormData] = useState({
    company_name: formData.name || '',
    subtitle: formData.description,
    industry: formData.industry || 'Technology',
    style_preference: 'Modern and Minimalist',
    color_palette: 'Blue and White',
    additional_notes: ''
  });
  const [imagesAmount, setImagesAmount] = useState(2);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const { user, access_token } = useSelector((state) => state.auth);
  const credits = useGetCredits();

  const costPerImage = 50;
  const totalCost = imagesAmount * costPerImage;
  const hasEnoughCredits = credits >= totalCost;

  const handleGenerateLogo = async (e) => {
    e.preventDefault();

    if (!logoGeneratorFormData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (!access_token) {
      toast.error('You must be logged in to generate logos');
      return;
    }

    if (!hasEnoughCredits) {
      toast.error(`Insufficient credits. You need ${totalCost} credits but have ${credits}`);
      return;
    }

    setGeneratingLogo(true);
    setGeneratedLogos([]);

    try {
      const response = await aiAPI.generateLogo({
        brandName: logoGeneratorFormData.company_name,
        industry: logoGeneratorFormData.industry,
        style: logoGeneratorFormData.style_preference,
        colors: logoGeneratorFormData.color_palette.split(' and '),
        subtitle: logoGeneratorFormData.subtitle,
        additionalNotes: logoGeneratorFormData.additional_notes,
        accessToken: access_token,
        imagesAmount: imagesAmount
      });

      if (!response.success) {
        throw new Error(response.error || 'Unknown error occurred');
      }

      setGeneratedLogos(response.images);
      setSloganDesigns(response.slogan_designs);
      toast.success('Logos generated successfully!');
    } catch (err) {
      toast.error(err?.error || 'Failed to generate logos. Please try again later.');
      console.error('Logo generation error:', err);
    } finally {
      setGeneratingLogo(false);
    }
  };

  const handleSelectGeneratedLogo = (logo) => {
    if (logo.base64) {
      const file = base64ToFile(logo.base64, `${logoGeneratorFormData.company_name.replace(/\s+/g, '_')}_logo.png`);
      handleFileChange({ target: { files: [file] } }, 'logo');
      setShowLogoGenerator(false);
      setGeneratedLogos([]);
      toast.success('Logo selected!');
    }
  };

  const base64ToFile = (base64String, fileName) => {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], fileName, { type: 'image/png' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <Image className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Brand Identity</CardTitle>
        <CardDescription className="text-gray-300">Upload your logo and banner to stand out</CardDescription>
      </div>
      <Button
        onClick={() => setShowLogoGenerator(!showLogoGenerator)}
        className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {showLogoGenerator ? 'Hide Generator' : 'Generate Logo with AI'}
      </Button>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-white flex items-center gap-2 justify-between w-full">
            Company Logo <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Your company logo should be high-quality and recognizable. Square images work best. This will be displayed throughout the platform.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Card
            onClick={() => logoInputRef.current?.click()}
            className="border-2 bg-blue-400/5 border-dashed border-gray-600 p-6 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-400/10 backdrop-blur-sm hover:scale-105"
          >
            <CardContent className="p-0">
              {logoFile || existingLogo ? (
                <div className="space-y-3">
                  <div className="w-24 h-24 rounded-2xl border-4 border-blue-400/30 mx-auto overflow-hidden">
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : existingLogo.startsWith('http') ? existingLogo : `${API_URL}${existingLogo}`}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Logo uploaded
                  </Badge>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <div className="text-gray-300 font-medium mb-1">Upload Logo</div>
                  <div className="text-gray-500 text-xs">PNG, JPG up to 2MB</div>
                </>
              )}
              <input
                type="file"
                ref={logoInputRef}
                onChange={(e) => handleFileChange(e, "logo")}
                className="hidden"
                accept="image/*"
              />
            </CardContent>
          </Card>

          {/* Generate Logo Button */}
          
        </div>
        
        {/* Banner Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-white flex items-center gap-2 justify-between w-full">
            Cover Banner
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>A cover banner helps your startup stand out. Use an image that represents your brand. Recommended size: 1200x300 pixels.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Card
            onClick={() => bannerInputRef.current?.click()}
            className="border-2 bg-blue-400/5 border-dashed border-gray-600 p-6 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-400/10 backdrop-blur-sm hover:scale-105"
          >
            <CardContent className="p-0">
              {bannerFile || existingBanner ? (
                <div className="space-y-3">
                  <img
                    src={bannerFile ? URL.createObjectURL(bannerFile) : existingBanner.startsWith('http') ? existingBanner : `${API_URL}${existingBanner}`}
                    alt="Banner preview"
                    className="w-full h-20 rounded-lg object-cover"
                  />
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Banner uploaded
                  </Badge>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <div className="text-gray-300 font-medium mb-1">Upload Banner</div>
                  <div className="text-gray-500 text-xs">Optional - PNG, JPG up to 5MB</div>
                </>
              )}
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleFileChange(e, "banner")}
                className="hidden"
                accept="image/*"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logo Generator Section */}
      {showLogoGenerator && (
        <div className="border border-neutral-700/50 rounded-2xl p-6 bg-neutral-900/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">AI Logo Generator</h3>
            <div className="flex gap-4 text-sm">
              <div className="bg-neutral-800 rounded-lg px-3 py-2">
                <p className="text-neutral-400">Your Credits</p>
                <p className="text-white font-semibold">{credits}</p>
              </div>
              <div className={`rounded-lg px-3 py-2 ${hasEnoughCredits ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                <p className="text-neutral-400">Cost</p>
                <p className={hasEnoughCredits ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{totalCost}</p>
              </div>
            </div>
          </div>
          
          {generatedLogos.length === 0 ? (
            <form onSubmit={handleGenerateLogo} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Company Name *</Label>
                  <input
                    type="text"
                    value={logoGeneratorFormData.company_name}
                    onChange={(e) => setLogoGeneratorFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Tagline</Label>
                  <input
                    type="text"
                    value={logoGeneratorFormData.subtitle}
                    onChange={(e) => setLogoGeneratorFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Brief tagline..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Images Amount</Label>
                  <input
                    type="number"
                    min="1"
                    value={imagesAmount}
                    onChange={(e) => setImagesAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Industry</Label>
                  <select
                    value={logoGeneratorFormData.industry}
                    onChange={(e) => setLogoGeneratorFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Food & Beverage', 'Fashion', 'Real Estate', 'Entertainment', 'Sports'].map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Design Style</Label>
                  <select
                    value={logoGeneratorFormData.style_preference}
                    onChange={(e) => setLogoGeneratorFormData(prev => ({ ...prev, style_preference: e.target.value }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {['Modern and Minimalist', 'Vintage and Classic', 'Playful and Colorful', 'Professional and Corporate', 'Elegant and Luxury', 'Tech and Futuristic', 'Organic and Natural', 'Bold and Geometric'].map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Color Palette</Label>
                <select
                  value={logoGeneratorFormData.color_palette}
                  onChange={(e) => setLogoGeneratorFormData(prev => ({ ...prev, color_palette: e.target.value }))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:outline-none"
                >
                  {['Blue and White', 'Black and White', 'Blue and Orange', 'Green and White', 'Purple and Yellow', 'Red and Black', 'Multi-color Bright', 'Pastel Colors', 'Earth Tones', 'Monochrome'].map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Additional Notes</Label>
                <textarea
                  value={logoGeneratorFormData.additional_notes}
                  onChange={(e) => setLogoGeneratorFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                  placeholder="Any specific elements or requirements..."
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:border-yellow-500 focus:outline-none resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={generatingLogo || !hasEnoughCredits}
                className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50"
              >
                {generatingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Logos
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedLogos.map((logo, index) => (
                  <div key={index} className="border border-neutral-700 rounded-lg p-3 bg-neutral-800 hover:border-blue-500 transition cursor-pointer">
                    <div className="mb-3 bg-white rounded-lg p-2 flex items-center justify-center h-32">
                      {logo.base64 && (
                        <img
                          src={`data:image/png;base64,${logo.base64}`}
                          alt={`Logo ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <Button
                      onClick={() => handleSelectGeneratedLogo(logo)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-sm"
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setGeneratedLogos([])}
                className="w-full bg-neutral-700 hover:bg-neutral-600 text-white"
              >
                Generate More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}