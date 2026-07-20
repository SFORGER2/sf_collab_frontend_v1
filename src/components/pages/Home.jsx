
import {
  BriefcaseBusiness,
  CheckCheck,
  LocateIcon,
  User,
  List,
  Calendar,
  Clock,
  ArrowUpRight,
  Users,
  Building2,
  MapPin,
  Target,
  MessageCircle,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import FilterHeader from "../headers/HomeHeader";
// import Options from "../sections/Options";
import ScrollToTop from "../sections/ScrollToTop";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");

  const getStageColor = (stage) => {
    const colors = {
      "IDEA Stage": "bg-blue-600",
      "MVP Stage": "bg-yellow-600",
      "Growth Stage": "bg-green-600",
      "Scale Stage": "bg-purple-600",
      "Research Stage": "bg-red-600",
    };
    return colors[stage] || "bg-gray-600";
  };

  const cardContent = [
    {
      id: 1,
      header: "ABC - Marketing side",
      content: `ABC is an application for parents, to make their life easier by helping them organize and track each task. Now we're looking for effective marketers. We are leaning towards female market.`,
      people: "10",
      technology: "Technology",
      location: "New York",
      createdAt: "March 6, 2024",
      tasks: "5 Tasks",
      stage: "IDEA Stage",
      description: `ABC is a comprehensive parenting app designed to simplify the lives of busy parents. Our platform helps parents organize their daily tasks, track their children's activities, and manage family schedules efficiently.`,
      requirements: [
        "Experience in digital marketing",
        "Understanding of parenting market",
        "Strong communication skills",
      ],
      team: [
        {
          name: "John Doe",
          role: "Project Lead",
          avatar: "https://i.pravatar.cc/150?img=1",
        },
      ],
      metrics: {
        progress: "25%",
        deadline: "3 months",
        budget: "$50K",
      },
    },
    {
      id: 2,
      header: "XYZ - Tech Development",
      content: `XYZ is a cutting-edge tech platform revolutionizing how businesses handle data. We're seeking experienced developers to join our growing team.`,
      people: "8",
      technology: "Technology",
      location: "San Francisco",
      createdAt: "March 5, 2024",
      tasks: "3 Tasks",
      stage: "MVP Stage",
      description: `XYZ is a data management platform that helps businesses streamline their operations and make data-driven decisions.`,
      requirements: [
        "Full-stack development experience",
        "Cloud platform knowledge",
        "Agile methodology expertise",
      ],
      team: [
        {
          name: "Jane Smith",
          role: "Tech Lead",
          avatar: "https://i.pravatar.cc/150?img=2",
        },
      ],
      metrics: {
        progress: "40%",
        deadline: "6 months",
        budget: "$75K",
      },
    },
    {
      id: 3,
      header: "HealthTech Solutions",
      content: `Revolutionizing healthcare through technology. We're building a platform that connects patients with healthcare providers seamlessly.`,
      people: "12",
      technology: "Healthcare",
      location: "Boston",
      createdAt: "March 4, 2024",
      tasks: "7 Tasks",
      stage: "Growth Stage",
      description: `HealthTech Solutions is a healthcare platform that bridges the gap between patients and healthcare providers through innovative technology.`,
      requirements: [
        "Healthcare industry experience",
        "UI/UX design skills",
        "Mobile app development",
      ],
      team: [
        {
          name: "Mike Johnson",
          role: "Product Manager",
          avatar: "https://i.pravatar.cc/150?img=3",
        },
      ],
      metrics: {
        progress: "60%",
        deadline: "9 months",
        budget: "$100K",
      },
    },
  ];

  // Filter projects based on search query and filters
  const filteredProjects = useMemo(() => {
    return cardContent.filter((project) => {
      // Search query filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        project.header.toLowerCase().includes(searchLower) ||
        project.content.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.technology.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower) ||
        project.stage.toLowerCase().includes(searchLower) ||
        project.people.toLowerCase().includes(searchLower) ||
        project.tasks.toLowerCase().includes(searchLower) ||
        project.createdAt.toLowerCase().includes(searchLower) ||
        project.team.some(
          (member) =>
            member.name.toLowerCase().includes(searchLower) ||
            member.role.toLowerCase().includes(searchLower)
        ) ||
        project.requirements.some((req) =>
          req.toLowerCase().includes(searchLower)
        ) ||
        Object.values(project.metrics).some((value) =>
          value.toLowerCase().includes(searchLower)
        );

      // Location filter
      const matchesLocation =
        selectedLocation === "All Locations" ||
        project.location === selectedLocation;

      // Stage filter
      const matchesStage =
        selectedStage === "All Stages" || project.stage === selectedStage;

      // Industry/Technology filter
      const matchesIndustry =
        selectedIndustry === "All Industries" ||
        project.technology === selectedIndustry;

      return (
        matchesSearch && matchesLocation && matchesStage && matchesIndustry
      );
    });
  }, [searchQuery, selectedLocation, selectedStage, selectedIndustry]);

  return (
    <div className="min-h-screen bg-black">
      {/* <Options /> */}
      <FilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
      />
      {/* <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-4'> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4 max-sm:p-0">
        {filteredProjects.map((content) => (
          <Link
            key={content.id}
            to={`/home-details?id=${content.id}`}
            className="bg-[#232323] rounded-4xl h-full hover:bg-[#2a2a2a] transition-colors duration-200"
          >
            <div className="w-full h-full p-2 max-sm:p-1">
              <div className="bg-[#1A1A1A] flex-1 items-center justify-center min-h-[330px] rounded-4xl p-7 space-y-6 max-sm:p-4">
                {/* header */}
                <div className="flex w-full justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-700">
                      <img
                        src={content.team[0].avatar}
                        alt={content.team[0].name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h1 className="text-lg font-bold max-sm:text-base">
                      {content.header}
                    </h1>
                  </div>
                  <button
                    className={`${getStageColor(
                      content.stage
                    )} text-xs max-sm:text-[10px] px-2 py-1 font-medium rounded-full`}
                  >
                    {content.stage}
                  </button>
                </div>

                {/* content */}
                <div className="text-sm font leading-relaxed text-[#C4C4C4] line-clamp-3">
                  {content.content}
                </div>

                {/* metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(content.metrics).map(
                    ([key, value], index) => (
                      <div
                        key={index}
                        className="bg-[#2A2A2A] rounded-lg p-2 text-center"
                      >
                        <p className="text-xs text-gray-400 mb-1">{key}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    )
                  )}
                </div>

                {/* roles */}
                <div className="grid grid-cols-2 font-medium text-[#C4C4C4] gap-4">
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm">
                      <Users size={18} className="text-blue-500" />
                      <span>{content.people} Roles</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Building2 size={18} className="text-green-500" />
                      <span>{content.technology}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <MapPin size={18} className="text-red-500" />
                      <span>{content.location}</span>
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm">
                      <CheckCheck size={18} className="text-purple-500" />
                      <span>{content.tasks}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Calendar size={18} className="text-yellow-500" />
                      <span>{content.createdAt}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-blue-500">
                      <Target size={18} />
                      <span>View Details</span>
                      <ArrowUpRight size={14} />
                    </p>
                  </div>
                </div>

                {/* team */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={content.team[0].avatar}
                      alt={content.team[0].name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {content.team[0].name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {content.team[0].role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show message when no results found */}
      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Fixed Chat Button */}
      <Link
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 max-sm:hidden"
        to="/messages"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
};

export default Home;
