export default function MessageBox({ value, onChange, onSend, loading }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">Your Message</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a personalized message..."
        className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                  text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 
                  hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </button>
    </div>
  );
}