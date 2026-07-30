import { PageTour } from "@/components/cosmos/PageTour";
import { POSTS_TOUR } from "@/components/cosmos/tours";

/** Community feed walkthrough. */
export default function PostsTutorial() {
  const role = (() => {
    try { return localStorage.getItem("activeRole") || "member"; } catch { return "member"; }
  })();
  return <PageTour tourKey="posts" role={role} steps={POSTS_TOUR} />;
}
