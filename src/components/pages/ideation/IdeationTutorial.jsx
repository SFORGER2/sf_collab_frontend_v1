import { isUserProfileComplete } from "@/utils/getUserComplete";
import { Rocket } from "lucide-react";
import { useState } from "react";
import Joyride from "react-joyride";
import { useSelector } from "react-redux";

export default function IdeationTutorial({ activeRole }) {
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(localStorage.getItem("visionTutorialCompleted") === "true" || false);
  const { user } = useSelector((state) => state.auth);
  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Welcome to SF Idea Incubator!
          </h2>
          <p>
            The Idea Hub is where startup ideas are shared, explored, and built. Founders, builders, and investors can collaborate, validate concepts, and turn ideas into real projects.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".create-idea",
      content: "Here you can share a new idea. Click this button to start sharing your innovative concepts with the community.",
    },
    {
      target: ".idea",
      content: "Each card represents an idea shared by the community. Click on a card to view details, provide feedback, or join as a collaborator. You can filter and search for ideas that match your interests and expertise.",
      placement: "right"
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Ready to Build? 🚀
          </h2>
          <p>
            The Idea Hub is your launchpad for creativity and collaboration. Dive in, explore ideas, connect with like-minded innovators, and let's build the future together!
          </p>
        </div>
      ),
      disableBeacon: true,
    }
    
  ];
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem("visionTutorialCompleted", "true");
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
      />
    </>
  );
}
