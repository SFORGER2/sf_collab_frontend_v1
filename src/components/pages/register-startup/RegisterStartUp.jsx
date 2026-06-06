"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, Rocket, CheckCircle, Star, Trophy, Zap, Lightbulb, TrendingUp,  } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "@/utils/config";
import SidebarContent from "./SidebarContent";
import { logoutUser } from "@/services/auth/authThunks";
import StartupReview from "./steps/9_StartupReview";
import StartupRolesAndTechStack from "./steps/7_StartupRolesAndTeamStack";
import StartupFinancialForm from "./steps/4_StartupFinancialForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import IdeaLaunchingLoader from "./IdeaLaunchingLoader";
import Branding from "./steps/5_branding";
import Completion from "./steps/9_completion";
import DocumentsUpload from "./steps/6_documents_upload";
import FounderDetailsSection from "./steps/2_founderDetails";
import StartupDetailsSection from "./steps/3_startupDetails";
import CompanyInformationSection from "./steps/1_companyInformation";
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
  const ideaId = query.get('ideaId') || null;
  const [ideaLoading, setIdeaLoading] = useState(false);
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
    
      async function fetchIdeaLaunch() {
        try {
          setIdeaLoading(true);
          const response = await startupsAPI.getIdeaLaunchData(ideaId);
          console.log("Idea launch data:", response);
          if (response.success && response.data?.suggestions) {
            const idea = response.data.suggestions;
            setFormData(prev => ({
              ...prev,
              name: idea.name || "",
              industry: idea.industry || "",
              location: idea.location || "",
              description: idea.description || "",
              stage: idea.stage || "",
              positions: idea.positions || 0,
              roles: idea.roles || {},
              revenue: 0,
              funding_amount: 0,
              funding_round: "pre-seed",
              burn_rate: 0,
              runway_months: 0,
              valuation: 0,
              financial_notes: "",
              tech_stack: idea.tech_stack || [],
            }));
          }
        } catch (error) {
          console.error('Error fetching idea launch data:', error);
          toast.error('Error fetching idea launch data');
        } finally {
          setIdeaLoading(false);
        }
      }
    if (ideaId && !id) {
      fetchIdeaLaunch();
    }
  }, [ideaId, id]);
  useEffect(() => {
    if (ideaId && !id) {
      setTechStack(formData.tech_stack || []);
      setRoles(
        Object.entries(formData.roles || {}).map(([title, details]) => ({
          title,
          roleType: details.roleType || "Full Time",
          positionsNumber: details.positionsNumber || 0,
        }))
      );
    }
  }, [formData, ideaId, id]);
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
        response = await startupsAPI.update(id, submitData, token);
        response = await startupsAPI.update(id, submitData, token);
      } else {
        response = await startupsAPI.register(submitData);
        response = await startupsAPI.register(submitData);
      }
      console.log("Startup registration response:", response);

      // FIX: startupsAPI.register returns response.data.data = { startup, role }
      // startupsAPI.update returns response.data = { success, data: { startup } }
      // Normalise: success when we have a startup object with an id
      const startupObj = response.startup || response.data?.startup || response;
      const startupId  = startupObj?.id || response.id;

      if (!startupId) {
        throw new Error(response.error || response.message || "Registration failed");
      }

      // Success
      {
        localStorage.removeItem('formData');
        toast.success(`Startup ${id ? "updated" : "registered"} successfully!`);
        if (id) {
          navigate(`/startup-details/${id}`);
        } else {
          // Add mode: show the celebration / launch complete screen
          setXpPoints(1200);
          setCurrentStep(9);
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
          });
        }
        
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
  const totalSteps = id ? 8 : 9;
  const StepIndicator = () => (
    <div className="mb-8 overflow-x-auto">
      <div className="flex items-center justify-start sm:justify-center min-w-max px-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, ...(id ? [] : [9])].map((step) => (
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

            {step < totalSteps && (
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
      <IdeaLaunchingLoader loading={ideaLoading} />
      <div className="container mx-auto px-0 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-8 mt-10">

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
                  <CompanyInformationSection
                  formData={formData}
                  handleInputChange={handleInputChange}
                  />
                )}

                {/* Step 2: Founder Details */}
                {currentStep === 2 && (
                  <FounderDetailsSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                    id={id}
                  />
                )}

                {/* Step 3: Startup Details */}
                {currentStep === 3 && (
                  <StartupDetailsSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                )}

                {/* Step 4: Financial Foundation */}
                {currentStep === 4 && <StartupFinancialForm
                  formData={formData}
                  handleFinancialChange={handleFinancialChange}
                  handleInputChange={handleInputChange}

                
                />}

                {/* Step 5: Branding */}
                {currentStep === 5 && (<Branding
                  logoFile={logoFile}
                  existingLogo={existingLogo}
                  bannerFile={bannerFile}
                  existingBanner={existingBanner}
                  logoInputRef={logoInputRef}
                  bannerInputRef={bannerInputRef}
                  handleFileChange={handleFileChange}
                  formData={formData}
                />)}
                
                {/* Step 6: Documents Upload */}
                {currentStep === 6 && (
                  <DocumentsUpload
                    existingDocuments={existingDocuments}
                    uploadedDocuments={uploadedDocuments}
                    removedDocumentIds={removedDocumentIds}
                    handleDocumentUpload={handleDocumentUpload}
                    removeDocument={removeDocument}
                    setRemovedDocumentIds={setRemovedDocumentIds}
                    formData={formData}
                  />
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
                {currentStep === 8 && <StartupReview formData={formData} logoFile={logoFile} existingLogo={existingLogo} bannerFile={bannerFile} existingBanner={existingBanner} newDocuments={newDocuments} existingDocuments={existingDocuments} removedDocumentIds={removedDocumentIds} roles={roles} techStack={techStack} />}

                {/* Step 9: Completion */}
                {currentStep === 9 && (
                  <Completion
                    formData={formData}
                    roles={roles}
                  />
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
    </div>
  );
}