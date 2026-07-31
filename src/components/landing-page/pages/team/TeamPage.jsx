
import Footer from "../../Footer";
import Navbar from "../../Navbar";
import TeamComponent from "./TeamComponent";
import { motion } from "framer-motion";
export default function TeamPage() {
  return (
    <>
      <Navbar />
      <motion.div className="landing-page bg-[#0b0b0b] text-white px-6 lg:px-20">
        <TeamComponent />
    </motion.div>
    
    <Footer />
    </>
  );
};
