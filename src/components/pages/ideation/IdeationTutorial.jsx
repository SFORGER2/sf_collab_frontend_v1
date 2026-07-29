import { PageTour } from "@/components/cosmos/PageTour";
import { visionTour } from "@/components/cosmos/tours";

/**
 * Visions page walkthrough.
 *
 * Was a react-joyride tour with generic copy and unthemed buttons. Now a
 * role-aware script rendered by the shared PageTour — a builder is told how to
 * find work, a founder how to start, an investor what the signals mean.
 */
export default function IdeationTutorial({ activeRole = "member" }) {
  return <PageTour tourKey="vision" role={activeRole} steps={visionTour(activeRole)} />;
}
