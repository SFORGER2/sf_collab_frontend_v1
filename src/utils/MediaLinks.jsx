import { Instagram, Linkedin } from "lucide-react";
import { BsTiktok } from "react-icons/bs";

export default function MediaLinks() {
  return <>
  
    <a href="https://www.instagram.com/sfcollab_official/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition"><Instagram className="w-6 h-6" /></a>
    <a href="https://www.tiktok.com/@sfcollab_official" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition"><BsTiktok className="w-6 h-6" /></a>
    <a href="https://www.linkedin.com/company/sfcollab" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition"><Linkedin className="w-6 h-6" /></a>
    
  </>
}
