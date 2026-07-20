import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { applicationAPI } from "@/utils/APIs/applicationAPI";

export default function JoinSFApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState(localStorage.getItem("joinSFFormData") ? JSON.parse(localStorage.getItem("joinSFFormData")) : {
    name: "",
    email: "",
    location: "",
    portfolio: "",
    area: "",
    skills: "",
    availability: "",
    earlyCoBuilder: "",
    motivation: "",
  });

  useEffect(() => {
    localStorage.setItem("joinSFFormData", JSON.stringify(form));
  }, [form]);
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const { user } = useSelector((state) => state.auth);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreement) {
      toast.error("You must accept the agreement to continue.");
      return;
    }

    const requiredFields = [
      "name",
      "email",
      "area",
      "skills",
      "availability",
      "earlyCoBuilder",
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        toast.error("Please fill in all required fields.");
        return;
      }
    }
    if (!user || !user.id) {
      toast.error("You must be logged in to submit the application.");
      return;
    }

    setLoading(true);
    const body = {
        user_id: user.id,
        name: form.name,
        email: form.email,
        country: form.location,
        data: {
          portfolio: form.portfolio,
          area: form.area,
          skills: form.skills,
          availability: form.availability,
          earlyCoBuilder: form.earlyCoBuilder,
          motivation: form.motivation,
        }
      };
    try {
      // 🔁 Replace with your backend endpoint
      const response = await applicationAPI.createJobApplication(body);
      if (!response.success) {
        throw new Error("Application submission failed");
      }
      toast.success("Application submitted successfully!");
      navigate('/dashboard')
      setForm({
        name: "",
        email: "",
        location: "",
        portfolio: "",
        area: "",
        skills: "",
        availability: "",
        earlyCoBuilder: "",
        motivation: "",
      });
      localStorage.removeItem("joinSFFormData");
      setAgreement(false);
    } catch (err) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Basic Info */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Country / Time Zone</Label>
                  <Input
                    placeholder="Colombia (GMT-5)"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    LinkedIn / GitHub / Portfolio
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={form.portfolio}
                    onChange={(e) => update("portfolio", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
            </motion.section>

            {/* Role & Skills */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded" />
                Role & Skills
              </h3>

              <div className="space-y-2">
                <Label className="text-slate-300">Area you want to co-build in *</Label>
                <Select className="bg-slate-700/50 border-slate-600" onValueChange={(v) => update("area", v)} required>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="ai">AI / ML</SelectItem>
                    <SelectItem value="design">Design / 3D / UI</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Main skills (1–3 keywords) *
                  </Label>
                  <Input
                    placeholder="React, Python, Figma"
                    value={form.skills}
                    onChange={(e) => update("skills", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Availability (hours/week) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={form.availability}
                    onChange={(e) => update("availability", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>
            </motion.section>

            {/* Alignment */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-orange-400 rounded" />
                Alignment
              </h3>

              <div className="space-y-2">
                <Label className="text-slate-300">
                  Open to joining as an early co-builder with delayed compensation? *
                </Label>
                <Select className="bg-slate-700/50 border-slate-600 text-white" onValueChange={(v) => update("earlyCoBuilder", v)} required>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue  placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.section>

            {/* Motivation */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="space-y-2"
            >
              <Label className="text-slate-300">
                Why do you want to co-build SF?
              </Label>
              <Textarea
                rows={3}
                value={form.motivation}
                onChange={(e) => update("motivation", e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white resize-none"
              />
            </motion.section>

            {/* Agreement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-start gap-3 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg"
            >
              <input
                type="checkbox"
                checked={agreement}
                onChange={() => setAgreement(!agreement)}
              />
              <p className="text-sm text-slate-300 leading-relaxed">
                I understand this is an early-stage collaboration, with compensation planned shortly after launch or funding.
              </p>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Apply to Join SF
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
