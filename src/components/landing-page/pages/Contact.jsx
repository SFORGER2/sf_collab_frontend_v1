import React, { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import gsap from "gsap";
import MediaLinks from "../../../utils/MediaLinks";
import NavBar from "../Navbar";
import Footer from "../Footer";
import ContactForm from "../../pages/ContactForm";

const Contact = () => {
  const main = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-animate",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.2,
        }
      );
    }, main);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={main} className="landing-page bg-[#0b0b0b] text-white py-20 px-6 lg:px-20">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-16 contact-animate">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 bg-linear-to-r from-gray-400 to-black bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-lg">
              Have a project in mind or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="contact-animate">
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Details</h2>
                <div className="space-y-4 text-gray-300">
                  <p className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href="mailto:sfcollab333@gmail.com" className="hover:text-white transition">
                      sfcollab333@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-animate">
                <h2 className="text-2xl font-semibold text-white mb-4">Follow Us</h2>
                <div className="flex items-center gap-6">
                  <MediaLinks />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-animate">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Contact;
