import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function InputArea({
  input,
  setInput,
  handleSubmit,
  loading,
  error,
  scrollToBottom,
  showScrollBottom,
  sidebarOpen,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    if (showPlusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPlusMenu]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formattedFiles = files.map((file) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = sizeMB > 0 ? `${sizeMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;
      const ext = file.name.split(".").pop().toLowerCase();
      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: sizeStr,
        ext,
        rawFile: file,
      };
    });

    setAttachedFiles((prev) => [...prev, ...formattedFiles]);
    toast.success(`Attached ${formattedFiles.length} file${formattedFiles.length > 1 ? "s" : ""}`, {
      position: "bottom-right",
      autoClose: 2000,
      theme: "dark",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowPlusMenu(false);
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info("Speech recognition isn't supported by this browser.", {
        position: "bottom-right",
        autoClose: 2500,
        theme: "dark",
      });
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => {
            const base = prev.trim();
            return base ? `${base} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        toast.error(`Voice input error: ${event.error}`, {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
    }
  };

  const insertTemplate = (templateText) => {
    setInput((prev) => (prev ? `${prev}\n${templateText}` : templateText));
    setShowPlusMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();

    let finalPrompt = input.trim();

    if (attachedFiles.length > 0) {
      const fileTokens = attachedFiles
        .map((f) => `[File: ${f.name} - ${f.size}]`)
        .join("\n");
      finalPrompt = finalPrompt ? `${fileTokens}\n\n${finalPrompt}` : fileTokens;
    }

    if (!finalPrompt) return;

    if (finalPrompt.length > 8000) {
      toast.error("Message exceeds maximum character limit of 8,000 characters", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setInput(finalPrompt);

    setTimeout(() => {
      handleSubmit(e);
      setAttachedFiles([]);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const getFileIcon = (ext) => {
    switch (ext) {
      case "pdf":
        return { name: "picture_as_pdf", color: "#FF6B6B" };
      case "csv":
      case "xlsx":
        return { name: "table_chart", color: "#3DDC97" };
      case "json":
        return { name: "data_object", color: "#7CA6FF" };
      case "png":
      case "jpg":
      case "jpeg":
        return { name: "image", color: "#91B6FF" };
      case "zip":
      case "rar":
        return { name: "folder_zip", color: "#FFC107" };
      default:
        return { name: "description", color: "#A9B3C4" };
    }
  };

  const canSend = !loading && (input.trim() || attachedFiles.length > 0);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.json,.xlsx,.png,.jpg,.jpeg,.zip"
      />

      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => scrollToBottom && scrollToBottom('smooth')}
            className="px-3 py-1 rounded-full bg-[#131925] flex items-center gap-1.5 text-[#A9B3C4] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors cursor-pointer shadow-xs text-[12px] font-medium font-sans"
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
          >
            <span className="material-symbols-outlined text-[15px] text-[#7CA6FF]">arrow_downward</span>
            <span>Scroll to latest</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[768px] px-4 md:px-6 flex flex-col gap-2">
        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF6B6B]/8 border-l-2 border-[#FF6B6B] text-[#FFB4B4] text-[13px] font-sans">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <AnimatePresence>
          {showPlusMenu && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="absolute bottom-full mb-3 left-4 md:left-6 w-64 bg-[#141A26] rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] z-50 flex flex-col gap-0.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-[#505D73] uppercase tracking-wider">
                Insert &amp; attach
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F7F8FA] hover:bg-[#1D2636] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#7CA6FF]">upload_file</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">Upload file</span>
                  <span className="text-[10px] text-[#64748B]">PDF, CSV, JSON, images</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertTemplate("```csv\nName, Age, Department, Salary\nAlex Mercer, 32, Engineering, $140,000\nSarah Connor, 28, Product, $125,000\n```")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F7F8FA] hover:bg-[#1D2636] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#3DDC97]">table_chart</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">Attach dataset / CSV</span>
                  <span className="text-[10px] text-[#64748B]">Insert sample CSV structure</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertTemplate("```javascript\nfunction example() {\n  console.log('Hello Qwen AI');\n}\n```")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F7F8FA] hover:bg-[#1D2636] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#91B6FF]">code</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">Insert code snippet</span>
                  <span className="text-[10px] text-[#64748B]">Formatted code block</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertTemplate("```mermaid\ngraph TD\n  A[Start] --> B[Process]\n  B --> C[Finish]\n```")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F7F8FA] hover:bg-[#1D2636] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#FFC107]">account_tree</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">Insert diagram</span>
                  <span className="text-[10px] text-[#64748B]">Mermaid flowchart template</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertTemplate("$$\n\\hat{H}\\Psi = E\\Psi\n$$")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F7F8FA] hover:bg-[#1D2636] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#FF8FA3]">functions</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">Insert LaTeX math</span>
                  <span className="text-[10px] text-[#64748B]">Mathematical formula</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleFormSubmit} className="w-full relative">
          <div className="w-full bg-[#131925] rounded-[28px] px-2 py-1.5 flex flex-col gap-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.25)]">
            <AnimatePresence>
              {attachedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-2 px-2.5 pt-1.5"
                >
                  {attachedFiles.map((file) => {
                    const iconInfo = getFileIcon(file.ext);
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#1B2232] text-[#D1D5DB] text-[12px]"
                      >
                        <span className="material-symbols-outlined text-[15px]" style={{ color: iconInfo.color }}>
                          {iconInfo.name}
                        </span>
                        <span className="max-w-[130px] truncate font-medium">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-[#64748B] hover:text-[#FF6B6B] transition-colors cursor-pointer rounded-full"
                          title="Remove attachment"
                        >
                          <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end w-full gap-1">
              <button
                type="button"
                onClick={() => setShowPlusMenu((prev) => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 outline-none ${
                  showPlusMenu
                    ? "bg-[#7CA6FF] text-[#07090D]"
                    : "text-[#8592A6] hover:text-[#F7F8FA] hover:bg-[#1D2636]"
                }`}
                title="Add attachment or template"
                aria-label="Add attachment or template"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening…" : "Ask Qwen anything"}
                disabled={loading}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#F7F8FA] font-sans text-[15px] leading-relaxed px-1.5 py-2 placeholder:text-[#64748B] outline-none resize-none max-h-36"
              />

              <div className="flex items-center gap-0.5 shrink-0 mb-0.5">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 outline-none ${
                    isRecording
                      ? "bg-[#FF6B6B] text-white animate-pulse"
                      : "text-[#8592A6] hover:text-[#F7F8FA] hover:bg-[#1D2636]"
                  }`}
                  title={isRecording ? "Stop voice recording" : "Voice input"}
                  aria-label="Voice input"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isRecording ? "mic_off" : "mic"}
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-full bg-[#7CA6FF] text-[#07090D] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-[19px] animate-spin">progress_activity</span>
                  ) : (
                    <span
                      className="material-symbols-outlined text-[19px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      arrow_upward
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        <p className="text-center text-[11px] text-[#4B5568] font-sans px-2 select-none">
          Qwen AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
