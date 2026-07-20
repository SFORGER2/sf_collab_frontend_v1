import { motion } from "framer-motion";
import {

  Eye,

  Grid3X3,
} from "lucide-react";

export default function MultiImageGrid({ images, onImageClick }) {
  const getGridClass = (count) => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2 gap-1";
      case 3:
        return "grid-cols-2 gap-1";
      case 4:
        return "grid-cols-2 gap-1";
      default:
        return "grid-cols-3 gap-1";
    }
  };

  const renderImages = () => {
    const imageCount = images.length;

    if (imageCount === 1) {
      return (
        <div
          className="relative group cursor-pointer"
          onClick={() => onImageClick(images[0])}
        >
          <img
            src={images[0]}
            alt="Post content"
            className="w-full h-auto max-h-[500px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white">
              <Eye size={20} />
              <span className="text-sm font-medium">View Full</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`grid ${getGridClass(
          imageCount
        )} rounded-xl overflow-hidden`}
      >
        {images.slice(0, 9).map((image, index) => (
          <div
            key={index}
            className={`relative group cursor-pointer ${
              imageCount === 3 && index === 0 ? "col-span-2 row-span-2" : ""
            } ${imageCount === 4 ? "aspect-square" : ""}`}
            onClick={() => onImageClick(image)}
          >
            <img
              src={image}
              alt={`Post content ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {imageCount > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  +{imageCount - 4}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      {images.length > 1 && (
        <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm rounded-full p-2">
          <Grid3X3 size={16} className="text-white" />
        </div>
      )}
      {renderImages()}
    </div>
  );
};