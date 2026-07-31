// src/components/pages/Pricing.jsx
import React from "react";
import NavBar from "../landing-page/Navbar";
import Footer from "../landing-page/Footer";

const Pricing = () => {
  return (
    <>
      <NavBar />
      <div className="landing-page bg-[#0b0b0b] text-white relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Floating blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-indigo-600/30 to-purple-700/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-pink-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Coming Soon Content */}
        <div className="text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            UPCOMING
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto">
            We're crafting the perfect pricing plans for you. Stay tuned!
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pricing;
