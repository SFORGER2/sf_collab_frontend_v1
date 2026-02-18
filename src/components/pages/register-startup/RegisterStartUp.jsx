"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Plus, X, ChevronRight, Minus,ChevronLeft, FileText, Building2, MapPin, Globe, Users, Rocket, CheckCircle, Image, AlertCircle, User, Mail, Eye, Star, Target, Trophy, Zap, Lightbulb, TrendingUp, DollarSign, PieChart, Target as TargetIcon, Calendar, BarChart3, InfoIcon, Code } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Alert, AlertDescription } from "../../ui/alert";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { useSelector } from "react-redux";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip"; 
import { waitlistAPI } from "@/utils/APIs/waitlistAPI";
import { toast } from "react-toastify";
import { API_URL } from "@/utils/config";
import SidebarContent from "./SidebarContent";
import { logoutUser } from "@/services/auth/authThunks";
import StartupRoleCard from "./StartupRoleCard";
import { industries, startupStages } from "./elements";
import StartupReview from "./steps/9_StartupReview";
import StartupRolesAndTechStack from "./steps/7_StartupRolesAndTeamStack";
import Startup from "@/components/landing-page/pages/StartupPage";
import StartupFinancialForm from "./steps/4_StartupFinancialForm";
import { formatCurrency } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
export default function RegisterStartUp() {
  const navigate = useNavigate();
  const { access_token, user } = useSelector((state) => state.auth);
  const [roles, setRoles] = useState([{ title: "", roleType: "Full Time" }]);
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);

  const [bannerFile, setBannerFile] = useState(null);
  const [existingBanner, setExistingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xpPoints, setXpPoints] = useState(0);
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [removedDocumentIds, setRemovedDocumentIds] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [query] = useSearchParams();
  const id = query.get('id') || null;
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    description: "",
    stage: "",
    positions: 0,
    roles: {},
    creator_first_name: "",
    creator_last_name: "",
    creator_email: "",
    
    revenue: 0,
    funding_amount: 0,
    funding_round: "pre-seed",
    burn_rate: 0,
    runway_months: 0,
    valuation: 0,
    financial_notes: "",
    
    tech_stack: []
  });
  useEffect(() => {
    if (!id) {
      const savedFormData = localStorage.getItem('formData');
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
  }, [id]);


  useEffect(() => {
    if (!id) {
      localStorage.setItem('formData', JSON.stringify(formData));
    }
  }, [formData, id]);

  useEffect(() => {
    if (id && user?.id) {

      async function fetchStartupData() {
        try {
          if (!user?.id) {
            toast.error('User not authenticated');
            return;
          }

          const response = await startupsAPI.getById(id)
          if (response.success && response.data?.startup) {
            const startup = response.data.startup;
            if (user.id !== startup.creator.id) {
              toast.error('Startup ID mismatch');
              navigate(`/register-startup`);
            }
            console.log("Startup data for editing:", {
              id: startup.id,
              creator_first_name: startup.creator.firstName || '',
              creator_last_name: startup.creator.lastName || '',
              creator_email: startup.creator.email || '',
              ...startup,
            });
            setFormData({
              id: startup.id,
              name: startup.name || "",
              industry: startup.industry || "",
              location: startup.location || "",
              description: startup.description || "",
              stage: startup.stage || "",
              positions: startup.positions || 0,

              creator_first_name: startup.creator?.firstName || "",
              creator_last_name: startup.creator?.lastName || "",
              creator_email: startup.creator?.email || "",

              revenue: startup.revenue || 0,
              funding_amount: startup.funding_amount || 0,
              funding_round: startup.funding_round || "pre-seed",
              burn_rate: startup.burn_rate || 0,
              runway_months: startup.runway_months || 0,
              valuation: startup.valuation || 0,
              financial_notes: startup.financial_notes || "",

              tech_stack: startup.tech_stack || [],
            });

            setTechStack(startup.tech_stack || []);
            setRoles(
              Object.entries(startup.roles || {}).map(([title, details]) => ({  
                title,
                roleType: details.roleType || "Full Time",
                positionsNumber: details.positionsNumber || 0,
              }))
            );

            setExistingBanner(startup.banner_url || null);
            setExistingLogo(startup.logo_url || null);
            return
          }
          toast.error('Failed to load startup data for editing');
        } catch {
          console.error('Error fetching startup data for editing');
          toast.error('Error fetching startup data for editing');
        }
          
      }
      fetchStartupData();
    }
  

  }, [id, user?.id]);
  useEffect(() => {
    async function getStartupDocuments() {
      const response = await startupsAPI.getDocuments(id);
      if (response.success && response.data?.documents) {
        setExistingDocuments(response.data.documents);
      }
    }
    if (id) {
      getStartupDocuments();
    }
  }, [id]);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);


  //! TECH STACK
  const addTech = (tech) => {
    if (tech && !techStack.includes(tech) && techStack.length < 15) {
      setTechStack([...techStack, tech]);
      setTechInput("");
    }
  };
  
  const removeTech = (techToRemove) => {
    setTechStack(techStack.filter(tech => tech !== techToRemove));
  };
  
  const handleTechInputChange = (e) => {
    setTechInput(e.target.value);
  };
  
  const handleTechInputKeyDown = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      addTech(techInput.trim());
    }
  };
  
  //! DOCUMENTS
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedDocuments(prev => [...prev, ...files]);
  };
  
  const removeDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };
  

  //! Get current user data from localStorage
  useEffect(() => {
    if (user && !id) {

      setFormData((prev) => ({
        ...prev,
        creator: null,
        creator_first_name: user?.first_name || user?.firstName || "",
        creator_last_name: user?.last_name || user?.lastName || "",
        creator_email: user?.email || ""
      }));
    }
  }, [id, user]);
  //! Add XP points when completing steps
  useEffect(() => {
    if (currentStep > 1) {
      setXpPoints(prev => prev + 150);
    }
  }, [currentStep]);

  //! Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          
          toast.error('Please enter a startup name');
          return false;
        }
        if (!formData.industry) {
          toast.error('Please select an industry');
          return false;
        }
        if (!formData.location.trim()) {
          toast.error('Please enter a location');
          return false;
        }
        return true;
      case 2:
        if ((!formData?.creator_first_name || '').trim()) {
          toast.error('Please enter your first name');
          return false;
        }
        if ((!formData?.creator_last_name || '').trim()) {
          toast.error('Please enter your last name');
          return false;
        }
        if ((!formData?.creator_email || '').trim()) {
          toast.error('Please enter your email');
          return false;
        }
        return true;
      case 3:
        if (!formData.description.trim()) {
          toast.error('Please enter a startup description');
          return false;
        }
        if (!formData.stage) {
          toast.error('Please select a startup stage');
          return false;
        }
        return true;
      case 4:
        // Financial step - all fields are optional but should be validated
        if (formData.burn_rate < 0) {
          toast.error('Burn rate cannot be negative');
          return false;
        }
        if (formData.runway_months < 0) {
          toast.error('Runway months cannot be negative');
          return false;
        }
        return true;
      case 5:
        // if (!logoFile) {
        //   toast.error('Please upload a company logo');
        //   return false;
        // }
        return true;
      case 6:
        // Documents step - all fields are optional, no validation needed
        return true;
      case 7: {
        const invalidRoles = roles.filter(role => !role.title.trim() || !role.roleType);
        if (invalidRoles.length > 0) {
          toast.error('Please fill in all role titles and types');
          return false;
        }
        
        if (techStack.length === 0) {
          toast.warning('Consider adding your tech stack to attract relevant developers');
          // Don't return false - let them proceed without tech stack
        }
        
        return true;
      }
      default:
        return true;
    }
  };
  

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinancialChange = (field, value) => {
    // Convert to number for financial fields
    const numValue = field.includes('notes') ? value : parseFloat(value) || 0;
    handleInputChange(field, numValue);
  };

  const addRole = () => {
    if (roles.length < 10) {
      setRoles([...roles, { title: "", roleType: "Full Time" }]);
    } else {
      toast.warning('You can add up to 10 roles maximum');
    }
  };

  const removeRole = (index) => {
    if (roles.length > 1) {
      setRoles(roles.filter((_, i) => i !== index));
    }
  };

  const updateRole = (index, field, value) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "logo") setLogoFile(file);
      else setBannerFile(file);
    }
  };
  const handleAddDocuments = (files) => {
    setNewDocuments(prev => [...prev, ...files]);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(8)) {
      console.warn("Validation failed at step 8", formData);
      toast.error("Please complete all required fields.");
      return;
    }

    const token =
      access_token ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }


    setIsSubmitting(true);
    
    try {
      // Get current user ID from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const creator_id = user?.id || user?.userId || 11;

      if (!creator_id) {
        throw new Error('User not authenticated');
      }
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (logoFile && logoFile.size > MAX_SIZE) {
        toast.error("Logo file is too large");
        return;
      }

      // Convert roles array to the format expected by backend
      const rolesObject = roles.reduce((acc, role) => {
        if (!role.title?.trim()) return acc;

        acc[role.title.trim()] = {
          roleType: role.roleType,
          positionsNumber: Number(role.positionsNumber) || 0,
        };
        return acc;
      }, {});


      // Calculate total positions from all roles
      const totalPositions = roles.reduce((total, role) => total + (parseInt(role.positionsNumber) || 0), 0);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("industry", formData.industry);
      submitData.append("location", formData.location);
      submitData.append("description", formData.description);
      submitData.append("stage", formData.stage);
      submitData.append("positions", totalPositions.toString());
      submitData.append("roles", JSON.stringify(rolesObject));
      submitData.append("creator_first_name", formData.creator_first_name);
      submitData.append("creator_last_name", formData.creator_last_name);
      
      // Append financial data
      submitData.append("revenue", formData.revenue.toString());
      submitData.append("funding_amount", formData.funding_amount.toString());
      submitData.append("funding_round", formData.funding_round);
      submitData.append("burn_rate", formData.burn_rate.toString());
      submitData.append("runway_months", formData.runway_months.toString());
      submitData.append("valuation", formData.valuation.toString());
      submitData.append("financial_notes", formData.financial_notes);
      
      submitData.append("tech_stack", JSON.stringify(techStack));
      
      if (logoFile instanceof File) {
        submitData.append("logo", logoFile);
      }

      if (bannerFile instanceof File) {
        submitData.append("banner", bannerFile);
      }

      // Append uploaded documents
      uploadedDocuments.forEach((doc) => {
        submitData.append("documents", doc);
      });
      newDocuments.forEach(file => {
        submitData.append("documents", file);
      });

      // tell backend what to delete
      if (removedDocumentIds.length) {
        submitData.append(
          "removed_documents",
          JSON.stringify(removedDocumentIds)
        );
}
      let response
      if (id) {
        response = await fetch(`${API_URL}/startups/${id}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'application/json',
          },
          body: submitData,
        })
      } else {

        response = await fetch(`${API_URL}/startups/register`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'application/json',
          },
          body: submitData,
        });
      }
      console.log("Startup registration response:", response);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        logoutUser();
        return;
      }

      if (response.ok) {
        setXpPoints(1200); // Complete all XP
        setCurrentStep(9); // Move to completion step
        setFormData({
          name: "",
          industry: "",
          location: "",
          description: "",
          stage: "",
          positions: 0,
          roles: {},
          creator_first_name: "",
          creator_last_name: "",
          creator_email: "",
          
          revenue: 0,
          funding_amount: 0,
          funding_round: "pre-seed",
          burn_rate: 0,
          runway_months: 0,
          valuation: 0,
          financial_notes: "",
          
          tech_stack: []
        })
        localStorage.removeItem('formData');
        toast.success(`Startup ${id ? "updated" : "registered"} successfully!`);
        
      } else {
        throw new Error(data.error || data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Startup registration failed:", err);
      toast.error(err.message || "Internal server error");
    } finally {
      setIsSubmitting(false);
    }
  };


  const [maxStep, setMaxStep] = useState(1);
  useEffect(() => {
    if (currentStep > maxStep) {
      setMaxStep(currentStep);
    }
    if (id) {
      setMaxStep(9);
    }
  }, [currentStep, maxStep, id]);
  //! StepIndicator
  const StepIndicator = () => (
    <div className="mb-8 overflow-x-auto">
      <div className="flex items-center justify-start sm:justify-center min-w-max px-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
          <div key={step} className="flex items-center">
            <div
              onClick={() => maxStep >= step && setCurrentStep(step)}
              className={`flex flex-col items-center cursor-pointer ${step < currentStep
                  ? 'text-blue-400'
                  : step === currentStep
                    ? 'text-white'
                    : 'text-gray-500'
                }`}
            >
              <div
                className={`
                w-8 h-8 sm:w-12 sm:h-12
                rounded-full border-2
                flex items-center justify-center
                transition-all duration-300
                ${step < currentStep
                    ? 'bg-blue-400 border-blue-400 text-white'
                    : step === currentStep
                      ? 'bg-white border-blue-400 text-blue-400 animate-pulse'
                      : step <= maxStep
                        ? 'bg-gray-700 border-gray-500 text-gray-300'
                        : 'bg-gray-800 border-gray-600 text-gray-500'
                  }
              `}
              >
                {step < currentStep ? (
                  <CheckCircle size={16} />
                ) : (
                  <span className="font-bold text-xs sm:text-sm">{step}</span>
                )}
              </div>

              {/* Hide labels on mobile */}
              <span className="hidden sm:block text-xs mt-2 font-medium">
                {[
                  'Company',
                  'Founder',
                  'Details',
                  'Financial',
                  'Branding',
                  'Documents',
                  'Team',
                  'Review',
                  'Complete',
                ][step - 1]}
              </span>
            </div>

            {step < 9 && (
              <div
                className={`
                w-6 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full
                transition-all duration-300
                ${step < currentStep ? 'bg-blue-400' : 'bg-gray-700'}
              `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  



  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-0 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-white mb-4">
            Build Your <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Dream Team</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join thousands of founders who've built successful teams on our platform.
            <span className="text-white font-semibold"> Average time to first hire: 2.3 weeks.</span>
          </p>
        </div>

        <StepIndicator />

        {/* Three-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mx-auto">
          {/* Left Sidebar - Context & Benefits */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  Guide & Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SidebarContent currentStep={currentStep} />
                
                {/* Milestone Tracker */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">Profile Completion</span>
                    <span className="text-blue-400 text-sm font-bold">{Math.round(((currentStep - 1) / 8) * 100)}%</span>
                  </div>
                  <Progress value={((currentStep - 1) / 8) * 100} className="h-2 bg-gray-700  *:data-[slot=progress-indicator]:bg-blue-500 [&>div]:bg-blue-500/20" />
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">XP Earned: {xpPoints}/1200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Form */}
          <div className="lg:col-span-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              {/* Progress Bar */}
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Step {currentStep} of 8</span>
                  <span className="text-blue-400 text-sm font-medium">+{currentStep > 1 ? (currentStep - 1) * 150 : 0} XP</span>
                </div>
                <Progress value={((currentStep - 1) / 8) * 100} className="h-2 bg-gray-700  *:data-[slot=progress-indicator]:bg-blue-500 [&>div]:bg-blue-500/20" />
                <div className="h-2  transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${((currentStep - 1) / 8) * 100}%`, marginTop: '-8px', background: 'linear-linear(90deg,rgba(13, 91, 181, 1) 0%, rgba(78, 225, 245, 1) 100%)' }}
                ></div>
              </div>

              <CardContent className="p-6">
                {/* Step 1: Company Information */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-blue-400" />
                      </div>
                      <CardTitle className="text-2xl mb-2 text-white">Company Information</CardTitle>
                      <CardDescription className="text-gray-300">Let's start with the basics of your startup</CardDescription>
                    </div>
                
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
                          <span>Startup Name <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge></span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Your official startup name. This will be visible to all users and should match your legal business name.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-4 text-gray-400" size={20} />
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            placeholder="Enter your startup name"
                          />
                        </div>
                      </div>
                
                      <div className="space-y-3">
                        <Label htmlFor="industry" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
                          <span>
                            Industry <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Select the primary industry your startup operates in. This helps match you with relevant talent and investors.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="relative">
                          <Globe className="absolute right-4 top-3 text-gray-400 z-10" size={20} />
                          <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                            <SelectTrigger style={{ height: '45px' }} className="w-full border-gray-600 bg-gray-700/50 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all">
                              <SelectValue placeholder="Select Industry" className="text-white" />
                            </SelectTrigger>
                            <SelectContent position="bottom" className="w-full bg-gray-800 border-gray-600 text-white">
                              {industries.map(industry => (
                                <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-700 focus:bg-gray-700 "><span className="text-white w-full h-full hover:text-blue-400">{industry}</span></SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                
                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="location" className="text-sm font-medium text-white  items-center gap-2 flex justify-between w-full">
                          <span>Location <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge></span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Your primary operating location. Include city and country. This helps local talent find your startup and indicates if you support remote work.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                          <Input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Founder Details */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-blue-400" />
                      </div>
                      <CardTitle className="text-2xl mb-2 text-white">Founder Information</CardTitle>
                      <CardDescription className="text-gray-300">Tell us about yourself as the founder</CardDescription>
                    </div>
                
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-sm font-medium text-white  items-center gap-2 flex justify-between w-full">
                          <span>
                            First Name <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Your legal first name as the founder. This builds credibility with potential team members and investors.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-4 text-gray-400" size={20} />
                          <Input
                            id="firstName"
                            type="text"
                            value={formData.creator_first_name}
                            onChange={(e) => handleInputChange("creator_first_name", e.target.value)}
                            className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            placeholder="Your first name"
                          />
                        </div>
                      </div>
                
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-sm font-medium text-white  items-center gap-2 flex justify-between w-full">
                          <span>
                            Last Name <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Your legal last name. Complete founder profiles receive 47% more applications from qualified candidates.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-4 text-gray-400" size={20} />
                          <Input
                            id="lastName"
                            type="text"
                            value={formData.creator_last_name}
                            onChange={(e) => handleInputChange("creator_last_name", e.target.value)}
                            className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            placeholder="Your last name"
                          />
                        </div>
                      </div>
                
                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="email" className="text-sm font-medium text-white items-center flex justify-between w-full gap-2">
                          <span>
                            Email <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
                          </span>
                          {
                            id && (
                              <span className="text-sm text-yellow-400 italic">(We encrypt your email for security, please write it again)</span>
                            )
                          }
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Your professional email address. Using a company domain email enhances credibility and trust with potential team members.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                          <Input
                            id="email"
                            type="email"
                            value={formData.creator_email}
                            onChange={(e) => handleInputChange("creator_email", e.target.value)}
                            className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            placeholder="your.email@company.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Startup Details */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                        <Rocket className="w-8 h-8 text-blue-400" />
                      </div>
                      <CardTitle className="text-2xl mb-2 text-white">Startup Details</CardTitle>
                      <CardDescription className="text-gray-300">Tell us more about your vision and stage</CardDescription>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium mb-3 text-white flex items-center gap-2">
                          <span>
                            Description <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Describe your startup's mission, vision, and what makes it unique. A compelling description attracts 3x more qualified applicants and helps candidates understand your company culture.</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-gray-400 text-xs ml-auto">{formData.description.length}/500</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          rows={5}
                          className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                          placeholder="Describe your startup's mission, vision, and what makes it unique..."
                          maxLength={500}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-3 text-white flex items-center gap-2">
                          Current Stage <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {startupStages.map((stage) => (
                            <TooltipProvider key={stage.value}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Card
                                    onClick={() => handleInputChange("stage", stage.value)}
                                    className={`p-4 flex-1 cursor-pointer transition-all duration-200 border backdrop-blur-sm hover:scale-105 ${formData.stage === stage.value
                                      ? 'border-blue-400 bg-blue-400/20 text-white shadow-lg shadow-blue-400/20'
                                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-blue-400 hover:text-white'
                                      }`}
                                  >
                                    <CardContent className="p-0 text-center">
                                      <div className={`flex justify-center mb-2 ${formData.stage === stage.value ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {stage.icon}
                                      </div>
                                      <div className={`font-semibold text-sm ${formData.stage === stage.value ? 'text-white' : 'text-gray-300'}`}>
                                        {stage.label}
                                      </div>
                                      <div className={`text-xs mt-2 ${formData.stage === stage.value ? 'text-blue-300' : 'text-gray-500'}`}>
                                        {stage.description}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TooltipTrigger>
                                <TooltipContent arrowColor="bg-gray-800 fill-gray-800" side="top" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                                  <p className="text-sm">{stage.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Financial Foundation */}
                {currentStep === 4 && <StartupFinancialForm
                  formData={formData}
                  handleFinancialChange={handleFinancialChange}
                  handleInputChange={handleInputChange}

                
                />}

                {/* Step 5: Branding */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-blue-400" />
                      </div>
                      <CardTitle className="text-2xl mb-2 text-white">Brand Identity</CardTitle>
                      <CardDescription className="text-gray-300">Upload your logo and banner to stand out</CardDescription>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Logo Upload */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
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
                      </div>

                      {/* Banner Upload */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
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
                  </div>
                )}
                
                {/* Step 6: Documents Upload */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-blue-400" />
                      </div>
                      <CardTitle className="text-2xl mb-2 text-white">Company Documents</CardTitle>
                      <CardDescription className="text-gray-300">Upload important documents for your startup</CardDescription>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-white flex items-center gap-2 justify-between w-full">
                          Business Plan & Documents
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                                <InfoIcon className="size-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                              <p>Upload your business plan, pitch deck, or other important documents. PDF, DOC, DOCX files up to 10MB.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Card className="border-2 bg-blue-400/5 hover:scale-101 border-dashed border-gray-600 p-6 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-400/10 backdrop-blur-sm">
                          <CardContent className="p-0">
                            <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                            <div className="text-gray-300 font-medium mb-1">Upload Documents</div>
                            <div className="text-gray-500 text-xs">PDF, DOC, DOCX up to 10MB each</div>
            
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.txt"
                              className="hidden"
                              id="document-upload"
                              onChange={handleDocumentUpload}
                            />
                            <Button
                              onClick={() => document.getElementById('document-upload')?.click()}
                              className="mt-4 bg-blue-400 hover:bg-blue-500 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Select Files
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Existing documents */}
                      {existingDocuments.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-white">Existing Documents</Label>
                          <div className="space-y-2">
                            {existingDocuments
                              .filter(doc => !removedDocumentIds.includes(doc.id))
                              .map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1">
                                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span className="text-white text-sm truncate">{doc.filename}</span>
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setRemovedDocumentIds(prev => [...prev, doc.id])}
                                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Newly uploaded documents */}
                      {uploadedDocuments.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-white">New Documents</Label>
                          <div className="space-y-2">
                            {uploadedDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                  <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-white text-sm truncate">{doc.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Step 7: Team & Roles */}
                {currentStep === 7 && (
                  <StartupRolesAndTechStack
                    techStack={techStack}
                    techInput={techInput}
                    setTechInput={setTechInput}
                    handleTechInputChange={handleTechInputChange}
                    handleTechInputKeyDown={handleTechInputKeyDown}
                    addTech={addTech}
                    removeTech={removeTech}
                    roles={roles}
                    addRole={addRole}
                    updateRole={updateRole}
                    removeRole={removeRole}
                  />
                )}

                {/* Step 8: Review */}
                {currentStep === 8 && <StartupReview formData={formData} logoFile={logoFile} existingLogo={existingLogo} bannerFile={bannerFile} existingBanner={existingBanner} newDocuments={newDocuments} existingDocuments={existingDocuments} removedDocumentIds={removedDocumentIds} roles={roles} techStack={techStack}  />}

                {/* Step 9: Completion */}
                {currentStep === 9 && (
                  <div className="text-center py-8 animate-fadeIn">
                    <div className="w-24 h-24 bg-linear-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-bounce">
                      <CheckCircle size={40} className="text-white" />
                    </div>
                    <CardTitle className="text-3xl mb-3 text-white">Launch Complete! 🚀</CardTitle>
                    <CardDescription className="text-lg mb-6 max-w-md mx-auto text-gray-300">
                      Your startup <span className="text-white font-semibold">{formData.name}</span> is now ready to change the world.
                    </CardDescription>
                    <div className="grid md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-2xl text-white font-bold">{roles.reduce((total, role) => total + (role.positionsNumber || 0), 0)}</div>
                          <div className="text-gray-400 text-sm">Open Positions</div>
                        </CardContent>
                      </Card>
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-2xl text-white font-bold">{roles.length}</div>
                          <div className="text-gray-400 text-sm">Roles Defined</div>
                        </CardContent>
                      </Card>
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-2xl text-white font-bold capitalize">{formData.stage}</div>
                          <div className="text-gray-400 text-sm">Current Stage</div>
                        </CardContent>
                      </Card>
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-2xl text-white font-bold">1200</div>
                          <div className="text-gray-400 text-sm">XP Earned</div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-lg text-white font-bold">{formatCurrency(formData.funding_amount)}</div>
                          <div className="text-gray-400 text-sm">Total Funding</div>
                        </CardContent>
                      </Card>
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-lg text-white font-bold">{formatCurrency(formData.valuation)}</div>
                          <div className="text-gray-400 text-sm">Valuation</div>
                        </CardContent>
                      </Card>
                      <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-0 text-center">
                          <div className="text-lg text-white font-bold">{formData.runway_months}m</div>
                          <div className="text-gray-400 text-sm">Runway</div>
                        </CardContent>
                      </Card>
                    </div>
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-400 hover:bg-blue-500 text-white border-0 px-8 py-3 text-base transition-all hover:scale-105 shadow-lg shadow-blue-400/20"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 9 && (
                  <div className="flex justify-between items-center pt-8 mt-6 border-t border-gray-700">
                    <Button
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      variant="outline"
                      className="border-gray-600 text-gray-900 hover:text-gray-700 cursor-pointer hover:border-blue-400 transition-all hover:scale-105 backdrop-blur-sm"
                    >
                      <ChevronLeft size={18} className="mr-2" />
                      Previous
                    </Button>

                    {currentStep === 8 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-400 hover:bg-blue-500 text-white border-0 px-8 py-3 text-base transition-all hover:scale-105 shadow-lg shadow-blue-400/20"
                      >
                        {isSubmitting ? (
                          <>Launching...</>
                        ) : (
                          <>
                            {!id ? 'Launch' : 'Update'} Startup
                            <Rocket size={18} className="ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        className="bg-blue-400 hover:bg-blue-500 text-white cursor-pointer border-0 px-8 py-3 text-base transition-all hover:scale-105 shadow-lg shadow-blue-400/20"
                      >
                        Continue
                        <ChevronRight size={18} className="ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Stats & Metrics */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Profile Strength</span>
                    <span className="text-blue-400 font-bold">{Math.round(((currentStep - 1) / 8) * 100)}%</span>
                  </div>
                  <Progress value={((currentStep - 1) / 8) * 100} className="h-2 bg-gray-700  *:data-[slot=progress-indicator]:bg-blue-500 [&>div]:bg-blue-500/20" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Time to Complete</span>
                    <span className="text-white font-medium">~{9 - currentStep} min</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Your Progress</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Steps Completed</span>
                      <span className="text-white">{currentStep - 1}/7</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">XP Earned</span>
                      <span className="text-blue-400 font-bold">{xpPoints}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Did You Know?</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Startups that complete their profiles within 24 hours are <span className="text-blue-400 font-medium">3x more likely</span> to secure their first hire within two weeks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.7);
        }
      `}</style>
    </div>
  );
}