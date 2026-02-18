// ScraperForm.jsx - Premium Redesign
import { useState } from 'react'
import axios from 'axios'
import ScraperResults from './ScraperResults'
import LoadingSpinner from './LoadingSpinner'
import LogoLoop from '../../ui/LogoLoop'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const featureItems = [
    { icon: <img loading="lazy" src="/thounder.jpg" className='w-full' />, metric: '99.9%', label: 'Success Rate', color: 'from-emerald-400 to-green-500' },
    { icon: <img loading="lazy" src="/rocket.jpg" className='w-full' />, metric: '<2s', label: 'Avg. Response', color: 'from-blue-400 to-cyan-500' },
    { icon: <img loading="lazy" src="/search.jpg" className='w-full' />, metric: '1000+', label: 'Sites Supported', color: 'from-purple-400 to-pink-500' },
    { icon: <img loading="lazy" src="/chart.jpg" className='w-full' />, metric: 'PDF', label: 'Export Formats', color: 'from-orange-400 to-red-500' }
  ];
  
function ScraperForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [scrapeMethod, setScrapeMethod] = useState(null)

  const handleScrape = async (method) => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setError(null)
    setResults(null)
    setLoading(true)
    setScrapeMethod(method)

    const endpoint = method === 'static' 
      ? `${API_BASE_URL}/scrape-static`
      : `${API_BASE_URL}/scrape-dynamic`

    try {
      const response = await axios.post(endpoint, { url: url.trim() }, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setResults(response.data.data)
      } else {
        setError(response.data.error || 'Scraping failed')
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout - the page took too long to load')
      } else if (err.response) {
        setError(err.response.data.error || `Server error: ${err.response.status}`)
      } else if (err.request) {
        setError('Cannot connect to server. Please check if the backend is running.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative space-y-8">
      {/* Animated Background */}
      <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

      {/* Premium Form Card */}
      <div className="relative  overflow-hidden animate-fade-in">
        {/* Header Gradient Bar */}
        {/* <div className="bg-linear-to-r from-blue-600 via-purple-600 to-amber-600 h-1.5" /> */}
        
        <div className="p-8">
          {/* Header */}
            <div className="relative overflow-hidden mb-12">
                {/* Animated Background */}
                <div className="absolute inset-0 ">
                    {/* Connection Lines */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-1/4 h-px bg-linear-to-r from-blue-500 to-transparent" />
                        <div className="absolute top-1/3 right-1/3 w-1/6 h-px bg-linear-to-l from-cyan-500 to-transparent" />
                    </div>
                </div>
            
                <div className="relative">
                
                    {/* Main Title */}
                    <div className="text-center mb-6 animate-slide-up">
                        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 animate-slide-up">
                            <span className="bg-linear-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                                Extract Web Data
                            </span>
                            <br />
                            <span className="bg-linear-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent  relative">
                                <span style={{zIndex:'9999999999 !important'}}>
                                    Instantly
                                </span>
                                <span className='absolute  top-16 right-1 w-full flex justify-center mt-2'>
                                    <svg aria-hidden="true" viewBox="0 0 418 42" className=" h-[0.70em] w-96 fill-blue-400/50" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
                                </span>
                            </span>
                        </h2>
                    </div>
                
                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto text-center leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Transform any webpage into <span className="text-blue-400 font-semibold">structured data</span> with our advanced AI scraping technology. 
                        Extract content, prices, reviews, and more with <span className="text-cyan-400 font-semibold">unprecedented accuracy</span>.
                    </p>
                
                    {/* Feature Metrics */}
                    <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div style={{ height: '250px', position: 'relative', overflow: 'hidden'}}>
                            {/* Basic horizontal loop */}
                            <LogoLoop
                              logos={featureItems}
                              speed={25}
                              direction="left"
                              logoHeight={50}
                              gap={40}
                              scaleOnHover
                              fadeOut
                              renderItem={(feature, index) => (
                                <div key={index} className="group relative">
                                  <div className="min-w-40 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
                                    
                                    {/* Icon */}
                                    <div className="flex justify-center mb-2 transform group-hover:scale-110 transition-transform duration-300">
                                      {feature.icon}
                                    </div>
                            
                                    {/* Metric */}
                                    <div className="text-center">
                                      <div className={`text-2xl font-bold bg-linear-to-r ${feature.color} bg-clip-text text-transparent mb-1`}>
                                        {feature.metric}
                                      </div>
                            
                                      {/* Label */}
                                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                        {feature.label}
                                      </div>
                                    </div>
                            
                                  </div>
                                </div>
                              )}
                            />
                        </div>
                    </div>
                </div>
            
                {/* Animated Data Stream */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
                </div>
            </div>

            {/* URL Input */}
            <div className="space-y-8">
                {/* URL Input with Glassmorphism Design */}
                <div className="relative group">
                    <div className="flex items-center justify-between mb-4">
                        <label htmlFor="url" className="flex items-center gap-3 text-lg font-semibold">
                        <div className="relative">
                            <div className="relative ">
                            <span className="text-xl text-blue-300"><img loading="lazy" src="/link.jpg" className='w-10' alt="link" /></span>
                            </div>
                        </div>
                        <span className="text-white font-medium">
                            Website URL
                        </span>
                        </label>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-green-300">READY</span>
                        </div>
                    </div>
                    
                    <div className="relative">
                        {/* Glassmorphism input container */}
                        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl transition-all duration-300 group-hover:border-blue-400/40 group-focus-within:border-purple-400/50 group-focus-within:bg-white/15 overflow-hidden">
                        <input
                            type="text"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleScrape('static')}
                            placeholder="https://example.com"
                            className="relative w-full px-6 py-4 bg-transparent border-none outline-none text-white placeholder-blue-100/60 text-lg font-medium transition-all duration-300"
                            disabled={loading}
                        />
                        
                        {/* Input status indicator */}
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            {url ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs text-blue-100/80 font-medium">VALID</span>
                            </div>
                            ) : (
                            <div className="w-2 h-2 bg-white/30 rounded-full" />
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            
                {/* Glassmorphism Scrape Buttons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[
                        {
                        method: 'static',
                        label: 'Static Analysis',
                        description: 'Lightning-fast HTML parsing',
                        icon:<img loading="lazy" src='/thounder.jpg' className='w-16'/>,
                        gradient: 'from-blue-400 to-cyan-400',
                        borderColor: 'border-blue-400/30',
                        hoverBorder: 'border-blue-400/50',
                        loadingText: 'Analyzing HTML structure...',
                        features: ['Instant parsing', 'Low resource usage', 'Ideal for static sites']
                        },
                        {
                        method: 'dynamic',
                        label: 'Dynamic Rendering', 
                        description: 'Full JavaScript execution',
                        icon:<img loading="lazy" src='/rocket.jpg' className='w-16'/>,
                        gradient: 'from-purple-400 to-pink-400',
                        borderColor: 'border-purple-400/30',
                        hoverBorder: 'border-purple-400/50',
                        loadingText: 'Executing JavaScript...',
                        features: ['SPA support', 'Real-time content', 'Complex interactions']
                        }
                    ].map((btn) => (
                        <button
                        key={btn.method}
                        onClick={() => handleScrape(btn.method)}
                        disabled={loading}
                        className={`groupe cursor-pointer relative w-full bg-white/10 backdrop-blur-lg ${btn.borderColor} border text-white font-semibold py-5 px-6 rounded-xl transition-all duration-300 hover:${btn.hoverBorder} hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden`}
                        >
                        {/* Gradient overlay on hover */}
                        <div className={`absolute inset-0 bg-linear-to-r ${btn.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {loading && scrapeMethod === btn.method ? (
                            <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                                <div className="text-left">
                                <div className="font-semibold text-white">Processing...</div>
                                <div className="text-sm text-blue-100/70 mt-1">{btn.loadingText}</div>
                                </div>
                            </div>
                            <div className="text-xl opacity-50 ">{btn.icon}</div>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative p-2 bg-white/10 rounded-lg border border-white/20">
                                <span className="text-xl">{btn.icon}</span>
                                </div>
                                <div className="text-left">
                                <div className="font-semibold text-white text-lg">{btn.label}</div>
                                <div className="text-sm text-blue-100/70 mt-1">{btn.description}</div>
                                </div>
                            </div>
                            <div className="text-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                {btn.icon}
                            </div>
                            </div>
                        )}
                        </button>
                    ))}
                </div>
            
                {/* Glassmorphism Method Info Card */}
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 transition-all duration-300 hover:border-amber-400/30">
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                        <div className="relative p-3 bg-white/10 rounded-lg border border-white/20">
                            <span className="text-xl text-amber-300">💡</span>
                        </div>
                        </div>
                        <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Choosing the Right Method
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0" />
                                <div>
                                <div className="font-semibold text-white mb-2">Static Analysis</div>
                                <ul className="space-y-2 text-sm text-blue-100/80">
                                    <li className="flex items-center gap-2">
                                    <span className="text-blue-300">•</span>
                                    Traditional HTML websites
                                    </li>
                                    <li className="flex items-center gap-2">
                                    <span className="text-blue-300">•</span>
                                    Blogs, news, documentation
                                    </li>
                                    <li className="flex items-center gap-2">
                                    <span className="text-blue-300">•</span>
                                    Faster processing (under 2s)
                                    </li>
                                </ul>
                                </div>
                            </div>
                            </div>
                            <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 shrink-0" />
                                <div>
                                <div className="font-semibold text-white mb-2">Dynamic Rendering</div>
                                <ul className="space-y-2 text-sm text-blue-100/80">
                                    <li className="flex items-center gap-2">
                                    <span className="text-purple-300">•</span>
                                    React, Vue, Angular apps
                                    </li>
                                    <li className="flex items-center gap-2">
                                    <span className="text-purple-300">•</span>
                                    Single Page Applications
                                    </li>
                                    <li className="flex items-center gap-2">
                                    <span className="text-purple-300">•</span>
                                    JavaScript-heavy content
                                    </li>
                                </ul>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full flex justify-center animate-fade-in">
          <div className="w-2/3 mb-4 relative bg-linear-to-br from-red-900/30 to-red-800/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <span className="text-red-400 text-xl">❌</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-400 mb-2">Scraping Error</h3>
                <p className="text-red-300/90">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="animate-fade-in">
          <div className="relative p-12 text-center shadow-2xl">
            <LoadingSpinner size="large" className="mb-6" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {scrapeMethod === 'dynamic' ? 'Launching Browser Engine' : 'Analyzing Page Structure'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {scrapeMethod === 'dynamic' 
                ? 'Rendering JavaScript and extracting dynamic content...' 
                : 'Parsing HTML structure and extracting metadata...'
              }
            </p>
            {/* Progress animation */}
            <div className="mt-6 w-48 h-1 bg-slate-700 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && !loading && (
        <ScraperResults data={results} method={scrapeMethod} />
      )}
    </div>
  )
}

export default ScraperForm