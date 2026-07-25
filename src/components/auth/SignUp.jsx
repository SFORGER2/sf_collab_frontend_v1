import { useState, useEffect,useRef } from "react"
import { Eye, EyeOff, Mail, Lock, User, MapPin, Building, Globe, Clock } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { setUser,setToken } from "../../services/auth/authSlice";
import { useDispatch } from "react-redux";
import NavBar from "../sections/NavBar";
import { TiThMenu } from "react-icons/ti";
import { ShineButton } from '../lightswind/shine-button';
import { FaUserPlus } from "react-icons/fa6";
import ShinyText from "../ui/ShinyText";
import { PasswordStrengthIndicator } from "../lightswind/password-strength-indicator";
import {Button} from '../ui/button';
import LoadingSpinner from "../LoadingSpinner";
import { API_URL } from "@/utils/config";
import { toast } from "react-toastify";
import MobileNavBar from "../sections/MobileNavBar";
import useScrollHide from "@/utils/hooks/useScrollHide";
import { authAPI } from "@/utils/APIs/authAPI";

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch=useDispatch();
  const [searchParams] = useSearchParams();

  const referralCode = searchParams.get("ref");
  const [isLoading, setIsLoading] = useState(false)
  const [loaderState, setLoaderState] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    // profile_company: "",
    // profile_country: "",
    // profile_city: "",
    // profile_timezone: "UTC",
    // pref_language: "en",
    // pref_timezone: "UTC",
    // pref_theme: "light",
    // agreeToTerms: false
  })

  const { isHidden: isNavHidden, onScroll } = useScrollHide({
    deltaThreshold: 4,
    topReveal: 10,
  });
  
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const optionsRef = useRef(null);
    const navContainerRef = useRef(null);
    const revealImgRef = useRef(null);
    
    // Handle mouse enter for the entire nav area
    const handleNavAreaEnter = () => {
      setIsOptionsVisible(true);
    };
    
    useEffect(()=>{
      setIsOptionsVisible(true);
      
      setTimeout(()=>{
        setIsOptionsVisible(false);
      },1000);
    },[]);
    
    // Handle mouse leave with proper event delegation
    const handleNavAreaLeave = (e) => {
      // Check if we're moving to the options element
      if (optionsRef.current && optionsRef.current.contains(e.relatedTarget)) {
        return; // Don't hide if moving to options
      }
      setIsOptionsVisible(false);
    };
  
  // Listen for OAuth popup messages
  useEffect(() => {
    const handleOAuthMessage = (event) => {
      const allowedOrigins = [
        window.location.origin ,
        "",
        "null",
        "https://sfclb.netlify.app",
        "https://sfclb.netlify.app/",
        "https://sf-collab-backend-flask.onrender.com/",
        "https://sf-collab-backend-flask.onrender.com"
      ];
  
      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Blocked message from:", event.origin);
        return;
      }
      
      // if (event.origin !== ORIGIN) return;
      
      // alert(JSON.stringify(event.data));
      
      const { type, provider, access_token, refreshToken, user, error } = event.data;
  
      if (type === "oauth_success") {
        console.log("OAuth SUCCESS");
  
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
  
        setLoaderState(false);
  
        dispatch(setToken(access_token));
        dispatch(setUser(user));
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
      }else if(type === "oauth_error") {
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
  }, []);
  

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  // OAuth handlers with popup
  const handleGoogleSignUp = () => {
    setLoaderState(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      `${API_URL}/auth/google?ref=${referralCode ?? ""}`,
      'Google Sign Up',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };
  
  const handleGithubSignUp = () => {
    setLoaderState(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    // setAlertConf({title:"Authenticating with GitHub ....", message:"This will only take a moment. Please follow the GitHub sign-in window."});
    window.open(
      `${API_URL}/auth/github?ref=${referralCode ?? ""}`,
      'Github Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    
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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await authAPI.registerRequest({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        referralCode: referralCode
      });
      console.log(response);

      if (response.success) {
        // Registration succeeded — now log in automatically to get tokens
        const loginResponse = await authAPI.loginRequest({
          email: formData.email,
          password: formData.password
        });

        const { access_token, refresh_token, user } = loginResponse;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refreshToken', refresh_token);

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch(setToken(access_token));
        dispatch(setUser(user));

        setLoaderState(false);

        if (!user.isEmailVerified) {
          const verificationResponse = await authAPI.sendVerificationCodeRequest(access_token);
          navigate(`/verify-email?token=${verificationResponse.verification_token}`);
          toast.info("Verification code sent to your email, continue to verify.");
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors(prev => ({
          ...prev,
          submit: response?.data?.error || 'Signup failed'
        }));
      }
    } catch (error) {
      console.error('Signup unexpected error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error?.response?.data?.error || 'An unexpected error occurred'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div>
      {/* Collapsible Top Nav Container */}
      <div
      ref={navContainerRef}
      onMouseEnter={handleNavAreaEnter}
      onMouseLeave={handleNavAreaLeave}
      className={`w-full overflow-hidden transition-[max-height] duration-300 ease-in-out ${isNavHidden ? "h-0" : "h-[60px]"} lg:h-[60px]`}
      style={{zIndex:99999999}}
    >
      <NavBar isHidden={isNavHidden} />
    </div>
  
      {/* Dark Horizon Glow */}
      <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #0d1a36 100%)",
          }}
        />

      {/* Loader Overlay */}
      {loaderState && (
        <LoadingSpinner
          title={"Authenticating..."}
          message={"Please wait while we redirect you."}
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
          <video src="/login_video.mp4" className="w-full max-h-screen object-fill" autoPlay muted loop/>
        </div>
        
        {/* Right side - Login Form */}
        <div style={{ 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#060010',
        zIndex:999
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
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:text-left">
          <h1 className="text-4xl text-center font-semibold text-white">
            <ShinyText 
              text="Sign up" 
              disabled={false} 
              speed={3} 
              className='mb-5' 
            />
            <p className="text-gray-400 text-sm">Enter your personal data to create your account.</p>
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
               {/* Google Sign In Button */}
               <Button
                // as="button"
                // color="white"
                // speed="5s"
                className="w-1/2 flex-1   bg-white border border-gray-300  text-black flex items-center justify-center py-2 rounded-sm hover:bg-white hover:shadow-[0px_0px_10px_white] cursor-pointer duration-400 transition-all"
                onClick={handleGoogleSignUp}
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
                  onClick={handleGithubSignUp}
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
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
                <span className="bg-black px-2 text-gray-400">Or</span>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-white text-sm">First Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="eg: John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    required
                    className={`border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 w-full rounded px-3 py-2 pl-10`}
                  />
                </div>
                {errors.firstName && <p id="firstName-error" className="text-red-500 text-xs">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-white text-sm">Last Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="eg: Francisco"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    required
                    className={`border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 w-full rounded px-3 py-2 pl-10`}
                  />
                </div>
                {errors.lastName && <p id="lastName-error" className="text-red-500 text-xs">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2 mb-2">
              <label htmlFor="email" className="text-white text-sm">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="eg: johnfrancisco@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                  className={`border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 w-full rounded px-3 py-2 pl-10`}
                />
              </div>
              {errors.email && <p id="email-error" className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2 mb-2">
              {/* <label htmlFor="password" className="text-white text-sm">Password *</label> */}
                <div className="relative">
                <PasswordStrengthIndicator
                  value={formData.password}
                  onChange={(value) => handleInputChange("password", value)}
                  // onStrengthChange={setStrength}
                  label="Password *"
                  showScore={true}
                  showScoreNumber={true}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : "password-hint"}
                  required
                />
                {/* <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button> */}
              </div>
              {errors.password && <p id="password-error" className="text-red-500 text-xs">{errors.password}</p>}
              <p id="password-hint" className="text-xs text-gray-500">Must be at least 8 characters.</p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                aria-invalid={!!errors.agreeToTerms}
                aria-describedby={errors.agreeToTerms ? "agreeToTerms-error" : undefined}
                required
                className="mt-1 rounded border-gray-700 bg-black text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                I agree to the{" "}
                <a href="/terms-and-conditions" className="text-blue-400 hover:text-blue-300">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && <p id="agreeToTerms-error" className="text-red-500 text-xs">{errors.agreeToTerms}</p>}

            {errors.submit && (
              <p id="submit-error" className="text-red-500 text-sm text-center" role="alert">{errors.submit}</p>
            )}

            {/* Sign Up Button */}
            <ShineButton 
              className="w-full  disabled:opacity-50 disabled:cursor-not-allowed relative h-10 cursor-pointer rounded-md flex items-center justify-center text-white "
              type="submit"
              disabled={isLoading}
              label={isLoading ? "Creating Account..." : "Sign Up"}
              size="md" 
              bgColor="linear-gradient(325deg, hsl(217 100% 56%) 0%, hsl(194 100% 69%) 55%, hsl(217 100% 56%) 90%)" 
            />

            {/* Login Link */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={() => navigate("/login")}
                className="text-white hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
  )
}