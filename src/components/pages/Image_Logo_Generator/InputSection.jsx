import { aiAPI } from "@/utils/APIs/aiAPI";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

import { Label } from '../../ui/label';
import { Loader2, Sparkles, Building2, Palette, Brush, Tag, Download, InfoIcon, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { motion } from 'framer-motion';
import { toast } from "react-toastify";
export default function InputSection({
  formData,
  setFormData,
  setLogos,
  containerVariants,
  imagesAmount,
  setSloganDesigns
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, access_token } = useSelector((state) => state.auth);
  
    const industryOptions = [
      'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
      'Food & Beverage', 'Fashion', 'Real Estate', 'Entertainment', 'Sports',
      'Travel', 'Automotive', 'Energy', 'Manufacturing', 'Other'
    ];
  
    const styleOptions = [
      'Modern and Minimalist',
      'Vintage and Classic',
      'Playful and Colorful',
      'Professional and Corporate',
      'Elegant and Luxury',
      'Tech and Futuristic',
      'Organic and Natural',
      'Bold and Geometric'
    ];
  
    const colorOptions = [
      'Blue and White',
      'Black and White',
      'Blue and Orange',
      'Green and White',
      'Purple and Yellow',
      'Red and Black',
      'Multi-color Bright',
      'Pastel Colors',
      'Earth Tones',
      'Monochrome'
    ];
  
    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.company_name.trim()) {
        toast.error('Company name is required');
        return;
      }
      
      const token = access_token;
      if (!token) {
        toast.error('You must be logged in to generate logos');
        return;
      }
      
      setLoading(true);
      setLogos([]);
  
      try {
        const response = await aiAPI.generateLogo({
          brandName: formData.company_name,
          industry: formData.industry,
          style: formData.style_preference,
          colors: formData.color_palette.split(' and '),
          subtitle: formData.subtitle,
          additionalNotes: formData.additional_notes,
          accessToken: token,
          imagesAmount: imagesAmount
        });
        // Mock response for demonstration
        
        if (!response.success) {
          throw new Error(response.error || 'Unknown error occurred');
        }
  
        setLogos(response.images);
        setSloganDesigns(response.slogan_designs);
      } catch (err) {
        toast.error(err?.error || 'Failed to generate logos. Please try again later.');
        if (err.status === 402) {
          setError('Insufficient credits. Please top up your account.');
          return;
        }
        console.error('Logo generation error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    const clearForm = () => {
      setFormData({
        company_name: '',
        subtitle: '',
        industry: 'Technology',
        style_preference: 'Modern and Minimalist',
        color_palette: 'Blue and White',
        additional_notes: ''
      });
      setLogos([]);
    };
  return <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-2 w-full"
            >
              <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
                    <Brush className="h-7 w-7 text-purple-400" />
                    Company Details
                  </h2>
                  <p className="text-neutral-400">
                    Describe your vision and let AI create the perfect logo
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Company Name */}
                  <motion.div
                    variants={containerVariants}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold text-white flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        Company Name *
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="rounded-full p-1.5 hover:bg-neutral-700 transition-colors">
                            <InfoIcon className="size-4 text-neutral-500 hover:text-neutral-300" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white">
                          <p>Your official startup name for the logo</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Enter your company name..."
                      className="bg-neutral-900/50 border border-neutral-700/50 focus:border-blue-500/50 text-white placeholder:text-neutral-500 rounded-lg"
                      required
                    />
                  </motion.div>

                  {/* Subtitle/Tagline */}
                  <motion.div
                    variants={containerVariants}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold text-white flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-400" />
                        Tagline / Subtitle
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="rounded-full p-1.5 hover:bg-neutral-700 transition-colors">
                            <InfoIcon className="size-4 text-neutral-500 hover:text-neutral-300" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white">
                          <p>A short phrase that describes your business</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="Brief tagline describing your company..."
                      className="bg-neutral-900/50 border border-neutral-700/50 focus:border-purple-500/50 text-white placeholder:text-neutral-500 rounded-lg"
                    />
                  </motion.div>

                  {/* Industry */}
                  <motion.div
                    variants={containerVariants}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold text-white">Industry</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="rounded-full p-1.5 hover:bg-neutral-700 transition-colors">
                            <InfoIcon className="size-4 text-neutral-500 hover:text-neutral-300" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white">
                          <p>Select your industry for relevant logo design</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange('industry', value)}
                    >
                      <SelectTrigger className="bg-neutral-900/50 border border-neutral-700/50 focus:border-blue-500/50 text-white rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border border-neutral-700">
                        {industryOptions.map(industry => (
                          <SelectItem key={industry} value={industry} className="text-white hover:bg-neutral-700">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Style & Color Grid */}
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Style Preference */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-white">Design Style</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="rounded-full p-1.5 hover:bg-neutral-700 transition-colors">
                              <InfoIcon className="size-4 text-neutral-500 hover:text-neutral-300" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white">
                            <p>Choose the visual style for your brand</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={formData.style_preference}
                        onValueChange={(value) => handleInputChange('style_preference', value)}
                      >
                        <SelectTrigger className="bg-neutral-900/50 border border-neutral-700/50 focus:border-purple-500/50 text-white rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border border-neutral-700">
                          {styleOptions.map(style => (
                            <SelectItem key={style} value={style} className="text-white hover:bg-neutral-700">
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-white flex items-center gap-2">
                          <Palette className="h-4 w-4 text-pink-400" />
                          Color Palette
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="rounded-full p-1.5 hover:bg-neutral-700 transition-colors">
                              <InfoIcon className="size-4 text-neutral-500 hover:text-neutral-300" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white">
                            <p>Choose your color scheme</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={formData.color_palette}
                        onValueChange={(value) => handleInputChange('color_palette', value)}
                      >
                        <SelectTrigger className="bg-neutral-900/50 border border-neutral-700/50 focus:border-pink-500/50 text-white rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border border-neutral-700">
                          {colorOptions.map(color => (
                            <SelectItem key={color} value={color} className="text-white hover:bg-neutral-700">
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {/* Additional Notes */}
                  <motion.div
                    variants={containerVariants}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold text-white flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        Additional Notes & Ideas
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="rounded-full p-1.5 hover:bg-neutral-700 transition-colors">
                            <InfoIcon className="size-4 text-neutral-500 hover:text-neutral-300" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-800 border border-neutral-700 text-white">
                          <p>Any specific elements or requirements</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      value={formData.additional_notes}
                      onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                      placeholder="E.g., include a mountain icon, use circular shape, incorporate nature elements..."
                      rows={4}
                      className="resize-none bg-neutral-900/50 border border-neutral-700/50 focus:border-yellow-500/50 text-white placeholder:text-neutral-500 rounded-lg"
                    />
                  </motion.div>

                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                    >
                      <p className="text-red-300 text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    variants={containerVariants}
                    className="flex gap-3 pt-4"
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold rounded-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Logo
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={clearForm}
                      className="px-6 bg-neutral-700/50 hover:bg-neutral-600/50 text-white border border-neutral-600/50 hover:border-neutral-500/50 rounded-lg transition-colors h-12 font-semibold"
                    >
                      Clear
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
}