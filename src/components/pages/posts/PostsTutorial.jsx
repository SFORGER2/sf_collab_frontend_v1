import { isUserProfileComplete } from "@/utils/getUserComplete";
import { Rocket } from "lucide-react";
import { useState } from "react";
import Joyride from "react-joyride";
import { useSelector } from "react-redux";

export default function PostsTutorial() {
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(localStorage.getItem("aiTutorialCompleted") === "true" || false);
  const { user } = useSelector((state) => state.auth);
  localStorage.setItem("aiTutorialCompleted", "false");
  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Welcome to SF Posts!
          </h2>
          <p>
            The Posts section is where you can share updates, insights, and engage with the community. Founders, builders, and investors can collaborate, provide feedback, and stay connected with the latest happenings in the ecosystem.

          </p>
        </div>
      ),
      disableBeacon: true,
    },

    {
      target: ".feed",
      content: "This is your feed, where you can see posts from the people and projects you follow. Engage with posts by liking, commenting, and sharing your thoughts. You can also create your own posts to share updates, ask questions, or start discussions with the community.",
      placement: "bottom"
    },
    {
      target: ".create-post",
      content: "This is where you can create a new post. Share your thoughts, updates, or ask questions to the community. Posts can include text, images, and links to keep everyone informed and engaged.",
      placement: "bottom"
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Ready to Share?
          </h2>
          <p>
            The Posts section is your space to connect, share, and engage with the community. Whether you're sharing an update, asking for feedback, or starting a discussion, your voice matters. Dive in and start sharing today!
          </p>
        </div>
      ),
      disableBeacon: true,
    }
    
  ];
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem("aiTutorialCompleted", "true");
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