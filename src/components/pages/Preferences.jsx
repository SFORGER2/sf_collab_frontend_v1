import { Check, X, Mail } from "lucide-react"
import React, { useState, useEffect } from "react"
import notificationAPI from "../../utils/APIs/notificationAPI"
import { toast } from "react-toastify"

export default function Preferences() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "English";
  });
  const [timeZone, setTimeZone] = useState("UTC+")
  const [defaultHomepage, setDefaultHomepage] = useState("Dashboard")
  const [showLanguageOptions, setShowLanguageOptions] = useState(false)
  const [showTimeZoneOptions, setShowTimeZoneOptions] = useState(false)
  const [showHomepageOptions, setShowHomepageOptions] = useState(false)

  const languages = ["English", "Spanish", "French"]
  const timeZones = [
    { value: "UTC+", label: "UTC+" },
    { value: "UTC-5", label: "UTC-5 (EST)" },
    { value: "UTC-8", label: "UTC-8 (PST)" },
    { value: "UTC+1", label: "UTC+1 (CET)" },
    { value: "UTC+9", label: "UTC+9 (JST)" }
  ]
  const homepages = ["Dashboard", "Analytics", "Projects", "Settings"]
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await notificationAPI.getSubscriptionPreferences()
        if (response) {
          setNewsletterPrefs({
            newsletter: response.newsletter ?? true,
            announcements: response.announcements ?? true,
            marketing: response.marketing ?? false,
          })
        }
      } catch (error) {
        console.error("Failed to load newsletter preferences:", error)
      }
    }
    loadPreferences()
  }, [])

  useEffect(() => {
    // Only attach listener when at least one dropdown is open
    if (!showLanguageOptions && !showTimeZoneOptions && !showHomepageOptions) return;

    const handleClickOutside = () => {
      setShowLanguageOptions(false);
      setShowTimeZoneOptions(false);
      setShowHomepageOptions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguageOptions, showTimeZoneOptions, showHomepageOptions]);

  const handleCancel = () => {
    console.log("Settings cancelled")
    toast.info("Changes discarded")
  }

  const handleSave = async () => {
    try {
      await notificationAPI.updateSubscriptionPreferences(newsletterPrefs)
      toast.success("Preferences saved successfully!")
    } catch (error) {
      console.error("Failed to save newsletter preferences:", error)
      toast.error("Failed to save preferences.")
    }
  }

  const toggleLanguageOptions = (e) => {
    e.stopPropagation()
    setShowLanguageOptions(!showLanguageOptions)
    setShowTimeZoneOptions(false)
    setShowHomepageOptions(false)
  }

  const toggleTimeZoneOptions = (e) => {
    e.stopPropagation()
    setShowTimeZoneOptions(!showTimeZoneOptions)
    setShowLanguageOptions(false)
    setShowHomepageOptions(false)
  }

  const toggleHomepageOptions = (e) => {
    e.stopPropagation()
    setShowHomepageOptions(!showHomepageOptions)
    setShowLanguageOptions(false)
    setShowTimeZoneOptions(false)
  }

  const handleNewsletterPrefChange = (key) => {
    setNewsletterPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col font-sans">
      <div className="w-full mx-auto bg-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold">Preferences</h1>
            <p className="text-gray-400 text-sm">You can customize your Preferences details here.</p>
          </div>

          <hr className="border-gray-800" />

          {/* Customize Experience */}
          <div className="flex gap-6 justify-between">
            <div className="w-1/2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">Customize your experience</h2>
                <span className="text-gray-400 text-sm" title="Info">ℹ️</span>
              </div>
              <p className="text-gray-400 text-sm">
                You can change language, time zone, default page experience.
              </p>
            </div>

            <div className="flex flex-col gap-6 w-1/2">
              {/* Language */}
              <div>
                <label htmlFor="language" className="text-sm font-medium">
                  Language
                </label>
                <div className="relative">
                  <div
                    onClick={toggleLanguageOptions}
                    className="text-white p-2.5 border border-gray-700 rounded w-full mt-2 cursor-pointer"
                  >
                    {language}
                  </div>
                  {showLanguageOptions && (
                    <div className="absolute top-full left-0 right-0 bg-[#232323] border border-gray-700 rounded mt-1 z-10">
                      {languages.map((lang) => (
                        <div
                          key={lang}
                          onClick={(e) => {
                            e.stopPropagation();

                            setLanguage(lang);
                            localStorage.setItem("language", lang);
                            if (lang === "Arabic") {
                              document.documentElement.dir = "rtl";
                            } else {
                              document.documentElement.dir = "ltr";
                            }

                            setShowLanguageOptions(false);
                            document.documentElement.dir =
                              lang === "Arabic" ? "rtl" : "ltr";

                            setShowLanguageOptions(false);
                            setShowLanguageOptions(false);
                          }}
                          className="p-2.5 cursor-pointer hover:bg-[#232323]"
                        >
                          {lang}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label htmlFor="timezone" className="text-sm font-medium">
                  Time Zone
                </label>
                <div className="relative">
                  <div
                    onClick={toggleTimeZoneOptions}
                    className="text-white p-2.5 border border-gray-700 rounded w-full mt-2 cursor-pointer"
                  >
                    {timeZone}
                  </div>
                  {showTimeZoneOptions && (
                    <div className="absolute top-full left-0 right-0 border  bg-[#232323] border-gray-700 rounded mt-1 z-10">
                      {timeZones.map(({ value, label }) => (
                        <div
                          key={value}
                          onClick={(e) => {
                            e.stopPropagation()
                            setTimeZone(value)
                            setShowTimeZoneOptions(false)
                          }}
                          className="p-2.5 cursor-pointer hover:bg-[#232323]"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Default Homepage */}
              <div>
                <label htmlFor="homepage" className="text-sm font-medium">
                  Default Homepage
                </label>
                <div className="relative">
                  <div
                    onClick={toggleHomepageOptions}
                    className="text-white p-2.5 border border-gray-700 rounded w-full mt-2 cursor-pointer"
                  >
                    {defaultHomepage}
                  </div>
                  {showHomepageOptions && (
                    <div className="absolute top-full left-0 right-0 border bg-[#232323] border-gray-700 rounded mt-1 z-10">
                      {homepages.map((page) => (
                        <div
                          key={page}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDefaultHomepage(page)
                            setShowHomepageOptions(false)
                          }}
                          className="p-2.5 cursor-pointer hover:bg-[#232323]"
                        >
                          {page}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Subscriptions */}
          <hr className="border-gray-800" />

          <div className="flex gap-6 justify-between">
            <div className="w-1/2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">Newsletter Subscriptions</h2>
              </div>
              <p className="text-gray-400 text-sm">
                Control the newsletter editions and alerts sent to your email inbox.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-1/2">
              {/* weekly newsletter */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newsletterPrefs.newsletter}
                  onChange={() => handleNewsletterPrefChange("newsletter")}
                  className="mt-1 accent-purple-600 rounded bg-black border-gray-700"
                />
                <div>
                  <span className="block text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                    Weekly Eco-system Digest
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    Curated startup success stories, developer guides, and community achievements.
                  </span>
                </div>
              </label>

              {/* product announcements */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newsletterPrefs.announcements}
                  onChange={() => handleNewsletterPrefChange("announcements")}
                  className="mt-1 accent-purple-600 rounded bg-black border-gray-700"
                />
                <div>
                  <span className="block text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                    Product Updates & Feature Releases
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    Be the first to know about new tools, platform features, and roadmap progress.
                  </span>
                </div>
              </label>

              {/* marketing */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newsletterPrefs.marketing}
                  onChange={() => handleNewsletterPrefChange("marketing")}
                  className="mt-1 accent-purple-600 rounded bg-black border-gray-700"
                />
                <div>
                  <span className="block text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                    Events & Partner Promotions
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    Get invitations to webinars, founder meetups, and ecosystem events.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <hr className="border-gray-800" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-gray-700 text-white rounded-full hover:bg-gray-800"
            >
              Cancel <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-full hover:bg-gray-100"
            >
              Save Settings <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

