import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider, useCheckout, PaymentElement } from '@stripe/react-stripe-js/checkout';
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { API_URL, STRIPE_PUBLIC_KEY } from "@/utils/config";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

// filepath: /Users/ivandavidgomezsilva/Documents/Ivan/Trabajos/SFORGER/SForger_data/SFRepos/sf_collab_frontend_v1/src/components/pages/donate/Donate.jsx

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;
function DonateCheckoutForm({ clientSecret, donationAmount, donorInfo }) {
  const checkoutState = useCheckout();
  const { user, access_token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (checkoutState.type === 'loading') {
      return;
    } else if (checkoutState.type === 'error') {
      toast.error(`Error: ${checkoutState.error.message}`);
      setLoading(false);
      return;
    }

    try {
      const { checkout } = checkoutState;
      const result = await checkout.confirm({
        redirect: 'always',
        email: donorInfo.email || user?.email,
        billingAddress: checkoutState.billingAddress,
      });

      if (result.type === 'error') {
        toast.error(`Payment failed: ${result.error.message}`);
      } else {
        toast.success("Thank you for your generous donation!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during payment processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Payment Details
        </label>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
          <PaymentElement />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
      >
        {loading ? "Processing..." : `Donate ${donationAmount}`}
      </Button>
    </form>
  );
}

export default function Donate() {
  const { user, access_token } = useSelector((state) => state.auth);
  const [donationAmount, setDonationAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: user?.name ? user.name : `${user?.firstName} ${user?.lastName}`,
    email: user?.email || "",
    message: "",
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("amount"); // "amount" | "payment"

  const presetAmounts = [10, 25, 50, 100, 250, 500];
  const finalAmount = customAmount ? parseInt(customAmount) : donationAmount;

const handleDonateClick = async () => {
  if (!donorInfo.email || !donorInfo.name) {
    toast.error("Please provide your name and email.");
    return;
  }

  setLoading(true);
  console.log("Sending:", {
        amount: finalAmount * 100,
        name: donorInfo.name,
        email: donorInfo.email,
        message: donorInfo.message,
        type: "donation"
      });
  try {
    const response = await axios.post(
      `${API_URL}/payments/create-donation-session`,
      {
        amount: finalAmount * 100,
        name: donorInfo.name,
        email: donorInfo.email,
        message: donorInfo.message,
        type: "donation"
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // 🔥 Redirect to Stripe-hosted checkout
    window.location.href = response.data.url;

  } catch (err) {
    console.error(err);
    toast.error("Failed to start checkout.");
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 sm:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Support Our Mission
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Your generous donation helps us continue building amazing tools and services for our community.
          </p>
        </motion.div>

        {step === "amount" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Donation Amount Selection */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6">Select Donation Amount</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {presetAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDonationAmount(amount);
                      setCustomAmount("");
                    }}
                    className={`p-4 rounded-lg font-semibold transition-all border-2 ${
                      donationAmount === amount && !customAmount
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-800/50 border-white/10 text-slate-300 hover:border-red-500/50'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Custom Amount
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-4 bg-slate-800/50 border border-white/10 rounded-lg text-slate-300">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setDonationAmount(50);
                    }}
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Donor Information Form */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Your Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={donorInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={donorInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  placeholder="Share why you're supporting us..."
                  rows={4}
                  value={donorInfo.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                />
              </div>

              <Button
                onClick={handleDonateClick}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Processing..." : `Continue to Payment - $${finalAmount}`}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl mb-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-slate-400 text-sm">Donation Amount</p>
                  <p className="text-3xl font-bold text-white">${finalAmount}</p>
                </div>
                <button
                  onClick={() => setStep("amount")}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <p>From: {donorInfo.name} ({donorInfo.email})</p>
                {donorInfo.message && <p>Message: {donorInfo.message}</p>}
              </div>
            </div>

            {clientSecret && (
              <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                <CheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <DonateCheckoutForm
                    clientSecret={clientSecret}
                    donationAmount={`$${finalAmount}`}
                    donorInfo={donorInfo}
                  />
                </CheckoutProvider>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}