import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight
} from "lucide-react";

import { Button } from "../../ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Badge } from "../../ui/badge";
// Media Viewer Sheet Component
export default function MediaViewerSheet({
  mediaUrl,
  mediaType,
  trigger,
  isMultiImage = false,
  images = [],
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isMultiImage && images.length > 0) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          style={{ zIndex: 999999999 }}
          side="bottom"
          className="h-[90vh] bg-black/25 backdrop-blur-xl border-white/10"
        >
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <ShinyText>Media Preview</ShinyText>
              <Badge
                variant="outline"
                className="border-blue-300/50 text-blue-300 bg-blue-500/10"
              >
                {currentImageIndex + 1} / {images.length}
              </Badge>
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-full relative">
            <img
              src={images[currentImageIndex]}
              alt={`Gallery ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg"
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/20"
                  onClick={() =>
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + images.length) % images.length
                    )
                  }
                  disabled={images.length <= 1}
                >
                  <ChevronRight size={24} className="rotate-180 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/20"
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev + 1) % images.length)
                  }
                  disabled={images.length <= 1}
                >
                  <ChevronRight size={24} className="text-white" />
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[95vh] bg-black/95 backdrop-blur-xl border-white/10"
      >
        <SheetHeader>
          <SheetTitle className="text-white">
            <ShinyText>Media Preview</ShinyText>
          </SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-center h-full">
          {mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt="Full preview"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="max-h-full max-w-full rounded-lg"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
