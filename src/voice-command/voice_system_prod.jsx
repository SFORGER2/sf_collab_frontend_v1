import React, { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Volume2, Moon, Sun, Home, LayoutDashboard, Edit, Settings, User } from 'lucide-react';

// ============================================================================
// COMMANDS REGISTRY - Add new commands here in 5 seconds
// ============================================================================

const createCommandsRegistry = (navigate, actions) => [
  // Navigation Commands
  {
    id: 'nav_dashboard',
    phrases: ['dashboard', 'go to dashboard', 'show dashboard', 'open dashboard'],
    callback: () => navigate('dashboard'),
    description: 'Navigate to dashboard',
    category: 'navigation'
  },
  {
    id: 'nav_home',
    phrases: ['home', 'go home', 'go to home', 'homepage'],
    callback: () => navigate('home'),
    description: 'Navigate to home',
    category: 'navigation'
  },
  {
    id: 'nav_editor',
    phrases: ['edit image', 'image editor', 'go to editor', 'editor', 'edit'],
    callback: () => navigate('editor'),
    description: 'Navigate to image editor',
    category: 'navigation'
  },
  {
    id: 'nav_settings',
    phrases: ['settings', 'go to settings', 'open settings'],
    callback: () => navigate('settings'),
    description: 'Navigate to settings',
    category: 'navigation'
  },
  {
    id: 'nav_profile',
    phrases: ['profile', 'my profile', 'go to profile', 'user profile'],
    callback: () => navigate('profile'),
    description: 'Navigate to profile',
    category: 'navigation'
  },

  // Action Commands
  {
    id: 'action_modal',
    phrases: ['open modal', 'show modal', 'modal', 'open popup'],
    callback: () => actions.openModal(),
    description: 'Open modal dialog',
    category: 'action'
  },
  {
    id: 'action_refresh',
    phrases: ['refresh', 'reload', 'refresh page', 'reload page'],
    callback: () => window.location.reload(),
    description: 'Refresh the page',
    category: 'action'
  },
  {
    id: 'action_theme',
    phrases: ['toggle theme', 'dark mode', 'light mode', 'switch theme', 'change theme'],
    callback: () => actions.toggleTheme(),
    description: 'Toggle dark/light theme',
    category: 'action'
  },
  {
    id: 'action_reset',
    phrases: ['reset', 'clear all', 'start over', 'clear'],
    callback: () => actions.reset(),
    description: 'Reset application state',
    category: 'action'
  },
  {
    id: 'action_save',
    phrases: ['save', 'save changes', 'save now'],
    callback: () => actions.save(),
    description: 'Save current work',
    category: 'action'
  },

  // Voice Control Commands
  {
    id: 'voice_stop',
    phrases: ['stop listening', 'turn off voice', 'disable voice', 'stop'],
    callback: () => actions.stopListening(),
    description: 'Stop voice recognition',
    category: 'control'
  },
  {
    id: 'voice_start',
    phrases: ['start listening', 'turn on voice', 'enable voice'],
    callback: () => actions.startListening(),
    description: 'Start voice recognition',
    category: 'control'
  },
  {
    id: 'voice_help',
    phrases: ['help', 'list commands', 'what can you do', 'show commands', 'commands'],
    callback: () => actions.showHelp(),
    description: 'Show available commands',
    category: 'control'
  },

  // Wildcard Commands - Search
  {
    id: 'wildcard_search',
    phrases: ['search *', 'find *', 'look for *'],
    callback: (query) => actions.search(query),
    description: 'Search for anything',
    category: 'wildcard',
    isWildcard: true,
    extractWildcard: (transcript, phrase) => {
      const prefix = phrase.replace('*', '').trim();
      return transcript.replace(new RegExp(`^${prefix}`, 'i'), '').trim();
    }
  },
  {
    id: 'wildcard_open',
    phrases: ['open *', 'launch *', 'show *'],
    callback: (target) => actions.openTarget(target),
    description: 'Open any target',
    category: 'wildcard',
    isWildcard: true,
    extractWildcard: (transcript, phrase) => {
      const prefix = phrase.replace('*', '').trim();
      return transcript.replace(new RegExp(`^${prefix}`, 'i'), '').trim();
    }
  },
  {
    id: 'wildcard_create',
    phrases: ['create *', 'new *', 'make *'],
    callback: (item) => actions.create(item),
    description: 'Create new item',
    category: 'wildcard',
    isWildcard: true,
    extractWildcard: (transcript, phrase) => {
      const prefix = phrase.replace('*', '').trim();
      return transcript.replace(new RegExp(`^${prefix}`, 'i'), '').trim();
    }
  }
];

// ============================================================================
// FUZZY MATCHING ENGINE
// ============================================================================

const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;
  
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  let matchCount = 0;
  
  words1.forEach(w1 => {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matchCount++;
    }
  });
  
  return matchCount / Math.max(words1.length, words2.length);
};

const findBestMatch = (transcript, commands, threshold = 0.65) => {
  let bestMatch = null;
  let bestScore = threshold;
  let wildcardData = null;

  for (const command of commands) {
    for (const phrase of command.phrases) {
      if (command.isWildcard) {
        const prefix = phrase.replace('*', '').trim();
        const regex = new RegExp(`^${prefix}`, 'i');
        
        if (regex.test(transcript)) {
          const extracted = command.extractWildcard(transcript, phrase);
          if (extracted) {
            return { command, score: 1, wildcardData: extracted };
          }
        }
      } else {
        const score = calculateSimilarity(transcript, phrase);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = command;
        }
      }
    }
  }

  return bestMatch ? { command: bestMatch, score: bestScore, wildcardData } : null;
};

// ============================================================================
// VOICE CONTROLLER COMPONENT
// ============================================================================

const VoiceController = ({ currentPage, onNavigate, onCommandExecuted }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const lastProcessedRef = useRef('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Actions that commands can trigger
  const actions = {
    openModal: () => {
      setModalOpen(true);
      setLastCommand('Opened modal');
    },
    toggleTheme: () => {
      setDarkMode(prev => !prev);
      setLastCommand('Toggled theme');
    },
    reset: () => {
      resetTranscript();
      setSearchQuery('');
      setLastCommand('Reset application');
    },
    stopListening: () => {
      setIsEnabled(false);
      SpeechRecognition.stopListening();
      setLastCommand('Voice disabled');
    },
    startListening: () => {
      setIsEnabled(true);
      SpeechRecognition.startListening({ continuous: true });
      setLastCommand('Voice enabled');
    },
    showHelp: () => {
      setShowHelp(true);
      setLastCommand('Showing help');
    },
    search: (query) => {
      setSearchQuery(query);
      setLastCommand(`Searching: ${query}`);
    },
    openTarget: (target) => {
      console.log('Opening:', target);
      setLastCommand(`Opening: ${target}`);
    },
    create: (item) => {
      console.log('Creating:', item);
      setLastCommand(`Creating: ${item}`);
    },
    save: () => {
      console.log('Saving...');
      setLastCommand('Saved successfully');
    }
  };

  const commands = createCommandsRegistry(onNavigate, actions);

  // Process voice commands
  const processCommand = useCallback((text) => {
    if (!text || text === lastProcessedRef.current) return;
    
    lastProcessedRef.current = text;
    const match = findBestMatch(text, commands, 0.75);

    if (match) {
      console.log(`✓ Matched: ${match.command.id} (${(match.score * 100).toFixed(0)}%)`);
      
      if (match.wildcardData) {
        match.command.callback(match.wildcardData);
      } else {
        match.command.callback();
      }
      
      setLastCommand(text);
      onCommandExecuted?.(match.command);
      
      setTimeout(() => {
        resetTranscript();
        lastProcessedRef.current = '';
      }, 1500);
    }
  }, [commands, resetTranscript, onCommandExecuted]);

  // Start listening on mount
  useEffect(() => {
    if (browserSupportsSpeechRecognition && isEnabled) {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
    return () => SpeechRecognition.stopListening();
  }, [browserSupportsSpeechRecognition, isEnabled]);

  // Process transcript changes
  useEffect(() => {
    if (transcript && isEnabled) {
      const cleanTranscript = transcript.toLowerCase().trim();
      if (cleanTranscript) {
        processCommand(cleanTranscript);
      }
    }
  }, [transcript, isEnabled, processCommand]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#ff5252',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 9999
      }}>
        ⚠️ Browser doesn't support speech recognition. Try Chrome or Edge.
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: darkMode ? '#2a2a2a' : '#fff',
        border: `2px solid ${listening && isEnabled ? '#4CAF50' : (darkMode ? '#404040' : '#e0e0e0')}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: listening && isEnabled ? '0 4px 16px rgba(76,175,80,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: '250px',
        transition: 'all 0.3s ease',
        color: darkMode ? '#fff' : '#000'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {listening && isEnabled ? (
            <Mic size={20} style={{ color: '#4CAF50', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <MicOff size={20} style={{ color: darkMode ? '#888' : '#666' }} />
          )}
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            {listening && isEnabled ? 'Listening...' : 'Voice Inactive'}
          </span>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#888' : '#666',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex'
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        
        {transcript && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: darkMode ? '#aaa' : '#666',
            padding: '8px',
            background: darkMode ? '#1a1a1a' : '#f5f5f5',
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <Volume2 size={14} />
            <span>"{transcript}"</span>
          </div>
        )}
        
        {lastCommand && (
          <div style={{
            fontSize: '12px',
            color: '#4CAF50',
            padding: '6px 8px',
            background: darkMode ? '#1a3a1a' : '#e8f5e9',
            borderRadius: '4px'
          }}>
            ✓ {lastCommand}
          </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div onClick={() => setShowHelp(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: darkMode ? '#2a2a2a' : '#fff',
            color: darkMode ? '#fff' : '#000',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px' }}>
              🎤 Voice Commands
            </h2>
            
            {['navigation', 'action', 'control', 'wildcard'].map(category => (
              <div key={category} style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '16px',
                  color: '#4CAF50',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <div>
                  {commands
                    .filter(cmd => cmd.category === category)
                    .map(cmd => (
                      <div key={cmd.id} style={{
                        padding: '8px 0',
                        borderBottom: `1px solid ${darkMode ? '#404040' : '#e0e0e0'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}>
                        <strong style={{ fontFamily: 'monospace' }}>
                          {cmd.phrases[0]}
                        </strong>
                        <span style={{ color: darkMode ? '#888' : '#666', fontSize: '14px' }}>
                          {cmd.description}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
            
            <button onClick={() => setShowHelp(false)} style={{
              marginTop: '24px',
              padding: '10px 24px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: darkMode ? '#2a2a2a' : '#fff',
            color: darkMode ? '#fff' : '#000',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0 }}>Demo Modal</h2>
            <p>This modal was opened via voice command!</p>
            <p style={{ fontSize: '14px', color: darkMode ? '#888' : '#666', marginTop: '16px' }}>
              Try saying "close" or click anywhere to dismiss.
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: darkMode ? '#2a2a2a' : '#fff',
          color: darkMode ? '#fff' : '#000',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 9998
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.7 }}>
            Search Results:
          </div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>
            "{searchQuery}"
          </div>
          <button onClick={() => setSearchQuery('')} style={{
            marginTop: '12px',
            padding: '6px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            Clear
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
};

// ============================================================================
// DEMO PAGES
// ============================================================================

const pages = {
  home: {
    title: '🏠 Home',
    icon: Home,
    content: 'Welcome! Try: "dashboard", "editor", "open modal", "toggle theme", "search AI"'
  },
  dashboard: {
    title: '📊 Dashboard',
    icon: LayoutDashboard,
    content: 'Try: "home", "settings", "search machine learning", "create project"'
  },
  editor: {
    title: '✏️ Image Editor',
    icon: Edit,
    content: 'Try: "profile", "help", "save", "dark mode"'
  },
  settings: {
    title: '⚙️ Settings',
    icon: Settings,
    content: 'Try: "home", "stop listening", "list commands", "refresh"'
  },
  profile: {
    title: '👤 Profile',
    icon: User,
    content: 'Try: "dashboard", "editor", "open calendar", "reset"'
  }
};

// ============================================================================
// MAIN APP
// ============================================================================

const TestVoiceCommand = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [commandHistory, setCommandHistory] = useState([]);

  const handleNavigate = (page) => {
    if (pages[page]) {
      setCurrentPage(page);
    }
  };

  const handleCommandExecuted = (command) => {
    setCommandHistory(prev => [
      { ...command, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4)
    ]);
  };

  const PageIcon = pages[currentPage].icon;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <VoiceController 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onCommandExecuted={handleCommandExecuted}
      />
      
      {/* Navigation Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 40px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {Object.entries(pages).map(([key, page]) => {
          const Icon = page.icon;
          return (
            <button
              key={key}
              onClick={() => handleNavigate(key)}
              style={{
                padding: '12px 20px',
                background: currentPage === key ? '#fff' : 'rgba(255,255,255,0.2)',
                color: currentPage === key ? '#667eea' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Icon size={16} />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <PageIcon size={32} />
          <h1 style={{ margin: 0, fontSize: '32px', color: '#333' }}>
            {pages[currentPage].title}
          </h1>
        </div>
        
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#666',
          marginBottom: '32px'
        }}>
          {pages[currentPage].content}
        </p>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
              Recent Commands
            </h3>
            {commandHistory.map((cmd, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                background: '#fff',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  <strong>{cmd.phrases[0]}</strong>
                  <span style={{ color: '#888', marginLeft: '8px' }}>
                    • {cmd.description}
                  </span>
                </span>
                <span style={{ fontSize: '12px', color: '#aaa' }}>
                  {cmd.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#e8f5e9',
          borderRadius: '12px',
          border: '1px solid #4CAF50'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2e7d32' }}>
            💡 Quick Tips
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
            <li>Say "help" to see all available commands</li>
            <li>Try navigation: "dashboard", "settings", "profile"</li>
            <li>Use wildcards: "search [query]", "open [target]"</li>
            <li>Toggle features: "dark mode", "stop listening"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestVoiceCommand;