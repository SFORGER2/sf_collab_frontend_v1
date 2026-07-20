import { BsDatabaseFillDown, BsFilePdf, BsStars } from "react-icons/bs";
import { FaMagic } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { RiAiGenerate2, RiGeminiFill } from "react-icons/ri";

export const aiFeatures = [
    {
      id: 1,
      type: "Images",
      description: "Generate images from text prompts",
      icon: <BsStars size={23}/>,
      href: "/multimodal-images",
      label: "Multimodal AI (coming soon)"
    },
    // {
    //   id: 2,
    //   type: "Images",
    //   description: "Edit and enhance your images",
    //   icon: <RiAiGenerate2 size={23}/>,
    //   href: "/image-editor",
    //   label: "Image editor"
    // },
    // {
    //   id: 2,
    //   type: "Images",
    //   description: "Remove backgrounds from images",
    //   icon: <FaImage size={20} />,
    //   href: "/background-remover",
    //   label: "Background Remover"
    // },
    {
      id: 3,
      type: "Business Plans & Pitch Decks", 
      description: "Generate business plans and pitch decks",
      icon: <RiGeminiFill size={20} />,
      href: "/qwen-chat",
      label: "AI Chat / Business plan generator / Pitch deck creator"
    },
    // {
    //   id: 5,
    //   type: "Images",
    //   description: "Convert photos to anime style",
    //   icon: <FaMagic size={20} />,
    //   href: "/anime-converter",
    //   label: "Anime Converter (coming soon)"
    // },
    {
      id: 4,
      type: "Documents",
      description: "Sign PDF documents digitally",
      icon: <BsFilePdf size={20} />,
      href: "/pdf-signing",
      label: "PDF Signing"
    },
    {
      id: 5,
      type: "Data",
      description: "Extract data from websites",
      icon: <BsDatabaseFillDown size={23}/>,
      href: "/data-scraper",
      label: "Data scraper (coming soon)"
    }
  ];