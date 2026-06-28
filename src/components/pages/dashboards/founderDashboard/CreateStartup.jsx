import { useState } from "react";
import { useDraft } from "@/utils/hooks/useDraft";
import {
  Rocket,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  Sparkles,
  Users,
  Target,
  DollarSign,
  Globe,
  Building2,
  Lightbulb,
  Palette,
  BrainCircuit,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, title: "Basics", icon: Rocket },
  { id: 2, title: "Details", icon: Building2 },
  { id: 3, title: "Team & Funding", icon: Users },
  { id: 4, title: "Review", icon: Check },
];

const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B+"];
const INDUSTRIES = [
  "AI & Machine Learning",
  "FinTech",
  "HealthTech",
  "EdTech",
  "E-Commerce",
  "SaaS",
  "Marketplace",
  "Climate Tech",
  "Web3 / Crypto",
  "Gaming",
  "Social",
  "Enterprise",
  "Other",
];

export default function CreateStartup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const INITIAL_STARTUP = {
    // Step 1: Basics
    name: "",
    tagline: "",
    logo: null,
    logoPreview: "",
    
    // Step 2: Details
    description: "",
    industry: "",
    stage: "",
    website: "",
    
    // Step 3: Team & Funding
    teamSize: "",
    lookingFor: [],
    fundingStatus: "Bootstrapped",
    fundingTarget: "",
    fundingRaised: "",
  };
  // B5 FIX: auto-save startup registration draft
  const [formData, setFormData, clearStartupDraft] = useDraft("create_startup", INITIAL_STARTUP);

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("logo", file);
        updateField("logoPreview", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Startup name is required";
      if (!formData.tagline.trim()) newErrors.tagline = "Tagline is required";
    }
    
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.industry) newErrors.industry = "Please select an industry";
      if (!formData.stage) newErrors.stage = "Please select a stage";
    }
    
    if (step === 3) {
      if (!formData.teamSize) newErrors.teamSize = "Team size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Navigate to my startups page
    navigate("/my-startups");
  };

  const toggleRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(role)
        ? prev.lookingFor.filter((r) => r !== role)
        : [...prev.lookingFor, role],
    }));
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          to="/my-startups"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Startups
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/25">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Create Your Startup
          </h1>
          <p className="text-white/60">
            Let's bring your vision to life. Tell us about your venture.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                      : isCompleted
                      ? "bg-green-500/20 border border-green-500/30 text-green-400 cursor-pointer"
                      : "bg-white/5 border border-white/10 text-white/30"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${
                      isCompleted ? "bg-green-500/50" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">
                  Let's start with the basics
                </h2>
                <p className="text-sm text-white/50">
                  What should we call your startup?
                </p>
              </div>

              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  {formData.logoPreview ? (
                    <div className="relative">
                      <img
                        src={formData.logoPreview}
                        alt="Logo preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500/50"
                      />
                      <button
                        onClick={() => {
                          updateField("logo", null);
                          updateField("logoPreview", "");
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 hover:border-purple-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group-hover:bg-white/[0.07]">
                      <Upload className="w-6 h-6 text-white/30 group-hover:text-purple-400 transition-colors" />
                      <span className="text-xs text-white/30 mt-1">Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  Upload a logo or we'll generate one for you
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Startup Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., NeuroForge"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.name ? "border-red-500/50" : "border-white/10"
                  } text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors`}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Tagline Input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="A short, catchy description (max 60 chars)"
                  maxLength={60}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.tagline ? "border-red-500/50" : "border-white/10"
                  } text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors`}
                />
                <div className="flex justify-between mt-1">
                  {errors.tagline ? (
                    <p className="text-xs text-red-400">{errors.tagline}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-white/30">
                    {formData.tagline.length}/60
                  </span>
                </div>
              </div>

              {/* AI Suggestion */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Generate tagline with AI</span>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">
                  Tell us more about your startup
                </h2>
                <p className="text-sm text-white/50">
                  Help others understand what you're building
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="What problem are you solving? Who are your target customers?"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.description ? "border-red-500/50" : "border-white/10"
                  } text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none`}
                />
                {errors.description && (
                  <p className="text-xs text-red-400 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Industry *
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => updateField("industry", industry)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        formData.industry === industry
                          ? "bg-purple-500/30 border border-purple-500/50 text-purple-300"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
                {errors.industry && (
                  <p className="text-xs text-red-400 mt-2">{errors.industry}</p>
                )}
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Stage *
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => updateField("stage", stage)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.stage === stage
                          ? "bg-purple-500/30 border border-purple-500/50 text-purple-300"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
                {errors.stage && (
                  <p className="text-xs text-red-400 mt-2">{errors.stage}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Website (optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://yourstartup.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team & Funding */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">
                  Team & Funding
                </h2>
                <p className="text-sm text-white/50">
                  Tell us about your team and funding situation
                </p>
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Current Team Size *
                </label>
                <div className="flex flex-wrap gap-2">
                  {["1 (Solo)", "2-5", "6-10", "11-25", "26-50", "50+"].map(
                    (size) => (
                      <button
                        key={size}
                        onClick={() => updateField("teamSize", size)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.teamSize === size
                            ? "bg-purple-500/30 border border-purple-500/50 text-purple-300"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
                {errors.teamSize && (
                  <p className="text-xs text-red-400 mt-2">{errors.teamSize}</p>
                )}
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Looking for (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Developers",
                    "Designers",
                    "Marketing",
                    "Sales",
                    "Operations",
                    "Finance",
                    "Legal",
                    "Co-founder",
                    "Advisors",
                    "Investors",
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        formData.lookingFor.includes(role)
                          ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-300"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funding Status */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Funding Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Bootstrapped", "Raising", "Funded", "Not Looking"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => updateField("fundingStatus", status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.fundingStatus === status
                            ? "bg-green-500/30 border border-green-500/50 text-green-300"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Funding Target (conditional) */}
              {formData.fundingStatus === "Raising" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Funding Target
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={formData.fundingTarget}
                        onChange={(e) =>
                          updateField("fundingTarget", e.target.value)
                        }
                        placeholder="1,000,000"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Already Raised
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={formData.fundingRaised}
                        onChange={(e) =>
                          updateField("fundingRaised", e.target.value)
                        }
                        placeholder="0"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">
                  Review Your Startup
                </h2>
                <p className="text-sm text-white/50">
                  Make sure everything looks good before creating
                </p>
              </div>

              {/* Preview Card */}
              <div className="rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="h-20 bg-gradient-to-br from-purple-600 to-indigo-600" />
                
                <div className="p-6 -mt-10">
                  {/* Logo */}
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-4 border-zinc-900 flex items-center justify-center text-4xl mb-4 shadow-lg">
                    {formData.logoPreview ? (
                      <img
                        src={formData.logoPreview}
                        alt="Logo"
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      "🚀"
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-bold text-white mb-1">
                    {formData.name || "Your Startup"}
                  </h3>
                  <p className="text-sm text-white/60 mb-4">
                    {formData.tagline || "Your tagline here"}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.industry && (
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs">
                        {formData.industry}
                      </span>
                    )}
                    {formData.stage && (
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
                        {formData.stage}
                      </span>
                    )}
                    {formData.fundingStatus && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs">
                        {formData.fundingStatus}
                      </span>
                    )}
                  </div>

                  {formData.description && (
                    <p className="text-sm text-white/70 mb-4">
                      {formData.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-white/40">Team Size</p>
                      <p className="text-sm font-medium text-white">
                        {formData.teamSize || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Looking For</p>
                      <p className="text-sm font-medium text-white">
                        {formData.lookingFor.length > 0
                          ? formData.lookingFor.slice(0, 2).join(", ") +
                            (formData.lookingFor.length > 2
                              ? ` +${formData.lookingFor.length - 2}`
                              : "")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Tools Suggestion */}
              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      After creating, try our AI tools!
                    </p>
                    <p className="text-xs text-white/60">
                      Generate a business plan, pitch deck, or logo for your new startup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                currentStep === 1
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all hover:scale-105"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Create Startup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}