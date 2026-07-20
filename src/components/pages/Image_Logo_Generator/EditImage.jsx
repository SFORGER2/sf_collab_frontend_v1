import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "../../ui/button";
import { backgrounds } from "./background";
import { toast } from "react-toastify";
export default function EditImage({
  sloganDesigns,
  image,
  formData }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
    const wrapperRef = useRef(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [bgColor, setBgColor] = useState("transparent");
  const [colorMode, setColorMode] = useState("background");
  // Init canvas
  useEffect(() => {
  if (!canvasRef.current || !wrapperRef.current) return;

  const canvas = new fabric.Canvas(canvasRef.current, {
    preserveObjectStacking: true
  });

  fabricRef.current = canvas;

  const resize = () => {
    const size = wrapperRef.current.offsetWidth;
    const margin = 20;

    canvas.setDimensions({ width: size - margin, height: size - margin });

    canvas.calcOffset();

    // Recenter objects
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "image") {
        obj.scaleToWidth((size - margin) * 0.5);
        obj.set({
          left: (size - margin) / 2,
          top: (size - margin) / 2,
          originX: "center",
          originY: "center"
        });
      }
    });

    canvas.requestRenderAll();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(wrapperRef.current);

  resize(); // initial sizing

  return () => {
    observer.disconnect();
    canvas.dispose();
  };
}, []);
useEffect(() => {
  const canvas = fabricRef.current;
  if (!canvas || !image?.base64) return;

  // Remove old images
  canvas.getObjects("image").forEach(obj => canvas.remove(obj));

  const src = image.base64.startsWith("data:")
    ? image.base64
    : `data:image/png;base64,${image.base64}`;

  fabric.Image.fromURL(src).then((img) => {
    const size = canvas.getWidth();

    img.scaleToWidth(size * 0.5);
    img.set({
      selectable: true,
      evented: true,
      originX: "center",
      originY: "center",
      left: size / 2,
      top: size / 2
    });

    canvas.add(img);
    canvas.sendToBack(img);
    canvas.requestRenderAll();
  });

}, [image]);


  // Update background
useEffect(() => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.backgroundColor = bgColor === "transparent" ? null : bgColor;
  canvas.requestRenderAll();
}, [bgColor]);

// Apply typography variant
const applyVariant = (variant) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.getObjects("textbox").forEach(obj => canvas.remove(obj));

  let textValue = formData.subtitle;
  if (variant.text_case === "uppercase") {
    textValue = textValue.toUpperCase();
  } else if (variant.text_case === "title") {
    textValue = textValue.replace(
      /\w\S*/g,
      w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
  }

  const text = new fabric.Textbox(textValue, {
    fontFamily: variant.font_family,
    fontWeight: variant.font_weight,
    charSpacing: Number(variant.letter_spacing),
    textAlign: variant.alignment,
    fill: "#ffffff",
    fontSize: 28,
    editable: true,
    originX: "center",
    originY: "center",
    left: canvas.width / 2,
    top: variant.placement === "below" ? 360 : 280
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.requestRenderAll();

  setActiveVariant(variant);
};


  // Export final image
  const exportImage = () => {
    const dataURL = fabricRef.current.toDataURL({
      format: "png",
      multiplier: 2
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${formData.company_name}_logo.png`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Canvas */}
      <div
        ref={wrapperRef}
        className="bg-neutral-900 p-4 aspect-square rounded-xl border border-neutral-700 w-full h-full flex flex-col items-center">
        <canvas ref={canvasRef} />

        <div className="flex gap-2 mt-4">
          <Button onClick={exportImage} className="w-full">
            Export Image
          </Button>
        </div>
</div>

{/* Controls */}
<div className="space-y-4 h-full overflow-y-auto pr-2">
        <h4 className="text-lg font-semibold text-white">Typography Variants</h4>

        {sloganDesigns?.map((variant, idx) => (
          <button
            key={idx}
            onClick={() => applyVariant(variant)}
            className={`w-full p-4 rounded-lg border text-left ${activeVariant === variant
                ? "border-cyan-400 bg-neutral-800"
                : "border-neutral-700 bg-neutral-900"
              }`}
          >
            <p
              style={{
                fontFamily: variant.font_family,
                fontWeight: variant.font_weight,
                letterSpacing: `${variant.letter_spacing / 1000}em`
              }}
              className="text-white whitespace-pre-wrap break-words"
            >
              {formData.subtitle}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{variant.mood}</p>
          </button>
        ))}

        <div className="mt-6">
          <div className="mb-6 ">

          {["background", "font"].map((mode) => (
    <button
  key={mode}
  onClick={() => setColorMode(mode)}
  className={`
    px-4 py-2 mx-1 my-2 rounded-lg border font-medium text-sm
    transition-colors duration-200 ease-in-out
    ${colorMode === mode 
      ? "border-cyan-400 bg-cyan-600 text-white shadow-md" 
      : "border-neutral-700 bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white"}
  `}
>
  {mode.charAt(0).toUpperCase() + mode.slice(1)}
</button>
  ))}
          
          <div className="flex gap-2 flex-wrap h-full">
            {backgrounds.map((c, idx) => (
              <button
                key={idx}
                onClick={() => {
                
              if (colorMode === "background") {
                setBgColor(c)
              }
              else if (colorMode === "font" && fabricRef.current) {
                const canvas = fabricRef.current;
                
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.type === "textbox") {
                  activeObject.set("fill", c);
                  canvas.requestRenderAll();
                } else {
                  toast.error("Please insert the text box first by selecting a color variant.");
                }
              }
              else if (colorMode === "logo" && fabricRef.current) {
  const canvas = fabricRef.current;
  canvas.getObjects("image").forEach(img => {
    img.set({ tint: c }); // simple color overlay
  });
  canvas.requestRenderAll();
}
            }
            }
                
                className="w-8 h-8 rounded border border-neutral-600"
                style={{ backgroundColor: c === "transparent" ? "#444" : c }}
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
