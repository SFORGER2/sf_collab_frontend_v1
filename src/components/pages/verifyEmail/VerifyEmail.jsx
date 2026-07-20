import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Mail, CheckCircle, ArrowRight, Lock } from "lucide-react";
import { API_URL } from "@/utils/config";
import { authAPI } from "@/utils/APIs/authAPI";
import useCountdown from "@/components/waitlist/components/hooks/useCountdown";
import { updateUser } from "@/services/auth/authSlice";

"use client";


const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, access_token } = useSelector((state) => state.auth);
  const [queryParams] = useSearchParams()
  const token = queryParams.get('token');
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900);

  // Redirect if already verified
  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

const handleVerification = async (e) => {
  e.preventDefault();
  
  if (!verificationCode.trim()) {
    toast.error("Please enter the verification code");
    return;
  }

  setLoading(true);
  try {
    // Try to get email from Redux user, then from localStorage
    let email = user?.email;
    if (!email) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          email = parsed.email || parsed.user?.email || null;
        } catch (err) {
          console.error("Failed to parse stored user", err);
        }
      }
    }

    // If still no email, try to get from the token (if it's a JWT)
    if (!email && token) {
      try {
        // Simple base64 decode of JWT payload (middle part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        email = payload.email || payload.sub || null;
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }

    if (!email) {
      toast.error("Email not found. Please log in again.");
      return;
    }

    const response = await authAPI.verifyEmailRequest(email, verificationCode, token);
    if (response.data.verified) {
      setVerified(true);
      toast.success("Email verified successfully!");
      dispatch(updateUser({ ...user, isEmailVerified: true }));
      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      toast.error("Invalid verification code. Please try again.");
      setVerificationCode("");
    }
  } catch (error) {
    toast.error("Error verifying email. Please try again.");
    console.error("Verification error:", error);
  } finally {
    setLoading(false);
  }
};

  const handleResendCode = async () => {
    try {
      const response = await authAPI.sendVerificationCodeRequest();
      if (response.data.verification_token) {
        setTimeRemaining(900);
        toast.success("Verification code sent to your email");
        window.location.search = `?token=${response.data.verification_token}`;
      } else {
        toast.error("Failed to resend code");
      }
    } catch (error) {
      toast.error("Error resending code");
      console.error("Resend error:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 bg-green-500/20 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
            <p className="text-slate-400 mb-6">
              Your email has been successfully verified.
            </p>
            <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-600/20 to-purple-700/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-slate-400">
            We've sent a code to{" "}
            <span className="text-blue-400 font-semibold">{user?.email}</span>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Code Input Section */}
          <form onSubmit={handleVerification} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Verification Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-white/10 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-slate-700 transition-all duration-300 text-center text-2xl font-bold tracking-widest"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Check your email for the code
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Code expires in</p>
                <p
                  className={`text-2xl font-bold font-mono ${
                    timeRemaining < 60
                      ? "text-red-400"
                      : "text-blue-400"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>

            {/* Verify Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !verificationCode.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-500/30 hover:border-blue-500/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Resend Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResendCode}
            className="w-full py-2 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-sm"
          >
            Resend Code
          </motion.button>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Didn't receive the code?{" "}
          <button
            onClick={handleResendCode}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Resend
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;