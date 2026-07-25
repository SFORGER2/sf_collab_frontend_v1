import React, { useState, useEffect, useMemo } from 'react'
import { Sun, Moon, Globe, Clock, ChevronDown, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import SpotlightCard from '../ui/SpotlightCard'
import { IoMdClock } from "react-icons/io"
import { US, GB, JP, AU, FR, DE, IT, ES, CN, IN, BR, CA, MX, RU, KR, SG, NZ, NL, SE, NO, DK, FI, CH, AT, BE, PT, IE, PL, CZ, HU, RO, BG, GR, TR, SA, AE, IL, ZA, EG, NG, KE, MA, AR, CL, CO, PE, VE, PH, MY } from 'country-flag-icons/react/3x2'
import countries from '../../utils/countries'
import ShinyText from '../ui/ShinyText'
import { getUserCountry } from '@/utils/getUserCountry'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const TIME_ZONES = [
  { city: "New York", country: "USA", flag: <US className="w-6 h-4" />, offset: -4, utc: "UTC-4", gradient: "from-blue-500/30 via-white/30 to-red-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Los Angeles", country: "USA", flag: <US className="w-6 h-4" />, offset: -7, utc: "UTC-7", gradient: "from-blue-500/30 via-red-500/30 to-white/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Chicago", country: "USA", flag: <US className="w-6 h-4" />, offset: -5, utc: "UTC-5", gradient: "from-red-500/30 via-white/30 to-blue-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "London", country: "UK", flag: <GB className="w-6 h-4" />, offset: 1, utc: "UTC+1", gradient: "from-blue-500/30 via-red-500/30 to-blue-600/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Tokyo", country: "Japan", flag: <JP className="w-6 h-4" />, offset: 9, utc: "UTC+9", gradient: "from-white/30 via-red-500/30 to-white/30", color: "rgba(181, 20, 138, 0.15)" },
  { city: "Sydney", country: "Australia", flag: <AU className="w-6 h-4" />, offset: 10, utc: "UTC+10", gradient: "from-blue-500/30 via-red-500/30 to-blue-500/30", color: "rgba(245, 158, 11, 0.15)" },
  { city: "Paris", country: "France", flag: <FR className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-blue-500/30 via-white/30 to-red-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Berlin", country: "Germany", flag: <DE className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-black/30 via-red-500/30 to-yellow-500/30", color: "rgba(0, 0, 0, 0.15)" },
  { city: "Rome", country: "Italy", flag: <IT className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-green-500/30 via-white/30 to-red-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Madrid", country: "Spain", flag: <ES className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-yellow-500/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Beijing", country: "China", flag: <CN className="w-6 h-4" />, offset: 8, utc: "UTC+8", gradient: "from-red-500/30 via-yellow-500/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Mumbai", country: "India", flag: <IN className="w-6 h-4" />, offset: 5.5, utc: "UTC+5:30", gradient: "from-orange-500/30 via-white/30 to-green-500/30", color: "rgba(249, 115, 22, 0.15)" },
  { city: "São Paulo", country: "Brazil", flag: <BR className="w-6 h-4" />, offset: -3, utc: "UTC-3", gradient: "from-green-500/30 via-yellow-500/30 to-blue-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Toronto", country: "Canada", flag: <CA className="w-6 h-4" />, offset: -4, utc: "UTC-4", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Mexico City", country: "Mexico", flag: <MX className="w-6 h-4" />, offset: -5, utc: "UTC-5", gradient: "from-green-500/30 via-white/30 to-red-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Moscow", country: "Russia", flag: <RU className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-white/30 via-blue-500/30 to-red-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Seoul", country: "South Korea", flag: <KR className="w-6 h-4" />, offset: 9, utc: "UTC+9", gradient: "from-black/30 via-white/30 to-red-500/30", color: "rgba(0, 0, 0, 0.15)" },
  { city: "Singapore", country: "Singapore", flag: <SG className="w-6 h-4" />, offset: 8, utc: "UTC+8", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Auckland", country: "New Zealand", flag: <NZ className="w-6 h-4" />, offset: 12, utc: "UTC+12", gradient: "from-blue-500/30 via-red-500/30 to-white/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Amsterdam", country: "Netherlands", flag: <NL className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-blue-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Stockholm", country: "Sweden", flag: <SE className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-blue-500/30 via-yellow-500/30 to-blue-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Oslo", country: "Norway", flag: <NO className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-blue-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Copenhagen", country: "Denmark", flag: <DK className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Helsinki", country: "Finland", flag: <FI className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-white-500/30 via-blue-500/30 to-white-500/30", color: "rgba(255, 255, 255, 0.15)" },
  { city: "Zurich", country: "Switzerland", flag: <CH className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Vienna", country: "Austria", flag: <AT className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Brussels", country: "Belgium", flag: <BE className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-black/30 via-yellow-500/30 to-red-500/30", color: "rgba(0, 0, 0, 0.15)" },
  { city: "Lisbon", country: "Portugal", flag: <PT className="w-6 h-4" />, offset: 1, utc: "UTC+1", gradient: "from-green-500/30 via-red-500/30 to-green-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Dublin", country: "Ireland", flag: <IE className="w-6 h-4" />, offset: 1, utc: "UTC+1", gradient: "from-green-500/30 via-white/30 to-orange-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Warsaw", country: "Poland", flag: <PL className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-white-500/30 via-red-500/30 to-white-500/30", color: "rgba(255, 255, 255, 0.15)" },
  { city: "Prague", country: "Czech Republic", flag: <CZ className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-white-500/30 via-red-500/30 to-blue-500/30", color: "rgba(255, 255, 255, 0.15)" },
  { city: "Budapest", country: "Hungary", flag: <HU className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-green-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Bucharest", country: "Romania", flag: <RO className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-blue-500/30 via-yellow-500/30 to-red-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Sofia", country: "Bulgaria", flag: <BG className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-white-500/30 via-green-500/30 to-red-500/30", color: "rgba(255, 255, 255, 0.15)" },
  { city: "Athens", country: "Greece", flag: <GR className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-blue-500/30 via-white/30 to-blue-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Istanbul", country: "Turkey", flag: <TR className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Dubai", country: "UAE", flag: <AE className="w-6 h-4" />, offset: 4, utc: "UTC+4", gradient: "from-red-500/30 via-green-500/30 to-white-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Riyadh", country: "Saudi Arabia", flag: <SA className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-green-500/30 via-white/30 to-green-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Tel Aviv", country: "Israel", flag: <IL className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-white-500/30 via-blue-500/30 to-white-500/30", color: "rgba(255, 255, 255, 0.15)" },
  { city: "Cairo", country: "Egypt", flag: <EG className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-black-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Johannesburg", country: "South Africa", flag: <ZA className="w-6 h-4" />, offset: 2, utc: "UTC+2", gradient: "from-red-500/30 via-white/30 to-blue-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Lagos", country: "Nigeria", flag: <NG className="w-6 h-4" />, offset: 1, utc: "UTC+1", gradient: "from-green-500/30 via-white/30 to-green-500/30", color: "rgba(16, 185, 129, 0.15)" },
  { city: "Nairobi", country: "Kenya", flag: <KE className="w-6 h-4" />, offset: 3, utc: "UTC+3", gradient: "from-black-500/30 via-red-500/30 to-green-500/30", color: "rgba(0, 0, 0, 0.15)" },
  { city: "Casablanca", country: "Morocco", flag: <MA className="w-6 h-4" />, offset: 1, utc: "UTC+1", gradient: "from-red-500/30 via-green-500/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Buenos Aires", country: "Argentina", flag: <AR className="w-6 h-4" />, offset: -3, utc: "UTC-3", gradient: "from-blue-500/30 via-white/30 to-blue-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Santiago", country: "Chile", flag: <CL className="w-6 h-4" />, offset: -3, utc: "UTC-3", gradient: "from-red-500/30 via-white/30 to-blue-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Bogota", country: "Colombia", flag: <CO className="w-6 h-4" />, offset: -5, utc: "UTC-5", gradient: "from-yellow-500/30 via-blue-500/30 to-red-500/30", color: "rgba(245, 158, 11, 0.15)" },
  { city: "Lima", country: "Peru", flag: <PE className="w-6 h-4" />, offset: -5, utc: "UTC-5", gradient: "from-red-500/30 via-white/30 to-red-500/30", color: "rgba(239, 68, 68, 0.15)" },
  { city: "Caracas", country: "Venezuela", flag: <VE className="w-6 h-4" />, offset: -4, utc: "UTC-4", gradient: "from-yellow-500/30 via-blue-500/30 to-red-500/30", color: "rgba(245, 158, 11, 0.15)" },
  { city: "Manila", country: "Philippines", flag: <PH className="w-6 h-4" />, offset: 8, utc: "UTC+8", gradient: "from-blue-500/30 via-red-500/30 to-yellow-500/30", color: "rgba(59, 130, 246, 0.15)" },
  { city: "Kuala Lumpur", country: "Malaysia", flag: <MY className="w-6 h-4" />, offset: 8, utc: "UTC+8", gradient: "from-blue-500/30 via-white/30 to-red-500/30", color: "rgba(59, 130, 246, 0.15)" }
]

export default function WorldClock() {
  const { user } = useSelector((state) => state.auth)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [country, setCountry] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
    const detectCountry = async () => {
      try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.country_name && countries.includes(data.country_name)) {
              setCountry({ label: data.country_name, flag: React.createElement(countries[data.country_name], { className: 'w-6 h-4' }) });
            }
            if (data.city) {
              setCountry((prev) => ({
                ...prev,
                label: `${data.city}, ${data.country_name}`
              }));
            }
            if (!data.country_name && !data.city) {
              toast.info("Could not detect country or city");
              return;
            }
          } catch {
            toast.error("Failed to detect location");
          }
    }

  const getTimeForTimezone = (offset) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
    return new Date(utc + (3600000 * offset))
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const getDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter timezones based on search and region
  const filteredTimezones = useMemo(() => TIME_ZONES.filter(zone => {
    const matchesSearch = zone.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          zone.country.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRegion = selectedRegion === 'all' || 
                          (selectedRegion === 'americas' && (zone.offset <= 0 || zone.country === 'Brazil' || zone.country === 'Argentina')) ||
                          (selectedRegion === 'europe' && zone.offset >= 0 && zone.offset <= 3 && 
                          ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece'].includes(zone.country)) ||
                          (selectedRegion === 'asia' && zone.offset >= 5 && zone.offset <= 12) ||
                          (selectedRegion === 'africa' && ['Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Morocco'].includes(zone.country))
    
    return matchesSearch && matchesRegion
  }), [searchQuery, selectedRegion])

  // Show only 2 initially, or all when "See More" is clicked
  const displayedTimezones = showAll ? filteredTimezones : filteredTimezones.slice(0, 4)

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'americas', label: 'Americas' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia Pacific' },
    { value: 'africa', label: 'Africa & Middle East' }
  ]

  return (
    <div className="md:p-2 overflow-hidden ">
      <div className="w-full mx-auto">
        {/* Header */}
        <Card className="relative overflow-hidden bg-transparent border-zinc-800 shadow-none mb-6">
          {/* <div className="transition-all duration-1000  opacity-15"> */}
              <img loading="lazy" src="/world_clock.jpg" className=" absolute object-fill top-0 left-0  w-full h-fit -mt-80 opacity-15" alt="" />
            {/* </div> */}
          <CardContent className="p-6 relative ">
            
          
            <div className="flex relative flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <IoMdClock className="h-8 w-8 text-white" />
                  <ShinyText 
                    text="World Clock" 
                    disabled={false} 
                    speed={3} 
                    className='text-2xl font-bold' 
                  />
                </div>
                <p className="text-slate-400 text-base ml-5">Monitor time zones across the globe in real-time</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-lg text-white text-center sm:text-left flex flex-col">
                  Currently in: <br />
                  <span className="flex items-center gap-2 mt-1">
                    {
                      (country || user?.timezone) ? (
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-300" />
                          {user.timezone}
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" onClick={detectCountry}>
                          Detect Location
                        </Button>
                      )
                    }
                  </span>
                  <svg aria-hidden="true" viewBox="0 0 418 42" className=" h-[0.78em] w-full fill-blue-300/70" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
                </span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-300/20">
                  Last updated: {currentTime.toLocaleTimeString('en-US')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-transparent relative overflow-hidden border-zinc-800 shadow-none mb-6">
          <CardContent className="p-6">
            <img loading="lazy" src="/design_2.jpg" className=" absolute object-fill top-0 left-0  w-full h-fit -mt-80 opacity-15" alt="" />
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cities or countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400"
                />
              </div>
              
              {/* Region Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-zinc-800/50 border-zinc-700 text-white z-50">
                    <Globe className="h-4 w-4 mr-2" />
                    {regions.find(r => r.value === selectedRegion)?.label}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={5}
                  className="bg-zinc-900 border-zinc-800 text-white z-[100] w-48"
                >
                  {regions.map(region => (
                    <DropdownMenuItem 
                    inset={3}
                      key={region.value}
                      onSelect={() => setSelectedRegion(region.value)}
                      className="cursor-pointer focus:bg-zinc-800 focus:text-white"
                    >
                      {region.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Clock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {displayedTimezones.map(({ city, country, offset, utc, gradient, color, flag }) => {
            const time = getTimeForTimezone(offset)
            const isDay = time.getHours() >= 6 && time.getHours() < 18
            const hours = time.getHours()
            const formattedTime = formatTime(time)
            const formattedDate = getDate(time)

            return (
              <Card key={city} className="bg-transparent relative border-zinc-800 shadow-none hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 md:p-6 relative">
                  <img loading="lazy" src="/design_3.jpg" className=" absolute object-cover top-0 left-0  w-full opacity-30" alt="" />
                  {/* Location Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {flag}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{city}</h3>
                        <p className="text-sm text-slate-400 truncate">{country}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs">
                      {utc}
                    </Badge>
                  </div>

                  {/* Time Display */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                          {formattedTime}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">{formattedDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Day/Night Indicator */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
                    <div className="flex items-center gap-2">
                      {isDay ? (
                        <>
                          <div className="p-1.5 bg-amber-500/10 rounded-lg ring-1 ring-amber-500/20">
                            <Sun className="h-3 w-3 text-amber-400" />
                          </div>
                          <span className="text-xs font-semibold text-amber-400">Day</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-indigo-500/10 rounded-lg ring-1 ring-indigo-500/20">
                            <Moon className="h-3 w-3 text-indigo-400" />
                          </div>
                          <span className="text-xs font-semibold text-indigo-400">Night</span>
                        </>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-0.5 rounded-full transition-all duration-300 ${
                            i === hours % 12
                              ? 'bg-blue-400 shadow-lg'
                              : 'bg-slate-700/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* See More/Less Button */}
        {/* {filteredTimezones.length > 2 && (
          <div className="flex justify-center mt-6">
            <Button
              style={{zIndex:9999999}}
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              {showAll ? 'Show Less' : `See More (${filteredTimezones.length - 2} more)`}
            </Button>
          </div>
        )} */}

        {/* Empty State */}
        {filteredTimezones.length === 0 && (
          <Card className="bg-transparent border-zinc-800 shadow-none mt-6">
            <CardContent className="p-12 text-center">
              <Globe className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No timezones found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}