import { isUserProfileComplete } from "@/utils/getUserComplete";
import { useState } from "react";
import Joyride from "react-joyride";
import { useSelector } from "react-redux";

export default function ReferralTutorial() {
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(
    localStorage.getItem("referralTutorialCompleted") === "true" || false
  );
  const { user } = useSelector((state) => state.auth);
  localStorage.setItem("referralTutorialCompleted", "false");

  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Welcome to SF Referral & Rankings! 🚀
          </h2>
          <p>
            Climb the ranks by referring friends and contributing to the SFCollab community. Earn exclusive rewards, unlock prestige badges, and gain lifetime discounts!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            How Rankings Work
          </h2>
          <p>
            Your rank is determined by total points earned through referrals, contributions, and community activity. Higher ranks unlock better rewards and exclusive perks.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".stats",
      content: "Track your progress here! Your current rank, total points, and referral earnings are displayed across these stats cards.",
      placement: "bottom",
    },
    {
      target: ".share",
      content: "Use these buttons to share your referral link with friends. Copy the link or use your device's native sharing feature to invite others.",
      placement: "bottom",
    },
    {
      target: ".ranking",
      content: "This section shows the current leaderboard. See how you stack up against other members and get inspired to climb higher, higher ranks unlock better rewards!",
      placement: "top",
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Earn Points & Climb Ranks 📈
          </h2>
          <p>
            Refer friends, submit ideas, participate in polls, and contribute to the community. Every action brings you closer to exclusive rewards!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Ready to Compete? 🏆
          </h2>
          <p>
            Start referring, contributing, and engaging with the community. Watch your rank climb and unlock exclusive rewards. Let's build the future together!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem("referralTutorialCompleted", "true");
      setIsTutorialCompleted(true);
    }
  };

  const isProfileComplete = isUserProfileComplete(user);
  if (isTutorialCompleted || !isProfileComplete) return null;

  return (
    <Joyride
      steps={steps}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      disableCloseOnEsc={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 1000000000,
          backgroundColor: "#0f172a",
          textColor: "#e2e8f0",
          primaryColor: "#3b82f6",
          borderRadius: "16px",
          width: "320px",
          fontFamily: "inherit",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        },
        beacon: {
          inner: "bg-blue-500",
          outer: "border-2 border-blue-400",
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          color: "#fff",
          borderRadius: "8px",
        },
        buttonBack: {
          color: "#94a3b8",
        },
        buttonSkip: {
          color: "#64748b",
        },
      }}
    />
  );
}