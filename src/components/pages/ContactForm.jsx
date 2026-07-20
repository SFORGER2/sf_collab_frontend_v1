import { usersAPI } from "@/utils/APIs/userAPI";
import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function ContactForm({
  includeFiles = false,
  acceptTerms = false,
  subject = "Subject",
  subjectPlaceholder = "Subject of your message...",
  filesPlaceholder = "Attach files",
}) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!contactForm.name || !contactForm.email || !contactForm.message) {
        toast.error("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      if (acceptTerms && !termsAccepted) {
        toast.error("You must accept the terms and conditions.");
        setLoading(false);
        return;
      }
      if (includeFiles && !files) {
        toast.error("Please attach at least one file.");
        setLoading(false);
        return;
      }
      const formData = new FormData();

      formData.append("name", contactForm.name);
      formData.append("email", contactForm.email);
      formData.append("message", contactForm.message);

      if (includeFiles && files) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await usersAPI.submitContactForm(formData);

      if (response?.success) {
        toast.success("Your message has been sent successfully!");
        setContactForm({
          name: "",
          email: "",
          message: "",
        });
        setFiles(null);
      } else {
        toast.error("There was an error sending your message.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full bg-linear-to-br from-gray-800 to-gray-900 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl"
    >
      <h3 className="text-3xl font-bold text-white mb-2">
        Send us a message
      </h3>
      <p className="text-gray-400 mb-8">
        Can't find what you're looking for? Send us a detailed message and we'll
        get back to you within 24 hours.
      </p>

      <form onSubmit={handleSubmitContact} noValidate className="space-y-6">
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={contactForm.name}
              onChange={(e) =>
                setContactForm({ ...contactForm, name: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            {subject} <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder={subjectPlaceholder}
            rows={5}
            value={contactForm.message}
            onChange={(e) =>
              setContactForm({ ...contactForm, message: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          />
        </div>

        {/* Files */}
        {includeFiles && (
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              {filesPlaceholder}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-gray-300 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
            />
          </div>
        )}
        {acceptTerms && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-gray-300"
            >
              I agree to the{" "}
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-500"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? "Sending..." : "Submit Message"}
        </Button>
      </form>
    </motion.div>
  );
}
