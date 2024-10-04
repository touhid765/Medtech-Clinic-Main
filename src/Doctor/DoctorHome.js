import React from 'react';
import DoctorSidebar from './DoctorSidebar';
import { Link , Outlet } from 'react-router-dom';
import './doctorHome.css'

const DoctorHome = () => {
  return (
    <div className="dashboard">
      <header>
        <h1>MedTech Clinic</h1>
        <div className="profile">
          <Link to="doctor-profile-settings">Doctor Profile</Link>
        </div>
      </header>
      <div className="main-content">
        <DoctorSidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
