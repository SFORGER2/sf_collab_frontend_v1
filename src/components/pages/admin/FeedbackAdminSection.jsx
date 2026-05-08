import InfiniteList from "@/components/InfiniteList";

export default function AdminFeedbackSection({
  feedback,
  feedbackFilter,
  setFeedbackFilter,
  feedbackRef,
  loadingFeedback,
  users,
  handleGivePointsPopup
}) {
    
  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">💬 Feedback</h2>
            <input
              type="text"
              placeholder="Filter feedback..."
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition"
            />
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              <InfiniteList items={feedback} renderItem={(item) => (
                <li
                  key={item.id}
                  className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition backdrop-blur"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-blue-300">
                      User ID: {item.userId}
                    </div>
                  
    
                    <button
                      onClick={() => {
                        handleGivePointsPopup(item);
                      }}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
                    >
                      + Give Points 
                    </button>
                  </div>

                  <p className="text-gray-100">User: {users.find(u => u.id === item.userId)?.fullName}</p>
                  <p className="text-gray-100 whitespace-pre-wrap break-words">{item.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleDateString()} •{' '}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </li>

              )} sentinelRef={feedbackRef} loading={loadingFeedback} />
            </ul>
          </div>
  )

}