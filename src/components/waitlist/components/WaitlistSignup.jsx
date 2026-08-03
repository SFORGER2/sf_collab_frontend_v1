import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { waitlistAPI } from '../../../utils/APIs/waitlistAPI'
import { CheckCircle2, Users, Gift, Phone } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LoadingSpinner } from './ui/loading-spinner'

/* ------------------------------------------------------------------
   PhoneInput
------------------------------------------------------------------ */
function PhoneInput({ extension, onExtensionChange, phone, onPhoneChange }) {
  return (
    <div className="flex gap-2 w-full">
      <div className="relative w-20 shrink-0">
        <Input
          id="extension"
          type="text"
          placeholder="+1"
          value={extension}
          onChange={onExtensionChange}
          className="w-full bg-neutral-800 border border-white/10 text-white placeholder:text-neutral-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
        />
      </div>
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
        <Input
          id="phone"
          type="tel"
          placeholder="123-456-7890"
          value={phone}
          onChange={onPhoneChange}
          required
          className="w-full pl-9 bg-neutral-800 border border-white/10 text-white placeholder:text-neutral-500 rounded-lg py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   OTPInput
------------------------------------------------------------------ */
function OTPInput({ value, onChange }) {
  const digits = value.padEnd(6, '').split('').slice(0, 6)

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, idx) => (idx === i ? val : d)).join('')
    onChange(next)
    if (val && i < 5) {
      e.target.parentElement.children[i + 1]?.focus()
    }
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.target.parentElement.children[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <Input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-11 h-11 text-center text-lg font-bold bg-neutral-800 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------
   Main component
------------------------------------------------------------------ */
export function WaitlistSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [extension, setExtension] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [truthyVerificationCode, setTruthyVerificationCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [maxCount, setMaxCount] = useState(1000)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const navigate = useNavigate()
  const { user, access_token } = useSelector((state) => state.auth)
  const justRegistered = useRef(false)
  const statusCheckInProgress = useRef(false) // prevent race

  // Detect dev bypass user – this is the ONLY place we mock
  const isDevUser = user?.email === 'dev@sfcollab.local' || user?.id === 'dev-preview-user'

  // Auto‑verify OTP for real users
  useEffect(() => {
    if (
      !isDevUser &&
      truthyVerificationCode.length === 6 &&
      verificationCode === truthyVerificationCode
    ) {
      setVerified(true)
      toast.success('Phone number verified successfully!')
    }
  }, [verificationCode, truthyVerificationCode, isDevUser])

  // Fetch total count
  useEffect(() => {
    async function fetchTotalCount() {
      try {
        const res = await waitlistAPI.getTotalCount()
        setTotalCount(res.total)
        setMaxCount(res.max_allowed)
      } catch { /* ignore */ }
    }
    fetchTotalCount()
  }, [])

  // Pre‑fill from real user (skip dev)
  useEffect(() => {
    if (user && !isDevUser && user.email) {
      setEmail(user.email)
      setName((user.fullName || user.firstName || '').trim())
    }
  }, [user, isDevUser])

  // ---- Check waitlist status (real users only) ----
  useEffect(() => {
    if (isDevUser) {
      // For dev, do not set on waitlist (unless we want to show mock, but we skip)
      setIsOnWaitlist(false)
      setResult(null)
      return
    }

    // If we just registered, skip the check – the state is already updated
    if (justRegistered.current) {
      justRegistered.current = false
      return
    }

    if (!email || !access_token) return

    const checkStatus = async () => {
      // Avoid multiple simultaneous calls
      if (statusCheckInProgress.current) return
      statusCheckInProgress.current = true

      try {
        // 1) Check localStorage cache, but only if it's fresh (≤ 5 minutes)
        const cached = localStorage.getItem('waitlistStatus')
        if (cached) {
          try {
            const data = JSON.parse(cached)
            if (data.email === email && Date.now() - data.timestamp < 5 * 60 * 1000) {
              // Cache is fresh
              setIsOnWaitlist(true)
              setResult({ position: data.position })
              statusCheckInProgress.current = false
              return
            }
          } catch (e) {}
        }

        // 2) Call API
        const res = await waitlistAPI.isOnWaitlist(email)
        if (res.on_waitlist) {
          setIsOnWaitlist(true)
          setResult({ position: res.position })
          localStorage.setItem('waitlistStatus', JSON.stringify({
            email,
            position: res.position,
            timestamp: Date.now()
          }))
        } else {
          setIsOnWaitlist(false)
          setResult(null)
          localStorage.removeItem('waitlistStatus')
        }
      } catch (err) {
        console.error('Waitlist check failed:', err.response || err)
        // On error, fallback to cache if it exists (even if expired)
        const cached = localStorage.getItem('waitlistStatus')
        if (cached) {
          try {
            const data = JSON.parse(cached)
            if (data.email === email) {
              setIsOnWaitlist(true)
              setResult({ position: data.position })
            }
          } catch (e) {}
        }
      } finally {
        statusCheckInProgress.current = false
      }
    }

    checkStatus()
  }, [email, access_token, isDevUser])

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // ---- Authentication ----
    if (!user || !access_token) {
      toast.error('Please login before joining the waitlist.')
      setLoading(false)
      return
    }

    // ---- Dev user is blocked from real registration ----
    if (isDevUser) {
      toast.error('Dev user cannot join the real waitlist. Please log in with a real account.')
      setLoading(false)
      return
    }

    // ---- Already on waitlist ----
    if (isOnWaitlist) {
      toast.error('You are already on the waitlist')
      setLoading(false)
      return
    }

    // ---- Terms ----
    if (!acceptedTerms) {
      toast.error('You must accept the terms and conditions.')
      setLoading(false)
      return
    }

    // ---- Phone verification step ----
    if (!verified) {
      try {
        // If OTP code was sent and length is 6 but not verified, prompt to enter
        if (truthyVerificationCode.length === 6) {
          toast.error('Please enter the verification code sent to your phone.')
          setLoading(false)
          return
        }
        const response = await waitlistAPI.sendPhoneVerificationCode(
          user.id, email, phone, extension, access_token
        )
        if (response?.verified) {
          setVerified(true)
          toast.success('Phone number verified successfully!')
        } else {
          setTruthyVerificationCode(String(response.verification_code))
          toast.info('Verification code sent to your phone. Please enter the code to verify.')
        }
      } catch (err) {
        console.log('Send verification error:', err.response || err)
        if (err.response?.status === 401) {
          toast.error('Phone number already in use. Please check and try again.')
        } else {
          toast.error(err.response?.data?.error || 'Failed to send verification code.')
        }
      } finally {
        setLoading(false)
      }
      return
    }

    // ---- Registration ----
    try {
      const response = await waitlistAPI.register(
        email,
        name || undefined,
        user.id,
        phone,
        extension,
        access_token
      )
      // Success – update state and cache
      setIsOnWaitlist(true)
      setResult({ position: response.position })
      localStorage.setItem('waitlistStatus', JSON.stringify({
        email,
        position: response.position,
        timestamp: Date.now()
      }))
      justRegistered.current = true  // prevent check effect from re‑running
      toast.success('Successfully joined the waitlist!')
      setTotalCount((c) => c + 1)
    } catch (error) {
      console.log('Registration error:', error.response || error)
      if (error.response?.status === 409) {
        toast.error('The waitlist is full. We are no longer accepting new signups.')
      } else if (error.response?.status === 400) {
        toast.error('This phone number is already registered.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to join the waitlist')
      }
    } finally {
      setLoading(false)
    }
  }

  const progressPct = Math.min((totalCount / maxCount) * 100, 100)

  // ---------- Screens ----------
  // Show Already on Waitlist for real users
  if (isOnWaitlist && !isDevUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <div className="p-8 bg-neutral-900 border border-green-600/50 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Already on Waitlist</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            You're already registered. Thank you for your interest — stay tuned for updates and referral opportunities.
          </p>
          <p className="text-white">
            Your Position:{' '}
            <span className="font-bold text-green-400 text-lg">#{result?.position || '—'}</span>
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 hover:bg-green-700 transition-colors px-8"
          >
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    )
  }

  // Waitlist full (real users only)
  if (totalCount >= maxCount && !isDevUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-4"
      >
        <div className="p-8 bg-neutral-900 border border-red-600/50 rounded-2xl text-center space-y-3">
          <Gift className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Waitlist Full</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            The waitlist has reached its maximum capacity. Please check back later.
          </p>
        </div>
        <WaitlistCounter totalCount={totalCount} maxCount={maxCount} progressPct={progressPct} />
      </motion.div>
    )
  }

  // ---------- Signup form (real users only; dev user is blocked) ----------
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="max-w-xl mx-auto"
    >
      <Card className="shadow-2xl bg-neutral-900 border border-white/10">
        <CardHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <Users className="h-5 w-5 text-blue-400" />
            Join the Waitlist
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pt-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email – editable, placeholder faded */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="bg-neutral-800 border border-white/10 text-white placeholder:text-neutral-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Name – editable, placeholder faded */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="bg-neutral-800 border border-white/10 text-white placeholder:text-neutral-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <PhoneInput
                extension={extension}
                onExtensionChange={(e) => setExtension(e.target.value)}
                phone={phone}
                onPhoneChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Terms & Conditions
              </Label>
              <label
                htmlFor="terms"
                className="flex items-start gap-3 bg-neutral-800/60 border border-white/10 rounded-lg px-4 py-3 cursor-pointer hover:border-white/20 transition-colors"
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 shrink-0 accent-blue-500 cursor-pointer"
                />
                <span className="text-sm text-neutral-300 leading-snug">
                  I accept the{' '}
                  <a
                    href="/waitlist-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    waitlist terms and conditions
                  </a>
                </span>
              </label>
            </div>

            {/* OTP */}
            {!verified && truthyVerificationCode.length === 6 && (
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Verification Code
                </Label>
                <p className="text-sm text-neutral-400">
                  Enter the 6‑digit code sent to your phone
                </p>
                <OTPInput value={verificationCode} onChange={setVerificationCode} />
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  {truthyVerificationCode.length === 6 && !verified ? 'Verifying...' : 'Joining...'}
                </span>
              ) : (
                truthyVerificationCode.length === 6 && !verified ? 'Verify & Join' : 'Join Waitlist'
              )}
            </Button>

            <WaitlistCounter totalCount={totalCount} maxCount={maxCount} progressPct={progressPct} />

          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------
   Counter
------------------------------------------------------------------ */
function WaitlistCounter({ totalCount, maxCount, progressPct }) {
  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Spots filled</span>
        <span className="text-white font-semibold">
          {totalCount.toLocaleString()} / {maxCount.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500 text-center">
        {Math.round(progressPct)}% of spots claimed
      </p>
    </div>
  )
}