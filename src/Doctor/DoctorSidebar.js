import React, { useState } from 'react';
import {Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
import './doctorHome.css'

const URL = process.env.REACT_APP_BACKEND_URL; // Ensure this is correctly set in .env

const DoctorSidebar = () => {

  const [loading, setLoading] = useState(false);  // State to manage loading state
  const [error, setError] = useState(null);  // State to manage error messages
  const navigate = useNavigate();
  
  const doctorLogout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${URL}/api/auth/doctor-logout`);

      if (response.data.success) {
        // Loged out successfully, navigate to login page
        navigate('/');
      } else {
          // Handle error case
          setError(response.data.message || 'Logout failed.');
      }
    } catch (err) {
      // Handle different error cases
      if (err.response) {
        setError(err.response.data.message || 'Something went wrong.');
      } else {
        setError('Server is not responding.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="sidebar">
      <ul>
        <li><Link to="doctor-dashboard">Dashboard</Link></li>
        <li><Link to="appointment-manage">Appointments</Link></li>
        <li><Link to="consultations-billing">Billings</Link></li>
        <li><Link to="prescription-page">Prescriptions</Link></li>
        <li><Link to="test-results-management">Test Results</Link></li>
      </ul>
      <div className='divForLine'/>
      <div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={doctorLogout} className="logout-btn" disabled={loading}>
          {loading ? 'Loging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
