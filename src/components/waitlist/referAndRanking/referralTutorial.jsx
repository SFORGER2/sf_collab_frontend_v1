import { PageTour } from "@/components/cosmos/PageTour";
import { PROMISE_STEP } from "@/components/cosmos/tours";
import { Coins, Link2, Trophy, Users } from "lucide-react";

/**
 * Referral walkthrough — the last react-joyride tour, now on the shared engine.
 */
const REFERRAL_TOUR = [
  {
    icon: Link2,
    eyebrow: "Your link",
    title: "One link, tracked forever.",
    body:
      "Share your referral link anywhere. Anyone who joins through it is permanently attributed to you — there is no window that expires.",
  },
  {
    icon: Users,
    eyebrow: "Who to invite",
    title: "Invite people who build.",
    body:
      "The reward lands when your referral completes their first real contribution, not on signup. That keeps the ecosystem full of people who actually do the work.",
  },
  {
    icon: Coins,
    eyebrow: "What you earn",
    title: "SF Coins, and standing.",
    body:
      "Every qualifying referral pays SF Coins you can spend in the store or stake in draws, and moves you up the referral leaderboard.",
    cta: { label: "See the leaderboard", to: "/leaderboard" },
  },
  {
    icon: Trophy,
    eyebrow: "Compounding",
    title: "Your network becomes your advantage.",
    body:
      "People you bring in are people you can build with later. The strongest teams here started as referral chains.",
  },
  PROMISE_STEP,
];

export default function ReferralTutorial() {
  const role = (() => {
    try { return localStorage.getItem("activeRole") || "member"; } catch { return "member"; }
  })();
  return <PageTour tourKey="referral" role={role} steps={REFERRAL_TOUR} />;
}
