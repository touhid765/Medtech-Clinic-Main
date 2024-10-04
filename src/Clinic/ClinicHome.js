import React from 'react';
import ClinicSidebar from './ClinicSidebar';
import { Link , Outlet} from 'react-router-dom';
import './ClinicHome.css'

const ClinicHome = () => {
  return (
    <div className="dashboard">
      <header>
        <h1>MedTech Clinic</h1>
        <div className="profile">
          <Link to="clinic-profile-settings">Clinic Profile</Link>
        </div>
      </header>
      <div className="main-content">
        <ClinicSidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClinicHome;
