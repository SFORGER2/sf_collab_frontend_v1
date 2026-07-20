import React, { useState } from "react";
import {
  ChevronRight,
  ArrowLeft,
  Check,
  Layout,
  Palette,
  Link as LinkIcon,
  Rocket,
  Sparkles,
  Edit2,
  Grid,
  Briefcase,
  ShoppingCart,
  FileText,
  Monitor,
  Box,
  MoreHorizontal,
  Upload,
  User,
  Search,
  Mail,
  Calendar,
  TrendingUp,
  X,
  Plus,
} from "lucide-react";

export const ProjectWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State matching the UI
  const [formData, setFormData] = useState({
    websiteName: "",
    appType: "Business",
    primaryColor: "#06b6d4",
    fontStyle: "sans",
    features: ["Contact Form", "Blog", "Analytics"],
    otherFeature: "",
    referenceUrls: [
      "https://stripe.com",
      "https://webflow.com",
      "https://notion.so",
    ],
    currentUrlInput: "",
  });

  const TOTAL_STEPS = 5;

  // Navigation Handlers
  const handleNext = () => {
    if (currentStep === 1 && !formData.websiteName.trim()) return; // Simple validation
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  // --- Step Content Configurations ---

  const appTypes = [
    {
      id: "Business",
      icon: Briefcase,
      desc: "Corporate, services, consulting",
    },
    { id: "E-commerce", icon: ShoppingCart, desc: "Online store, products" },
    { id: "Portfolio", icon: Layout, desc: "Showcase your work and projects" },
    { id: "Blog", icon: FileText, desc: "Articles, news, and stories" },
    { id: "Landing Page", icon: Monitor, desc: "Promote a product or service" },
    {
      id: "SaaS / Web App",
      icon: Box,
      desc: "Software or tools with dashboards",
    },
    { id: "Other", icon: MoreHorizontal, desc: "Something else" },
  ];

  const colors = [
    "#06b6d4",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
  ];

  const fontOptions = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Source Sans Pro",
  ];

  const availableFeatures = [
    { id: "Contact Form", icon: Mail, desc: "Allow visitors to contact you" },
    { id: "Blog", icon: FileText, desc: "Publish articles and updates" },
    { id: "E-commerce", icon: ShoppingCart, desc: "Sell products online" },
    { id: "User Accounts", icon: User, desc: "Login and user profiles" },
    { id: "SEO Tools", icon: Search, desc: "Optimize for search engines" },
    {
      id: "Newsletter",
      icon: Mail,
      desc: "Collect emails and send newsletters",
    },
    {
      id: "Booking / Calendar",
      icon: Calendar,
      desc: "Allow bookings or appointments",
    },
    {
      id: "Analytics",
      icon: TrendingUp,
      desc: "Track visitors and website data",
    },
  ];

  // Render Helpers
  const toggleFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const addUrl = () => {
    if (
      formData.currentUrlInput &&
      formData.currentUrlInput.startsWith("http")
    ) {
      setFormData((prev) => ({
        ...prev,
        referenceUrls: [...prev.referenceUrls, prev.currentUrlInput],
        currentUrlInput: "",
      }));
    }
  };

  const removeUrl = (urlToRemove) => {
    setFormData((prev) => ({
      ...prev,
      referenceUrls: prev.referenceUrls.filter((url) => url !== urlToRemove),
    }));
  };

  // --- Layout Wrapper Component ---
  const StepLayout = ({
    stepNum,
    sidebarTitle,
    sidebarDesc,
    mainIcon: MainIcon,
    mainTitle,
    mainSubtitle,
    children,
    accentColor,
  }) => (
    <div className="w-full bg-[#0d0f17] border border-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300">
      {/* Left Sidebar */}
      <div className="w-full md:w-[30%] bg-[#0f111a] border-b md:border-b-0 md:border-r border-slate-800 p-8 flex flex-col">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-6 ${
            accentColor === "cyan"
              ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              : accentColor === "purple"
                ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-cyan-500 text-white"
          }`}
        >
          {stepNum}
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-3">
          {sidebarTitle}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{sidebarDesc}</p>
      </div>

      {/* Right Content Area */}
      <div className="w-full md:w-[70%] p-8 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div
              className={`p-2.5 rounded-xl border ${
                accentColor === "cyan"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : accentColor === "purple"
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              }`}
            >
              <MainIcon className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            {mainTitle}
          </h2>
          <p className="text-sm text-slate-400">{mainSubtitle}</p>
        </div>

        <div className="flex-1">{children}</div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between">
          {stepNum > 1 ? (
            <button
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {stepNum < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className={`px-6 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 text-white ${
                accentColor === "cyan"
                  ? "bg-cyan-600 hover:bg-cyan-500"
                  : accentColor === "purple"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-cyan-600 hover:bg-cyan-500"
              } ${currentStep === 1 && !formData.websiteName.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? "Generating..." : "Generate Website ✨"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Success Screen
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
          <Rocket className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-4xl font-bold text-slate-100 mb-4">
          Project Initialized!
        </h2>
        <p className="text-slate-400 mb-8 max-w-md text-lg">
          Your new workspace for "{formData.websiteName}" has been created. The
          AI is scaffolding your project now.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          View Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-sans text-slate-300">
      {/* --- Top Global Header & Progress --- */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-slate-100 mb-3 tracking-tight">
          Website Creation Wizard
        </h1>
        <p className="text-slate-400 text-sm">
          Answer a few questions and we'll generate your perfect website.
        </p>

        <div className="mt-12 max-w-4xl mx-auto relative z-0 px-4">
          {/* Progress Line */}
          <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-800 -z-10"></div>
          <div
            className="absolute top-5 left-10 h-[2px] bg-emerald-500 -z-10 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 95}%`,
            }}
          ></div>

          <div className="flex justify-between">
            {[
              "BASICS",
              "APP TYPE",
              "BRANDING",
              "FEATURES",
              "REFERENCE URLS",
            ].map((label, idx) => {
              const step = idx + 1;
              return (
                <div key={step} className="flex flex-col items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step < currentStep
                        ? "bg-emerald-500 text-white"
                        : step === currentStep
                          ? "bg-[#0a0b10] border-2 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          : "bg-[#0a0b10] border-2 border-slate-700 text-slate-500"
                    }`}
                  >
                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest hidden md:block transition-colors duration-500 ${
                      step === currentStep ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Step Contents --- */}

      {/* STEP 1: WEBSITE NAME */}
      {currentStep === 1 && (
        <StepLayout
          stepNum={1}
          accentColor="cyan"
          sidebarTitle="Website Name"
          sidebarDesc="Enter the name of your website. You can always change it later."
          mainIcon={Edit2}
          mainTitle="What is your website name?"
          mainSubtitle="This will help us personalize your website."
        >
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Website Name
              </label>
              <input
                type="text"
                autoFocus
                className="w-full bg-[#0a0b10] border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                placeholder="e.g. Acme Marketing"
                value={formData.websiteName}
                onChange={(e) =>
                  setFormData({ ...formData, websiteName: e.target.value })
                }
              />
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 p-4 rounded-xl flex items-center gap-3 text-sm">
              <Sparkles className="w-5 h-5 shrink-0" />
              Tip: Choose a name that reflects your brand or business.
            </div>
          </div>
        </StepLayout>
      )}

      {/* STEP 2: APP TYPE */}
      {currentStep === 2 && (
        <StepLayout
          stepNum={2}
          accentColor="purple"
          sidebarTitle="App Type"
          sidebarDesc="Select the type of website you want to build."
          mainIcon={Grid}
          mainTitle="What type of website do you want to build?"
          mainSubtitle="Choose the option that best describes your project."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {appTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setFormData({ ...formData, appType: type.id })}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  formData.appType === type.id
                    ? "bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "bg-[#0a0b10] border-slate-800 hover:border-slate-600"
                }`}
              >
                <div
                  className={`mb-4 ${formData.appType === type.id ? "text-purple-400" : "text-slate-400"}`}
                >
                  <type.icon className="w-6 h-6" />
                </div>
                <h4
                  className={`text-sm font-bold mb-1 ${formData.appType === type.id ? "text-purple-300" : "text-slate-200"}`}
                >
                  {type.id}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {type.desc}
                </p>
              </div>
            ))}
          </div>
        </StepLayout>
      )}

      {/* STEP 3: BRANDING */}
      {currentStep === 3 && (
        <StepLayout
          stepNum={3}
          accentColor="purple"
          sidebarTitle="Branding"
          sidebarDesc="Define your brand identity and visual style."
          mainIcon={Palette}
          mainTitle="Let's define your branding"
          mainSubtitle="Choose your colors, font style and upload your logo."
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Logo
                </label>
                <div className="w-full h-32 border border-dashed border-slate-700 bg-[#0a0b10]/50 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors cursor-pointer group">
                  <Upload className="w-6 h-6 mb-2 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-sm font-bold text-slate-200 mb-1">
                    Upload Logo
                  </span>
                  <span className="text-xs">PNG, SVG or JPG</span>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Primary Color
                </label>
                <div className="flex flex-wrap gap-4 items-center">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setFormData({ ...formData, primaryColor: color })
                      }
                      className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center ${formData.primaryColor === color ? "ring-2 ring-cyan-400 ring-offset-4 ring-offset-[#0d0f17] scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: color }}
                    >
                      {formData.primaryColor === color && (
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                  <button className="w-12 h-12 rounded-xl border border-slate-700 bg-[#0a0b10] flex items-center justify-center text-slate-400 hover:bg-slate-800 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Font Style
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={formData.fontStyle}
                  onChange={(e) =>
                    setFormData({ ...formData, fontStyle: e.target.value })
                  }
                  className="w-full sm:w-64 bg-[#0a0b10] border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1em",
                  }}
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                  {/* Keep fallback if starting state is slightly different */}
                  {!fontOptions.includes(formData.fontStyle) && (
                    <option value={formData.fontStyle}>
                      {formData.fontStyle}
                    </option>
                  )}
                </select>
                <div className="flex-1 bg-[#0a0b10] border border-slate-700 rounded-xl p-4 flex items-center overflow-hidden">
                  <span
                    className="text-sm text-slate-300 truncate"
                    style={{
                      fontFamily: fontOptions.includes(formData.fontStyle)
                        ? `"${formData.fontStyle}", sans-serif`
                        : "sans-serif",
                    }}
                  >
                    The quick one font
                  </span>
                </div>
              </div>
            </div>
          </div>
        </StepLayout>
      )}

      {/* STEP 4: FEATURES */}
      {currentStep === 4 && (
        <StepLayout
          stepNum={4}
          accentColor="cyan" // UI shows a mix, we'll keep cyan active, but purple checks
          sidebarTitle="Features"
          sidebarDesc="Select the features and functionalities you need."
          mainIcon={Sparkles}
          mainTitle="What features do you need?"
          mainSubtitle="Select all that apply. You can add or remove later."
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableFeatures.map((feat) => {
                const isSelected = formData.features.includes(feat.id);
                return (
                  <label
                    key={feat.id}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                        : "bg-[#0a0b10] border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <feat.icon
                        className={`w-5 h-5 ${isSelected ? "text-cyan-400" : "text-slate-400"}`}
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-cyan-500 border-cyan-500"
                            : "bg-[#0a0b10] border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[#0d0f17] font-bold" />
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold mb-1 ${isSelected ? "text-cyan-300" : "text-slate-200"}`}
                    >
                      {feat.id}
                    </span>
                    <span className="text-xs text-slate-500 leading-tight">
                      {feat.desc}
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      onChange={() => toggleFeature(feat.id)}
                    />
                  </label>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Other (Please specify)
              </label>
              <input
                type="text"
                className="w-full bg-[#0a0b10] border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
                placeholder="Describe any other features you need..."
                value={formData.otherFeature}
                onChange={(e) =>
                  setFormData({ ...formData, otherFeature: e.target.value })
                }
              />
            </div>
          </div>
        </StepLayout>
      )}

      {/* STEP 5: REFERENCE URLs */}
      {currentStep === 5 && (
        <StepLayout
          stepNum={5}
          accentColor="cyan"
          sidebarTitle="Reference URLs"
          sidebarDesc="Share websites you like or similar to your vision."
          mainIcon={LinkIcon}
          mainTitle="Share reference websites (optional)"
          mainSubtitle="Add URLs of websites you like. This helps us understand your style and expectations."
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side inputs */}
            <div className="flex-1 space-y-6">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={formData.currentUrlInput}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentUrlInput: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addUrl()}
                  placeholder="https://example.com"
                  className="flex-1 bg-[#0a0b10] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  onClick={addUrl}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  Add URL
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.referenceUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 px-3 py-1.5 rounded-lg text-sm"
                  >
                    {url}
                    <button
                      onClick={() => removeUrl(url)}
                      className="hover:text-cyan-200 transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side info box */}
            <div className="w-full lg:w-72 bg-[#0a0b10] border border-slate-800 rounded-xl p-5 shrink-0 flex flex-col">
              <div className="w-full h-24 bg-[#11131a] border border-slate-700 rounded-lg mb-5 flex p-3 gap-3">
                <div className="w-16 h-16 bg-purple-500/20 rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-full h-3 bg-slate-800 rounded"></div>
                  <div className="w-3/4 h-3 bg-slate-800 rounded"></div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-200 mb-3">
                These references help us:
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />{" "}
                  Understand the design style you prefer
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" /> Match the
                  layout and structure you like
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" /> Create a
                  website that's closer to your vision
                </li>
              </ul>
            </div>
          </div>
        </StepLayout>
      )}
    </div>
  );
};
