import Footer from "../Footer";
import Roadmap from "../Home/Roadmap";
import Navbar from "../Navbar";

export default function ImplementationPlans() {
  return (
    <div className="landing-page bg-[#0b0b0b] min-h-screen">
      <Navbar />
      <div className="relative z-10 h-[200vh] pt-10 pb-400">
        <Roadmap />
      </div>
    </div>
  );
}