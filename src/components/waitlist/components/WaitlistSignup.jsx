
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { waitlistAPI } from '../../../utils/APIs/waitlistAPI'
import { CheckCircle2, Users, Gift } from 'lucide-react'
import { toast } from 'react-toastify'
import useCountdown from './hooks/useCountdown'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LoadingSpinner } from './ui/loading-spinner'



// Smooth prompt input (inspired by Claude Style Chat Input)
function PromptInput({ value, onChange, placeholder, wFull, includeLogo, ...props }) {
  return (
    <div className={`relative group ${wFull ? 'w-full' : ''}`}>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 bg-b/80 border border-primary/30 rounded-lg shadow-md focus:ring-2 focus:ring-primary/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
        {...props}
      />
      {includeLogo &&
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 text-lg transition-transform duration-300 group-hover:scale-110">✉️</span>
      }
    </div>
  )
}

export function WaitlistSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [extension, setExtension] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [truthyVerificationCode, setTruthyVerificationCode] = useState('')
  const [verified, setVerified] = useState(false)

  useEffect(() => {

    if (verificationCode === truthyVerificationCode && verificationCode.length === 6) {
      setVerified(true)
      toast.success('Phone number verified successfully!')
    }

  }, [verificationCode, truthyVerificationCode]);
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(false)
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [maxCount, setMaxCount] = useState(1000)
  useEffect(() => {
    async function fetchTotalCount() {
      const result = await waitlistAPI.getTotalCount()

      setTotalCount(result.total)
      setMaxCount(result.max_allowed)
    }
    fetchTotalCount()
  }, []);
  const [expiresAt] = useState(null) // in seconds
  const navigate = useNavigate()
  const { user, access_token } = useSelector((state) => state.auth);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email)
      setName((user.fullName || user.firstName || '').trim())
    }
  }, [user]);
  // const secondsLeft = useCountdown(expiresAt || 5, result, () => {
  //   navigate(`/refer`)
  // })
  useEffect(() => {
    async function checkWaitlist() {
      if (!email) return;
      const isOnWaitlist = await waitlistAPI.isOnWaitlist(email)

      setIsOnWaitlist(isOnWaitlist.on_waitlist)
      if (isOnWaitlist.on_waitlist) {
        setResult({ position: isOnWaitlist.position })
      }
    }
    checkWaitlist()
  }, [email]);



  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (isOnWaitlist) {
      toast.error('You are already on the waitlist')
      setLoading(false)
      return
    }
    if (!acceptedTerms) {
      toast.error('You must accept the terms and conditions to join the waitlist.')
      setLoading(false)
      return
    }
    if (!verified) {
      try {
        if (truthyVerificationCode.length === 6) {
          toast.error('Please enter the verification code sent to your phone.')
          setLoading(false)
          return
        }
        const response = await waitlistAPI.sendPhoneVerificationCode(user.id, email, phone, extension, access_token)
        if (response?.verified) {
          setVerified(true)
          toast.success('Phone number verified successfully!')
          setLoading(false)
        }
        else {
          setTruthyVerificationCode(String(response.verification_code))

          toast.info('Verification code sent to your phone. Please enter the code to verify.')
          return
        }


      } catch (err) {
        if (err.status === 401) {
          toast.error('Phone number already in use. Please check and try again.')
          return
        }
        console.log('Response:', err);
        toast.error('Failed to send verification code. Please check your phone number and try again.')
        return
      } finally {
        setLoading(false)
      }
    }
    try {
      const response = await waitlistAPI.register(email, name || undefined, user.id, access_token)

      setResult(response)
      toast.success('Successfully joined the waitlist!')
      setTotalCount(totalCount + 1)


    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error('The waitlist is full. We are no longer accepting new signups.')
        return
      }
      if (error.response && error.response.status === 400) {
        toast.error('This phone number is already registered.')
        return
      }
      toast.error(error.response?.data?.error || 'Failed to join the waitlist')
    } finally {
      setLoading(false)
    }
  }
  if (isOnWaitlist) {

    return (
      <div className="p-6 bg-neutral-900 border border-green-600 rounded-2xl text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">Already on Waitlist</h2>
        <p className="text-neutral-400">
          You are already on the waitlist. Thank you for your interest! Stay tuned for updates and referral opportunities.
        </p>
        <p className="text-lg font-medium mb-4 text-white mt-4">Your Position: <span className="font-bold text-green-400">#{result.position}</span></p>
        <Button
          onClick={() => navigate('/dashboard')}
          className="p-4 m-4 bg-green-600 hover:bg-green-700 transition-all duration-300"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }
  if (totalCount >= maxCount) {
    return (
      <>
        <div className="p-6 bg-neutral-900 border border-red-600 rounded-2xl text-center">
          <Gift className="h-10 w-10 text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Waitlist Full</h2>
          <p className="text-neutral-400">
            Thank you for your interest! The waitlist has reached its maximum capacity. Please check back later for more opportunities to join.
          </p>
        </div>

        <div className="my-6 p-8 bg-slate-900 border border-white rounded-2xl total w-full">
          <p className="text-sm text-white text-center">
            Total on Waitlist: <span className="font-bold text-white">{totalCount}</span> / <span className="font-bold text-white">{maxCount}</span>
          </p>
          <div className='w-full h-4 border border-black rounded-lg overflow-hidden mt-2 bg-white/10'>
            <div
              className='h-full bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-lg'
              style={{ width: `${(totalCount / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>

      </>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center bg-linear-to-tr min-h-[400px] p-6 rounded-2xl shadow-2xl overflow-hidden">

      {result ? (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring' }} className="w-full max-w-xl z-10">
          <Card className="border-primary shadow-2xl bg-slate-800/90 backdrop-blur-md text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-white text-3xl">
                <CheckCircle2 className="h-8 w-8 animate-scale-in" />
                Congratulations!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xl font-semibold mb-2 text-white">You're in the waitlist</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400/60 bg-clip-text text-transparent">
                  #{result.position}
                </p>
              </div>

              <p className="text-lg font-medium text-white">🚀 The competition has started!</p>

              <Button
                onClick={() => navigate('/dashboard')}
                className="p-4 m-4 bg-green-600 hover:bg-green-700 transition-all duration-300"
              >
                Go to Dashboard
              </Button>
              {/* <p className="text-sm text-slate-400">
                Redirecting to referral page in <span className="font-bold text-white">{secondsLeft}</span> seconds...
              </p> */}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring' }} className="w-full max-w-xl space-y-6 z-10">
          <Card className="hover-lift animate-fade-in-up shadow-2xl bg-stale-600/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex text-white items-center gap-2">
                <Users className="h-5 w-5 text-white transition-transform duration-300 hover:rotate-12" />
                Join the Waitlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up animate-stagger-1">
                <div className="space-y-2 text-white">
                  <Label>Email</Label>
                  <p className="text-sm text-slate-300">{email}</p>
                </div>
                <div className="space-y-2 text-white">
                  <Label>Name</Label>
                  <p className="text-sm text-slate-300">{name || 'Not provided'}</p>
                </div>
                <div className="space-y-2 text-white">
                  <Label htmlFor="phone">Phone Number *</Label>

                  <div className="flex gap-2 w-full text-black">
                    <PromptInput
                      id="extension"
                      type="text"
                      placeholder="Ext"
                      value={extension}
                      onChange={(e) => setExtension(e.target.value)}
                      className="w-20"
                    />

                    <PromptInput
                      id="phone"
                      type="tel"
                      placeholder="123-456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="flex-1"
                      wFull={true}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-white">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-primary/30 bg-b/80 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
                      I accept the <a href="/waitlist-terms" target="_blank" rel="noopener noreferrer" className="underline">waitlist terms and conditions</a>
                    </label>
                  </div>
                </div>

                {
                  !verified && truthyVerificationCode.length === 6 && (
                    <div className="space-y-2 text-white">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <p className="text-sm text-slate-300">Enter the 6-digit code sent to your phone</p>
                      <div className="flex gap-1 justify-center">
                        {[...Array(6)].map((_, i) => (
                          <Input
                            key={i}
                            type="text"
                            maxLength="1"
                            placeholder="0"
                            onPaste={(e) => {
                              const paste = e.clipboardData.getData('text').slice(0, 6)
                              const newCode = paste.split('')
                              setVerificationCode(newCode.join(''))
                            }}
                            value={verificationCode[i] || ''}
                            onChange={(e) => {
                              const newCode = verificationCode.split('')
                              newCode[i] = e.target.value
                              setVerificationCode(newCode.join(''))
                              if (e.target.value.length === 0) {
                                e.target.previousElementSibling?.focus()
                                return
                              }
                              if (e.target.value && i < 5) {
                                e.target.nextElementSibling?.focus()
                              }
                            }}
                            className="w-10 h-10 text-center text-lg font-bold border border-primary/30 rounded-lg bg-b/80 focus:ring-2 focus:ring-primary/40"
                          />
                        ))}
                      </div>
                    </div>
                  )
                }{
                  !verified && truthyVerificationCode.length === 6 && (
                    <div className="space-y-2 text-white">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <p className="text-sm text-slate-300">Enter the 6-digit code sent to your phone</p>
                      <div className="flex gap-1 justify-center">
                        {[...Array(6)].map((_, i) => (
                          <Input
                            key={i}
                            type="text"
                            maxLength="1"
                            placeholder="0"
                            onPaste={(e) => {
                              const paste = e.clipboardData.getData('text').slice(0, 6)
                              const newCode = paste.split('')
                              setVerificationCode(newCode.join(''))
                            }}

                            value={verificationCode[i] || ''}
                            onChange={(e) => {
                              const newCode = verificationCode.split('')
                              newCode[i] = e.target.value
                              setVerificationCode(newCode.join(''))
                              if (e.target.value.length === 0) {
                                e.target.previousElementSibling?.focus()
                                return
                              }
                              if (e.target.value && i < 5) {
                                e.target.nextElementSibling?.focus()
                              }
                            }}
                            className="w-10 h-10 text-center text-lg font-bold border border-primary/30 rounded-lg bg-b/80 focus:ring-2 focus:ring-primary/40"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="group w-full transition-all duration-300 hover:scale-105
      hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
      hover:bg-purple-600 cursor-pointer"
                >

                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Joining...
                    </span>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
                <div className="total w-full">
                  <p className="text-sm text-white text-center">
                    Total on Waitlist: <span className="font-bold text-white">{totalCount}</span> / <span className="font-bold text-white">{maxCount}</span>
                  </p>
                  <div className='w-full h-4 border border-black rounded-lg overflow-hidden mt-2 bg-white/10'>
                    <div
                      className='h-full bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-lg'
                      style={{ width: `${(totalCount / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};


// ...existing code up to the first return statement...
// Only keep the first return block, remove all duplicate/extra returns and JSX after it.

