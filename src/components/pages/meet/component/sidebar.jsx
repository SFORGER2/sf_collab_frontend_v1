import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send } from "lucide-react";

// button on the bottom right
export function AIActions({ onOpenSidebar }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onOpenSidebar}
        className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl rounded-2xl px-5 py-3 text-sm font-medium"
        size="lg"
      >
        <Bot size={20} />
        AI Assistant
      </Button>
    </div>
  );
}

export function AISidebar({ open, onClose }) {
  const [input, setInput] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-80 sm:w-96 
                       bg-[#0f0f12] border-l border-zinc-800 shadow-2xl 
                       flex flex-col z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800 bg-[#18181b] flex-shrink-0">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <Bot size={20} className="text-violet-400" />
                AI Assistant
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              <Card className="bg-[#18181b] border-zinc-800">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1 text-white">
                    Current Context
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Discussing pricing strategy and roadmap planning for Q2.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#18181b] border-zinc-800">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 text-white">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="justify-start bg-[#18181b] border-zinc-700 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                    >
                      Summarize this page
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-[#18181b] border-zinc-700 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                    >
                      Extract action items
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-[#18181b] border-zinc-700 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                    >
                      Analyze budget alerts
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#18181b] border-zinc-800">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 text-white">Results</h3>
                  <ul className="text-sm text-zinc-300 space-y-3">
                    <li className="flex gap-2">
                      <span className="text-emerald-400">•</span>
                      Decision: Use Stripe for payments
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-400">•</span>
                      Task: Update pitch deck v2 (due in 2 days)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-400">•</span>
                      Alert: Q2 budget exceeded by 8%
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Input*/}
            <div className="p-5 border-t border-zinc-800 bg-[#18181b] flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about tasks, budget, or team updates..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-[#27272a] border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                />
                <Button
                  className="bg-violet-600 hover:bg-violet-700 px-4"
                  onClick={() => {
                    console.log("AI Query:", input);
                    setInput("");
                  }}
                >
                  <Send size={18} />
                </Button>
              </div>
              <p className="text-[10px] text-center text-zinc-500 mt-2">
                AI can see current dashboard context
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
