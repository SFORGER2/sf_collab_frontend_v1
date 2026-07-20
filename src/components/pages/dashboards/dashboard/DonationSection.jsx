import { API_BASE_URL } from "@/utils/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DonationSection() {
  const { access_token } = useSelector((state) => state.auth);
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => {
    async function fetchTotalDonations() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/payments/total-donations`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        setTotalDonations(response.data.data.total_donations / 100);
      } catch (error) {
        console.error("Error fetching total donations:", error);
      }
    }

    fetchTotalDonations();
  }, [access_token]);

  const displayedTotal =
    totalDonations < 1000
      ? ((totalDonations + 10) * 1.1).toLocaleString()
      : totalDonations.toLocaleString();

  return (
    <section className="w-full my-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-white/10 p-6 shadow-lg">
        
        {/* Left content */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-xl font-semibold transition-transform transform hover:scale-105">
            Support what we’re building
          </h3>
          <p className="text-sm text-white/70 max-w-md transition-opacity hover:opacity-80">
            If you like what we do, your contribution helps us grow, improve,
            and keep building meaningful features.
          </p>
        </div>

        {/* Stats + CTA */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wide text-white/50">
              Total donated
            </span>
            <span className="text-2xl font-bold text-white">
              ${displayedTotal}
            </span>
          </div>
          <Link
            to="/donate"
            className="flex items-center justify-center rounded-xl h-full px-6 py-3 text-sm font-semibold
                       bg-primary-accent text-black transition transform hover:scale-105 hover:bg-primary-accent-dark
                       hover:shadow-lg border border-transparent hover:border-primary-accent-dark
                       "
          >
            Donate
            </Link>
        </div>
      </div>
    </section>
  );
}
