"use client";

/**
 * RegisterExistingStartup — SF Collab
 *
 * A lighter registration path for founders whose startup already exists
 * and operates outside SFCollab. Unlike RegisterStartUp.jsx (the 9-step,
 * Vision-first wizard for building something from scratch on the platform),
 * this is a single short form: just the essentials needed to bring an
 * already-running company onto SFCollab.
 *
 * Route: /register-existing-startup
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Building2, Loader2, Upload } from "lucide-react";
import { startupsAPI } from "@/utils/APIs/startupsAPI";

const INDUSTRIES = [
  "Technology", "Product", "Design", "Marketing", "Sales", "Finance",
  "Legal", "Operations", "AI / ML", "SaaS", "FinTech", "EdTech",
  "Healthcare", "Web3", "Other",
];

const STAGES = [
  { value: "early", label: "Early — first customers, still finding fit" },
  { value: "growth", label: "Growth — repeatable traction, scaling up" },
  { value: "scale", label: "Scale — established, expanding fast" },
  { value: "validation", label: "Validation — testing the idea in market" },
];

const inputClasses =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 " +
  "text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50";

const selectClasses = inputClasses + " appearance-none";

export default function RegisterExistingStartup() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    website_url: "",
    founded_date: "",
    team_size: "",
    stage: "early",
    description: "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Startup name is required");
    if (!form.industry) return toast.error("Please select an industry");
    if (!form.description.trim()) return toast.error("Please add a short description");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (logoFile) formData.append("logo", logoFile);

      const result = await startupsAPI.registerExisting(formData);
      const startup = result?.startup;

      toast.success("Startup registered!");
      if (startup?.id) {
        navigate(`/startup-details/${startup.id}`);
      } else {
        navigate("/discover-startups");
      }
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to register startup";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Building2 size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Register an existing startup</h1>
            <p className="text-sm text-gray-500">
              Already running a company? Bring it onto SFCollab — no Vision or wizard required.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Name + Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Startup name *</label>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="e.g. Northwind Logistics"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Industry *</label>
              <select
                value={form.industry}
                onChange={update("industry")}
                className={selectClasses}
                style={{ colorScheme: "dark" }}
              >
                <option value="" style={{ backgroundColor: "var(--surface-input)", color: "var(--color-star)" }}>
                  Select an industry
                </option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} style={{ backgroundColor: "var(--surface-input)", color: "var(--color-star)" }}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Website + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Website (optional)</label>
              <input
                type="url"
                value={form.website_url}
                onChange={update("website_url")}
                placeholder="https://yourcompany.com"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Location (optional)</label>
              <input
                type="text"
                value={form.location}
                onChange={update("location")}
                placeholder="e.g. Lagos, Nigeria"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Founded date + Team size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Founded on (optional)</label>
              <input
                type="date"
                value={form.founded_date}
                onChange={update("founded_date")}
                className={inputClasses}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Team size (optional)</label>
              <input
                type="number"
                min="1"
                value={form.team_size}
                onChange={update("team_size")}
                placeholder="e.g. 6"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Current stage *</label>
            <select
              value={form.stage}
              onChange={update("stage")}
              className={selectClasses}
              style={{ colorScheme: "dark" }}
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value} style={{ backgroundColor: "var(--surface-input)", color: "var(--color-star)" }}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Description *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={update("description")}
              placeholder="What does your startup do? What's it built so far?"
              className={inputClasses}
            />
          </div>

          {/* Logo */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Logo (optional)</label>
            <label
              className="flex items-center gap-2 w-full bg-white/[0.04] border border-white/[0.08]
                         border-dashed rounded-xl px-3.5 py-3 text-sm text-gray-500 cursor-pointer
                         hover:border-white/[0.16] transition-colors"
            >
              <Upload size={16} />
              {logoFile ? logoFile.name : "Click to upload a logo image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                       font-semibold py-3 rounded-xl transition-colors flex items-center
                       justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Registering...
              </>
            ) : (
              "Register startup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}