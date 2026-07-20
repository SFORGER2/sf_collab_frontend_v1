export default function AuthorProfile() {
  return (
    <div className="min-h-screen bg-[#05070F] text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex-shrink-0" />

          <div>
            <h1 className="text-5xl font-semibold tracking-tighter mb-2">Alex Thompson</h1>
            <p className="text-blue-400 text-xl mb-6">Founding Engineer @ SF Startup OS</p>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              Passionate about building tools that help founders move faster and with more confidence.
            </p>

            <div className="mt-10">
              <h3 className="uppercase text-xs tracking-widest text-gray-400 mb-6">Latest Articles</h3>
              {/* Article lists */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}