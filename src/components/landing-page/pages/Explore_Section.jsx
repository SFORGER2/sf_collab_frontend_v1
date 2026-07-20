import React from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";

const Products = () => {
  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0,
      rotate: -10
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    })
  };

  const title = "UPCOMING";

  return (
    <>
      <Navbar />
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-[#0b0b0b]"
      >
        <div className="bg-[#0b0b0b] text-white relative overflow-hidden min-h-screen flex items-center justify-center">
          {/* Floating blobs */}
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-indigo-600/30 to-purple-700/30 rounded-full blur-3xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1,
                scale: 1,
                y: [0, 30, 0]
              }}
              transition={{ 
                opacity: { duration: 1 },
                scale: { duration: 1 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-pink-600/20 to-blue-600/20 rounded-full blur-3xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1,
                scale: 1,
                y: [0, -30, 0]
              }}
              transition={{ 
                opacity: { duration: 1, delay: 0.3 },
                scale: { duration: 1, delay: 0.3 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </div>

          {/* Coming Soon Content */}
          <div className="text-center px-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex justify-center">
              {title.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </h1>

            <motion.p 
              className="text-gray-400 text-lg md:text-xl max-w-md mx-auto"
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              Explore page coming soon. Stay tuned!
            </motion.p>

            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mt-8"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "200px", opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            />
          </div>
        </div>
      </motion.section>
      <Footer />
    </>
  );
};

export default Products;
