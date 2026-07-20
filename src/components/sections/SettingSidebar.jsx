import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
// import { useAuth } from '../../contexts/AuthContext'

const SettingSidebar = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth);
    const [active, setActive] = useState(1)

    const handleLogout = () => {
        // logout()
        navigate('/login')
    }

    const links = [
        {
            id: 1,
            name: 'Profile',
            href: '/setting/'
        },
        {
            id: 2,
            name: 'Account and Security',
            href: '/setting/account'
        },
        {
            id: 3,
            name: 'Preferences',
            href: '/setting/preferences'
        },
        {
            id: 5,
            name: 'Saved',
            href: '/saved'
        },
        {
            id: 4,
            name: 'Logout',
            isLogout: true
        },
    ]

    return (
        <>
            <div className='min-w-[250px] min-h-[200px] rounded-4xl p-2 space-y-8'>
                <div className='flex flex-col gap-2'
                
                >
                    {links.map((link) => (
                        link.isLogout ? (
                            <button
                                key={link.id}
                                onClick={handleLogout}
                                className={`text-lg text-[#C4C4C4] hover:text-white text-left ${active === link.id ? 'text-white' : ''}`}
                            >
                                {link.name}
                            </button>
                        ) : (
                            <Link 
                                key={link.id} 
                                to={link.href} 
                                onClick={() => setActive(link.id)}
                                className={`text-lg text-[#C4C4C4] hover:text-white ${active === link.id ? 'text-white' : ''}`}
                            >
                                {link.name}
                            </Link>
                        )
                    ))}
{user?.isAdmin && (
  <Link key="admin" to="/admin" onClick={() => setActive(6)} className={`text-lg text-[#C4C4C4] hover:text-white text-left ${active === 6 ? 'text-white' : ''}`}>
    Admin
  </Link>
)}
                </div>
            </div>
        </>
    )
}

export default SettingSidebar