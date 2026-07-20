

import { Check, User, X } from "lucide-react"
import { toast } from 'react-toastify'
// Import necessary dependencies
import React, { useState } from "react"

// Main ProfileSetting component
const AccountandSecurity = () => {
  // Initialize navigation hook
  
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [bioLength, setBioLength] = useState(0)
  const [formData, setFormData] = useState({
    username: "fcollab",
    profileUrl: "https://fcollab.com/",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Handle bio text changes and update character count
  const handleBioChange = (e) => {
    setBioLength(e.target.value.length)
    setFormData(prev => ({
      ...prev,
      bio: e.target.value
    }))
  }

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Replace with your API endpoint
      // const response = await fetch('/api/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData)
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to update profile')
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Profile Details Header */}
          <div className="border-b pb-4  ">
            <h2 className="text-2xl font-medium mb-2">Account and Security</h2>
            <p className="text-[#C4C4C4]">You can change your account and security details here seamlessly.</p>
          </div>


          {/* Public Profile Section */}
          <div className="flex justify-between border-b pb-4">
            <div className="w-[50%] space-y-2">
            <h3 className="text-xl font-medium">Update Password</h3>
            <p className="text-[#C4C4C4]">This is the main profile that will be visible for everyone. This is the main profile that will be visible for everyone.</p>
            </div>
            <div className=" flex flex-col gap-4 w-[50%]">
            <div className="space-y-2">
              <div className="relative">
                <input 
                  type="text"
                  name="username"
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="min-w-[500px] bg-[#232323] rounded-full p-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <input 
                type="text"
                name="profileUrl"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                className="min-w-[500px] bg-[#232323] rounded-full p-2"
              />
            </div>


            <div className="space-y-2">
            <input 
                type="text"
                name="profileUrl"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="min-w-[500px] bg-[#232323] rounded-full p-2"
              />
            </div>



            </div>
          
          </div>



         

          {/* Form Action Buttons */}
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              className="bg-[none] border-white/10 border-2 hover:bg-white/10 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              Cancel <span><X className="w-4 h-4" /></span>
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? "Saving..." : "Save Settings"} <span><Check className="w-4 h-4" /></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountandSecurity
