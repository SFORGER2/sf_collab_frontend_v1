import { Mic, Square } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

export default function VoiceInput({
  fieldName,
  setFormData,
  placeholder,
  value,
  type = 'input',
  btnId,
  label, icon }) {
  const recognitionInstances = useRef({});
  const [isRecording, setIsRecording] = useState({});
const [voiceStatus, setVoiceStatus] = useState({});
  const startVoiceInput = (fieldName, btnId) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (recognitionInstances.current[btnId]) {
      recognitionInstances.current[btnId].stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionInstances.current[btnId] = recognition;

    recognition.onstart = () => {
      setIsRecording(prev => ({ ...prev, [btnId]: true }));
      setVoiceStatus(prev => ({ ...prev, [btnId]: '🎤 Listening... Click stop when finished' }));
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: (prev[fieldName] + ' ' + finalTranscript).trim()
        }));
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition warning:', event.error);

      // These are NORMAL and should NOT be shown as errors
      const nonFatalErrors = ['no-speech', 'aborted'];

      if (nonFatalErrors.includes(event.error)) {
        setVoiceStatus(prev => ({
          ...prev,
          [btnId]: '⏸️ Listening paused'
        }));
        return;
      }

      // Real errors
      stopVoiceInput(btnId);
      setVoiceStatus(prev => ({
        ...prev,
        [btnId]: '❌ Mic error: ' + event.error
      }));
    };


    recognition.start();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  

  const stopVoiceInput = (btnId) => {
    if (recognitionInstances.current[btnId]) {
      recognitionInstances.current[btnId].stop();
      delete recognitionInstances.current[btnId];
      setIsRecording(prev => ({ ...prev, [btnId]: false }));
      setVoiceStatus(prev => ({ ...prev, [btnId]: '✅ Recording stopped' }));
      
      setTimeout(() => {
        setVoiceStatus(prev => ({ ...prev, [btnId]: '' }));
      }, 2000);
    }
  };
  return (<div className='mb-4'>
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
      {icon}
      {label}
    </label>
    <div className="relative">
      {type === 'textarea' ? (
        <textarea
          name={fieldName}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-24 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
        />
      ) : (
        <input
          type="text"
          name={fieldName}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-24 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      )}
      <div className="absolute right-2 top-3 flex gap-2">
        <button
          type="button"
          onClick={() => startVoiceInput(fieldName, btnId)}
          className={`p-2 rounded-lg transition-all ${isRecording[btnId]
              ? 'bg-linear-to-br from-rose-500 to-red-600 animate-pulse'
              : 'bg-linear-to-br from-purple-500 to-blue-600 hover:scale-110'
            }`}
        >
          <Mic className="h-4 w-4 text-white" />
        </button>
        {isRecording[btnId] && (
          <button
            type="button"
            onClick={() => stopVoiceInput(btnId)}
            className="p-2 rounded-lg bg-linear-to-br from-rose-500 to-red-600 hover:scale-110 transition-all"
          >
            <Square className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
    </div>
    {voiceStatus[btnId] && (
      <div className="mt-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg">
        {voiceStatus[btnId]}
      </div>
    )}
  </div>
  )
}