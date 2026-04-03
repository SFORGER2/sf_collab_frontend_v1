import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StartUpHeader from "../headers/StartUpHeader";
import ScrollToTop from "../sections/ScrollToTop";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import {
  Users,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  ArrowUpRight,
  WifiOff,
  RefreshCw,
} from "lucide-react";

const StartUp = () => {
  const [startups, setStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [networkError, setNetworkError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // <-- Loading state added

  const getStageColor = (stage) => {
    const colors = {
      idea: "bg-yellow-600",
      seed: "bg-purple-600",
      early: "bg-green-600",
      growth: "bg-blue-600",
      scale: "bg-red-600",
    };
    return colors[stage?.toLowerCase()] || "bg-gray-600";
  };

  const fetchStartups = async () => {
    try {
      setLoading(true); // <-- Start loading
      setNetworkError(false);
      setError("");

      const res = await axios.get(
        `${API_URL}/startup`,
        {
          params: {
            page,
            limit: 12,
            industry:
              selectedIndustry !== "All Industries" ? selectedIndustry : undefined,
            stage: selectedStage !== "All Stages" ? selectedStage : undefined,
            location:
              selectedLocation !== "All Locations" ? selectedLocation : undefined,
            search: searchQuery || undefined,
          },
        }
      );

      const converted = res.data.startups.map((startup) => ({
        ...startup,
        logo: startup.logo,
        banner: startup.banner,
      }));

      setStartups(converted);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch startups:", err);
      setNetworkError(true);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [page, searchQuery, selectedIndustry, selectedStage, selectedLocation]);

  const handleRetry = () => fetchStartups();

  if (networkError) {
    return (
      <div className="min-h-screen bg-black">
        <StartUpHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-4 rounded-full">
                <WifiOff className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Network Connection Issue
            </h3>
            <p className="text-gray-400 mb-6">
              {error ||
                "Unable to connect to the server. Please check your internet connection."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <StartUpHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 text-lg">
          Loading startups...
        </div>
      ) : startups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No startups found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 p-4 max-sm:p-0">
            {startups.map((startup) => (
              <Link
                key={startup._id}
                to={`/startup-details?id=${startup._id}`}
                className="bg-[#232323] rounded-4xl h-full hover:bg-[#2A2A2A] transition-colors"
              >
                <div className="w-full h-full p-2 max-sm:p-1">
                  <div className="bg-[#1A1A1A] flex-1 items-center justify-center min-h-[330px] rounded-4xl p-7 space-y-6 max-sm:p-5">
                    {/* Header */}
                    <div className="flex w-full justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-700">
                          <img
                            src={startup.logo || "https://via.placeholder.com/150"}
                            alt={startup.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h1 className="text-lg max-sm:text-base font-bold">{startup.name}</h1>
                      </div>
                      <button
                        className={`${getStageColor(
                          startup.stage
                        )} text-xs max-sm:text-[10px] px-2 py-1 font-medium rounded-full`}
                      >
                        {startup.stage}
                      </button>
                    </div>

                    {/* Description */}
                    <div className="text-sm font-medium max-sm:font-normal leading-relaxed text-[#C4C4C4] line-clamp-3">
                      {startup.description}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#2A2A2A] rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400 mb-1">Positions</p>
                        <p className="text-sm font-medium">{startup.positions || 0}</p>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400 mb-1">Members</p>
                        <p className="text-sm font-medium">{startup.memberCount || 1}</p>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400 mb-1">Views</p>
                        <p className="text-sm font-medium">{startup.views || 0}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 font-medium text-[#C4C4C4] gap-4">
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-sm">
                          <Users size={18} className="text-blue-500" />
                          <span>{startup.memberCount} Team</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Building2 size={18} className="text-green-500" />
                          <span>{startup.industry}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <MapPin size={18} className="text-red-500" />
                          <span>{startup.location}</span>
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-sm">
                          <Calendar size={18} className="text-purple-500" />
                          <span>
                            Founded{" "}
                            {startup.createdAt
                              ? new Date(startup.createdAt).getFullYear()
                              : "N/A"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2 text-sm text-green-500">
                          <DollarSign size={18} />
                          <span>{startup.funding || "$0"} Raised</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm text-blue-500">
                          <Target size={18} />
                          <span>View Details</span>
                          <ArrowUpRight size={14} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center gap-4 py-6">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
};

export default StartUp;
