import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function ReturnPage() {
  const [status, setStatus] = useState("loading"); // loading | success | failed
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  const { access_token } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const donate = searchParams.get("donation") === "true";
  const sessionId = searchParams.get("session_id");
  console.log("Donation:", searchParams.get("donation"))


  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      setError("No session_id provided");
      return;
    }

    async function fetchSession() {
      try {
        const res = await axios.get(
          `${API_URL}/payments/checkout-session/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        console.log("Response:", res);
        setSession(res.data);

        if (res.data.payment_status === "paid") {
          setStatus("success");
        } else {
          setStatus("failed");
          setError("Payment not completed");
        }
      } catch (err) {
        setStatus("failed");
        setError(err.response?.data?.message || "Something went wrong");
      }
    }

    fetchSession();
  }, [sessionId, access_token]);
  const replaceDashesAndTitle = (str) => {
    if (!str) return "";
    return str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white text-lg"
        >
          Verifying payment…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-white/10 backdrop-blur-xl border border-white/20
               text-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-3xl blur-xl opacity-60" />

          <div className="relative z-10">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />

            <h1 className="text-3xl font-bold mb-2">
              {donate ? "Donation Received" : "Payment Successful"}
            </h1>

            <p className="text-gray-200 mb-6">
              {donate
                ? "Thank you for supporting SF Collab 💜"
                : "Welcome aboard — your plan is now active."}
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm mb-1">
                <span className="text-gray-400">{donate ? "Message:" : "Plan:"}</span>{" "}
                {donate ? session?.metadata?.message : replaceDashesAndTitle(session?.metadata?.plan_id) || "No plan associated"}
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Amount:</span>{" "}
                {(session?.amount_total / 100).toFixed(2)}{" "}
                {session?.currency?.toUpperCase()}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center justify-center gap-2
                   bg-gradient-to-r from-green-500 to-emerald-600
                   hover:from-green-400 hover:to-emerald-500
                   text-white font-semibold py-3 rounded-xl
                   shadow-lg shadow-green-500/30 transition-all"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-600/10 backdrop-blur-xl border border-red-500/30
                     text-white p-10 rounded-3xl shadow-xl text-center max-w-md"
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
          <p className="text-sm text-gray-200 mb-6">{error}</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/pricing")}
            className="bg-red-500 hover:bg-red-400 px-6 py-3 rounded-xl font-semibold"
          >
            Try Again
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
