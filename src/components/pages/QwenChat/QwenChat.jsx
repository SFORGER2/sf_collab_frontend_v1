import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Loader2, Send, Bot, User, Trash2, Copy, Download, Settings, Zap, Brain, MessageSquare, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { getProfilePicture } from '@/utils/getProfilePicture';
import InputArea from './InputArea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiAPI } from '@/utils/APIs/aiAPI';
const API_URL = import.meta.env.VITE_API_URL || '/api';

const QwenChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m Qwen 2.5, your friendly AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are Qwen 2.5, a helpful AI assistant. Provide simple and friendly responses.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [showSettings, setShowSettings] = useState(false);
  const [modelStatus, setModelStatus] = useState('loading');
  const [modelResponseType, setModelResponseType] = useState('general_knowledge'); // 'page_context' or 'general_knowledge'
  
  const messagesEndRef = useRef(null);
  const { user, access_token } = useSelector((state) => state.auth);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check model status
  useEffect(() => {
    checkModelStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkModelStatus = async () => {
    try {
      const response = await aiAPI.getHealth();
      console.log(response);
      setModelStatus(response.data.status === 'ready' ? 'ready' : 'loading');
    } catch (err) {
      setModelStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const token = access_token;
    if (!token) {
      setError('Please log in to use the chat');
      return;
    }

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Format messages for API
      const apiMessages = [];
      
      // Add system prompt if exists
      if (systemPrompt.trim()) {
        apiMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      // Add conversation history (last 10 messages)
      const historyMessages = messages.slice(-10);
      historyMessages.forEach(msg => {
        if (msg.role !== 'system') { // Don't duplicate system message
          apiMessages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
      
      // Add current user message
      apiMessages.push({
        role: 'user',
        content: input
      });
      let data
      if (modelResponseType === 'page_context') {
        const response = await aiAPI.queryAssistant(input.trim());
        if (!response.success) {
          throw new Error(response.error || 'Unknown error');
        }
        data = {
          response: response.data.answer,
          model: 'Custom RAG Model'
        }
      }
      else if (modelResponseType === 'general_knowledge') {
        const response = await aiAPI.generateContent({
          prompt: apiMessages,
          model: 'openai/gpt-oss-20b', // openai/gpt-oss-20b | wen/qwen3-32b
          temperature: temperature,
          maxTokens: maxTokens,
          contentType: 'chat',
          outputFormat: 'text'
        });
        if (!response.success) {
          throw new Error(response.error || 'Unknown error');
        }
        data = {
          response: response.data.response,
          model: response.data.model
        }
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
      console.error('Chat error:', err);
      
      // Provide user-friendly error message
      let errorContent = 'Sorry, I\'m having trouble responding right now. Please try again.';
      
      if (err.message.includes('network') || err.message.includes('fetch')) {
        errorContent = 'Connection issue detected. Please check your internet and try again.';
      } else if (err.message.includes('token') || err.message.includes('auth')) {
        errorContent = 'Authentication error. Please try logging in again.';
      }
      
      setError(errorContent);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };


  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m Qwen 2.5, your friendly AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Qwen'}: ${msg.content}\n${'-'.repeat(50)}`
    ).join('\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qwen-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    'Explain something interesting in simple terms',
    'Give me a fun fact',
    'What are some easy recipes I can try?',
    'Tell me a short story',
    'How can I improve my daily routine?',
    'What are some fun activities to do at home?',
    'Share a motivational quote',
    'Help me plan a fun day out'
  ];


  const sendQuickPrompt = async (promptText) => {
    if (loading) return;
    const token = access_token;
    if (!token) { setError('Please log in to use the chat'); return; }

    const userMessage = { id: messages.length + 1, role: 'user', content: promptText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');

    try {
      const apiMessages = [];
      if (systemPrompt.trim()) apiMessages.push({ role: 'system', content: systemPrompt });
      messages.slice(-10).forEach(msg => { if (msg.role !== 'system') apiMessages.push({ role: msg.role, content: msg.content }); });
      apiMessages.push({ role: 'user', content: promptText });

      const response = await aiAPI.generateContent({
        prompt: apiMessages,
        model: 'qwen/qwen3-32b',
        temperature,
        maxTokens,
        contentType: 'chat',
        outputFormat: 'text'
      });
      if (!response.success) throw new Error(response.error || 'Unknown error');

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        model: response.data.model
      }]);
    } catch (err) {
      const msg = 'Sorry, I am having trouble responding right now. Please try again.';
      setError(msg);
      setMessages(prev => [...prev, { id: prev.length + 1, role: 'assistant', content: msg, timestamp: new Date(), isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 py-8 px-4">
        <div className="w-full mx-auto">
          {/* Header with animated background similar to DiscoverUsers */}
          <div className="text-center mb-8 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-4 mb-6 mt-10">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30 backdrop-blur-sm">
                <Brain className="h-10 w-10 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
                  Qwen Chat
                </h1>
                <p className="text-lg text-gray-300">
                  Your intelligent conversation partner powered by <span className="font-semibold text-blue-400">Qwen 2.5</span>
                </p>
              </div>
            </div>
            
            {/* Model Status Badge */}
            <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <div className={`w-2 h-2 rounded-full ${modelStatus === 'ready' ? 'bg-green-400 animate-pulse' :
                  modelStatus === 'loading' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'
                }`} />
              <span className="text-sm text-gray-300">
                {modelStatus === 'ready' ? 'Ready' :
                  modelStatus === 'loading' ? 'Loading...' :
                    'Offline'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap flex-col-reverse md:flex-row mx-auto gap-6">
            {/* Settings Sidebar */}
            <div className="flex-1 space-y-6">
              {/* Configuration Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Configuration</h3>
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      System Instructions
                    </Label>
                    <Textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Define AI behavior..."
                      rows={4}
                      className="bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-300">
                        Creativity
                      </Label>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([value]) => setTemperature(value)}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      {temperature < 0.3 ? '🎯 Precise' :
                        temperature < 0.7 ? '⚖️ Balanced' :
                          '🎨 Creative'}
                    </p>
                  </div>
                  <div className="w-full my-2">
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">
                      Model Response Type
                    </Label>

                    <div className="flex gap-2">
                      {/* General Knowledge */}
                      <button
                        onClick={() => setModelResponseType("general_knowledge")}
                        className={`
        flex-1 px-2 py-1 rounded-full border text-sm font-medium transition-all
        ${modelResponseType === "general_knowledge"
                            ? "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-400 text-white border-transparent shadow-lg scale-[1.02]"
                            : "border-gray-600/50 text-gray-300 hover:border-gray-400 hover:text-white"
                          }
      `}
                        aria-pressed={modelResponseType === "general_knowledge"}
                      >
                        General Knowledge
                      </button>
                    </div>

                    {/* Selected mode hint */}
                    <p className="mt-2 text-xs text-gray-400">
                      Selected mode:{" "}
                      <span className="text-white font-medium">
                        {modelResponseType === "page_context"
                          ? "Page Context (uses SForger information only)"
                          : "General Knowledge (model knowledge only)"}
                      </span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-700/50">
                    <Button
                      onClick={clearChat}
                      variant="outline"
                      className="w-full bg-gray-900/50 border-gray-600/50 hover:bg-gray-700/50 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat
                    </Button>
                    <Button
                      onClick={downloadChat}
                      variant="outline"
                      className="w-full bg-gray-900/50 border-gray-600/50 hover:bg-gray-700/50 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Prompts Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Quick Start</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => sendQuickPrompt(prompt)}
                        disabled={loading}
                        className="w-full text-left p-3 rounded-xl bg-gray-900/30 border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-sm text-gray-300 hover:text-white disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-3">
              <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 h-[calc(100vh-12rem)] flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
                
                {/* Chat Header */}
                <div className="relative z-10 p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">Conversation</h2>
                    </div>
                    <span className="text-sm text-gray-400">
                      {messages.length - 1} messages
                    </span>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                          ? 'bg-blue-500'
                          : 'bg-purple-500'
                        }`}>
                        {message.role === 'user' ? (
                          <img loading="lazy" src={getProfilePicture(user)} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      
                      <div className={`max-w-[75%] ${message.role === 'user' ? 'items-end' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.isError
                              ? 'bg-red-900/30 border border-red-700/50 text-red-200'
                              : 'bg-gray-700/80 text-gray-100'
                          }`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-1 text-xs ${message.role === 'user' ? 'justify-end' : ''
                          }`}>
                          <span className="text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="text-gray-500 hover:text-blue-400 p-1"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-700/80 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <InputArea
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QwenChat;