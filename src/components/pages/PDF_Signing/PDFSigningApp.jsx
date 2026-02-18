import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Trash2, MousePointer, Save, 
  FileText, Check, X, RefreshCw,
  Move, Maximize2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { FaFilePdf } from "react-icons/fa6";
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Progress } from '../../ui/progress';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toolsAPI } from '@/utils/APIs/toolsAPI';

const PDFSigningApp = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState(null);
  const [signedDocuments, setSignedDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoPosition, setAutoPosition] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 800, height: 1131 });
  const [totalPages, setTotalPages] = useState(1);

  const canvasRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const sigStartPos = useRef({ x: 0, y: 0 });



  useEffect(() => {
    if (showSignaturePad && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [showSignaturePad]);

  useEffect(() => {
    if (!isDragging) return;
  
    let animationFrameId = null;
    let lastTimestamp = 0;
    const FRAME_RATE = 60;
  
    const handleMouseMove = (e) => {
      if (!signaturePosition || !pdfContainerRef.current) return;
  
      const now = Date.now();
      if (now - lastTimestamp < 1000 / FRAME_RATE) return;
      
      lastTimestamp = now;
  
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
  
      animationFrameId = requestAnimationFrame(() => {
        const container = pdfContainerRef.current;
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        const deltaX = (clientX - dragStartPos.current.x) / scale;
        const deltaY = (clientY - dragStartPos.current.y) / scale;
        
        const easedDeltaX = deltaX * 0.3 + (signaturePosition.x - sigStartPos.current.x) * 0.7;
        const easedDeltaY = deltaY * 0.3 + (signaturePosition.y - sigStartPos.current.y) * 0.7;
        
        const newX = sigStartPos.current.x + easedDeltaX;
        const newY = sigStartPos.current.y + easedDeltaY;
        
        const buffer = 5;
        const maxX = pdfDimensions.width - signaturePosition.width - buffer;
        const maxY = pdfDimensions.height - signaturePosition.height - buffer;
  
        setSignaturePosition(prev => ({
          ...prev,
          x: Math.max(buffer, Math.min(newX, maxX)),
          y: Math.max(buffer, Math.min(newY, maxY)),
          page: currentPage
        }));
      });
    };
  
    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setIsDragging(false);
      if (signatureRef.current) {
        signatureRef.current.style.transition = 'transform 0.1s ease-out';
        setTimeout(() => {
          if (signatureRef.current) {
            signatureRef.current.style.transition = '';
          }
        }, 100);
      }
    };
  
    const handleTouchMove = (e) => {
      e.preventDefault();
      handleMouseMove(e);
    };
  
    const options = { passive: false };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleMouseUp);
  
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, signaturePosition, pdfDimensions, currentPage, scale]);

  const loadSignedDocuments = async () => {
    try {
      const data = await toolsAPI.listSignedDocuments();
      const formattedDocs = data.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        date: new Date(doc.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        size: formatFileSize(doc.size),
        downloadUrl: doc.download_url
      }));
      setSignedDocuments(formattedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
      showAlert('Failed to load documents', 'error');
    }
  };
  const loadSignedDocumentsCallback = useCallback(loadSignedDocuments, []);

  useEffect(() => {
    loadSignedDocumentsCallback();
  }, [loadSignedDocumentsCallback]);
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.closePath();
    }
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    setShowSignaturePad(false);
    
    if (autoPosition && pdfUrl) {
      const position = {
        x: pdfDimensions.width * 0.7,
        y: pdfDimensions.height * 0.8,
        width: 150,
        height: 75,
        page: currentPage
      };
      setSignaturePosition(position);
      showAlert('Signature saved and positioned!', 'success');
    } else if (pdfUrl) {
      const position = {
        x: pdfDimensions.width * 0.1,
        y: pdfDimensions.height * 0.8,
        width: 150,
        height: 75,
        page: currentPage
      };
      setSignaturePosition(position);
      showAlert('Signature saved! Drag it to position on the PDF.', 'success');
    } else {
      showAlert('Signature saved! Upload a PDF to position it.', 'success');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showAlert('Please upload a valid PDF file.', 'error');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      showAlert('File size must be less than 16MB', 'error');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setSelectedFile(file);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const data = await toolsAPI.uploadPDF(file);
      clearInterval(progressInterval);
      setProgress(100);

      setUploadedFileData(data);
      showAlert('PDF uploaded successfully!', 'success');
      
      const blob = new Blob([file], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      setPdfDimensions({ width: 794, height: 1123 });
      setTotalPages(data.num_pages || 1);

      setTimeout(() => setProgress(0), 1000);

    } catch (error) {
      showAlert(error.message || 'Error uploading file', 'error');
      setSelectedFile(null);
      setPdfUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const startDragging = (e) => {
    if (!signaturePosition || !pdfContainerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    
    let clientX, clientY;
    if (e.type === 'touchstart') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    dragStartPos.current = { x: clientX, y: clientY };
    sigStartPos.current = { x: signaturePosition.x, y: signaturePosition.y };
    
    if (signatureRef.current) {
      signatureRef.current.style.transition = 'none';
    }
  };

  const signDocument = async () => {
    if (!selectedFile || !signatureData || !signaturePosition || !uploadedFileData) {
      showAlert('Missing required data for signing.', 'error');
      return;
    }
  
    setIsProcessing(true);
    setProgress(0);
  
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
  
      const dpiRatio = 72 / 96;
      
      const pdfPosition = {
        x: signaturePosition.x * dpiRatio,
        y: signaturePosition.y * dpiRatio,
        width: signaturePosition.width * dpiRatio,
        height: signaturePosition.height * dpiRatio,
        page: signaturePosition.page
      };

      await toolsAPI.signPDF(
        uploadedFileData.file_id,
        uploadedFileData.filename,
        signatureData,
        pdfPosition
      );
  
      clearInterval(progressInterval);
      setProgress(100);

      showAlert('Document signed successfully!', 'success');
      await loadSignedDocuments();
      resetState();

      setTimeout(() => setProgress(0), 1000);
  
    } catch (error) {
      showAlert(error.message || 'Error signing document', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setUploadedFileData(null);
    setSignatureData(null);
    setSignaturePosition(null);
    setPdfUrl(null);
    setCurrentPage(1);
    setScale(1);
    setPdfDimensions({ width: 794, height: 1123 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  };

  const downloadSignedDoc = async (doc) => {
    try {
      const blob = await toolsAPI.downloadSignedPDF(doc.name);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showAlert(`Downloading ${doc.name}...`, 'success');
    } catch (error) {
      showAlert('Error downloading document: ' + error.message, 'error');
    }
  };

  const deleteSignedDoc = async (doc) => {
    try {
      await toolsAPI.deleteDocument(doc.name);
      showAlert('Document deleted successfully!', 'success');
      await loadSignedDocuments();
    } catch (error) {
      showAlert('Error deleting document: ' + error.message, 'error');
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      if (signaturePosition) {
        setSignaturePosition(prev => ({
          ...prev,
          page: currentPage - 1
        }));
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      if (signaturePosition) {
        setSignaturePosition(prev => ({
          ...prev,
          page: currentPage + 1
        }));
      }
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const fitToWidth = () => {
    if (pdfContainerRef.current) {
      const containerWidth = pdfContainerRef.current.clientWidth;
      const pageWidth = pdfDimensions.width;
      setScale(containerWidth / pageWidth);
    }
  };

  const handleIframeLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.style.transform = `scale(${scale})`;
      iframeRef.current.style.transformOrigin = 'top left';
    }
  };
  const previewText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    const extIndex = text.lastIndexOf('.');
    const extension = extIndex !== -1 ? text.substring(extIndex) : '';
    const namePart = text.substring(0, extIndex);
    const truncatedName = namePart.length > maxLength - extension.length
      ? namePart.substring(0, maxLength - extension.length - 3) + '...'
      : namePart;
    return truncatedName + extension;
  }
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-4 px-3 sm:py-8 sm:px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <div className="p-2.5 sm:p-4 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-2xl shadow-2xl">
              <FaFilePdf className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent px-2">
                PDF Signing Tool
              </h1>
              <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-lg">
                Professional document signing
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 w-full lg:grid-cols-3 auto-rows-max lg:auto-rows-min">
          {/* Left Panel - Controls */}
          <div className="w-full lg:col-span-1">
            <Card className="bg-linear-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl lg:sticky lg:top-6">
              <CardHeader className="pb-3 sm:pb-4 border-b border-slate-700/30 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl text-white">
                  <FaFilePdf className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 shrink-0" />
                  <span className="truncate text-sm sm:text-base">Signing</span>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1 text-xs">
                  Upload PDF and sign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-3 sm:px-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-white">
                    Upload PDF
                  </Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="application/pdf"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-blue-500/50 transition-all text-xs sm:text-base py-2 h-auto"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin shrink-0" />
                        <span className="text-xs">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2 shrink-0" />
                        <span className="text-xs">Upload PDF</span>
                      </>
                    )}
                  </Button>
                  
                  {selectedFile && (
                    <div className="mt-2 p-2 sm:p-3 bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-xs text-white font-medium truncate">{previewText(selectedFile.name, 20)}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(selectedFile.size)}
                        {uploadedFileData && ` • ${uploadedFileData.num_pages || 1} pages`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {(isUploading || isProcessing) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">
                        {isUploading ? 'Uploading...' : 'Processing...'}
                      </span>
                      <span className="text-blue-400 font-semibold text-xs">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-700" />
                  </div>
                )}

                {/* Signature Creation */}
                <div className="space-y-2 border-t border-slate-700/30 pt-4">
                  <Label className="text-xs sm:text-sm font-semibold text-white">
                    Create Signature
                  </Label>
                  <Button
                    onClick={() => setShowSignaturePad(!showSignaturePad)}
                    variant="outline"
                    className="w-full border-slate-600 bg-slate-700/30 text-white hover:bg-slate-600/50 transition-all text-xs py-2 h-auto"
                  >
                    <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 mr-2 shrink-0" />
                    {showSignaturePad ? 'Hide' : 'Draw Sign'}
                  </Button>

                  {showSignaturePad && (
                    <div className="mt-3 space-y-3">
                      <div className="border-2 border-slate-600 rounded-lg bg-white/95 overflow-hidden shadow-lg">
                        <canvas
                          ref={canvasRef}
                          width={280}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-auto cursor-crosshair touch-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={clearSignature}
                          variant="outline"
                          className="flex-1 border-slate-600 bg-slate-700/30 text-white hover:bg-slate-600/50 text-xs py-1.5 h-auto"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                        <Button
                          onClick={saveSignature}
                          className="flex-1 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-emerald-500/50 text-xs py-1.5 h-auto"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  {signatureData && !showSignaturePad && (
                    <div className="mt-3 p-2 bg-linear-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-400/50">
                      <div className="bg-white/95 rounded p-1.5">
                        <img loading="lazy" 
                          src={signatureData} 
                          alt="Signature" 
                          className="w-full h-auto border border-slate-300 rounded" 
                        />
                      </div>
                      <p className="text-xs text-emerald-400 mt-1.5 text-center font-medium">
                        ✓ Ready - Drag to position
                      </p>
                    </div>
                  )}
                </div>

                {/* Auto-position Toggle */}
                <div className="space-y-2 border-t border-slate-700/30 pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-position" className="text-xs font-semibold text-white">
                      Auto-position
                    </Label>
                    <Switch
                      id="auto-position"
                      checked={autoPosition}
                      onCheckedChange={setAutoPosition}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Auto-position on last page
                  </p>
                </div>

                {/* Sign Document Button */}
                {selectedFile && signatureData && signaturePosition && (
                  <Button
                    onClick={signDocument}
                    disabled={isProcessing}
                    className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-blue-500/50 transition-all mt-4 py-2 h-auto text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin shrink-0" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-2 shrink-0" />
                        Sign Document
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:col-span-2">
            <Tabs defaultValue={isMobile ? "documents" : "preview"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700/30 p-1 rounded-lg mb-4 sm:mb-6">
                <TabsTrigger value="preview" className="text-xs sm:text-sm text-white data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs sm:text-sm text-white data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600">
                  Docs ({signedDocuments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-3 sm:space-y-4">
                <Card className="bg-linear-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                  <CardContent className="pt-3 sm:pt-6 px-3 sm:px-6">
                    {alert.message && (
                      <Alert className={`mb-3 border-l-4 text-xs sm:text-sm ${
                        alert.type === 'success' 
                          ? 'bg-emerald-500/10 border-emerald-400/50 text-emerald-300'
                          : 'bg-red-500/10 border-red-400/50 text-red-300'
                      }`}>
                        <AlertDescription className="flex items-center gap-2">
                          {alert.type === 'success' ? 
                            <Check className="h-4 w-4 shrink-0" /> : 
                            <X className="h-4 w-4 shrink-0" />
                          }
                          <span className="text-xs">{alert.message}</span>
                        </AlertDescription>
                      </Alert>
                    )}

                    {!isMobile ? (
                      <>
                        {uploadedFileData && (
                          <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 bg-slate-700/30 rounded-lg p-2 sm:p-3 gap-2 border border-slate-700/50 overflow-x-auto">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <Button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600 h-7 sm:h-9 px-1.5 sm:px-2"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <span className="text-xs sm:text-sm text-white font-medium">
                                {currentPage} / {totalPages}
                              </span>
                              <Button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600 h-7 sm:h-9 px-1.5 sm:px-2"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={zoomOut}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600 h-7 sm:h-9 px-1.5 sm:px-2 text-xs"
                              >
                                −
                              </Button>
                              <span className="text-xs sm:text-sm text-white font-medium min-w-8 text-center">{Math.round(scale * 100)}%</span>
                              <Button
                                onClick={zoomIn}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600 h-7 sm:h-9 px-1.5 sm:px-2 text-xs"
                              >
                                +
                              </Button>
                              <Button
                                onClick={fitToWidth}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600 h-7 sm:h-9 px-1.5 sm:px-2"
                              >
                                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="bg-linear-to-b from-slate-700/20 to-slate-800/20 rounded-lg sm:rounded-xl shadow-inner min-h-64 sm:min-h-96 flex items-center justify-center relative overflow-auto border border-slate-700/50">
                          {uploadedFileData && pdfUrl ? (
                            <div className="relative w-full h-full p-2 sm:p-4 overflow-hidden">
                              <div 
                                ref={pdfContainerRef}
                                className="w-full h-full min-h-60 sm:min-h-96 border-2 border-slate-600/50 rounded-lg bg-white/5 flex items-center justify-center overflow-auto relative shadow-inner"
                                style={{ position: 'relative', overflow: 'auto' }}
                              >
                                <iframe
                                  ref={iframeRef}
                                  src={pdfUrl}
                                  title="PDF Preview"
                                  className="border-none rounded-lg"
                                  style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                    width: `${pdfDimensions.width}px`,
                                    height: `${pdfDimensions.height}px`,
                                    minWidth: `${pdfDimensions.width}px`,
                                    minHeight: `${pdfDimensions.height}px`,
                                  }}
                                  onLoad={handleIframeLoad}
                                />
                                
                                {signatureData && signaturePosition && signaturePosition.page === currentPage && (
                                  <div
                                    ref={signatureRef}
                                    className="absolute border-2 border-dashed border-blue-400/60 bg-blue-500/5 cursor-move transition-all duration-150 ease-out hover:border-blue-300 hover:bg-blue-500/15 active:border-blue-400 active:bg-blue-500/25 shadow-lg shrink-0 rounded-lg"
                                    style={{
                                      left: `${signaturePosition.x}px`,
                                      top: `${signaturePosition.y}px`,
                                      width: `${signaturePosition.width}px`,
                                      height: `${signaturePosition.height}px`,
                                      transform: `scale(${scale})`,
                                      transformOrigin: 'top left',
                                      willChange: 'transform, left, top',
                                    }}
                                    onMouseDown={startDragging}
                                    onTouchStart={startDragging}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <img loading="lazy" 
                                        src={signatureData} 
                                        alt="Signature" 
                                        className="w-full h-full object-contain pointer-events-none shrink-0"
                                        draggable="false"
                                      />
                                      <div className="absolute -top-2 -right-2 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-full p-0.5 shadow-lg">
                                        <Move className="h-2.5 w-2.5" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 text-center">
                                {signatureData && signaturePosition ? 
                                  "Drag signature to position" : 
                                  "Draw a signature to place it"}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 p-4 sm:p-8">
                              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                                <Upload className="h-6 w-6 sm:h-10 sm:w-10 text-blue-400/80" />
                              </div>
                              <h3 className="text-sm sm:text-lg font-semibold text-white mb-2">
                                No Document
                              </h3>
                              <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                                Upload a PDF document to add your signature.
                              </p>
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-blue-500/50 text-xs py-1.5 h-auto"
                              >
                                <Upload className="h-3 w-3 mr-2" />
                                Upload PDF
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 p-4 sm:p-8">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3 mx-auto">
                          <Maximize2 className="h-6 w-6 text-blue-400/80" />
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">Switch to Desktop</p>
                        <p className="text-xs text-gray-400">
                          PDF preview is better on larger screens
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                    {signedDocuments.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-400">
                        <FileText className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 opacity-40" />
                        <p className="text-sm sm:text-lg text-white font-medium">No signed documents</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Sign your first document</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-96 sm:max-h-150 overflow-y-auto pr-2">
                        {signedDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-linear-to-r from-slate-700/30 to-slate-800/30 backdrop-blur rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:from-slate-700/50 hover:to-slate-800/50 transition-all border border-slate-600/30 hover:border-slate-600/60 gap-2 sm:gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0 w-full">
                              <div className="p-2 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded shrink-0 mt-0.5 sm:mt-0">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white text-xs sm:text-sm truncate">{previewText(doc.name, 20)}</p>
                                <p className="text-xs text-gray-400 truncate">
                                  {doc.date} • {doc.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                              <Button
                                onClick={() => downloadSignedDoc(doc)}
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none border-emerald-500/50 text-white bg-emerald-600 hover:text-emerald-500 hover:bg-white transition-all text-xs py-1.5 h-auto"
                              >
                                <Download className="h-3 w-3 mr-1 shrink-0" />
                                <span>Download</span>
                              </Button>
                              <Button
                                onClick={() => deleteSignedDoc(doc)}
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none border-red-500/50 text-white bg-red-600 hover:text-red-500 hover:bg-white transition-all text-xs py-1.5 h-auto"
                              >
                                <Trash2 className="h-3 w-3 mr-1 shrink-0" />
                                <span>Delete</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSigningApp;
