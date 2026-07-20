// LoadingSpinner.jsx - Premium Redesign
function LoadingSpinner({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4'
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-full blur-sm animate-pulse" />
        {/* Spinner */}
        <div 
          className={`relative ${sizeClasses[size]} border-blue-400 border-t-transparent rounded-full animate-spin z-10`}
          style={{
            background: 'conic-gradient(from 0deg, transparent, transparent 20%, #60a5fa 50%, transparent 80%, transparent)'
          }}
        ></div>
      </div>
    </div>
  )
}

export default LoadingSpinner