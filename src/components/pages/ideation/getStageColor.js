export const getStageColor = (stage) => {
    const colors = {
      "Idea Stage": "bg-blue-500/20 text-blue-400",
      "Concept Stage": "bg-amber-500/20 text-amber-400",
      "Development Stage": "bg-green-500/20 text-green-400",
      "Research Stage": "bg-purple-500/20 text-purple-400",
      "MVP Stage": "bg-red-500/20 text-red-400",
    };
    return colors[stage] || "bg-gray-500/20 text-gray-400";
  };