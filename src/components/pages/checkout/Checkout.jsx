// Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {useCheckout, PaymentElement, CheckoutProvider} from '@stripe/react-stripe-js/checkout';

import {
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { API_URL, STRIPE_PUBLIC_KEY } from "@/utils/config";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

function CheckoutForm({ clientSecret }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Payment confirmation handled via Stripe-hosted page
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
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {loading ? "Processing..." : "Complete Payment"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();

  const { tierId } = useParams();
  const { user, access_token } = useSelector((state) => state.auth);

  const [tier, setTier] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTier() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/payments/plans/${tierId}`);
        setTier(res.data);

        // Set default option if available
        if (res.data.options?.length > 0) setSelectedOption(res.data.options[0]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tier details");
      } finally {
        setLoading(false);
      }
    }
    fetchTier();
  }, [tierId]);

  const handleCheckout = async () => {
    if (!tier || !user) return;

    try {
      const payload = {
        priceId: tier.stripe_price_id,
        user_id: user.id,
        id: tier.id,
        title: tier.title,
        description: tier.description,
        currency: tier.currency || "usd",
        features: tier.features,
        price: tier.price,
        option: selectedOption, 
        type: tierId.includes("crowdfunding") ? "crowdfunding" : "subscription"
      };
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/payments/create-checkout-session`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Redirect to Stripe-hosted checkout
      window.location.href = response.data.url;
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate checkout");
    }
  };

  // if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!tier) return <div className="text-center mt-20">Tier not found</div>;
  if (!tierId.includes("crowdfunding") && !tierId.includes("donations")) {
    navigate("/crowdfunding");
    return (
      <div className="text-center mt-20">At the moment, we are only accepting crowdfunding and donations</div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8 flex flex-col items-center">
      {/* Tier Info */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-7xl text-center mb-10 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">{tier.title}</h1>
        <p className="text-slate-300 mb-4">{tier.description}</p>
        <p className="text-2xl font-semibold mb-4">
          {(tier.price / 100).toFixed(2)} {tier.currency?.toUpperCase()}
        </p>

        {/* Options Selection */}
        {tier.options?.length > 0 && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-blue-300">Choose your option</h2>
            <select
              value={selectedOption?.title || ""}
              onChange={(e) =>
                setSelectedOption(
                  tier.options.find((o) => o.title === e.target.value)
                )
              }
              className="w-full bg-slate-800 border-2 border-blue-400 text-white p-3 rounded-lg focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/50 cursor-pointer hover:border-blue-300 transition"
            >
              {tier.options.map((opt) => (
                <option key={opt.title} value={opt.title}>
                  {opt.title} • {opt.duration_months > 0 ? `${opt.duration_months} months` : "Lifetime"} - {opt.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Features */}
        <ul className="text-left text-slate-300 mb-4 space-y-1">
          {(tier.options.find(opt => opt.title === selectedOption?.title)?.features || tier.features).map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={handleCheckout}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition"
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>

      {/* Stripe Payment Form */}
      {clientSecret && (
        <CheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </CheckoutProvider>
      )}
    </div>
  );
}