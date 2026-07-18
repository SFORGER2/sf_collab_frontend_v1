import PropTypes from "prop-types";

export default function AIEnrichedBadge({ aiEnriched }) {
  const isEnriched = Boolean(aiEnriched);

  return (
    <span
      data-testid="ai-enriched-badge"
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${
        isEnriched
          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
          : "bg-gradient-to-r from-slate-500 to-slate-600"
      }`}
    >
      {isEnriched ? "AI Verified" : "Recently Added"}
    </span>
  );
}

AIEnrichedBadge.propTypes = {
  aiEnriched: PropTypes.bool.isRequired,
};
