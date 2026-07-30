import { PageTour } from "@/components/cosmos/PageTour";
import { AI_TOOLS_TOUR } from "@/components/cosmos/tours";

/** AI suite walkthrough — explains shared context and credit pricing. */
export default function AITutorial() {
  const role = (() => {
    try { return localStorage.getItem("activeRole") || "member"; } catch { return "member"; }
  })();
  return <PageTour tourKey="ai-tools" role={role} steps={AI_TOOLS_TOUR} />;
}
