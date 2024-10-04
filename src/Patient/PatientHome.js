import React from 'react';
import PatientSidebar from './PatientSidebar';
import { Outlet , Link } from 'react-router-dom';
import './patientHome.css'

const PatientHome = () => {
  return (
    <div className="dashboard">
      <header>
        <h1>MedTech Clinic</h1>
        <div className="profile">
          <Link to="patient-profile-settings">Patient Profile</Link>
        </div>
      </header>
      <div className="main-content">
        <PatientSidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
