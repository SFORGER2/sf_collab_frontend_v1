export const getStageColor = (stage) => {
  if (!stage) return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
  const s = stage.toLowerCase();
  if (s.includes("idea")) return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  if (s.includes("concept")) return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  if (s.includes("dev") || s.includes("prototype")) return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (s.includes("research")) return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
  if (s.includes("mvp") || s.includes("launch")) return "bg-red-500/20 text-red-400 border border-red-500/30";
  return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
};

export const getCategoryColor = (category) => {
  if (!category) return "border-gray-500/20 bg-gray-500/10 text-gray-300";
  const cat = category.toLowerCase();
  if (cat.includes("web3") || cat.includes("crypto") || cat.includes("blockchain")) {
    return "border-purple-500/30 bg-purple-500/10 text-purple-300";
  }
  if (cat.includes("ai") || cat.includes("ml") || cat.includes("intelligence") || cat.includes("deeptech")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (cat.includes("saas") || cat.includes("software") || cat.includes("b2b")) {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
  return "border-blue-500/20 bg-blue-500/10 text-blue-300";
};