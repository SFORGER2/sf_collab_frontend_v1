import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Loader2, Send, Bot, User, Trash2, Copy, Download, Settings, Zap, Brain, MessageSquare, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const GeminiChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m Google Gemini AI. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are Google Gemini, a helpful AI assistant. Provide accurate, helpful, and detailed responses.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('loading');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [availableModels, setAvailableModels] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check service status and load models
  useEffect(() => {
    checkServiceStatus();
    loadModels();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/gemini/health`);
      if (response.ok) {
        setServiceStatus('ready');
      } else {
        setServiceStatus('error');
      }
    } catch (err) {
      setServiceStatus('error');
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch(`${API_URL}/gemini/models`);
      const data = await response.json();
      if (data.success) {
        setAvailableModels(data.models);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date(),
      image: imagePreview
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');
    setImageFile(null);
    setImagePreview(null);

    try {
      let response;
      
      // If there's an image, use analyze-image endpoint
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', input || 'Describe this image');
        
        response = await fetch(`${API_URL}/gemini/analyze-image`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Regular chat
        response = await fetch(`${API_URL}/gemini/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: input,
            temperature: temperature,
            max_tokens: maxTokens
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Request failed');
      }

      // Add assistant response
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        model: data.model
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      setError(err.message);
      console.error('Chat error:', err);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m Google Gemini AI. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
    setError('');
    setImageFile(null);
    setImagePreview(null);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Gemini'}: ${msg.content}\n${'-'.repeat(50)}`
    ).join('\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    'Explain quantum computing in simple terms',
    'Write a Python function to reverse a string',
    'What are the benefits of renewable energy?',
    'Create a short story about a time traveler',
    'How do I improve my coding skills?',
    'Write a recipe for chocolate chip cookies',
    'Explain the theory of relativity',
    'Help me plan a 3-day trip to Tokyo'
  ];

  return (
    <TooltipProvider>
      <div className="relative min-h-screen py-8 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-collapsible-down" style={{ animationDelay: '10s' }}/>
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '10s' }} />
        </div>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Google Gemini Chat
                </h1>
                <p className="text-gray-300 mt-1">
                  Chat with Google's Gemini AI - Text and Vision capabilities
                </p>
              </div>
            </div>
            
            {/* Service Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-blue-400/30 shadow-sm mb-4 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${
                serviceStatus === 'ready' ? 'bg-green-500' :
                serviceStatus === 'loading' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-white">
                {serviceStatus === 'ready' ? 'Gemini API Ready' :
                 serviceStatus === 'loading' ? 'Checking Status...' :
                 'Service Error'}
              </span>
              <span className="text-xs text-gray-400">• Google Gemini AI</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Left Panel - Settings */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Settings className="h-5 w-5 text-blue-400" />
                    Settings
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure Gemini AI
                    
                  {/* Service Info */}
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-white">Service Info</h4>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium text-blue-400">Google Gemini AI</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          serviceStatus === 'ready' ? 'text-green-400' :
                          serviceStatus === 'loading' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {serviceStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Models:</span>
                        <span className="font-medium text-blue-400">{availableModels.length}</span>
                      </div>
                    </div>
                  </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Model Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="model-select" className="text-sm font-semibold text-white">
                      Model
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-full border-gray-600 bg-gray-700/50 text-white">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-white">
                        {availableModels.map((model, index) => (
                          <SelectItem key={index} value={model} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            {model.split('/').pop()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-3">
                    <Label htmlFor="system-prompt" className="text-sm font-semibold text-white">
                      System Prompt
                    </Label>
                    <Textarea
                      id="system-prompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Define the AI's behavior..."
                      rows={3}
                      className="text-sm resize-none border-gray-600 bg-gray-700/50 text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-white">
                        Temperature: {temperature.toFixed(1)}
                      </Label>
                      <span className="text-xs text-gray-400">
                        {temperature < 0.3 ? 'Precise' :
                         temperature < 0.7 ? 'Balanced' :
                         'Creative'}
                      </span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([value]) => setTemperature(value)}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full text-blue-400"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-white">
                        Max Tokens: {maxTokens}
                      </Label>
                    </div>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={([value]) => setMaxTokens(value)}
                      min={100}
                      max={2000}
                      step={100}
                      className="w-full"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <Button
                      onClick={clearChat}
                      variant="outline"
                      className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat
                    </Button>
                    
                    <Button
                      onClick={downloadChat}
                      variant="outline"
                      className="w-full border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Chat
                    </Button>
                  </div>

                </CardContent>
              </Card>

              {/* Quick Prompts */}
              <Card className="mt-6 bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-blue-400" />
                    Quick Prompts
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Try these examples
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 flex gap-2 flex-wrap overflow-y-auto">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => {
                          document.getElementById('chat-input')?.focus();
                        }, 100);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-700 bg-gray-700/50 text-gray-300 hover:border-blue-400 hover:bg-blue-400/10 hover:text-white transition-colors text-sm backdrop-blur-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg min-h-[600px] flex flex-col">
                <CardHeader className="pb-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <MessageSquare className="h-6 w-6 text-blue-400" />
                        Chat with Gemini
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {messages.length - 1} messages exchanged
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowSettings(!showSettings)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {showSettings ? 'Hide' : 'Show'} Settings
                    </Button>
                  </div>
                </CardHeader>
                
                {/* Messages Container */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30' 
                          : 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                        {/* Image Preview */}
                        {message.image && (
                          <div className="mb-2">
                            <img loading="lazy" 
                              src={message.image} 
                              alt="Uploaded" 
                              className="max-w-[200px] rounded-lg border border-gray-600"
                            />
                          </div>
                        )}
                        
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-400 text-white rounded-br-none border border-blue-400/30'
                            : message.isError
                            ? 'bg-red-400/10 border border-red-400/30 text-red-300'
                            : 'bg-gray-700/50 text-gray-200 rounded-bl-none border border-gray-600'
                        }`}>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Message Meta */}
                        <div className={`flex items-center gap-2 mt-1 text-xs ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}>
                          <span className="text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.role === 'assistant' && !message.isError && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-teal-400 font-medium">{message.model || 'Gemini'}</span>
                            </>
                          )}
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => copyMessage(message.content)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 border-gray-600 text-white">
                              <p>Copy message</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-400/20 text-teal-400 border border-teal-400/30 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-700/50 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-600">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </CardContent>
                
                {/* Input Area */}
                <div className="p-4 border-t border-gray-700">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                      <Alert variant="destructive" className="bg-red-400/10 border-red-400/30">
                        <AlertDescription className="text-red-300 text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Image Upload */}
                    {imagePreview && (
                      <div className="flex items-center gap-2 p-2 bg-blue-400/10 rounded-lg border border-blue-400/30">
                        <img loading="lazy" 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span className="text-sm text-blue-300 flex-1">
                          Image ready for analysis
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-2 relative">
                        
                        <Textarea
                          id="chat-input"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type your message here... (Press Shift+Enter for new line)"
                          rows={2}
                          className="resize-none border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                          disabled={loading}
                        />

                        <div className="flex gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                      </div>
                      <Button
                          type="submit"
                          disabled={(!input.trim() && !imageFile) || loading}
                          className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400">
                      <div>
                        <span className="font-medium text-gray-300">Tips:</span>
                        <span className="ml-2">Upload images for visual analysis</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-300">Model:</span>
                        <span className="ml-2 text-blue-400">{selectedModel}</span>
                      </div>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default GeminiChat;