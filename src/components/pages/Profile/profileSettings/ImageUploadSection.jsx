import { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ImageUploadSection({ formData, uploadProfilePicture, getProfilePicture, user }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 3));
  };

  const handleUpload = async () => {
    if (!selectedFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        position.x,
        position.y,
        img.width * zoom,
        img.height * zoom
      );

      canvas.toBlob(async (blob) => {
        const croppedFile = new File([blob], selectedFile.name, {
          type: 'image/jpeg',
        });

        try {
          await uploadProfilePicture(croppedFile);
          setSelectedFile(null);
          setPreview(null);
        } catch (error) {
          toast.error('Failed to upload image');
        }
      }, 'image/jpeg');
    };

    img.src = preview;
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4 mb-8">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Profile Picture
      </label>

      {!preview ? (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
            {formData?.profile?.picture ? (
              <img
                src={formData.profile?.picture}
                className="w-full h-full object-cover"
                alt="profile"
              />
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm h-full">
                No image
              </div>
            )}
          </div>

          <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="relative w-full aspect-square rounded-lg bg-gray-700 overflow-hidden cursor-move border-2 border-gray-600"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={preview}
              alt="preview"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.2s',
              }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
              <Move className="w-3 h-3" />
              Drag to move
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <input
                onClick={handleUpload}
                type="file" accept="image/*"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Upload Picture
            </input>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} width={200} height={200} className="hidden" />
    </div>
  );
}