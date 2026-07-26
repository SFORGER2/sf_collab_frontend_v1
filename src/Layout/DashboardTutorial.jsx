import { isUserProfileComplete } from "@/utils/getUserComplete";
import { Rocket } from "lucide-react";
import { useState } from "react";
import Joyride from "react-joyride";
import { useSelector } from "react-redux";
import { DEV_AUTH_BYPASS } from "@/services/auth/devSession";

export default function DashboardTutorial({ activeRole }) {
  // Treat the tour as already seen under the dev bypass — otherwise it opens on
  // every reload while reviewing the UI.
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(
    DEV_AUTH_BYPASS || localStorage.getItem("tutorialCompleted") === "true" || false
  );
  const { user } = useSelector((state) => state.auth);
  // const startupStep = useMemo(() => {
  //   if (activeRole === "founder") {
  //     return {
  //       target: ".register-startup",
  //       content: "This is where you can register your startup and manage your projects, team, and resources. Showcase your startup to attract builders, investors, and collaborators in the ecosystem.",
  //     }
  //   } else if (activeRole === "builder") {
  //     return {
  //       target: "#discover-startups",
  //       content: "This is your builder dashboard, where you can discover startups to collaborate with, track your projects, and access tools to help you build.",
  //     }
  //   } else if (activeRole === "investor") {
  //     return {
  //       target: "#discover-startups",
  //       content: "This is your investor dashboard, where you can discover promising startups, track your investments, and access resources tailored for investors.",
  //     }
  //   } else if (activeRole === "influencer") {
  //     return {
  //       target: ".discover-startups",
  //       content: "This is your influencer dashboard, where you can discover startups to support, track your collaborations, and access resources tailored for influencers.",
  //     }
  //   } else {
  //     return null;
  //   }
  // }, [activeRole]);
  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Welcome to the Ecosystem 👋
          </h2>
          <p>
            This platform adapts to your role — founders, builders,
            investors and influencers each get a unique experience.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".roles",
      content: "Your account and view can be switched based on your role in the ecosystem. Founders, builders, investors, and influencers all have different dashboards tailored to their needs.",
    },
    {
      target: ".sidebar",
      placement: "right",
      content: "This is your main navigation sidebar. Access startups, ideas, social feed, tools, and more. The content here will adapt based on your role and the features available to you.",
    },
      // startupStep,
    {
      target: ".chat",
      content: "The chat feature allows you to communicate with your collaborators in real-time. You can create group chats for your projects or have one-on-one conversations.",
    },
    {
      target: "#notification-dropdown",
      content: "Here you'll find your notifications, including updates on your projects, messages, and important announcements. Stay tuned to keep up with the latest activity in your network.",
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            You can start exploring now! <Rocket className="inline-block w-6 h-6 text-blue-500" />
          </h2>
          <p>
            Explore the platform, connect with others, and start building your projects. If you need help, check out our resources or reach out to support.
          </p>
        </div>
      ),
      disableBeacon: true,
    }
    
  ];
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem("tutorialCompleted", "true");
      setIsTutorialCompleted(true);
    }
  }
  const isProfileComplete = isUserProfileComplete(user);
  if (isTutorialCompleted || !isProfileComplete) return null;
  return (
    <>
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
      // callback={handleJoyrideCallback}
      />

    </>
  );
}