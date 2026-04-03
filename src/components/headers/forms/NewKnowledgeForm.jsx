import { useState, useEffect, useRef } from "react";
import { Search, Plus, X, Filter, Tag } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NewKnowledgeForm = ({
  setShowNewKnowledgeForm,
  selectedCategory,
  setSelectedCategory,
  reloadResources,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    titleDescription: "",
    contentPreview: "",
    file: null,
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const tagsDropdownRef = useRef(null);

  const tagsOptions = [
    "Technical",
    "Strategy",
    "Beginner",
    "Advanced",
    "Case Study",
    "Tutorial",
    "Best Practices",
    "Guide",
  ];

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await fetch(
          `${API_URL}/knowledge/predefined-categories`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        console.log("Categories API response:", data);

        let categoryNames = [];
        if (Array.isArray(data)) {
          categoryNames = data.map((cat) =>
            typeof cat === "object" ? cat.name || cat : cat
          );
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray(data.categories)
        ) {
          categoryNames = data.categories.map((cat) =>
            typeof cat === "object" ? cat.name || cat : cat
          );
        } else {
          throw new Error("Invalid categories data format");
        }

        setCategories(["All Categories", ...categoryNames]);
      } catch (err) {
        setCategoryError(err.message);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        console.log("Modal closed via click outside");
        setShowNewKnowledgeForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowNewKnowledgeForm]);

  useEffect(() => {
    const handleClickOutsideDropdowns = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(event.target)
      ) {
        setIsTagsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdowns);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdowns);
  }, []);

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.titleDescription.trim())
      newErrors.titleDescription = "Title Description is required";
    if (!formData.contentPreview.trim())
      newErrors.contentPreview = "Content Preview is required";
    if (!formData.file) newErrors.file = "Please upload a file";
    if (selectedCategory === "All Categories")
      newErrors.category = "Please select a valid category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      Toast.fire({
        title: "Error",
        text: "Authentication token not found. Please log in.",
        icon: "error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("titleDescription", formData.titleDescription);
      formDataToSend.append("contentPreview", formData.contentPreview);
      formDataToSend.append("category", selectedCategory);

     
      formData.tags.forEach((tag) => formDataToSend.append("tags[]", tag));

      if (formData.file) {
        formDataToSend.append("fileUrl", formData.file);
      }

      const response = await fetch(
        `${API_URL}/knowledge`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, 
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API submission failed");
      }

      Toast.fire({
        title: "Success!",
        text: "Knowledge resource added successfully!",
        icon: "success",
      });

      if (typeof reloadResources === "function") {
        await reloadResources();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      Toast.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }

    setFormData({
      title: "",
      titleDescription: "",
      contentPreview: "",
      file: null,
      tags: [],
    });
    setSelectedCategory("All Categories");
    setErrors({});
    setShowNewKnowledgeForm(false);
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      titleDescription: "",
      contentPreview: "",
      file: null,
      tags: [],
    });
    setSelectedCategory("All Categories");
    setErrors({});
    setShowNewKnowledgeForm(false);
  };

  const handleDropdownClick = (e, dropdownType) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropdownType === "category") {
      setIsCategoryOpen(!isCategoryOpen);
      setIsTagsOpen(false);
    } else if (dropdownType === "tags") {
      setIsTagsOpen(!isTagsOpen);
      setIsCategoryOpen(false);
    }
  };

  const handleDropdownItemClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-4">
      <div
        ref={modalRef}
        className="bg-[#1A1A1A] rounded-4xl p-7 w-full max-w-[600px] mx-4 my-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-medium">Add new Knowledge resource</h2>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter title"
              className={`bg-[#232323] rounded-lg px-4 py-3 border transition-colors ${
                errors.title ? "border-red-500" : "border-transparent"
              }`}
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span className="text-red-500 text-sm">{errors.title}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="titleDesription" className="text-sm font-medium">
              Title Description
            </label>
            <textarea
              id="titleDescription"
              placeholder="Enter title description"
              className={`bg-[#232323] rounded-lg px-4 py-3 border transition-colors ${
                errors.titleDescription
                  ? "border-red-500"
                  : "border-transparent"
              }`}
              rows={3}
              value={formData.titleDescription}
              onChange={handleChange}
            />
            {errors.titleDescription && (
              <span className="text-red-500 text-sm">
                {errors.titleDescription}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contentPreview" className="text-sm font-medium">
              Content Preview
            </label>
            <textarea
              id="contentPreview"
              placeholder="Enter content preview"
              className={`bg-[#232323] rounded-lg px-4 py-3 border transition-colors ${
                errors.contentPreview ? "border-red-500" : "border-transparent"
              }`}
              rows={3}
              value={formData.contentPreview}
              onChange={handleChange}
            />
            {errors.contentPreview && (
              <span className="text-red-500 text-sm">
                {errors.contentPreview}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Category</label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                className={`bg-[#232323] rounded-lg px-4 py-3 w-full text-left flex justify-between items-center border transition-colors ${
                  errors.category ? "border-red-500" : "border-transparent"
                }`}
                onClick={(e) => handleDropdownClick(e, "category")}
                disabled={categoryLoading || categoryError}
              >
                <span
                  className={
                    selectedCategory === "All Categories" ? "text-gray-500" : ""
                  }
                >
                  {categoryLoading
                    ? "Loading..."
                    : categoryError
                    ? "Error"
                    : selectedCategory}
                </span>
                <Tag className="h-4 w-4 text-gray-400" />
              </button>

              {isCategoryOpen && !categoryLoading && !categoryError && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#232323] rounded-lg shadow-lg z-50 border border-white/10">
                  {categories
                    .filter((category) => category !== "All Categories")
                    .map((category, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-full text-left px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors ${
                          selectedCategory === category ? "bg-white/10" : ""
                        }`}
                        onClick={(e) =>
                          handleDropdownItemClick(e, () =>
                            handleCategorySelect(category)
                          )
                        }
                      >
                        {category}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {categoryError && (
              <span className="text-red-500 text-sm">{categoryError}</span>
            )}
            {errors.category && (
              <span className="text-red-500 text-sm">{errors.category}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="relative" ref={tagsDropdownRef}>
              <button
                type="button"
                className="bg-[#232323] rounded-lg px-4 py-3 w-full text-left flex justify-between items-center border border-transparent"
                onClick={(e) => handleDropdownClick(e, "tags")}
              >
                <span
                  className={formData.tags.length === 0 ? "text-gray-500" : ""}
                >
                  {formData.tags.length > 0
                    ? formData.tags.join(", ")
                    : "Select tags"}
                </span>
                <Tag className="h-4 w-4 text-gray-400" />
              </button>

              {isTagsOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#232323] rounded-lg shadow-lg z-50 border border-white/10 max-h-60 overflow-y-auto">
                  {tagsOptions.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full text-left px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-3 ${
                        formData.tags.includes(tag) ? "bg-white/10" : ""
                      }`}
                      onClick={(e) =>
                        handleDropdownItemClick(e, () => handleTagToggle(tag))
                      }
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          formData.tags.includes(tag)
                            ? "bg-white border-white"
                            : "border-gray-400"
                        }`}
                      >
                        {formData.tags.includes(tag) && (
                          <div className="w-1.5 h-1.5 bg-[#232323] rounded-sm" />
                        )}
                      </div>
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="file" className="text-sm font-medium">
              Upload file
            </label>
            <input
              type="file"
              id="file"
              className={`bg-[#232323] rounded-lg px-4 py-3 w-full border transition-colors ${
                errors.file ? "border-red-500" : "border-transparent"
              }`}
              onChange={handleChange}
            />
            {errors.file && (
              <span className="text-red-500 text-sm">{errors.file}</span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-6 py-2 bg-[#232323] rounded-full hover:bg-white/10 transition-colors"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-medium ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewKnowledgeForm;
