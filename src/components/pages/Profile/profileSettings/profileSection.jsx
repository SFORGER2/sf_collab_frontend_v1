import { toast } from "react-toastify";
import { countries } from "./countries";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getProfilePicture, resolveBackendUrl } from "@/utils/getProfilePicture";
import { builderFocusOptions } from "./builderFocus";
import { motion } from "framer-motion";
import {
  User, MapPin, Briefcase, Globe, Link as LinkIcon, Upload, Trash2, Crosshair, Loader2,
} from "lucide-react";
import { CosmosButton } from "@/components/cosmos";
import {
  Field, FieldGrid, Notice, PillGroup, SectionHead, Select, SettingsCard, TextArea, TextInput,
} from "./SettingsUI";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/…" },
  { key: "github", label: "GitHub", placeholder: "github.com/…" },
  { key: "twitter", label: "X / Twitter", placeholder: "x.com/…" },
  { key: "portfolio", label: "Portfolio", placeholder: "yoursite.com" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@…" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/…" },
  { key: "dribbble", label: "Dribbble", placeholder: "dribbble.com/…" },
  { key: "behance", label: "Behance", placeholder: "behance.net/…" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/…" },
];

const BIO_LIMIT = 300;

export default function ProfileSection({ formData, setFormData, uploadProfilePicture }) {
  const timezones = useMemo(
    () => (Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : ["UTC"]),
    []
  );
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [roles, setRoles] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    setRoles(["founder", "builder", "mentor", "influencer", "investor"]);
  }, []);

  const patchProfile = (patch) =>
    setFormData((prev) => ({ ...prev, profile: { ...(prev.profile || {}), ...patch } }));

  const patchPrefs = (patch) =>
    setFormData((prev) => ({ ...prev, preferences: { ...(prev.preferences || {}), ...patch } }));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear value so re-selecting same file triggers event
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadProfilePicture(file);
      if (url) {
        patchProfile({ picture: url });
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAutoDetectLocation = async () => {
    try {
      setLoadingCountry(true);
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      const patch = {};
      if (data.country_name && countries.includes(data.country_name)) patch.country = data.country_name;
      if (data.city) patch.city = data.city;

      if (!Object.keys(patch).length) {
        toast.info("Could not detect your location");
        return;
      }
      patchProfile(patch);

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) patchPrefs({ timezone: tz });
    } catch {
      toast.error("Failed to detect location");
    } finally {
      setLoadingCountry(false);
    }
  };

  const bio = formData.profile?.bio || "";
  const bioOver = bio.length > BIO_LIMIT;

  const isLocationSet =
    !!formData.profile?.country && !!formData.profile?.city && !!formData.preferences?.timezone;

  const currentFormPic = formData.profile?.picture;
  const picture = useMemo(() => {
    if (currentFormPic !== undefined) {
      return currentFormPic ? resolveBackendUrl(currentFormPic) : null;
    }
    return getProfilePicture(user);
  }, [currentFormPic, user]);

  return (
    <motion.div
      className="flex flex-col gap-6 w-full max-w-full min-w-0"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.div variants={item}>
        <SectionHead
          icon={User}
          title="Profile"
          description="How you appear across the ecosystem."
          accent="#ffbf5e"
        />
      </motion.div>

      {/* Picture */}
      <motion.div variants={item}>
        <SettingsCard title="Profile picture" accent="#4fd8ff">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
            <div
              className="w-20 h-20 rounded-full overflow-hidden shrink-0 grid place-items-center relative transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(79,216,255,0.35)",
                boxShadow: "0 0 18px -4px rgba(79,216,255,0.22)",
              }}
            >
              {isUploading ? (
                <Loader2 size={22} className="animate-spin text-cyan-400" />
              ) : picture ? (
                <img loading="lazy" src={picture} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-dim/70 font-medium">
                  No image
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
              <CosmosButton
                variant="ghost"
                size="sm"
                onClick={() => document.querySelector("#profileInput")?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto min-h-[44px] justify-center"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? "Uploading…" : "Upload"}
              </CosmosButton>
              <input
                id="profileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />

              {picture && (
                <button
                  type="button"
                  onClick={() => patchProfile({ picture: null })}
                  disabled={isUploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-red-500/30 text-[0.84rem] font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}

              <span className="text-[0.78rem] font-medium text-dim/80 w-full text-center sm:text-left mt-1 sm:mt-0 break-words">
                Square images work best. Max 5MB.
              </span>
            </div>
          </div>
        </SettingsCard>
      </motion.div>

      {/* Identity */}
      <motion.div variants={item}>
        <SettingsCard title="Basics" accent="#ffbf5e" bodyClassName="gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="First name" required>
              <TextInput
                value={formData.firstName || ""}
                onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={formData.lastName || ""}
                onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Email" hint="Change this from Account & Security.">
              <TextInput value={formData.email || ""} readOnly />
            </Field>
            <Field label="Account status">
              <TextInput value={formData.status || ""} readOnly className="capitalize" />
            </Field>
          </div>

          <Field
            label="Bio"
            error={bioOver ? `${bio.length}/${BIO_LIMIT} — too long to save` : null}
            hint={bioOver ? null : `${bio.length}/${BIO_LIMIT} characters`}
          >
            <TextArea
              rows={4}
              value={bio}
              placeholder="A paragraph in your own words."
              onChange={(e) => patchProfile({ bio: e.target.value })}
            />
          </Field>
        </SettingsCard>
      </motion.div>

      {/* Roles */}
      <motion.div variants={item}>
        <SettingsCard
          title="Your roles"
          hint="Roles change your navigation, dashboard and what the ecosystem offers you. You can hold more than one."
          accent="#8b6cff"
          bodyClassName="gap-3"
        >
          {(formData.roles || []).length === 0 && (
            <Notice tone="error">Pick at least one role — the app can't lay itself out without one.</Notice>
          )}

          <div>
            <PillGroup
              options={roles}
              value={formData.roles || []}
              onChange={(next) => setFormData((p) => ({ ...p, roles: next }))}
              accent="#8b6cff"
            />
          </div>

          {formData.roles?.includes("influencer") && !user?.roles?.includes("influencer") && (
            <div>
              <Notice tone="info">
                Influencer needs an application. Saving takes you to the form.
              </Notice>
            </div>
          )}

          {formData.roles?.includes("builder") && (
            <Field label="Builder focus" required>
              <Select
                value={formData.preferences?.builderPreferences || ""}
                onChange={(e) => patchPrefs({ builderPreferences: e.target.value })}
                placeholder="What do you build?"
                options={builderFocusOptions.map((o) => ({
                  value: o,
                  label: o.charAt(0).toUpperCase() + o.slice(1),
                }))}
              />
            </Field>
          )}
        </SettingsCard>
      </motion.div>

      {/* Location */}
      <motion.div variants={item}>
        <SettingsCard title="Location & timezone" accent="#3ee6a0">
          {!isLocationSet && (
            <div>
              <Notice>
                Matchmaking, meeting times and local discovery stay switched off until this is set.
              </Notice>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Country">
              <Select
                value={formData.profile?.country || ""}
                onChange={(e) => patchProfile({ country: e.target.value })}
                placeholder="Select country"
                options={countries || []}
              />
            </Field>
            <Field label="City">
              <TextInput
                value={formData.profile?.city || ""}
                placeholder="Where you're based"
                onChange={(e) => patchProfile({ city: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Timezone">
            <Select
              value={formData.preferences?.timezone || ""}
              onChange={(e) => patchPrefs({ timezone: e.target.value })}
              placeholder="Select timezone"
              options={timezones}
            />
          </Field>

          <div>
            <CosmosButton
              variant="ghost"
              size="sm"
              onClick={handleAutoDetectLocation}
              disabled={loadingCountry}
              className="min-h-[44px]"
            >
              {loadingCountry ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
              {loadingCountry ? "Detecting…" : "Detect from my connection"}
            </CosmosButton>
          </div>
        </SettingsCard>
      </motion.div>

      {/* Work */}
      <motion.div variants={item}>
        <SettingsCard title="Work" accent="#ff8f5e">
          <Field label="Company" hint="Shown on your profile and in investor introductions.">
            <TextInput
              value={formData.profile?.company || ""}
              placeholder="Where you work, or your own venture"
              onChange={(e) => patchProfile({ company: e.target.value })}
            />
          </Field>
        </SettingsCard>
      </motion.div>

      {/* Links */}
      <motion.div variants={item}>
        <SettingsCard
          title="Links"
          hint="The assistant reads GitHub and LinkedIn to fill in your skills and history."
          accent="#ff6fd8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {SOCIALS.map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <TextInput
                  value={formData.profile?.socialLinks?.[key] || ""}
                  placeholder={placeholder}
                  onChange={(e) =>
                    patchProfile({
                      socialLinks: { ...(formData.profile?.socialLinks || {}), [key]: e.target.value },
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </SettingsCard>
      </motion.div>
    </motion.div>
  );
}
