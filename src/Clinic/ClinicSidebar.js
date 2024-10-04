import React, { useState } from 'react';
import {Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
import './ClinicHome.css'

const URL = process.env.REACT_APP_BACKEND_URL; // Ensure this is correctly set in .env

const ClinicSidebar = () => {
  
  const [loading, setLoading] = useState(false);  // State to manage loading state
  const [error, setError] = useState(null);  // State to manage error messages
  const navigate = useNavigate();
  
  const clinicLogout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${URL}/api/auth/clinic-logout`);

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
        <li><Link to="test-results-manage">Test Results</Link></li>
        <li><Link to="prescription-logs">Prescription Logs</Link></li>
        <li><Link to="manage-appointments">Appointments Management</Link></li>
        <li><Link to="billing-management">Billing Management</Link></li>
        <li><Link to="doctor-list">Doctors</Link></li>
      </ul>
      <div className='divForLine'/>
      <div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={clinicLogout} className="logout-btn" disabled={loading}>
          {loading ? 'Loging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default ClinicSidebar;
