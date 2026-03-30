import React from 'react'
import "./Admin.css"
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'

const Admin = () => {
  return (
    <div className='admin' style={{ display: "flex" }}>
      
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* RIGHT CONTENT */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />   {/* 🔥 YAHI MAGIC HAI */}
      </div>

    </div>
  )
}

export default Admin