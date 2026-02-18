import { useEffect } from "react";
import "./loader.css";
export default function Loader() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <div className="loader-bg relative bg-black indent-0 flex justify-center items-center h-screen w-screen z-9999999999999">
      <img loading="lazy" src="/loader.gif" alt="Loading..." className="absolute inset-0 w-screen h-screen" />
  
    </div>

    // <div className="loader"></div>
  );
}