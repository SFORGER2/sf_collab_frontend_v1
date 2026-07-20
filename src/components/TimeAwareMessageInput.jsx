import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Clock, Paperclip, Image as ImageIcon } from 'lucide-react';

const TimeAwareMessageInput = ({ onSend, onTyping, conversationId }) => {
  const [message, setMessage] = useState('');
  const [showTimeSuggestion, setShowTimeSuggestion] = useState(false);
  const [timeSuggestion, setTimeSuggestion] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [timeSuggestions, setTimeSuggestions] = useState([]);
  const [currentHour, setCurrentHour] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const textareaRef = useRef(null);
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);

  const detectTimePattern = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const timeMatch = beforeCursor.match(/(\d{1,2})(?::(\d{0,2}))?$/);
    
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : null;
      
      if (hour >= 0 && hour <= 23) {
        const start = position - timeMatch[0].length;
        
        if (minute !== null && minute >= 0 && minute <= 59) {
          const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          return {
            hasPattern: true,
            isComplete: true,
            suggestion: `[${formattedTime}]`,
            start: start,
            end: position,
            hour: hour,
            minute: minute
          };
        } else {
          return {
            hasPattern: true,
            isComplete: false,
            suggestion: '',
            start: start,
            end: position,
            hour: hour,
            minute: minute
          };
        }
      }
    }
    
    return { hasPattern: false };
  };

  const generateTimeSuggestions = (hour) => {
    const suggestions = [];
    for (let minute = 0; minute < 60; minute += 5) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      suggestions.push({
        time: timeString,
        display: timeString,
        placeholder: `[${timeString}]`
      });
    }
    return suggestions;
  };

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    const position = e.target.selectionStart;
    
    setMessage(newMessage);
    setCursorPosition(position);
    
    if (onTyping) {
      onTyping(conversationId);
    }
    
    const detection = detectTimePattern(newMessage, position);
    
    if (detection.hasPattern) {
      if (detection.isComplete) {
        setShowTimeSuggestion(true);
        setTimeSuggestion(detection.suggestion);
        setShowTimePopup(false);
      } else {
        setShowTimeSuggestion(false);
        setCurrentHour(detection.hour.toString().padStart(2, '0'));
        setTimeSuggestions(generateTimeSuggestions(detection.hour));
        setShowTimePopup(true);
      }
    } else {
      setShowTimeSuggestion(false);
      setShowTimePopup(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && showTimeSuggestion) {
      e.preventDefault();
      acceptTimeSuggestion();
      return;
    }
    
    if (e.key === ' ' && !showTimePopup) {
      const detection = detectTimePattern(message, cursorPosition);
      if (detection.hasPattern && !detection.isComplete) {
        e.preventDefault();
        setShowTimePopup(true);
        return;
      }
    }
    
    if (e.key === 'Escape' && showTimePopup) {
      e.preventDefault();
      setShowTimePopup(false);
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey && !showTimePopup) {
      e.preventDefault();
      handleSend();
      return;
    }
    
    if (showTimePopup && e.key.length === 1 && e.key !== ' ') {
      setShowTimePopup(false);
    }
  };

  const acceptTimeSuggestion = () => {
    const detection = detectTimePattern(message, cursorPosition);
    
    if (detection.hasPattern && detection.isComplete) {
      const before = message.substring(0, detection.start);
      const after = message.substring(detection.end);
      const newMessage = before + detection.suggestion + after;
      
      setMessage(newMessage);
      setShowTimeSuggestion(false);
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = detection.start + detection.suggestion.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleTimeSelect = (timeSuggestion) => {
    const detection = detectTimePattern(message, cursorPosition);
    
    if (detection.hasPattern) {
      const before = message.substring(0, detection.start);
      const after = message.substring(detection.end);
      const newMessage = before + timeSuggestion.placeholder + ' ' + after;
      
      setMessage(newMessage);
      setShowTimePopup(false);
      setShowTimeSuggestion(false);
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = detection.start + timeSuggestion.placeholder.length + 1;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSend(message, selectedFile);
      
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      setShowTimeSuggestion(false);
      setShowTimePopup(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTimePopup && popupRef.current && !popupRef.current.contains(event.target) && !textareaRef.current.contains(event.target)) {
        setShowTimePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimePopup]);

  const getShadowText = () => {
    const detection = detectTimePattern(message, cursorPosition);
    if (detection.hasPattern && !detection.isComplete) {
      return `[${currentHour}:00]`;
    }
    return '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className=" space-y-3">
      <div className="relative">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-[#1a1a1a] border border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              {filePreview ? (
                <img loading="lazy" src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Paperclip size={24} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{selectedFile.name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full">
          <div className="relative w-full flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.gif"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              // style={{marginTop:'-0px'}}
              className="mb-2 shrink-0 p-3 bg-[#1a1a1a] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-[#c1ff72] rounded-full transition-all duration-300"
            >
              <Paperclip size={20} />
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                className="w-full px-5 h-13 py-2 pr-16 bg-[#1a1a1a] border border-gray-800 rounded-full text-white placeholder-gray-600 focus:outline-none focus:border-[#c1ff72] transition-all duration-300 resize-none"
                // rows={1}
              />
              
              <button
                onClick={handleSend}
                disabled={!message.trim() && !selectedFile}
                className="absolute right-2 bottom-3.5 p-2.5 bg-[#c1ff72] hover:bg-[#b0ef62] text-black rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          {getShadowText() && (
            <div className="absolute top-0 left-14 right-0 px-5 py-4 pointer-events-none text-transparent whitespace-pre-wrap wrap-break-word overflow-hidden">
              {message.substring(0, cursorPosition)}
              <span className="bg-green-500/20 text-green-400 rounded-lg px-1">
                {getShadowText()}
              </span>
              {message.substring(cursorPosition)}
            </div>
          )}
        </div>
        
        {showTimePopup && (
          <div 
            ref={popupRef}
            className="absolute bottom-full left-14 mb-2 bg-[#1a1a1a] backdrop-blur-2xl rounded-2xl p-5 min-w-[320px] border border-gray-800 shadow-2xl z-50"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <h4 className="text-sm font-semibold text-white">Select Time for {currentHour}:XX</h4>
              </div>
              <button 
                onClick={() => setShowTimePopup(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {timeSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-3 py-2.5 bg-gray-900 hover:bg-[#c1ff72] hover:text-black border border-gray-800 hover:border-[#c1ff72] text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                  onClick={() => handleTimeSelect(suggestion)}
                >
                  {suggestion.display}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {showTimeSuggestion && (
          <div className="absolute -bottom-12 left-14 right-0 bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-2.5 shadow-xl z-10">
            <span className="text-sm text-gray-300">
              Press <kbd className="px-2 py-1 bg-gray-800 text-[#c1ff72] rounded-lg text-xs font-semibold mx-1">Tab</kbd> to convert to {timeSuggestion}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default TimeAwareMessageInput;