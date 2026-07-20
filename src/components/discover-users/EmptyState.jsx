export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
        <UserPlus className="w-10 h-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No more users to discover</h3>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        You've swiped through all available users. Check back later for more connections!
      </p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        className="border-gray-600 text-gray-300"
      >
        Refresh Page
      </Button>
    </motion.div>
  );
}