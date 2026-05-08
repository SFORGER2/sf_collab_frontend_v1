import { useEffect, useState } from "react";

export default function OverviewWebsite() {
  const [accepted, setAccepted] = useState(localStorage.getItem("overviewAccepted") === "true");
  const [acceptedTempAccess, setAcceptedTempAccess] = useState(localStorage.getItem("overviewTempAccessAccepted") === "true");
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    localStorage.setItem("overviewAccepted", accepted);
  }, [accepted]);

  useEffect(() => {
    localStorage.setItem("overviewTempAccessAccepted", acceptedTempAccess);
  }, [acceptedTempAccess]);

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date("2026-03-02").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {
        countdown.days > 0 && (
        
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 border border-white/20 backdrop-blur-sm p-2">
    
            <h2 className="text-2xl font-bold text-white mb-1">
              MVP LAUNCH COUNTDOWN
            </h2>

            <p className="text-lg text-white font-semibold mb-1">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </p>


            <p className="text-sm text-white/70 leading-relaxed mb-2">
              Secure your spot now! We're limiting the initial launch to
              <span className="font-semibold"> 5-10k users</span>,
              with gradual acceptance for the rest.
              Use the contribution system to guarantee your access.
            </p>
          </div>
        )
      }
        
      
      {!accepted &&
        <div className="w-full flex flex-col items-center justify-center mb-1">
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-blue-900/30 border border-blue-500/50 backdrop-blur-sm py-3 px-6 w-full">
            <div className="rounded-lg text-center">
              <p className="text-sm bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 bg-clip-text text-transparent leading-relaxed">
                <span className="font-semibold">SFCollab is currently in active testing and early rollout.</span> Features, point values, visuals, and rewards may evolve as we refine the system — always with fairness and transparency in mind.
              </p>
            </div>
            <button
              onClick={() => setAccepted(true)}
              className="mt-3 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
              Accept
            </button>
          </div>
        </div>
      }
      {!acceptedTempAccess &&
        <div className="w-full mb-1 text-center">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/80 to-orange-500/80 border border-white/20 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-bold text-white mb-2">TEMPORARY EARLY ACCESS</h2>
            <p className="text-white/70 mb-3">Everyone has free access to Founder (Explorer) & Builder (Supporter) Pro features</p>
            <p className="text-sm text-white/60">This complimentary access will reset when V1 launches</p>
            <button
              onClick={() => setAcceptedTempAccess(true)}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200">
              Accept
            </button>
          </div>
        </div>
      }
    </>
  );
}