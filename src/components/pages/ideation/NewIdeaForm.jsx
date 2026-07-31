import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function NewIdeaForm({
  onClose,
  onCreateIdea,
  industries,
  stages,
}) {
  const formData = useMemo(() => localStorage.getItem("newIdeaFormData") || {
    title: "",
    description: "",
    projectDetails: "",
    industry: "",
    stage: "",
    tags: [],
  }, []);
  const titleRef = useRef(formData.title || "");
  const descriptionRef = useRef(formData.description || "");
  const industryRef = useRef(formData.industry || "");
  const stageRef = useRef(formData.stage || "");
  const tagInputRef = useRef(formData.tags || []);
  const projectDetailsRef = useRef(formData.projectDetails || "");
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    localStorage.setItem("newIdeaFormData", JSON.stringify({
      title: titleRef.current,
      description: descriptionRef.current,
      industry: industryRef.current,
      stage: stageRef.current,
      tags: tagInputRef.current,
      projectDetails: projectDetailsRef.current,
    }));
  }, [titleRef, descriptionRef, industryRef, stageRef, tagInputRef, projectDetailsRef]);
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleAddTag = () => {
    const tagValue = tagInputRef.current.trim();
    if (tagValue && tags.length < 5) {
      setTags([...tags, tagValue]);
      tagInputRef.current = "";
    } else if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const { user } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {};
    if (!titleRef.current?.trim()) newErrors.title = "Title is required";
    if (!descriptionRef.current?.trim()) newErrors.description = "Description is required";
    if (!industryRef.current) newErrors.industry = "Industry is required";
    if (!stageRef.current) newErrors.stage = "Stage is required";
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("creator_first_name", user?.firstName);
    formData.append("creator_last_name", user?.lastName);
    formData.append("title", titleRef.current.trim());
    formData.append("description", descriptionRef.current.trim());
    formData.append(
      "projectDetails",
      projectDetailsRef.current.trim() || "No additional details provided."
    );
    formData.append("industry", industryRef.current || "Technology");
    formData.append("stage", stageRef.current || "Idea Stage");
    formData.append("tags", JSON.stringify(tags.length > 0 ? tags : ["General"]));
    
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    if (typeof onCreateIdea === "function") {
      onCreateIdea(formData);
    }
    onClose();
    titleRef.current = "";
    descriptionRef.current = "";
    industryRef.current = "";
    stageRef.current = "";
    tagInputRef.current = "";
    setSelectedImage(null);
    setTags([]);
    setErrors({});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={() => onClose()}
    >
      <motion.div
        className="bg-[#1A1A1A] border border-white/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-scroll"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="flex justify-between items-center mb-6"
          variants={itemVariants}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold">Share Your Idea</h2>
          <motion.button
            onClick={() => onClose()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </motion.div>

        <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
          {[
            {
              label: "Idea Title *",
              type: "input",
              placeholder: "What's your big idea?",
              ref: titleRef,
              required: true,
              autoFocus: true,
              fieldName: "title",
            },
            {
              label: "Description *",
              type: "textarea",
              placeholder:
                "Describe your idea in detail. What problem does it solve? How does it work?",
              ref: descriptionRef,
              required: true,
              rows: 4,
              fieldName: "description",
            },
            {
              label: "Project Details",
              type: "textarea",
              placeholder:
                "Add more technical or business details about your idea",
              ref: projectDetailsRef,
              rows: 3,
              fieldName: "projectDetails",
            },
          ].map((field, i) => (
            <motion.div
              key={field.label}
              variants={itemVariants}
              custom={i + 1}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
              </label>
              {field.type === "input" ? (
                <motion.input
                  type="text"
                  defaultValue=""
                  onChange={(e) => {
                    field.ref.current = e.target.value;
                    if (errors[field.fieldName]) {
                      setErrors({ ...errors, [field.fieldName]: "" });
                    }
                  }}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 placeholder:text-xs transition-all ${
                    errors[field.fieldName] ? "border-red-500" : "border-white/20"
                  }`}
                  required={field.required}
                  autoFocus={field.autoFocus}
                  whileFocus={{ scale: 1.01 }}
                />
              ) : (
                <motion.textarea
                  defaultValue=""
                  onChange={(e) => {
                    field.ref.current = e.target.value;
                    if (errors[field.fieldName]) {
                      setErrors({ ...errors, [field.fieldName]: "" });
                    }
                  }}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 resize-none placeholder:text-xs transition-all ${
                    errors[field.fieldName] ? "border-red-500" : "border-white/20"
                  }`}
                  rows={field.rows}
                  required={field.required}
                  whileFocus={{ scale: 1.01 }}
                />
              )}
              {errors[field.fieldName] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.fieldName]}</p>
              )}
            </motion.div>
          ))}

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={itemVariants}
            custom={4}
            initial="hidden"
            animate="visible"
          >
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-dim mb-1.5 font-medium">
                Industry *
              </label>
              <motion.select
                defaultValue=""
                onChange={(e) => {
                  industryRef.current = e.target.value;
                  if (errors.industry) {
                    setErrors({ ...errors, industry: "" });
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-[0.88rem] font-medium text-star hover:bg-white/[0.06] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none bg-no-repeat transition-all duration-200 cursor-pointer min-h-[44px] ${
                  errors.industry ? "border-red-500" : "border-white/10"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.85rem center',
                }}
                required
                whileFocus={{ scale: 1.005 }}
              >
                <option value="" className="bg-[#12141d] text-dim">
                  Select Industry…
                </option>
                {industries
                  .filter((industry) => industry !== "All Industries")
                  .map((industry, index) => (
                    <option
                      key={index}
                      value={industry}
                      className="bg-[#12141d] text-star"
                    >
                      {industry}
                    </option>
                  ))}
              </motion.select>
              {errors.industry && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.industry}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-dim mb-1.5 font-medium">
                Stage *
              </label>
              <motion.select
                defaultValue=""
                onChange={(e) => {
                  stageRef.current = e.target.value;
                  if (errors.stage) {
                    setErrors({ ...errors, stage: "" });
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-[0.88rem] font-medium text-star hover:bg-white/[0.06] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none bg-no-repeat transition-all duration-200 cursor-pointer min-h-[44px] ${
                  errors.stage ? "border-red-500" : "border-white/10"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.85rem center',
                }}
                required
                whileFocus={{ scale: 1.005 }}
              >
                <option value="" className="bg-[#12141d] text-dim">
                  Select Stage…
                </option>
                {stages
                  .filter((stage) => stage !== "All Stages")
                  .map((stage, index) => (
                    <option key={index} value={stage} className="bg-[#12141d] text-star">
                      {stage}
                    </option>
                  ))}
              </motion.select>
              {errors.stage && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.stage}</p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            custom={5}
            initial="hidden"
            animate="visible"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags ({tags.length}/5)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <motion.input
                  type="text"
                  defaultValue=""
                  onChange={(e) => {
                    tagInputRef.current = e.target.value;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 placeholder:text-xs transition-all"
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button
                  type="button"
                  onClick={handleAddTag}
                  disabled={tags.length >= 5}
                  className="px-4 py-3 bg-blue-500/30 hover:bg-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50 rounded-xl transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-lg"
                  >
                    <span className="text-sm text-white">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-blue-300 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          {
            !selectedImage ? (
          
              <motion.div
                variants={itemVariants}
                custom={5.5}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors text-white"
                  whileHover={{ scale: 1.01 }}
                >
                  {selectedImage ? `✓ ${selectedImage.name}` : "Choose Image"}
                </motion.button>
              </motion.div>) : (
              <motion.div
                variants={itemVariants}
                custom={5.5}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors text-white"
                  whileHover={{ scale: 1.01 }}
                >
                  {selectedImage ? `✓ ${selectedImage.name}` : "Choose Image"}
                </motion.button>
  
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-xl overflow-hidden border border-white/20"
                  >
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

          <motion.div
            className="flex justify-end gap-3 pt-4 max-sm:text-sm"
            variants={itemVariants}
            custom={6}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              type="button"
              onClick={() => onClose()}
              className="px-6 py-2.5 bg-white/10 shadow-md hover:bg-white/20 rounded-xl transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-6 py-2.5 bg-gray-200 shadow-md hover:bg-gray-300 rounded-xl transition-all duration-200 font-medium text-black shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Post Idea
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}