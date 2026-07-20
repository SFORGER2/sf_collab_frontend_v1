import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

export default function InputArea({
  input,
  setInput,
  handleSubmit,
  loading,
  error,
}) {
  return (
    <div className="relative z-10 p-6 border-t border-gray-700/50">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <Alert className="bg-red-900/20 border-red-700/50">
            <AlertDescription className="text-red-200 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
                    
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-500 focus:border-blue-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
                    
        <p className="text-xs text-gray-500 flex items-center justify-between">
          <span>Press Shift+Enter for new line</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ready
          </span>
        </p>
      </form>
    </div>
  );

};