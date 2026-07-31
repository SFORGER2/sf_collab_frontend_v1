export const getStageColor = (stage) => {
  if (!stage) return "bg-slate-800/80 text-gray-300 border border-slate-700/50 font-medium";
  const s = stage.toLowerCase();
  if (s.includes("idea")) return "bg-blue-500/10 text-blue-300 border border-blue-500/25 font-medium";
  if (s.includes("concept")) return "bg-amber-500/10 text-amber-300 border border-amber-500/25 font-medium";
  if (s.includes("dev") || s.includes("prototype")) return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-medium";
  if (s.includes("research")) return "bg-purple-500/10 text-purple-300 border border-purple-500/25 font-medium";
  if (s.includes("mvp") || s.includes("launch")) return "bg-rose-500/10 text-rose-300 border border-rose-500/25 font-medium";
  return "bg-slate-800/80 text-gray-300 border border-slate-700/50 font-medium";
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