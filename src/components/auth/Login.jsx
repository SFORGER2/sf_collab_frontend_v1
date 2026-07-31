import { translate } from "../../utils/translation";
import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
// import { useAuth } from "../../contexts/AuthContext"
import ShinyText from '../ui/ShinyText';
import { Button } from '../ui/button';
import { loginUser } from "../../services/auth/authThunks";

import NavBar from "../sections/NavBar";
import MobileNavBar from "../sections/MobileNavBar";
import { setUser, setToken } from "../../services/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import '../style/Login.css';
import LoadingSpinner from "../LoadingSpinner";
import { IoLogIn } from "react-icons/io5";
import { ShineButton } from '../lightswind/shine-button';
import useScrollHide from "@/utils/hooks/useScrollHide";

const API_URL = import.meta.env.VITE_API_URL_AUTH || '/api/auth';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = localStorage.getItem("language") || "en";

  // const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false)
  const [loaderState, setLoaderState] = useState(false)
  const { user } = useSelector((state) => state.auth);
  // If you have user logged in, you should be signed out to access login page

  const [alertConf, setAlertConf] = useState({ title: "", message: "" });

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { isHidden: isNavHidden } = useScrollHide({
    deltaThreshold: 4,
    topReveal: 10,
  });

  const navContainerRef = useRef(null);
  const revealImgRef = useRef(null);

  // Handle mouse enter for the entire nav area
  const handleNavAreaEnter = () => {
    // Navigation area enter handler
  };

  // Handle mouse leave with proper event delegation
  const handleNavAreaLeave = () => {
    // Navigation area leave handler
  };
  // Get the intended destination or default to dashboard
  // const from = location.state?.from?.pathname || '/dashboard'

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleOAuthMessage = async (event) => {
      const allowedOrigins = [
        "http://localhost:5001",
        "http://localhost:5000",
        window.location.origin,
        "http://127.0.0.1:5000",
        "https://sfclb.netlify.app",
        "https://sf-collab-backend-flask.onrender.com",
        "https://api.sfcollab.com",
      ];

      // alert(new URL(API_URL).origin);
      // alert((event));

      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Blocked message from:", event.origin);
        return;
      }

      // if (event.origin !== ORIGIN) return;


      const { type, provider, access_token, refreshToken, user, error } = event.data;

      if (type === "oauth_success") {
        // console.log("OAuth SUCCESS");
        // console.log("refreshToken", refreshToken);
        // console.log("access_token", access_token);
        // console.log("user", JSON.stringify(user));

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch(setUser(user));
        dispatch(setToken(access_token));
        window.location.href = "/dashboard";



        setLoaderState(false);

      } else if (type === "oauth_error") {
        console.error("OAuth ERROR:", error);
        setLoaderState(false);
        setErrors(prev => ({
          ...prev,
          submit: `${provider} authentication failed: ${error}`,
        }));
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [dispatch, navigate]);
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await dispatch(loginUser(formData)).unwrap();
      window.location.href = '/dashboard'
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error?.message || "An error occurred during login"
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
    setAlertConf({ title: "Authenticating with Google ....", message: "This will only take a moment. Please follow the Google sign-in window." });
    window.open(
      `${API_URL}/google`,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleGithubSignIn = () => {
    setLoaderState(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    setAlertConf({ title: "Authenticating with GitHub ....", message: "This will only take a moment. Please follow the GitHub sign-in window." });
    window.open(
      `${API_URL}/github`,
      'Github Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };


  return (
    <div>

      {/* Collapsible Top Nav Container */}
      <div
        ref={navContainerRef}
        onMouseEnter={handleNavAreaEnter}
        onMouseLeave={handleNavAreaLeave}
        className={`w-full overflow-hidden transition-[max-height] duration-300 ease-in-out ${isNavHidden ? "h-0" : "h-15"
          } lg:h-15`}
        style={{ zIndex: 99999999 }}
      >
        <NavBar isHidden={isNavHidden} />
      </div>

      {/* Dark Horizon Glow */}
      <div
        className="absolute inset-0 z-0 cosmos-atmosphere"
      />

      {/* Loader Overlay */}
      {loaderState && (
        <LoadingSpinner
          title={alertConf.title || "Authenticating..."}
          message={alertConf.message || "Please wait while we redirect you."}
        />
      )}


      <MobileNavBar isHidden={isNavHidden} />
      <div className="h-screen flex w-full">
        {/* Left side - Image */}
        {/* <div className="hidden lg:flex lg:w-1/2 relative ">
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Beams
              beamWidth={2}
              beamHeight={15}
              beamNumber={7}
              lightColor="#E8E8E8"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={30}
            />
          </div>
        </div> */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-black">
          {/* <img loading="lazy" 
            src="/collaboration.jpg"
            className="w-full max-h-screen object-cover"
            alt="Recollab Background" 
          /> */}
          <video src="/login_video.mp4" className="w-full max-h-screen object-fill" autoPlay muted loop />
        </div>

        {/* Right side - Login Form */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--surface-splash)',
          zIndex: 999
        }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const el = revealImgRef.current;
            if (el) {
              el.style.setProperty('--mx', `${x}px`);
              el.style.setProperty('--my', `${y + rect.height * 0.5}px`);
            }
          }}
          onMouseLeave={() => {
            const el = revealImgRef.current;
            if (el) {
              el.style.setProperty('--mx', '-9999px');
              el.style.setProperty('--my', '-9999px');
            }
          }}
          className="w-full h-full lg:w-1/2 max-h-screen flex items-center justify-center p-2">
          <img
            ref={revealImgRef}
            src="/shiny_logo.jpg"
            alt="Reveal effect"
            style={{
              position: 'absolute',
              width: '100%',
              top: '-10%',
              zIndex: 5,
              mixBlendMode: 'lighten',
              opacity: 0.3,
              pointerEvents: 'none',
              '--mx': '-9999px',
              '--my': '-9999px',
              WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
              maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat'
            }}
          />
          <div className="w-full max-w-md space-y-6  rounded-md">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl text-center font-semibold text-white">
                <ShinyText
                  text="Login"
                  disabled={false}
                  speed={3}
                  className='custom-class'
                />
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Google Sign In Button */}
              <Button
                // as="button"
                // color="white"
                // speed="5s"
                className="w-1/2 flex-1 bg-white border border-gray-300  text-black flex items-center justify-center py-2 rounded-sm hover:bg-white hover:shadow-[0px_0px_10px_white] cursor-pointer duration-400 transition-all"
                onClick={handleGoogleSignIn}
              // thickness="10px"
              >

                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              {/* Github Sign In Button */}
              <Button
                className="w-1/2 flex-1 bg-white border border-gray-300  text-black flex items-center justify-center py-2 rounded-sm hover:bg-white hover:shadow-[0px_0px_10px_white] cursor-pointer duration-400 transition-all"
                onClick={handleGithubSignIn}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={errors.submit ? "submit-error" : undefined}>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className=" px-2 text-white bg-black backdrop-blur-lg rounded-md">Or</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Enter your Email and password.</p>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="eg: johnmike@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                  className={` border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 w-full rounded px-3 py-2`}
                />
                {errors.email && <p id="email-error" className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : "password-hint"}
                    required
                    className={` border ${errors.password ? 'border-red-500' : 'border-gray-700'} text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 w-full rounded px-3 py-2 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="text-red-500 text-xs">{errors.password}</p>}
                <p id="password-hint" className="text-xs text-gray-500">Must be at least 8 characters.</p>
              </div>

              {errors.submit && (
                <p id="submit-error" className="text-red-500 text-sm text-center" role="alert">{errors.submit}</p>
              )}

              {/* Login Button */}
              <ShineButton
                className="w-full   disabled:opacity-50 disabled:cursor-not-allowed relative h-10 cursor-pointer rounded-md flex items-center justify-center text-white "
                type="submit"
                disabled={isLoading}
                label={isLoading ? "Logging in..." : "Log in"}
                size="md"
                bgColor="linear-gradient(325deg, #f09220 0%, #ffcf7d 55%, #f09220 90%)"
              />


              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}

                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-white hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}