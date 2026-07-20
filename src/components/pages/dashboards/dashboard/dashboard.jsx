
import React, { useMemo, useState, useEffect } from "react";
import WorldClock from "../../../sections/WorldClock";
import Calendar from "../../../sections/Calendar";
import DashboardHeader from "../../../headers/DashboardHeader";
import DashboardSection from "../../../sections/DashboardSection";
import TaskProgress from "../../../sections/TaskProgress";
import { GrOverview } from "react-icons/gr";
import ShinyText from "../../../ui/ShinyText";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableSection from "./SortableSection";
import OverviewWebsite from "./OverviewWebsite";
import DashboardSummaryCard from "./DashboardSummarySection";

import Loader from "@/components/loader/loader";
import DashboardChangeSection from "../dashboardChangeSection";
import AnnouncementsSection from "./AnnouncementsSection";
import AINewsSection from "@/components/news/AINewsSection";
const Dashboard = ({
  activeRole, setActiveRole, userRoles, setUserRoles
}) => {
  const [query, setQuery] = useState("");
  const [userData, setUserData] = useState(null);
  // State for search functionality


  const { user, loading } = useSelector((state) => state.auth);


  useEffect(() => {
    // Only run this when the user changes
    if (user) {
      setUserData(user);
    }
  }, [user]);
  const initialSections = useMemo(() => [
    { id: "overview", component: <DashboardSection /> },
    { id: "worldclock", component: <WorldClock /> },
    { id: "calendar", component: <Calendar /> },
    // { id: "tasks", component: <Tasks searchQuery={query} /> },
    { id: "progress", component: <TaskProgress /> },
  ], []);

  const [sections, setSections] = useState(initialSections);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  useEffect(() => {
    localStorage.setItem(
      "dashboard-layout",
      JSON.stringify(sections.map(s => s.id))
    );
  }, [sections]);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-layout");
    if (!saved) return;

    const order = JSON.parse(saved);
    setSections(prev =>
      order
        .map(id => prev.find(s => s.id === id))
        .filter(Boolean)
    );
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );
  const moveSection = (from, to) => {
    setSections(items => arrayMove(items, from, to));
  };


  return (
    <div
      id="dashboard"
      className="relative min-h-screen  text-white w-full overflow-x-hidden md:p-4 text-center">
      {loading && (<Loader />)}
      <DashboardHeader searchQuery={query} onSearchChange={setQuery} />



      <div className="relative w-full mx-auto p-4 overflow-x-hidden">
        <OverviewWebsite />
        <DashboardChangeSection
          sections={userRoles.map(role => ({
            id: role,
            label: role.charAt(0).toUpperCase() + role.slice(1)
            }))}
          onSectionChange={(sectionId) => {
            setActiveRole(sectionId);
            localStorage.setItem('activeRole', sectionId);
          }}
          setUserRoles={setUserRoles}
          setActiveRole={setActiveRole}
          userRoles={userRoles}
          activeRole={activeRole}
        />
        <AnnouncementsSection userRoles={userRoles} />
        {/* {
          userData && (userRoles.includes("admin") || user.role === 'admin') && (
            <AdminSection userData={userData} />
          )
        } */}
        <DashboardSummaryCard userData={userData} />
        <AINewsSection />

        {/* Original Dashboard Header */}
        <div className='w-full  p-4'>
          <div className='flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4 sm:gap-0 h-full'>
            <div className="flex items-center gap-3 mb-3">
              <GrOverview className="h-8 w-8" />

              <h1 className="relative text-2xl font-semibold text-white"><ShinyText
                text="Dashboard Overview"

                disabled={false}
                speed={3}
                className='custom-class'
              /></h1>
            </div>

          </div>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map(section => (
              <SortableSection key={section.id}
                id={section.id}
                index={sections.findIndex(s => s.id === section.id)}
                total={sections.length}
                onMove={moveSection}
              >
                {section.component}
              </SortableSection>
            ))}
          </SortableContext>
        </DndContext>
      </div>


    </div>
  );
};

export default Dashboard;
