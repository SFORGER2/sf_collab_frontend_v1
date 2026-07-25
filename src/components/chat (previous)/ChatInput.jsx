/**
 * ChatInput.jsx - FULL RESTORED VERSION
 * * FEATURES:
 * 1. Responsive Image Editor (Mobile & Desktop)
 * 2. Drawing & Text Annotations (Touch + Mouse)
 * 3. Auto-expanding Textarea
 * 4. Emoji Picker & Multi-file Support
 * 5. Clipboard Image Paste support
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Send, Smile, Paperclip, Image as ImageIcon, 
  X, Loader2, Type, Pencil, Trash2, Check 
} from 'lucide-react';

const EMOJI_LIST = [
  '😀', '😂', '🥰', '😍', '🤩', '😎', '🙂', '😊',
  '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔',
  '🔥', '⭐', '✨', '💯', '🎉', '🎊', '🎁', '🏆',
  '👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤏', '✊',
  '😢', '😭', '😤', '😠', '🤬', '😱', '😨', '😰',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣',
  '🙏', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
];

const COLORS = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

// --- SUB-COMPONENT: FILE PREVIEW ---
const FilePreview = ({ file, onRemove }) => {
  const isImage = file?.type?.startsWith('image/');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isImage && file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, [file, isImage]);

  if (!file) return null;

  return (
    <div className="relative inline-block mb-2 mr-2">
      {isImage && preview ? (
        <img 
          src={preview} 
          alt="preview" 
          className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-xl border border-zinc-700 shadow-md"
        />
      ) : (
        <div className="h-16 px-4 flex items-center gap-2 bg-zinc-800 rounded-xl border border-zinc-700">
          <Paperclip size={16} className="text-zinc-400" />
          <span className="text-xs text-zinc-300 max-w-[120px] truncate">{file.name}</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// --- SUB-COMPONENT: EMOJI PICKER ---
// FIX: this used to be `absolute bottom-full right-0`, positioned relative
// to whatever ancestor happened to be the nearest `position`-ed element.
// On this page that chain put it nowhere near the emoji button -- it could
// render clear at the top of the browser window, overlapping the header,
// exactly like the screenshot. Same fix as the reaction picker in
// MessageBubble.jsx: compute the real on-screen position from the button's
// own bounding box and render through a portal with `position: fixed`, so
// it can never be thrown off by a parent's layout again.
const EmojiPicker = ({ isOpen, onSelect, onClose, anchorRef }) => {
  if (!isOpen) return null;

  const style = (() => {
    if (!anchorRef?.current) return { bottom: 80, right: 16 };
    const r = anchorRef.current.getBoundingClientRect();
    const pickerHeight = 320; // matches max-h-80
    const pickerWidth = 288; // matches md:w-72
    const openAbove = r.top > pickerHeight + 16;
    return {
      ...(openAbove
        ? { bottom: window.innerHeight - r.top + 8 }
        : { top: r.bottom + 8 }),
      ...(r.right > pickerWidth
        ? { right: Math.max(8, window.innerWidth - r.right) }
        : { left: Math.max(8, r.left) }),
    };
  })();

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed p-2 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-[9999] w-64 md:w-72 max-h-80 overflow-y-auto"
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_LIST.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => { onSelect(emoji); onClose(); }}
              className="p-2 hover:bg-zinc-800 rounded-lg text-xl transition-all active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
};

// --- MAIN COMPONENT ---
const ChatInput = ({ 
  value = '', 
  onChange, 
  onSend, 
  onFileUpload, 
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Image Editor States
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('pencil'); 
  const [activeColor, setActiveColor] = useState('#ff0000');
  const [textInput, setTextInput] = useState('');
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Auto-resize Logic
  const handleTextareaResize = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, []);

  // --- CANVAS ENGINE ---
  useEffect(() => {
    if (editorOpen && canvasRef.current && selectedFile) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      
      img.onload = () => {
        const availableW = window.innerWidth * 0.9;
        const availableH = window.innerHeight * 0.6; 

        let width = img.width;
        let height = img.height;
        const ratio = Math.min(availableW / width, availableH / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        contextRef.current = ctx;
      };
    }
  }, [editorOpen, selectedFile]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (activeTool !== 'pencil') return;
    const { x, y } = getPos(e.nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = activeColor;
    contextRef.current.isDrawing = true;
  };

  const draw = (e) => {
    if (!contextRef.current?.isDrawing || activeTool !== 'pencil') return;
    if (e.cancelable) e.preventDefault(); 
    const { x, y } = getPos(e.nativeEvent);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => { if (contextRef.current) contextRef.current.isDrawing = false; };

  const handleCanvasClick = (e) => {
    if (activeTool !== 'text' || !textInput) return;
    const { x, y } = getPos(e.nativeEvent);
    contextRef.current.font = "bold 24px Arial";
    contextRef.current.fillStyle = activeColor;
    contextRef.current.fillText(textInput, x, y);
    setTextInput('');
  };

  const saveEditedImage = () => {
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], "edited_image.png", { type: "image/png" });
      setSelectedFile(file);
      setEditorOpen(false);
    }, 'image/png');
  };

  // --- ACTIONS ---
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isUploading || disabled) return;
    
    if (selectedFile) {
      setIsUploading(true);
      try {
        await onFileUpload(selectedFile, value.trim());
        setSelectedFile(null);
        if (onChange) onChange('');
      } catch (err) { alert('Upload failed'); } 
      finally { setIsUploading(false); }
    } else if (value.trim()) {
      onSend(value.trim());
      if (onChange) onChange('');
    }
    if (inputRef.current) inputRef.current.style.height = '40px';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) setEditorOpen(true);
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        setSelectedFile(file);
        setEditorOpen(true);
        e.preventDefault();
      }
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/50 relative w-full">
      
      {/* --- IMAGE EDITOR MODAL --- */}
      {editorOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-4 touch-none overflow-hidden">
          <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-700 shadow-2xl">
            <button type="button" onClick={() => setActiveTool('pencil')} className={`p-2 rounded-xl transition-colors ${activeTool === 'pencil' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}><Pencil size={20}/></button>
            <button type="button" onClick={() => setActiveTool('text')} className={`p-2 rounded-xl transition-colors ${activeTool === 'text' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}><Type size={20}/></button>
            <div className="flex gap-1.5 px-2 items-center overflow-x-auto">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setActiveColor(c)} className={`w-7 h-7 shrink-0 rounded-full border-2 transition-transform ${activeColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{backgroundColor: c}} />
              ))}
            </div>
            <button type="button" onClick={() => setEditorOpen(false)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={20}/></button>
          </div>

          {activeTool === 'text' && (
            <div className="w-full max-w-md px-4 mt-2">
              <input 
                autoFocus 
                className="w-full px-4 py-3 bg-zinc-800 border border-indigo-500 rounded-xl text-white outline-none shadow-lg" 
                placeholder="Type then tap image..." 
                value={textInput} 
                onChange={(e) => setTextInput(e.target.value)} 
              />
            </div>
          )}

          <div className="flex-1 flex items-center justify-center w-full overflow-hidden my-4">
            <canvas 
              ref={canvasRef} 
              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing}
              onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
              onClick={handleCanvasClick}
              className="max-w-full max-h-full cursor-crosshair shadow-2xl bg-zinc-800 rounded-lg touch-none"
            />
          </div>

          <button type="button" onClick={saveEditedImage} className="w-full max-w-xs py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all mb-4">
            <Check size={22} /> Done Editing
          </button>
        </div>
      )}

      {/* --- MAIN INPUT BAR --- */}
      <div className="max-w-7xl mx-auto px-2 py-2">
        {selectedFile && <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />}
        
        <form onSubmit={handleSubmit} className="flex items-center gap-1 md:gap-2">
          <div className="flex items-center gap-0.5 md:gap-1">
            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-zinc-800 rounded-full text-indigo-400 transition-colors" disabled={disabled}><ImageIcon size={18} className="md:w-5 md:h-5" /></button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-zinc-800 rounded-full text-indigo-400 transition-colors" disabled={disabled}><Paperclip size={18} className="md:w-5 md:h-5" /></button>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
          </div>

          <div className="flex-1 relative bg-zinc-800 rounded-2xl border border-zinc-700 focus-within:border-indigo-500/50 transition-all">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onInput={handleTextareaResize}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              onPaste={handlePaste}
              placeholder={placeholder}
              rows={1}
              className="w-full pl-3 pr-10 py-2.5 bg-transparent text-white text-sm outline-none resize-none max-h-[120px] scrollbar-hide"
            />
            <div className="absolute right-2 bottom-2">
              <button ref={emojiBtnRef} type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-1 text-zinc-500 hover:text-indigo-400 transition-colors"><Smile size={20} /></button>
              <EmojiPicker isOpen={showEmoji} onSelect={(e) => onChange(value + e)} onClose={() => setShowEmoji(false)} anchorRef={emojiBtnRef} />
            </div>
          </div>

          <div>
            {isUploading ? (
              <div className="p-2.5 bg-indigo-600/20 rounded-full"><Loader2 size={20} className="text-indigo-400 animate-spin" /></div>
            ) : (value.trim() || selectedFile) ? (
              <button type="submit" className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all active:scale-90 shadow-lg" disabled={disabled}><Send size={20} /></button>
            ) : (
              <button type="button" onClick={() => onSend('👍')} className="p-2.5 hover:bg-zinc-800 rounded-full text-xl transition-all active:scale-125" disabled={disabled}>👍</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;