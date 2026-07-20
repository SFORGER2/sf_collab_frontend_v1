import { motion } from "framer-motion";
import { ImageIcon, Download, Sparkles, Palette } from "lucide-react";
import { Button } from "../../ui/button";
import { useState } from "react";
import EditImage from "./EditImage";

export default function OutputSection({
  formData,
  logos,
  setLogos,
  sloganDesigns
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const downloadLogo = (base64, index) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = `${formData.company_name
      .replace(/\s+/g, "_")
      .toLowerCase()}_logo_${index + 1}.png`;
    link.click();
  };

  // Group logos by variant (future-proof)
  const groupedByVariant = logos.reduce((acc, logo) => {
    const key = logo.variant || "default";
    if (!acc[key]) acc[key] = [];
    acc[key].push(logo);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="lg:col-span-1"
    >
      <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-8 shadow-2xl h-fit sticky top-8">
        
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-white mb-2">
            <ImageIcon className="h-6 w-6 text-cyan-400" />
            Generated Logos
          </h3>
          <p className="text-neutral-400 text-sm">
            AI-generated logo concepts for your brand
          </p>
        </div>

        

        {/* Company info */}
        <div className="text-center p-5 mb-8 bg-neutral-900/50 border border-neutral-700/50 rounded-xl">
          <h4 className="font-bold text-2xl text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
            {formData.company_name}
          </h4>
          {formData.subtitle && (
            <p className="text-neutral-400 text-sm mt-2">
              {formData.subtitle}
            </p>
          )}
        </div>

        {/* Variants */}
        <div className="space-y-10">
          {Object.entries(groupedByVariant).map(([variant, variantLogos]) => (
            <div key={variant} className="space-y-4">
              
              {/* Variant header */}
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                <Palette className="h-4 w-4 text-purple-400" />
                {formatVariantName(variant)}
              </div>

              {/* Logo grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {variantLogos.map((logo, index) => (
                  <motion.div
                    key={logo.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-neutral-700/50 rounded-xl bg-neutral-900/50 p-4 hover:border-neutral-600 transition"
                  >
                    <div
                      className={`rounded-lg flex items-center justify-center p-4 ${logo.background === "black"
                          ? "bg-black"
                          : logo.background === "gradient"
                            ? "bg-linear-to-br from-slate-700 to-slate-900"
                            : "bg-white"
                        }`}
                    >
                      {logo.svg ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: logo.svg }}
                          className="w-full h-auto"
                          style={{ backgroundColor: logo.background === "white" ? "black" : "black" }}
                        />
                      ) : (
                        <img
                          src={`data:image/png;base64,${logo.base64}`}
                          alt={`Logo ${index + 1}`}
                          className="w-full h-auto"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => downloadLogo(logo.base64, index)}
                        className="w-full mt-3 bg-linear-to-r from-green-500 to-emerald-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => setSelectedImageIndex(index)}
                        className="w-full mt-3 bg-linear-to-r border-green-500 text-green-500 from-slate-500 to-gray-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Edit Design
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Regenerate */}
        <div className="pt-8">
          <Button
            onClick={() => setLogos([])}
            variant="outline"
            className="w-full border-neutral-600 text-black"
          >
            <Sparkles className="h-4 w-4 mr-2 text-black" />
            Generate more logos
          </Button>
        </div>

        {/* Optional description */}
        {formData.logo_description && (
          <div className="mt-8 space-y-3">
            <p className="text-sm font-semibold text-neutral-300">
              Design Notes
            </p>
            <div className="p-4 bg-neutral-900/50 border border-neutral-700/50 rounded-xl max-h-48 overflow-y-auto">
              <p className="text-neutral-400 whitespace-pre-wrap text-xs leading-relaxed">
                {formData.logo_description}
              </p>
            </div>
          </div>
        )}
      </div>
      {
        selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-neutral-900/90 border border-neutral-700/50 rounded-2xl p-8 max-w-7xl max-h-[90vh] overflow-y-auto flex flex-col">
              <h3 className="text-2xl font-bold mb-4 text-white">Edit Images Amount</h3>
              {/* Edit content goes here */}
              <div className="flex-1 overflow-y-auto">
                <EditImage sloganDesigns={sloganDesigns} image={logos[selectedImageIndex]} formData={formData} />
              </div>
              <Button
                onClick={() => setSelectedImageIndex(null)}
                className="mt-4 bg-linear-to-r from-blue-500 to-purple-500 w-full"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )
      }
    </motion.div>
  );
}

/* ---------- Helpers ---------- */

function formatVariantName(variant) {
  return variant
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
