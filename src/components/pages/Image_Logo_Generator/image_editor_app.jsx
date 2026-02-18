import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, Trash2, RotateCw, RotateCcw, 
  Type, PenTool, Circle, Square, Eraser,
  ZoomIn, ZoomOut, Eye, Filter,
  Image as ImageIcon, RefreshCw, 
  Palette, Contrast, Sun, 
  Loader2
} from 'lucide-react';
import { MdBlurOn } from "react-icons/md";
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ImageEditor = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(5);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(30);
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0
  });
  const [originalImage, setOriginalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const initCanvas = async () => {
      try {
        // Dynamically import fabric to avoid import issues
        const fabricModule = await import('fabric');
        const fabric = fabricModule.fabric || fabricModule.default;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: '#1f2937',
          selection: true,
          selectionColor: 'rgba(59, 130, 246, 0.3)',
          selectionBorderColor: '#3b82f6',
          selectionLineWidth: 2
        });

        fabricCanvasRef.current = canvas;

        // Configure drawing
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = drawingColor;
        canvas.freeDrawingBrush.width = drawingWidth;
        canvas.isDrawingMode = false;

        // Enable object selection
        canvas.on('selection:created', () => {
          setSelectedTool('select');
        });

        canvas.on('selection:updated', () => {
          setSelectedTool('select');
        });

        canvas.on('selection:cleared', () => {
          setSelectedTool('select');
        });

        console.log('Canvas initialized successfully');
      } catch (err) {
        console.error('Failed to initialize canvas:', err);
        setError('Failed to initialize canvas. Please check console for details.');
      }
    };

    if (canvasRef.current) {
      initCanvas();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Handle drawing settings changes
  useEffect(() => {
    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
      fabricCanvasRef.current.freeDrawingBrush.color = drawingColor;
      fabricCanvasRef.current.freeDrawingBrush.width = drawingWidth;
    }
  }, [drawingColor, drawingWidth]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image size must be less than 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fabricModule = await import('fabric');
        const fabric = fabricModule.fabric || fabricModule.default;
        
        fabric.Image.fromURL(event.target.result, (img) => {
          if (fabricCanvasRef.current) {
            const canvas = fabricCanvasRef.current;
            canvas.clear();
            canvas.backgroundColor = 'rgba(255, 255, 255, 0.00)';
            
            // Calculate scale to fit canvas
            const scale = Math.min(
              canvas.width / img.width * 0.9,
              canvas.height / img.height * 0.9,
              1
            );
            
            img.scale(scale);
            img.set({
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: 'center',
              originY: 'center',
              hasControls: true,
              hasBorders: true
            });
            
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            
            setOriginalImage(event.target.result);
            setImageInfo({
              width: Math.round(img.width * scale),
              height: Math.round(img.height * scale),
              name: file.name,
              size: file.size,
              type: file.type
            });
            setError('');
          }
        }, {
          crossOrigin: 'anonymous'
        });
      } catch (err) {
        setError('Failed to load image: ' + err.message);
        console.error('Image load error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const enableDrawing = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = true;
      setIsDrawing(true);
      setSelectedTool('draw');
    }
  };

  const disableDrawing = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = false;
      setIsDrawing(false);
      setSelectedTool('select');
    }
  };

  const addShape = async (type) => {
    if (!fabricCanvasRef.current) return;
    
    try {
      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || fabricModule.default;
      
      let shape;
      const canvas = fabricCanvasRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      if (type === 'circle') {
        shape = new fabric.Circle({
          radius: 50,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 3,
          left: centerX - 50,
          top: centerY - 50,
          hasControls: true,
          hasBorders: true
        });
      } else if (type === 'rectangle') {
        shape = new fabric.Rect({
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 3,
          left: centerX - 50,
          top: centerY - 50,
          hasControls: true,
          hasBorders: true
        });
      } else if (type === 'triangle') {
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 3,
          left: centerX - 50,
          top: centerY - 50,
          hasControls: true,
          hasBorders: true
        });
      }
      
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      setSelectedTool('select');
    } catch (err) {
      console.error('Failed to add shape:', err);
      setError('Failed to add shape: ' + err.message);
    }
  };

  const addText = async () => {
    if (!fabricCanvasRef.current || !textInput) return;
    
    try {
      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || fabricModule.default;
      
      const text = new fabric.IText(textInput, {
        left: 100,
        top: 100,
        fill: textColor,
        fontSize: textSize,
        fontFamily: 'Arial',
        hasControls: true,
        hasBorders: true
      });
      
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      fabricCanvasRef.current.renderAll();
      setTextInput('');
      setSelectedTool('select');
    } catch (err) {
      console.error('Failed to add text:', err);
      setError('Failed to add text: ' + err.message);
    }
  };

  const applyFilter = async (operation, value) => {
    if (!fabricCanvasRef.current || !originalImage) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      // Use backend if available, otherwise apply client-side filters
      if (API_URL) {
        const response = await fetch(`${API_URL}/image-editor/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: dataUrl,
            operation: operation,
            params: { value: value / 100 }
          }),
        });
        
        clearInterval(progressInterval);
        setProgress(100);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to apply filter');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to apply filter');
        }
        
        // Load processed image
        const fabricModule = await import('fabric');
        const fabric = fabricModule.fabric || fabricModule.default;
        
        fabric.Image.fromURL(data.data.image, (img) => {
          if (fabricCanvasRef.current) {
            const canvas = fabricCanvasRef.current;
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
              const { left, top, scaleX, scaleY, angle } = activeObject;
              
              canvas.remove(activeObject);
              img.set({
                left,
                top,
                scaleX,
                scaleY,
                angle,
                originX: 'center',
                originY: 'center',
                hasControls: true,
                hasBorders: true
              });
              
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
            }
          }
        });
      } else {
        // Client-side filter fallback
        console.log('Applying filter client-side:', operation, value);
        // Note: For production, you'd implement actual client-side filtering
        // or use a different approach
        
        clearInterval(progressInterval);
        setProgress(100);
      }
      
      setTimeout(() => setProgress(0), 500);
      
    } catch (err) {
      setError(err.message || 'Failed to apply filter');
      console.error('Filter error:', err);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
    applyFilter(filter, value);
  };

  const rotateImage = (degrees) => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        activeObject.rotate((activeObject.angle || 0) + degrees);
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  const deleteSelected = () => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      if (activeObjects.length) {
        activeObjects.forEach(obj => fabricCanvasRef.current.remove(obj));
        fabricCanvasRef.current.discardActiveObject();
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#1f2937';
      fabricCanvasRef.current.renderAll();
      setOriginalImage(null);
      setImageInfo(null);
      setFilters({ brightness: 0, contrast: 0, saturation: 0, blur: 0 });
    }
  };

  const exportImage = async () => {
    if (!fabricCanvasRef.current) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      // Try to save via backend if available
      if (API_URL) {
        try {
          const response = await fetch(`${API_URL}/image-editor/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: dataUrl,
              filename: `edited-${Date.now()}.png`
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (!data.success) {
              console.warn('Backend save failed, downloading locally:', data.error);
            }
          }
        } catch (backendErr) {
          console.warn('Backend unavailable, downloading locally:', backendErr.message);
        }
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Always download locally
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setProgress(0), 500);
      
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export image: ' + err.message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const zoomIn = () => {
    if (fabricCanvasRef.current && zoom < 300) {
      const newZoom = Math.min(zoom + 25, 300);
      setZoom(newZoom);
      fabricCanvasRef.current.setZoom(newZoom / 100);
      fabricCanvasRef.current.renderAll();
    }
  };

  const zoomOut = () => {
    if (fabricCanvasRef.current && zoom > 25) {
      const newZoom = Math.max(zoom - 25, 25);
      setZoom(newZoom);
      fabricCanvasRef.current.setZoom(newZoom / 100);
      fabricCanvasRef.current.renderAll();
    }
  };

  const tools = [
    { id: 'select', icon: Eye, label: 'Select', action: () => setSelectedTool('select') },
    { id: 'draw', icon: PenTool, label: 'Draw', action: enableDrawing },
    { id: 'circle', icon: Circle, label: 'Circle', action: () => addShape('circle') },
    { id: 'rectangle', icon: Square, label: 'Rectangle', action: () => addShape('rectangle') },
    { id: 'text', icon: Type, label: 'Text', action: () => setSelectedTool('text') },
    { id: 'eraser', icon: Eraser, label: 'Eraser', action: deleteSelected }
  ];

  const filterPresets = [
    { name: 'Vibrant', brightness: 10, contrast: 15, saturation: 20 },
    { name: 'Muted', brightness: -5, contrast: -10, saturation: -15 },
    { name: 'High Contrast', brightness: 0, contrast: 30, saturation: 0 },
    { name: 'Vintage', brightness: -10, contrast: 5, saturation: -20, blur: 2 }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div  className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl py-3 font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Advanced Image Editor
              </h1>
              <p style={{fontFamily: "Trade Winds"}} className="text-gray-300 mt-1">
                Professional editing tools with real-time processing
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="tools" className="text-white data-[state=active]:bg-blue-500">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="filters" className="text-white data-[state=active]:bg-blue-500">
                  Filters
                </TabsTrigger>
                <TabsTrigger value="export" className="text-white data-[state=active]:bg-blue-500">
                  Export
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tools">
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                  <CardContent className="pt-2 space-y-6">
                    {/* Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Upload Image
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>

                    {/* Tools */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Editing Tools
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {tools.map((tool) => (
                          <Button
                            key={tool.id}
                            variant={selectedTool === tool.id ? "default" : "outline"}
                            onClick={tool.action}
                            className={`h-auto py-3 ${selectedTool === tool.id ? 'bg-blue-500' : 'border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600'}`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <tool.icon className="h-4 w-4" />
                              <span className="text-xs">{tool.label}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Drawing Settings */}
                    {isDrawing && (
                      <div className="space-y-3 p-3 border border-gray-600 rounded-lg">
                        <Label className="text-sm font-semibold text-white">
                          Drawing Settings
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={drawingColor}
                              onChange={(e) => setDrawingColor(e.target.value)}
                              className="w-8 h-8 cursor-pointer"
                            />
                            <span className="text-sm text-gray-300">Color</span>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">Width: {drawingWidth}px</Label>
                            <Slider
                              value={[drawingWidth]}
                              onValueChange={([value]) => setDrawingWidth(value)}
                              min={1}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <Button
                            onClick={disableDrawing}
                            variant="outline"
                            className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                          >
                            <Eraser className="h-4 w-4 mr-2" />
                            Stop Drawing
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Text Settings */}
                    {selectedTool === 'text' && (
                      <div className="space-y-3 p-3 border border-gray-600 rounded-lg">
                        <Label className="text-sm font-semibold text-white">
                          Text Settings
                        </Label>
                        <div className="space-y-2">
                          <Input
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Enter text..."
                            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-8 h-8 cursor-pointer"
                            />
                            <span className="text-sm text-gray-300">Color</span>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">Size: {textSize}px</Label>
                            <Slider
                              value={[textSize]}
                              onValueChange={([value]) => setTextSize(value)}
                              min={10}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <Button
                            onClick={addText}
                            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white border-0"
                            disabled={!textInput}
                          >
                            <Type className="h-4 w-4 mr-2" />
                            Add Text
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Object Actions */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Object Actions
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => rotateImage(90)}
                          variant="outline"
                          className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                        >
                          <RotateCw className="h-4 w-4 " />
                          Rotate 90°
                        </Button>
                        <Button
                          onClick={() => rotateImage(-90)}
                          variant="outline"
                          className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                        >
                          <RotateCcw className="h-4 w-4 " />
                          Rotate -90°
                        </Button>
                        <Button
                          onClick={deleteSelected}
                          variant="outline"
                          className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button
                          onClick={clearCanvas}
                          variant="outline"
                          className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="filters">
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                  <CardContent className="pt-6 space-y-6">
                    {/* Quick Presets */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Quick Presets
                      </Label>
                      <div className="space-y-2">
                        {filterPresets.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                            onClick={() => {
                              setFilters(preset);
                              Object.entries(preset).forEach(([key, value]) => {
                                if (key !== 'name') applyFilter(key, value);
                              });
                            }}
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="h-4 w-4 text-yellow-400" />
                          <Label className="text-sm font-semibold text-white">
                            Brightness: {filters.brightness}
                          </Label>
                        </div>
                        <Slider
                          value={[filters.brightness]}
                          onValueChange={([value]) => handleFilterChange('brightness', value)}
                          min={-100}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Contrast className="h-4 w-4 text-purple-400" />
                          <Label className="text-sm font-semibold text-white">
                            Contrast: {filters.contrast}
                          </Label>
                        </div>
                        <Slider
                          value={[filters.contrast]}
                          onValueChange={([value]) => handleFilterChange('contrast', value)}
                          min={-100}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="h-4 w-4 text-pink-400" />
                          <Label className="text-sm font-semibold text-white">
                            Saturation: {filters.saturation}
                          </Label>
                        </div>
                        <Slider
                          value={[filters.saturation]}
                          onValueChange={([value]) => handleFilterChange('saturation', value)}
                          min={-100}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MdBlurOn className="h-4 w-4 text-blue-400" />
                          <Label className="text-sm font-semibold text-white">
                            Blur: {filters.blur}
                          </Label>
                        </div>
                        <Slider
                          value={[filters.blur]}
                          onValueChange={([value]) => handleFilterChange('blur', value)}
                          min={0}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <Button
                        onClick={clearCanvas}
                        variant="outline"
                        className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export">
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                  <CardContent className="pt-6 space-y-6">
                    {/* Image Info */}
                    {imageInfo && (
                      <div className="space-y-3 p-3 border border-gray-600 rounded-lg">
                        <Label className="text-sm font-semibold text-white">
                          Image Information
                        </Label>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white truncate max-w-[120px]">{imageInfo.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dimensions:</span>
                            <span className="text-white">{imageInfo.width} × {imageInfo.height}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Size:</span>
                            <span className="text-white">{(imageInfo.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Format:</span>
                            <span className="text-white">{imageInfo.type.split('/')[1].toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Canvas Settings */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Canvas Settings
                      </Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show Grid</span>
                        <Switch
                          checked={showGrid}
                          onCheckedChange={setShowGrid}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Zoom: {zoom}%</span>
                          <div className="flex gap-1">
                            <Button
                              onClick={zoomOut}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                              disabled={zoom <= 25}
                            >
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={zoomIn}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                              disabled={zoom >= 300}
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Slider
                          value={[zoom]}
                          onValueChange={([value]) => {
                            setZoom(value);
                            if (fabricCanvasRef.current) {
                              fabricCanvasRef.current.setZoom(value / 100);
                              fabricCanvasRef.current.renderAll();
                            }
                          }}
                          min={25}
                          max={300}
                          step={25}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white">
                        Export Options
                      </Label>
                      <div className="space-y-2">
                        <Button
                          onClick={exportImage}
                          disabled={!originalImage || loading}
                          className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Export Image
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={clearCanvas}
                          variant="outline"
                          className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Canvas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg h-full">
              <CardContent className="p-6 h-full">
                {error && (
                  <Alert variant="destructive" className="mb-4 bg-red-400/10 border-red-400/30">
                    <AlertDescription className="text-red-300 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Progress Bar */}
                {loading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Processing image...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-gray-700" />
                  </div>
                )}

                {/* Canvas Container */}
                <div className="relative  bg-gray-900 rounded-lg border-2 border-gray-600 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className={`w-full  h-[600px] ${showGrid ? 'bg-grid-pattern' : ''}`}
                  />
                  
                  {/* Canvas Overlay Controls */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white">
                      Zoom: {zoom}%
                    </div>
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white">
                      {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
                    </div>
                  </div>

                  {/* Canvas Guide */}
                  {!originalImage && (
                    <div className="bg-gray-900 absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-lg font-semibold">No Image Loaded</p>
                      <p className="text-sm mt-2">Upload an image to start editing</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tool Status */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <div>
                    <span className="font-medium text-gray-300">Active Tool:</span>
                    <span className="ml-2 text-blue-400">
                      {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Filters Applied:</span>
                    <span className="ml-2 text-blue-400">
                      {Object.values(filters).filter(v => v !== 0).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;