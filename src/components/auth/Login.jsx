import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShinyText from "../ui/ShinyText";
import { Button } from "../ui/button";
import { loginUser } from "../../services/auth/authThunks";
import NavBar from "../sections/NavBar";
import MobileNavBar from "../sections/MobileNavBar";
import { setUser, setToken } from "../../services/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "../LoadingSpinner";
import { ShineButton } from "../lightswind/shine-button";
import useScrollHide from "@/utils/hooks/useScrollHide";

const API_URL = import.meta.env.VITE_API_URL_AUTH || "/api/auth";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [loaderState, setLoaderState] = useState(false);
  const [alertConf, setAlertConf] = useState({ title: "", message: "" });
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { isHidden: isNavHidden } = useScrollHide({ deltaThreshold: 4, topReveal: 10 });
  const navContainerRef = useRef(null);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "At least 8 characters";
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
      setErrors((prev) => ({ ...prev, submit: error?.message || "Login failed" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoaderState(true);
    const width = 500, height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    setAlertConf({ title: "Authenticating with Google...", message: "Please follow the Google sign-in window." });
    window.open(`${API_URL}/google`, "Google Sign In", `width=${width},height=${height},left=${left},top=${top}`);
  };

  const handleGithubSignIn = () => {
    setLoaderState(true);
    const width = 500, height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    setAlertConf({ title: "Authenticating with GitHub...", message: "Please follow the GitHub sign-in window." });
    window.open(`${API_URL}/github`, "Github Sign In", `width=${width},height=${height},left=${left},top=${top}`);
  };

  return (
    <div>
      <div ref={navContainerRef} className={`w-full transition-[max-height] duration-300 ${isNavHidden ? "h-0" : "h-15"} lg:h-15`} style={{ zIndex: 99999999 }}>
        <NavBar isHidden={isNavHidden} />
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #0d1a36 100%)" }} />

      {/* Loader */}
      {loaderState && <LoadingSpinner title={alertConf.title} message={alertConf.message} />}

      <MobileNavBar isHidden={isNavHidden} />

      <div className="h-screen flex w-full">
        {/* Left side video */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-black">
          <video src="/login_video.mp4" className="w-full max-h-screen object-fill" autoPlay muted loop />
        </div>

        {/* Right side form */}
        <div className="w-full h-full lg:w-1/2 flex items-center justify-center p-6 bg-[#060010]/90 backdrop-blur-md">
          <div className="w-full max-w-md space-y-6 rounded-md">
            <h1 className="text-4xl text-center font-semibold text-white">
              <ShinyText text="Login" speed={3} />
            </h1>

            {/* Social Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1 bg-white text-black rounded-md hover:shadow-lg" onClick={handleGoogleSignIn}>
                Continue with Google
              </Button>
              <Button className="flex-1 bg-white text-black rounded-md hover:shadow-lg" onClick={handleGithubSignIn}>
                Continue with GitHub
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-400 text-sm">Enter your Email and password.</p>

              {/* Email */}
              <div>
                <label htmlFor="email" className="text-white text-sm">Email</label>
                <input id="email" type="email" placeholder="eg: johnmike@gmail.com" value={formData.email} onChange={handleChange}
                  className={`w-full rounded px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-700"} text-white bg-transparent focus:border-purple-500 focus:ring-purple-500`} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-white text-sm">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleChange}
                    className={`w-full rounded px-3 py-2 pr-10 border ${errors.password ? "border-red-500" : "border-gray-700"} text-white bg-transparent focus:border-purple-500 focus:ring-purple-500`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

              {/* Login Button */}
              <ShineButton className="w-full h-10 rounded-md text-white" type="submit" disabled={isLoading}
                label={isLoading ? "Logging in..." : "Log in"} size="md"
                bgColor="linear-gradient(325deg, hsl(270 100% 60%) 0%, hsl(240 100% 70%) 55%, hsl(270 100% 60%) 90%)" />

              {/* Signup Link */}
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <button type="button" onClick={() => navigate("/signup")} className="text-white hover:underline font-medium">
                  Sign Up
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
``