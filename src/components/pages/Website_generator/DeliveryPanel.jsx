import React, { useState } from 'react';

// Color guidelines adapted for Premium Dark Mode per Davis's feedback
const DeliveryPanel = ({ projectId, token, slug, hasArchive = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleDownload = async () => {
    if (!hasArchive) return;
    setIsDownloading(true);
    setErrorMsg(null);
    setDemoSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockContent = "SF_COLLAB MOCK ZIP ARCHIVE PAYLOAD\nGenerated successfully via Demo Mode.";
      const blob = new Blob([mockContent], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${slug || 'sforger-project-mock'}.zip`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDemoSuccess(true);
    } catch (err) {
      console.error("Archive retrieval error:", err);
      setErrorMsg("Failed to stream your archive file download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ 
      padding: '28px', 
      backgroundColor: '#111827', // Tailwind gray-900 for modern dark mode
      borderRadius: '12px', 
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
      border: '1px solid #1f2937' // gray-800 border edge
    }}>
      
      {/* Title Section with Delivery Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h2 style={{ color: '#f3f4f6', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
          Screen 7 - Deliver & Deploy
        </h2>
      </div>
      
      <p style={{ color: '#9ca3af', marginBottom: '28px', fontSize: '0.95rem' }}>
        Your custom platform codebase generation is ready. Securely acquire the raw workspace snapshot asset below.
      </p>

      {/* Side-by-side action engine */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Module Area A: Active Download Card */}
        <div style={{ 
          backgroundColor: '#1f2937', // gray-800 interior card
          border: '1px solid #374151', // gray-700 divider
          padding: '24px', 
          borderRadius: '10px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Download Cloud Icon */}
          <div style={{ marginBottom: '14px', backgroundColor: 'rgba(124, 58, 237, 0.15)', padding: '12px', borderRadius: '50%' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '8px', color: '#f3f4f6' }}>
            Download Code Archive
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '24px', minHeight: '40px' }}>
            Get a local offline compressed .ZIP payload package structure containing full application codebase models.
          </p>
          
          <button
          onClick={handleDownload}
          disabled={isDownloading || !hasArchive}
          onMouseEnter={() => hasArchive && !isDownloading && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
          background: isDownloading 
          ? '#4b5563' 
          : hasArchive 
          ? isHovered
           ? 'linear-gradient(135deg, #9333ea 0%, #5b21b6 100%)'
           : 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
          : '#4b5563',
         color: '#ffffff',
         padding: '12px 28px',         // Slightly increased side padding for a better pill shape
         border: 'none',
         borderRadius: '24px',          // Davis's rounded-3xl curve
         fontWeight: '600',
         cursor: hasArchive && !isDownloading ? 'pointer' : 'not-allowed',
         boxShadow: hasArchive && !isDownloading 
          ? isHovered 
           ? '0 6px 20px rgba(147, 51, 234, 0.45)' 
           : '0 4px 12px rgba(124, 58, 237, 0.3)'   
         : 'none',
         transform: isHovered ? 'translateY(-1px)' : 'translateY(0)', 
         transition: 'all 0.2s ease',
         width: '85%',                  // Reduced width
         margin: '12px auto 0 auto',    // Centers it and adds 12px of top margin to space it from the text!
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         gap: '8px'
           }}
            >
            {isDownloading ? (
              <>
                <span className="animate-pulse">Processing Stream...</span>
              </>
            ) : (
              <>
                <span>Download ZIP Archive</span>
              </>
            )}
          </button>
        </div>

        {/* Module Area B: Disabled Git Push Card */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          border: '1px solid #374151', 
          padding: '24px', 
          borderRadius: '10px', 
          textAlign: 'center', 
          opacity: 0.4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Git Branch Icon */}
          <div style={{ marginBottom: '14px', backgroundColor: 'rgba(156, 163, 175, 0.1)', padding: '12px', borderRadius: '50%' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="3" x2="6" y2="15"></line>
              <circle cx="18" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '8px', color: '#f3f4f6' }}>
            Push to Remote Git
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '24px', minHeight: '40px' }}>
            Direct pipeline mirror distribution sync integration linking active projects to GitHub repositories automatically.
          </p>
          <button style={{ backgroundColor: '#374151', color: '#9ca3af', padding: '12px 20px', border: 'none', borderRadius: '8px', width: '100%', cursor: 'not-allowed', fontWeight: '600' }} disabled>
            Repository Deploy Pipeline
          </button>
        </div>

      </div>

      {/* Modern Neon Success Notification */}
      {demoSuccess && (
        <div style={{ 
          marginTop: '20px', 
          padding: '14px', 
          backgroundColor: 'rgba(22, 163, 74, 0.15)', 
          border: '1px solid #16a34a', 
          color: '#4ade80', 
          borderRadius: '8px', 
          fontSize: '0.875rem', 
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>[Demo Mode] Mock archive generated and download dispatched to system shell!</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginTop: '20px', padding: '14px', backgroundColor: 'rgba(220, 38, 38, 0.15)', border: '1px solid #dc2626', color: '#f87171', borderRadius: '8px', fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default DeliveryPanel;