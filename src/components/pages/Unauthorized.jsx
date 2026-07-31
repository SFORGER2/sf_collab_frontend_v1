export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-gray-900">
      <div className="text-center p-8 rounded-xl bg-black/60 border border-red-700 shadow-lg">
        <h1 className="text-4xl font-bold text-red-400 mb-4">🚫 Access Denied</h1>
        <p className="text-slate-300 mb-6">
          You are not authorized to view this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
