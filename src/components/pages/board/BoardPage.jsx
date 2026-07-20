import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {

  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Share2,
  Undo2,
  Redo2,
  Type,

  Users,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

// ============ TYPES ============
const TOOLS = {
PENCIL: 'pencil',
ERASER: 'eraser',
TEXT: 'text',
RECTANGLE: 'rectangle',
CIRCLE: 'circle',
LINE: 'line',
ARROW: 'arrow',
};

const COLORS = [
'#ffffff',
'#000000',
'#ef4444',
'#f97316',
'#eab308',
'#22c55e',
'#06b6d4',
'#3b82f6',
'#8b5cf6',
'#ec4899',
];

// ============ DRAWING ENGINE ============
const DrawingEngine = {
drawPencil: (ctx, from, to, color, size) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
},

drawEraser: (ctx, from, to, size) => {
  ctx.clearRect(from.x - size / 2, from.y - size / 2, size, size);
  ctx.clearRect(to.x - size / 2, to.y - size / 2, size, size);
},

drawRectangle: (ctx, from, to, color, size) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
},

drawCircle: (ctx, from, to, color, size) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  const radius = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  ctx.beginPath();
  ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI);
  ctx.stroke();
},

drawLine: (ctx, from, to, color, size) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
},

drawArrow: (ctx, from, to, color, size) => {
  const headlen = 15;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
},

drawText: (ctx, text, position, color, size) => {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.fillText(text, position.x, position.y);
},
};

// ============ CANVAS COMPONENT ============
const DrawingCanvas = ({ canvasRef, isDrawing, setIsDrawing, tool, color, brushSize, onDraw }) => {
const [isDrawingLocal, setIsDrawingLocal] = useState(false);
const startPos = useRef(null);
const lastPos = useRef(null);

const getMousePos = (canvas, e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const handleMouseDown = (e) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const pos = getMousePos(canvas, e);
  startPos.current = pos;
  lastPos.current = pos;
  setIsDrawingLocal(true);
  setIsDrawing(true);
};

const handleMouseMove = (e) => {
  if (!isDrawingLocal || !canvasRef.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const pos = getMousePos(canvas, e);

  if (tool === TOOLS.PENCIL) {
    DrawingEngine.drawPencil(ctx, lastPos.current, pos, color, brushSize);
  } else if (tool === TOOLS.ERASER) {
    DrawingEngine.drawEraser(ctx, lastPos.current, pos, brushSize);
  }

  lastPos.current = pos;
  onDraw(canvas);
};

const handleMouseUp = (e) => {
  if (!isDrawingLocal || !canvasRef.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const pos = getMousePos(canvas, e);

  if (tool === TOOLS.RECTANGLE) {
    DrawingEngine.drawRectangle(ctx, startPos.current, pos, color, brushSize);
  } else if (tool === TOOLS.CIRCLE) {
    DrawingEngine.drawCircle(ctx, startPos.current, pos, color, brushSize);
  } else if (tool === TOOLS.LINE) {
    DrawingEngine.drawLine(ctx, startPos.current, pos, color, brushSize);
  } else if (tool === TOOLS.ARROW) {
    DrawingEngine.drawArrow(ctx, startPos.current, pos, color, brushSize);
  }

  setIsDrawingLocal(false);
  setIsDrawing(false);
  onDraw(canvas);
};

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);

  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseUp);
  };
}, [tool, color, brushSize, isDrawingLocal]);

return (
  <canvas
    ref={canvasRef}
    className="w-full h-full border-2 border-gray-700 cursor-crosshair bg-gray-900"
    onContextMenu={(e) => e.preventDefault()}
  />
);
};

// ============ TOOLBAR COMPONENT ============
const Toolbar = ({
tool,
setTool,
color,
setColor,
brushSize,
setBrushSize,
onUndo,
onRedo,
onClear,
onDownload,
canUndo,
canRedo,
}) => {
return (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 space-y-4"
  >
    {/* Tools */}
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase">Tools</label>
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: TOOLS.PENCIL, icon: '✏️', label: 'Pencil' },
          { id: TOOLS.ERASER, icon: '🧹', label: 'Eraser' },
          { id: TOOLS.RECTANGLE, icon: '▭', label: 'Rectangle' },
          { id: TOOLS.CIRCLE, icon: '◯', label: 'Circle' },
          { id: TOOLS.LINE, icon: '/', label: 'Line' },
          { id: TOOLS.ARROW, icon: '→', label: 'Arrow' },
          { id: TOOLS.TEXT, icon: 'T', label: 'Text' },
        ].map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTool(t.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              tool === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={t.label}
          >
            {t.icon}
          </motion.button>
        ))}
      </div>
    </div>

    {/* Color Picker */}
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase">Color</label>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((c) => (
          <motion.button
            key={c}
            whileHover={{ scale: 1.1 }}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-lg transition-all ${
              color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
            style={{ backgroundColor: c, border: c === '#ffffff' ? '2px solid #333' : 'none' }}
          />
        ))}
      </div>
    </div>

    {/* Brush Size */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-400 uppercase">Size: {brushSize}px</label>
      </div>
      <input
        type="range"
        min="1"
        max="30"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>

    {/* Actions */}
    <div className="grid grid-cols-2 gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onUndo}
        disabled={!canUndo}
        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        <Undo2 className="w-4 h-4" />
        Undo
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRedo}
        disabled={!canRedo}
        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        <Redo2 className="w-4 h-4" />
        Redo
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClear}
        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg flex items-center justify-center gap-2 transition-all col-span-2"
      >
        <Trash2 className="w-4 h-4" />
        Clear
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDownload}
        className="bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg flex items-center justify-center gap-2 transition-all col-span-2"
      >
        <Download className="w-4 h-4" />
        Download
      </motion.button>
    </div>
  </motion.div>
);
};

// ============ BOARD NOTES COMPONENT ============
const BoardNotes = ({ notes, onAdd, onDelete, onUpdate }) => {
const [editingId, setEditingId] = useState(null);
const [editText, setEditText] = useState('');
const [newNoteText, setNewNoteText] = useState('');

const handleAddNote = () => {
  if (newNoteText.trim()) {
    onAdd({
      id: Date.now(),
      text: newNoteText,
      createdAt: new Date().toISOString(),
      position: { x: Math.random() * 200, y: Math.random() * 200 },
    });
    setNewNoteText('');
  }
};

const handleEditNote = (note) => {
  setEditingId(note.id);
  setEditText(note.text);
};

const handleSaveNote = (id) => {
  onUpdate(id, editText);
  setEditingId(null);
};

return (
  <motion.div
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto"
  >
    <h3 className="text-lg font-bold text-white flex items-center gap-2">
      <Type className="w-5 h-5" />
      Quick Notes
    </h3>

    <div className="flex gap-2">
      <input
        type="text"
        value={newNoteText}
        onChange={(e) => setNewNoteText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
        placeholder="Add a note..."
        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddNote}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>

    <div className="space-y-2">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-700 rounded p-3 space-y-2"
        >
          {editingId === note.id ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleSaveNote(note.id)}
                className="bg-green-600 hover:bg-green-700 text-white p-1 rounded"
              >
                <Save className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <>
              <p className="text-white text-sm">{note.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleTimeString()}
                </span>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleEditNote(note)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onDelete(note.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  </motion.div>
);
};

// ============ COLLABORATORS COMPONENT ============
const Collaborators = ({ collaborators, isLocked, onToggleLock }) => {
return (
  <motion.div
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 space-y-4"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Users className="w-5 h-5" />
        Team
      </h3>
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onToggleLock}
        className={`p-2 rounded-lg transition-all ${
          isLocked
            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
        }`}
      >
        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </motion.button>
    </div>

    <div className="space-y-2">
      {collaborators.map((collab, idx) => (
        <motion.div
          key={idx}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 bg-gray-700 rounded p-2"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
          >
            {collab.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{collab.name}</p>
            <p className="text-gray-400 text-xs">{collab.role}</p>
          </div>
          <div
            className={`w-2 h-2 rounded-full ${collab.online ? 'bg-green-500' : 'bg-gray-500'}`}
          />
        </motion.div>
      ))}
    </div>

    <div className="pt-2 border-t border-gray-700">
      <p className="text-xs text-gray-400">
        {collaborators.filter((c) => c.online).length} online
      </p>
    </div>
  </motion.div>
);
};

// ============ MAIN BOARD PAGE COMPONENT ============
const BoardPage = () => {
const { id: startupId } = useParams();
const { user } = useSelector((state) => state.auth);

const canvasRef = useRef(null);
const historyRef = useRef([]);
const historyIndexRef = useRef(-1);

const [tool, setTool] = useState(TOOLS.PENCIL);
const [color, setColor] = useState('#ffffff');
const [brushSize, setBrushSize] = useState(3);
const [isDrawing, setIsDrawing] = useState(false);
const [notes, setNotes] = useState([]);
const [isLocked, setIsLocked] = useState(false);
const [zoom, setZoom] = useState(100);
const [boardTitle, setBoardTitle] = useState(`Startup Board - ${startupId}`);
const [isEditingTitle, setIsEditingTitle] = useState(false);
const [collaborators, setCollaborators] = useState([
  { name: user?.firstName || 'You', role: 'Creator', online: true },
  { name: 'Team Member 1', role: 'Designer', online: true },
  { name: 'Team Member 2', role: 'Developer', online: false },
]);

// Initialize canvas
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load from localStorage
  const savedData = localStorage.getItem(`board_${startupId}`);
  if (savedData) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveHistory();
    };
    img.src = savedData;
  } else {
    saveHistory();
  }
}, [startupId]);

// History management
const saveHistory = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  historyIndexRef.current++;
  historyRef.current = historyRef.current.slice(0, historyIndexRef.current);
  historyRef.current.push(canvas.toDataURL());

  // Limit history to 20 states
  if (historyRef.current.length > 20) {
    historyRef.current.shift();
    historyIndexRef.current--;
  }

  // Save to localStorage
  localStorage.setItem(`board_${startupId}`, canvas.toDataURL());
}, [startupId]);

const handleUndo = () => {
  if (historyIndexRef.current > 0) {
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = historyRef.current[historyIndexRef.current];
  }
};

const handleRedo = () => {
  if (historyIndexRef.current < historyRef.current.length - 1) {
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = historyRef.current[historyIndexRef.current];
  }
};

const handleClear = () => {
  if (window.confirm('Clear the entire board?')) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }
};

const handleDownload = () => {
  const canvas = canvasRef.current;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${boardTitle}-${new Date().toISOString()}.png`;
  link.click();
};

const handleAddNote = (note) => {
  setNotes([...notes, note]);
  // TODO: Send to backend
};

const handleDeleteNote = (id) => {
  setNotes(notes.filter((n) => n.id !== id));
  // TODO: Send to backend
};

const handleUpdateNote = (id, text) => {
  setNotes(notes.map((n) => (n.id === id ? { ...n, text } : n)));
  // TODO: Send to backend
};

const handleSaveTitle = (newTitle) => {
  setBoardTitle(newTitle);
  setIsEditingTitle(false);
  // TODO: Send to backend
};

return (
  <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
    {/* Header */}
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              onBlur={() => handleSaveTitle(boardTitle)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(boardTitle)}
              autoFocus
              className="text-2xl font-bold bg-gray-700 border border-blue-500 rounded px-3 py-1 w-full"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
            >
              {boardTitle}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>
          <span className="text-sm text-gray-400 w-12 text-center">{zoom}%</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>
        </div>
      </div>
    </motion.div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-[calc(100vh-80px)]">
      {/* Left Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 overflow-y-auto">
        <Toolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onDownload={handleDownload}
          canUndo={historyIndexRef.current > 0}
          canRedo={historyIndexRef.current < historyRef.current.length - 1}
        />
      </div>

      {/* Canvas Area */}
      <div className="lg:col-span-2 h-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
        >
          <DrawingCanvas
            canvasRef={canvasRef}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            tool={tool}
            color={color}
            brushSize={brushSize}
            onDraw={saveHistory}
          />
        </motion.div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 overflow-y-auto">
        <Collaborators
          collaborators={collaborators}
          isLocked={isLocked}
          onToggleLock={() => setIsLocked(!isLocked)}
        />
        <BoardNotes
          notes={notes}
          onAdd={handleAddNote}
          onDelete={handleDeleteNote}
          onUpdate={handleUpdateNote}
        />
      </div>
    </div>

    {/* Mobile Bottom Toolbar */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
      <div className="flex gap-2 overflow-x-auto">
        {[TOOLS.PENCIL, TOOLS.ERASER, TOOLS.RECTANGLE, TOOLS.CIRCLE].map((t) => (
          <motion.button
            key={t}
            whileHover={{ scale: 1.05 }}
            onClick={() => setTool(t)}
            className={`p-2 rounded-lg whitespace-nowrap ${
              tool === t ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase()}
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);
};

export default BoardPage;