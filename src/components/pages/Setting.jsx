import React from 'react'
import SettingSidebar from '../sections/SettingSidebar'
import { Outlet } from 'react-router-dom'

const Setting = () => {
  return (
    <div className="w-full h-full space-y-5">
      {/* header */}
      <div>
        <h1 className="text-3xl font-medium">Settings</h1>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-5 md:gap-10 min-h-screen">
        {/* Sidebar */}
        <div className="
          w-full md:w-[30%] md:h-[250px] lg:w-[20%] 
          bg-[#1A1A1A] rounded-4xl p-5 md:p-7 space-y-10
          mb-5 md:mb-0
        ">
          <SettingSidebar />
        </div>
        {/* Main Content */}
        <div className="
          w-full md:w-[70%] lg:w-[80%] 
          min-h-screen rounded-4xl p-5 md:p-7 space-y-10
          overflow-hidden overflow-x-auto
        ">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Setting