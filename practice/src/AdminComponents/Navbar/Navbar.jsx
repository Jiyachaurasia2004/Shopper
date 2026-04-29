import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

  const navigate = useNavigate();  // 👈 navigation hook

  return (
    <div className='navbar'>
      <img src={navlogo} alt="" className="nav-logo" />

      <img 
        src={navProfile} 
        alt="" 
        className="nav-profile"
        onClick={() => navigate("/admin-login")}  // 👈 page open
      />
    </div>
  )
}

export default Navbar