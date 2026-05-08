import { isUserProfileComplete } from "@/utils/getUserComplete";
import { Rocket } from "lucide-react";
import { useState } from "react";
import Joyride from "react-joyride";
import { useSelector } from "react-redux";

export default function AITutorial() {
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
            Welcome to SF AI Tools!
          </h2>
          <p>
            The AI Tools suite is where you can leverage artificial intelligence to build, design, analyze, and scale your projects. Founders, builders, and investors can collaborate using AI-powered intelligence.

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

          <p>
            These tools are under active development and will be expanding rapidly, so stay tuned for new features and capabilities. You can also use your AI credits to access various tools and features within the suite. Let's get started!

          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".ai-tool",
      content: "Each card represents a different AI-powered tool available in the suite. Click on a card to access the tool and start leveraging AI for your projects. Some tools may require credits to use, which you can find in the next step.",
      placement: "right"
    },
    {
      target: ".credits",
      content: "This section shows your available AI credits. You can use these credits to access various AI-powered tools and features.",
      placement: "bottom"
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Ready to Explore AI? 🚀
          </h2>
          <p>
            The AI Tools suite is your launchpad for creativity and collaboration. Dive in, explore AI-powered features, connect with like-minded innovators, and let's build the future together!
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