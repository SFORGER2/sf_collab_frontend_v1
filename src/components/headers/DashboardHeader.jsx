import React, { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LuLayoutDashboard } from "react-icons/lu";
import ShinyText from "../ui/ShinyText";

const DashboardHeader = ({ searchQuery, onSearchChange }) => {
  const [localQuery, setLocalQuery] = useState('')
  const value = typeof searchQuery === 'string' ? searchQuery : localQuery

  const handleChange = (e) => {
    const v = e.target.value
    if (typeof onSearchChange === 'function') {
      onSearchChange(v)
    } else {
      setLocalQuery(v)
    }
  }

  return (
    <>
      <div className='w-full  p-4 mt-6 z-0'>
        <div className='flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4 sm:gap-0 h-full'>
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2"><LuLayoutDashboard/>
            <ShinyText 
            // fontStyle={"Trade Winds, system-ui"}
              text="Dashboard" 
              disabled={false} 
              speed={3} 
              className='custom-class' 
            />
            </h1>
          </div>
  
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto'>
            {/* Search Bar with Glassmorphism */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-full shadow-lg"></div>
              <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Search..."
                className="relative w-full sm:w-[320px] px-4 py-2.5 pl-10 bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-gray-300 transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 z-10" />
            </div>
  
            {/* Optional: Glassmorphism Button */}
            <Link 
              to="/register-startup"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md hover:bg-white/20 rounded-lg transition-all duration-200 text-white shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Register Startup</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardHeader