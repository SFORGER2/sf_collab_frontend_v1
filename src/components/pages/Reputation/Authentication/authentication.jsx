import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  User,
  Mail,
  Lock,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../../services/auth/authThunks";
import { setUser, setToken } from "../../../../services/auth/authSlice";
import { authAPI } from "../../../../utils/APIs/authAPI";
import { API_URL } from "../../../../utils/config";
import LoadingSpinner from "../../../LoadingSpinner";
import { toast } from "react-toastify";
import { updateUser } from "../../../../services/auth/authSlice";

const GradientButton = ({ children, onClick, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3.5 px-6 rounded-4xl bg-gradient-to-r from-[#008FBD] to-[#0366F3]
               text-white font-semibold text-base shadow-lg shadow-blue-500/30
               hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2 mt-4
               disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex">
    <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-[#1a3a6b] via-[#1e4080] to-[#0d2a5e]">
      {children}
    </div>
    <div
      className="hidden lg:block flex-1 bg-cover bg-center bg-no-repeat relative bg-white"
      style={{
        backgroundImage: `url('https://i.imgur.com/xWv8F4L.png')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10" />
    </div>
  </div>
);

export const ReputationCreateAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loaderState, setLoaderState] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreed: false,
  });

  useEffect(() => {
    const handleOAuthMessage = (event) => {
      const allowedOrigins = [
        window.location.origin,
        "https://api.sfcollab.com",
        "https://sf-collab-backend-flask.onrender.com",
      ];
      if (!allowedOrigins.includes(event.origin)) return;

      const { type, provider, access_token, refreshToken, user, error } =
        event.data;

      if (type === "oauth_success") {
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setToken(access_token));
        dispatch(setUser(user));
        setLoaderState(false);
        setTimeout(() => navigate("/dashboard"), 1000);
      } else if (type === "oauth_error") {
        setLoaderState(false);
        setErrors((prev) => ({
          ...prev,
          submit: `${provider} authentication failed: ${error}`,
        }));
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreed) newErrors.agreed = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    setIsLoading(true);
    try {
      const response = await authAPI.registerRequest({
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const loginResponse = await authAPI.loginRequest({
          email: formData.email,
          password: formData.password,
        });

        const { access_token, refresh_token, user } = loginResponse;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setToken(access_token));
        dispatch(setUser(user));

        if (!user.isEmailVerified) {
          const verificationResponse =
            await authAPI.sendVerificationCodeRequest(access_token);
          navigate(
            `/verify-email?token=${verificationResponse.data.verification_token}`
          );
          toast.info("Verification code sent to your email.");
        } else {
          navigate("/dashboard");
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: response?.data?.error || "Signup failed",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.response?.data?.error || "An unexpected error occurred",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setLoaderState(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      `${API_URL}/auth/google`,
      "Google Sign Up",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <AuthLayout>
      {loaderState && (
        <LoadingSpinner
          title="Authenticating..."
          message="Please wait while we redirect you."
        />
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-1.5 rounded-full mb-3">
            <span className="text-cyan-400">●</span> SF Access
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Create an account
          </h1>
          <p className="text-slate-300">
            Start your journey with SF Access today
          </p>
        </div>

        <div className="bg-[#1a263b] border border-slate-700 rounded-3xl p-8 shadow-[4px_4px_8px_#1C345E,10px_10px_20px_#223B6799]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.fullName ? "border-red-500" : "border-slate-600"
                  } rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.email ? "border-red-500" : "border-slate-600"
                  } rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.password ? "border-red-500" : "border-slate-600"
                  } rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between font-semibold text-[10px] text-slate-500 mt-1.5 px-1">
                <div>
                  STRENGTH:{" "}
                  {formData.password.length === 0
                    ? "—"
                    : formData.password.length < 8
                    ? "WEAK"
                    : "GOOD"}
                </div>
                <div>MIN. 8 CHARACTERS</div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-slate-600"
                  } rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-sm text-slate-400 mb-2">
                Your Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Founder
                  </option>
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Designer">Designer</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1.5">
                Helps us customize your workspace experience.
              </p>
            </div>

            <label className="grid grid-cols-[16px_1fr] items-start gap-3 cursor-pointer">
              <span className="relative w-4 h-4 mt-[2px]">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="peer appearance-none w-4 h-4 rounded-[4px] border border-indigo-400 bg-transparent cursor-pointer transition checked:bg-indigo-400 checked:border-indigo-400"
                />
                <svg
                  className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 scale-75 transition peer-checked:opacity-100 peer-checked:scale-100 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm text-slate-400 leading-relaxed ml-2">
                I agree to the{" "}
                <span className="text-indigo-400 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-indigo-400 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </span>
            </label>
            {errors.agreed && (
              <p className="text-red-400 text-xs">{errors.agreed}</p>
            )}

            {errors.submit && (
              <p className="text-red-400 text-sm text-center">
                {errors.submit}
              </p>
            )}

            <GradientButton type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create account"}
            </GradientButton>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#1a263b] px-4 text-xs text-slate-500">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full border border-slate-600 hover:border-slate-400 transition-colors rounded-2xl py-3.5 flex items-center justify-center gap-3 text-white"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <div className="text-center text-sm text-slate-400 pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:underline font-medium"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export const ReputationEmailVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900);

  useEffect(() => {
    if (user?.isEmailVerified) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token");
      const response = await authAPI.verifyEmailRequest(
        verificationCode,
        token
      );
      if (response.data.verified) {
        setVerified(true);
        toast.success("Email verified successfully!");
        dispatch(updateUser({ ...user, isEmailVerified: true }));
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error("Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error("Error verifying email. Please try again.");
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
    } catch {
      toast.error("Error resending code");
    }
  };

  if (verified) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md text-center">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl p-10">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="text-green-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
            <p className="text-slate-400 mb-4">
              Your email has been successfully verified.
            </p>
            <p className="text-sm text-slate-500">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-1.5 rounded-full mb-3">
            <Mail size={16} className="text-cyan-400" /> Email Verification
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Verify your email
          </h1>
          <p className="text-slate-300">
            We've sent a 6-digit verification code to your email address.
            <br />
            Please enter it below to activate your account.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-3xl p-8 shadow-[4px_4px_8px_#1C345E,10px_10px_20px_#223B6799]">
          <form onSubmit={handleVerification} className="space-y-8">
            <div>
              <label className="block text-xs tracking-widest text-gray-400 mb-4 text-center font-semibold">
                VERIFICATION CODE
              </label>
              <div className="flex gap-3 justify-center mt-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 bg-slate-900 border border-slate-600 rounded-2xl text-center text-2xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                ))}
              </div>
              <p className="text-center text-xs text-slate-500 mt-3">
                Code expires in{" "}
                <span
                  className={
                    timeRemaining < 60
                      ? "text-red-400 font-bold"
                      : "text-blue-400 font-bold"
                  }
                >
                  {formatTime(timeRemaining)}
                </span>
              </p>
            </div>

            <GradientButton type="submit" disabled={loading}>
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify Email <CheckCircle size={18} />
                </>
              )}
            </GradientButton>

            <div className="text-center space-y-4">
              <p className="text-sm text-slate-400">
                Didn't receive the email? Check your spam folder or wait a few
                minutes.
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-blue-400 hover:underline text-sm font-medium transition-colors"
              >
                Resend code
              </button>
            </div>

            <div className="pt-6 border-t border-slate-700 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Mail size={16} /> support@sfaccess.io
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 text-blue-400 hover:underline flex items-center gap-2 mx-auto transition-colors"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export const ReputationSuccessSignedIn = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-[#111827] border border-slate-700 rounded-3xl p-10 text-center shadow-[4px_4px_8px_#1C345E,10px_10px_20px_#223B6799]">
          <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-blue-400" size={48} />
          </div>

          <h1 className="text-3xl font-semibold text-white mb-2">
            Successfully Signed In
          </h1>
          <p className="text-slate-400 mb-8">
            Your session is secure and active. Welcome back to the
            <br />
            formation platform.
          </p>

          <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <User className="text-blue-400" size={24} />
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <p className="text-xs text-slate-500">SF Formation OS</p>
            </div>
          </div>

          <GradientButton onClick={() => navigate("/dashboard")}>
            Go to Dashboard <ArrowRight size={18} />
          </GradientButton>

          <p className="text-xs text-slate-500 mt-4">
            Redirecting automatically in 5 seconds...
          </p>

          <div className="mt-10 border-t border-slate-700 pt-6">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">
              QUICK LINKS
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="border border-slate-600 hover:border-slate-400 transition-colors rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 text-white"
              >
                <User size={16} /> View Profile
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="border border-slate-600 hover:border-slate-400 transition-colors rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 text-white"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 mt-8">
            <div className="flex items-center gap-1">
              <ShieldCheck size={14} /> Secure SSL Encrypted
            </div>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Help Center →
            </a>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export const ReputationLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderState, setLoaderState] = useState(false);
  const [alertConf, setAlertConf] = useState({ title: "", message: "" });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const handleOAuthMessage = async (event) => {
      const allowedOrigins = [
        window.location.origin,
        "http://localhost:5000",
        "http://localhost:5001",
        "https://api.sfcollab.com",
        "https://sf-collab-backend-flask.onrender.com",
      ];
      if (!allowedOrigins.includes(event.origin)) return;

      const { type, provider, access_token, refreshToken, user, error } =
        event.data;

      if (type === "oauth_success") {
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setUser(user));
        dispatch(setToken(access_token));
        setLoaderState(false);
        window.location.href = "/dashboard";
      } else if (type === "oauth_error") {
        setLoaderState(false);
        setErrors((prev) => ({
          ...prev,
          submit: `${provider} authentication failed: ${error}`,
        }));
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await dispatch(loginUser(formData)).unwrap();
      window.location.href = "/dashboard";
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || "An error occurred during login",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoaderState(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    setAlertConf({
      title: "Authenticating with Google....",
      message: "Please follow the Google sign-in window.",
    });
    window.open(
      `${API_URL}/google`,
      "Google Sign In",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <AuthLayout>
      {loaderState && (
        <LoadingSpinner
          title={alertConf.title || "Authenticating..."}
          message={alertConf.message || "Please wait."}
        />
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300">
            Log in to manage your startup formation securely.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-3xl p-8 shadow-[4px_4px_8px_#1C345E,10px_10px_20px_#223B6799]">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs px-4 py-1.5 rounded-full mb-6">
            <ShieldCheck size={14} /> SECURE LOGIN ENVIRONMENT
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.email ? "border-red-500" : "border-slate-600"
                  } pl-11 pr-4 rounded-xl py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-blue-400 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.password ? "border-red-500" : "border-slate-600"
                  } pl-11 pr-12 rounded-xl py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-red-400 text-sm text-center">
                {errors.submit}
              </p>
            )}

            <GradientButton type="submit" disabled={isLoading}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </GradientButton>

            <div className="relative text-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <span className="relative bg-[#111827] px-4 text-xs text-slate-500">
                OR CONTINUE WITH
              </span>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full border border-slate-600 hover:border-slate-400 transition-colors rounded-2xl py-3.5 flex items-center justify-center gap-3 text-white"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full border border-slate-600 hover:border-slate-400 transition-colors rounded-2xl py-3.5 flex items-center justify-center gap-3 text-white opacity-60 cursor-not-allowed"
                disabled
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                  alt="Apple"
                  className="w-5 h-5 invert"
                />
                Continue with Apple
              </button>
            </div>

            <div className="text-center text-sm text-slate-400 mt-6 pt-2">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-400 hover:underline font-medium transition-colors"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export const ReputationForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid business email address");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPasswordRequest({ email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-1.5 rounded-full mb-3">
            <Lock size={16} className="text-cyan-400" /> Password Recovery
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-slate-300">
            Enter your email and we'll send you a secure link to reset
            <br />
            your access to the SF Startup OS.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-3xl p-8 shadow-[4px_4px_8px_#1C345E,10px_10px_20px_#223B6799]">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
              <p className="text-white font-semibold mb-2">Reset link sent!</p>
              <p className="text-slate-400 text-sm">
                Check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Business Email
                </label>
                <div className="relative mt-3">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={`w-full bg-slate-900 border ${
                      error ? "border-red-500" : "border-slate-600"
                    } pl-11 pr-4 rounded-xl py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>

              <div className="bg-slate-900/70 border border-slate-600 rounded-2xl p-4 text-sm text-slate-300">
                <span className="font-medium">What happens next?</span> After
                clicking the button below, check your inbox (and spam folder)
                for a verification link valid for 10 minutes.
              </div>

              <GradientButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    Send reset link <ArrowRight size={18} />
                  </>
                )}
              </GradientButton>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2 transition-colors"
              >
                <ArrowLeft size={18} /> Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export const ReputationResetPassword = () => {
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const requirements = [
    {
      label: "At least 8 characters long",
      met: formData.newPassword.length >= 8,
    },
    {
      label: "Contains at least one number",
      met: /\d/.test(formData.newPassword),
    },
    {
      label: "Contains a special character (!@#$%^&*)",
      met: /[!@#$%^&*]/.test(formData.newPassword),
    },
    {
      label: "Passwords match",
      met:
        formData.newPassword === formData.confirmPassword &&
        formData.confirmPassword !== "",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (formData.newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token");
      await authAPI.resetPasswordRequest({
        token,
        newPassword: formData.newPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch {
      setErrors({
        submit: "Failed to reset password. Your link may have expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-1.5 rounded-full mb-3">
            <ShieldCheck size={16} className="text-cyan-400" /> Password Reset
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Reset your password
          </h1>
          <p className="text-slate-300">
            Choose a secure password to regain access to your SF Access account.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-3xl p-8 shadow-[4px_4px_8px_#1C345E,10px_10px_20px_#223B6799]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.newPassword ? "border-red-500" : "border-slate-600"
                  } rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-slate-600"
                  } rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-sm">
              <div className="uppercase text-xs tracking-widest text-slate-400 mb-3">
                SECURITY REQUIREMENTS
              </div>
              <ul className="space-y-2 text-slate-400">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 border rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                        req.met
                          ? "border-green-400 bg-green-400/20"
                          : "border-slate-500"
                      }`}
                    >
                      {req.met && (
                        <CheckCircle size={10} className="text-green-400" />
                      )}
                    </div>
                    <span className={req.met ? "text-green-400" : ""}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-blue-300 flex items-start gap-2">
              <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                This reset link is valid for another{" "}
                <span className="font-medium">23 hours</span>. If you didn't
                request this, please contact support immediately.
              </span>
            </div>

            {errors.submit && (
              <p className="text-red-400 text-sm text-center">
                {errors.submit}
              </p>
            )}

            <GradientButton type="submit" disabled={isLoading}>
              {isLoading ? (
                "Resetting..."
              ) : (
                <>
                  Reset Password <CheckCircle size={18} />
                </>
              )}
            </GradientButton>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-3 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Sign In
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default {
  ReputationCreateAccount,
  ReputationEmailVerification,
  ReputationSuccessSignedIn,
  ReputationLogin,
  ReputationForgotPassword,
  ReputationResetPassword,
};
