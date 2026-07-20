import React, { useState, useRef, memo } from 'react';
import { toast } from 'react-toastify';
import {
  Lightbulb,
  BarChart3,
  Mic,
  Square,
  Download,
  Building2,
  DollarSign,
  MapPin,
  Cpu,
  Target,
  Loader2,
  Check,
  Shield,
  Clock
} from 'lucide-react';

const INPUT_FIELDS = [
  {
    fieldName: 'industry',
    label: 'Industry Focus',
    icon: <Building2 className="h-4 w-4" />,
    placeholder: 'e.g., HealthTech, FinTech',
    btnId: 'industry'
  },
  {
    fieldName: 'budget',
    label: 'Investment Range',
    icon: <DollarSign className="h-4 w-4" />,
    placeholder: 'e.g., $10,000 – $100,000',
    btnId: 'budget'
  },
  {
    fieldName: 'location',
    label: 'Market Location',
    icon: <MapPin className="h-4 w-4" />,
    placeholder: 'e.g., India, US, Remote',
    btnId: 'location'
  },
  {
    fieldName: 'tech',
    label: 'Technology Stack',
    icon: <Cpu className="h-4 w-4" />,
    placeholder: 'e.g., AI, SaaS, Blockchain',
    btnId: 'tech'
  }
];

const VoiceInput = memo(function VoiceInput({
  fieldName,
  value,
  placeholder,
  type = 'input',
  btnId,
  onChange,
  onStart,
  onStop,
  isRecording,
  status
}) {
  return (
    <div className="mb-5">
      <div className="relative">
        {type === 'textarea' ? (
          <textarea  
            name={fieldName}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 pr-20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        ) : (
          <input
            name={fieldName}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 pr-20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        )}

        <div className="absolute right-2 top-2 flex gap-2">
          {!isRecording && (
            <button
              type="button"
              onClick={() => onStart(fieldName, btnId)}
              className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 hover:scale-105 transition"
            >
              <Mic className="h-4 w-4 text-white" />
            </button>
          )}
          {isRecording && (
            <button
              type="button"
              onClick={() => onStop(btnId)}
              className="p-2 rounded-lg bg-linear-to-br from-red-500 to-rose-600 hover:scale-105 transition"
            >
              <Square className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {status && (
        <div className="mt-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg">
          {status}
        </div>
      )}
    </div>
  );
});

/*.main cmpontss*/

export default function BusinessIdeaGenerator() {
  const [mode, setMode] = useState('ideas');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isRecording, setIsRecording] = useState({});
  const [voiceStatus, setVoiceStatus] = useState({});
  const activeRecordingRef = useRef(null);
  const recognitionRefs = useRef({});

  const [formData, setFormData] = useState({
    businessIdea: '',
    industry: '',
    budget: '',
    location: '',
    tech: ''
  });

  /* headerr start here*/

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const startVoiceInput = (field, id) => {
    if (activeRecordingRef.current && activeRecordingRef.current !== id) {
      toast.info('Finish the active recording first.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    activeRecordingRef.current = id;
    recognitionRefs.current[id] = recognition;

    recognition.onstart = () => {
      setIsRecording((p) => ({ ...p, [id]: true }));
      setVoiceStatus((p) => ({ ...p, [id]: 'Listening… speak clearly' }));
    };

    recognition.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          text += e.results[i][0].transcript + ' ';
        }
      }
      if (text) {
        setFormData((p) => ({
          ...p,
          [field]: `${p[field]} ${text}`.trim()
        }));
      }
    };

    recognition.onerror = () => stopVoiceInput(id);
    recognition.start();
  };

  const stopVoiceInput = (id) => {
    recognitionRefs.current[id]?.stop();
    delete recognitionRefs.current[id];
    activeRecordingRef.current = null;

    setIsRecording((p) => ({ ...p, [id]: false }));
    setVoiceStatus((p) => ({ ...p, [id]: 'Recording stopped' }));

    setTimeout(() => {
      setVoiceStatus((p) => ({ ...p, [id]: '' }));
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setResults({
        summary: 'Preview Output · AI Integration Pending'
      });
      setIsLoading(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="max-w-5xl mx-auto">

        {/* MODE SWITCH */}
              <div className="flex justify-center gap-2 mb-10">
          {['ideas', 'plan'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                  mode === m
                  ? 'bg-linear-to-r from-blue-600 to-purple-600'
                       : 'bg-slate-800 text-slate-400'
              }`}
 >   


              {m === 'ideas' ? 'Business Ideas' : 'Business Plan'}

            </button>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8"
        >
          {mode === 'plan' && (
            <VoiceInput
              fieldName="businessIdea"
              value={formData.businessIdea}
              placeholder="Describe your business idea clearly..."
              type="textarea"
             btnId="idea"
              onChange={handleInputChange}
                onStart={startVoiceInput}
              
                onStop={stopVoiceInput}
              isRecording={isRecording.idea}
              status={voiceStatus.idea}
            />
          )}

          <div className="grid md:grid-cols-2 gap-6">
 {INPUT_FIELDS.map((f) => (
              <div key={f.fieldName}>
     <label className="text-sm text-slate-400 mb-2 block">
                  {f.label}
      </label>
                <VoiceInput
                  {...f}
 value={formData[f.fieldName]}
                  onChange={handleInputChange}
                  onStart={startVoiceInput}
               onStop={stopVoiceInput}
                  isRecording={isRecording[f.btnId]}
                  status={voiceStatus[f.btnId]}
             />
              </div>
            ))}
          </div>

          <button
            disabled={isLoading}
        className="mt-8 w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition"
          >
            {isLoading ? (
              <span className="flex justify-center gap-2">
                <Loader2 className="animate-spin" /> Generating…
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </form>

        {results && (
          <div className="mt-10 bg-slate-900/60 border border-slate-700 rounded-3xl p-6">
            <div className="text-xs uppercase text-amber-400 mb-3">
              {results.summary}
            </div>
            <p className="text-slate-300">
              Replace this block with your real AI response stream.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-6 mt-8 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
          <span className="flex items-center gap-1"><Cpu size={12} /> AI Powered</span>
          <span className="flex items-center gap-1"><Clock size={12} /> Fast</span>
        </div>
      </div>
    </div>
  );
}
