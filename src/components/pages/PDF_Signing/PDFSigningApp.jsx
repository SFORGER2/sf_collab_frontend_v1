import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Trash2, MousePointer, Save, 
  FileText, Check, X, RefreshCw,
  Move, Maximize2, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { FaFilePdf } from "react-icons/fa6";
import { motion } from 'framer-motion';
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
  };

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-3 sm:px-6 py-4 sm:py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        className="w-full mx-auto max-w-7xl space-y-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-2xl">
              <FaFilePdf className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                PDF Signing Tool
              </h1>
              <p className="text-gray-400 text-sm sm:text-lg">
                Professional document signing made simple
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid gap-6 w-full lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Panel - Controls */}
          <motion.div variants={itemVariants} className="w-full lg:col-span-1">
            <div className="sticky top-6">
              <Card className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-700/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FaFilePdf className="h-5 w-5 text-blue-400" />
                    </div>
                    <span>Signing</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    Upload PDF and add signature
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  {/* File Upload */}
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-sm font-semibold text-white">Upload PDF</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="application/pdf"
                      className="hidden"
                      disabled={isUploading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-500/50 disabled:to-blue-600/50 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Upload PDF</span>
                        </>
                      )}
                    </motion.button>
                    
                    {selectedFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30"
                      >
                        <p className="text-xs text-white font-medium truncate">{previewText(selectedFile.name, 20)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatFileSize(selectedFile.size)}
                          {uploadedFileData && ` • ${uploadedFileData.num_pages || 1} pages`}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Progress Bar */}
                  {(isUploading || isProcessing) && (
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">
                          {isUploading ? 'Uploading...' : 'Processing...'}
                        </span>
                        <span className="text-blue-400 font-semibold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-slate-700" />
                    </motion.div>
                  )}

                  {/* Signature Creation */}
                  <motion.div className="space-y-3 border-t border-slate-700/30 pt-4" variants={itemVariants}>
                    <Label className="text-sm font-semibold text-white">Create Signature</Label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSignaturePad(!showSignaturePad)}
                      className="w-full border border-slate-600 bg-slate-700/30 hover:bg-slate-600/50 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <MousePointer className="h-4 w-4" />
                      {showSignaturePad ? 'Hide Pad' : 'Draw Signature'}
                    </motion.button>

                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: showSignaturePad ? 1 : 0, height: showSignaturePad ? 'auto' : 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-3"
                    >
                      {showSignaturePad && (
                        <>
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
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={clearSignature}
                              className="flex-1 border border-slate-600 bg-slate-700/30 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                            >
                              <Trash2 className="h-3 w-3" />
                              Clear
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={saveSignature}
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-1 text-sm font-medium"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </motion.button>
                          </div>
                        </>
                      )}
                    </motion.div>

                    {signatureData && !showSignaturePad && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-400/50 space-y-2"
                      >
                        <div className="bg-white/95 rounded p-2">
                          <img loading="lazy" 
                            src={signatureData} 
                            alt="Signature" 
                            className="w-full h-auto border border-slate-300 rounded" 
                          />
                        </div>
                        <p className="text-xs text-emerald-400 text-center font-medium">
                          ✓ Ready to position
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Auto-position Toggle */}
                  <motion.div className="space-y-2 border-t border-slate-700/30 pt-4" variants={itemVariants}>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-white">Auto-position</Label>
                      <Switch
                        checked={autoPosition}
                        onCheckedChange={setAutoPosition}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Auto-place on bottom-right</p>
                  </motion.div>

                  {/* Sign Document Button */}
                  {selectedFile && signatureData && signaturePosition && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={signDocument}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-500/50 disabled:to-blue-600/50 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Sign Document
                        </>
                      )}
                    </motion.button>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div variants={itemVariants} className="w-full lg:col-span-2 space-y-6">
            <Tabs defaultValue={isMobile ? "documents" : "preview"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700/30 p-1 rounded-xl mb-6">
                <TabsTrigger value="preview" className="text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg transition-all">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg transition-all">
                  Documents ({signedDocuments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                {alert.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-xl p-4 flex items-center gap-3 backdrop-blur border ${
                      alert.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-400/50 text-emerald-300'
                        : 'bg-red-500/10 border-red-400/50 text-red-300'
                    }`}
                  >
                    {alert.type === 'success' ? 
                      <Check className="h-5 w-5 flex-shrink-0" /> : 
                      <X className="h-5 w-5 flex-shrink-0" />
                    }
                    <span className="text-sm">{alert.message}</span>
                  </motion.div>
                )}

                <Card className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden">
                  <CardContent className="pt-6">
                    {!isMobile ? (
                      <>
                        {uploadedFileData && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-slate-700/30 rounded-xl p-3 gap-3 border border-slate-700/50"
                          >
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-600 bg-slate-700/50 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-all"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </motion.button>
                              <span className="text-sm text-white font-medium min-w-16 text-center">
                                {currentPage} / {totalPages}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-600 bg-slate-700/50 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-all"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.button>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={zoomOut}
                                className="p-2 border border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white rounded-lg transition-all"
                              >
                                −
                              </motion.button>
                              <span className="text-sm text-white font-medium min-w-12 text-center">{Math.round(scale * 100)}%</span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={zoomIn}
                                className="p-2 border border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white rounded-lg transition-all"
                              >
                                +
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fitToWidth}
                                className="p-2 border border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white rounded-lg transition-all"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        )}

                        <div className="bg-gradient-to-b from-slate-700/20 to-slate-800/20 rounded-xl shadow-inner min-h-96 flex items-center justify-center relative overflow-auto border border-slate-700/50">
                          {uploadedFileData && pdfUrl ? (
                            <div className="relative w-full h-full p-4 overflow-hidden">
                              <div 
                                ref={pdfContainerRef}
                                className="w-full h-full min-h-96 border-2 border-slate-600/50 rounded-lg bg-white/5 flex items-center justify-center overflow-auto relative shadow-inner"
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
                                  <motion.div
                                    ref={signatureRef}
                                    drag
                                    dragElastic={0.1}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute border-2 border-dashed border-blue-400/60 bg-blue-500/5 cursor-move hover:border-blue-300 hover:bg-blue-500/15 active:border-blue-400 active:bg-blue-500/25 shadow-lg shrink-0 rounded-lg group"
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
                                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-1 shadow-lg group-hover:scale-110 transition-transform">
                                        <Move className="h-3 w-3" />
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mt-3 text-center">
                                {signatureData && signaturePosition ? 
                                  "Drag signature to reposition" : 
                                  "Draw a signature to place it on the PDF"}
                              </p>
                            </div>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center text-gray-400 p-8 space-y-4"
                            >
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
                                <Upload className="h-10 w-10 text-blue-400/80" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">No Document</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                  Upload a PDF to start signing
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-blue-500/50 transition-all inline-flex items-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                Upload PDF
                              </motion.button>
                            </motion.div>
                          )}
                        </div>
                      </>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-gray-400 p-8 space-y-4"
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
                          <Maximize2 className="h-10 w-10 text-blue-400/80" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Desktop Only</p>
                          <p className="text-xs text-gray-400 mt-1">
                            PDF preview works better on larger screens
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden">
                  <CardContent className="pt-6">
                    {signedDocuments.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 text-gray-400 space-y-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
                          <FileText className="w-8 h-8 text-blue-400/80" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">No Signed Documents</p>
                          <p className="text-sm text-gray-400 mt-1">Sign your first document to see it here</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        layout
                        className="space-y-3 max-h-96 overflow-y-auto pr-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {signedDocuments.map((doc, idx) => (
                          <motion.div
                            key={doc.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 backdrop-blur rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:from-slate-700/50 hover:to-slate-800/50 transition-all border border-slate-600/30 hover:border-slate-600/60 gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0 w-full">
                              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                                <FileText className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white text-sm truncate">{previewText(doc.name, 20)}</p>
                                <p className="text-xs text-gray-400 truncate">
                                  {doc.date} • {doc.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => downloadSignedDoc(doc)}
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-xs font-medium flex items-center justify-center gap-2"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteSignedDoc(doc)}
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 transition-all text-xs font-medium flex items-center justify-center gap-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PDFSigningApp;
