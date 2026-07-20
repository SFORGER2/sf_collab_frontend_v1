// ScraperResults.jsx - Premium Redesign
import { useState } from 'react'

function ScraperResults({ data, method }) {
  const [showRawJson, setShowRawJson] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'links', label: 'Links', icon: '🔗' },
    { id: 'raw', label: 'JSON', icon: '{}' }
  ]

  return (
    <div className="relative animate-fade-in">
      {/* Background Glow */}
      <div className="absolute -inset-4 bg-linear-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 blur-3xl rounded-3xl" />
      
      <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Scraping Complete</h2>
                <p className="text-emerald-100 mt-1 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    method === 'static' ? 'bg-blue-500/30' : 'bg-purple-500/30'
                  }`}>
                    {method === 'static' ? 'BeautifulSoup (Static)' : 'Playwright (Dynamic)'}
                  </span>
                  • Successfully extracted {data.meta.total_links} elements
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-200 text-sm">Domain</div>
              <div className="font-semibold text-white">{data.meta.domain}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-white/10 bg-slate-800/30 backdrop-blur-xl">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Links', value: data.meta.total_links, color: 'blue', icon: '🔗' },
                  { label: 'H1 Headings', value: data.meta.total_h1, color: 'green', icon: '📄' },
                  { label: 'H2 Headings', value: data.meta.total_h2, color: 'purple', icon: '📑' },
                  { label: 'Page Title', value: data.title ? 'Available' : 'Missing', color: 'amber', icon: '🏷️' }
                ].map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group hover:scale-105 transition-transform duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* URL & Title */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-slate-300 font-semibold mb-3">
                    <span className="text-blue-400">🔗</span> Scraped URL
                  </h3>
                  <a 
                    href={data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all hover:underline font-medium"
                  >
                    {data.url}
                  </a>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-slate-300 font-semibold mb-3">
                    <span className="text-green-400">📄</span> Page Title
                  </h3>
                  <p className="text-white font-medium">{data.title || 'No title found'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in">
              {/* H1 Headings */}
              {data.headings.h1.length > 0 && (
                <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">H1</span>
                    Main Headings ({data.headings.h1.length})
                  </h3>
                  <div className="space-y-3">
                    {data.headings.h1.map((heading, index) => (
                      <div 
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 py-3 bg-slate-700/30 rounded-r-lg group hover:bg-slate-700/50 transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <p className="text-white font-medium">{heading}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* H2 Headings */}
              {data.headings.h2.length > 0 && (
                <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">H2</span>
                    Subheadings ({data.headings.h2.length})
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {data.headings.h2.map((heading, index) => (
                      <div 
                        key={index}
                        className="border-l-4 border-purple-500 pl-4 py-2 bg-slate-700/30 rounded-r-lg group hover:bg-slate-700/50 transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <p className="text-slate-200">{heading}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && data.links.length > 0 && (
            <div className="animate-fade-in">
              <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                  <span className="text-green-400">🔗</span>
                  Extracted Links ({data.links.length})
                  {data.meta.total_links > data.links.length && (
                    <span className="text-sm text-slate-400 font-normal ml-2">
                      (showing first {data.links.length})
                    </span>
                  )}
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {data.links.map((link, index) => (
                    <div 
                      key={index}
                      className="bg-slate-700/30 border border-white/10 rounded-xl p-4 hover:bg-slate-700/50 hover:border-white/20 transition-all duration-300 group animate-fade-in"
                      style={{ animationDelay: `${index * 0.02}s` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium mb-2 truncate">
                            {link.text || 'No text'}
                          </p>
                          <a 
                            href={link.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all hover:underline"
                          >
                            {link.href}
                          </a>
                        </div>
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded">
                            ↗
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON Tab */}
          {activeTab === 'raw' && (
            <div className="animate-fade-in">
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 border-b border-white/10">
                  <h3 className="text-slate-300 font-semibold flex items-center gap-2">
                    <span className="text-amber-400">{}</span>
                    Raw JSON Data
                  </h3>
                </div>
                <div className="p-6 max-h-96 overflow-auto">
                  <pre className="text-green-400 text-sm font-mono">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScraperResults