import './DoctorList.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IsClinicSessionLive } from '../utils/IsClinicSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL;

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateAndFetchDoctors = async () => {
      const { isAuthenticated } = await IsClinicSessionLive();

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/clinic-login');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${URL}/api/auth/fetch-all-doctors`);

        if (response.data.success) {
          setDoctors(response.data.doctors);
        } else {
          setError(response.data.message || 'Failed to fetch doctors');
        }
      } catch (error) {
        setError(error.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    authenticateAndFetchDoctors();
  }, [navigate]);

  return (
    <div className="doctor-list-container">
      <h1 className="page-title">Our Doctors</h1>

      {loading && <p>Loading doctors...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="doctor-list">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="doctor-card">
            <img src={doctor.image || '/default-doctor.jpg'} alt={doctor.name} className="doctor-image" />
            <div className="doctor-info">
              <h2 className="doctor-name">{doctor.name}</h2>
              <p className="doctor-specialty">{doctor.specialty}</p>
              <p className="doctor-experience">Experience: {doctor.experience} years</p>
              <p className="doctor-rating">Rating: {doctor.rating || 'N/A'}★</p>

              {/* Conditionally show additional information if available */}
              {doctor.contactNumber && (
                <p className="doctor-contact">Contact: {doctor.contactNumber}</p>
              )}
              {doctor.address && (
                <p className="doctor-address">
                  Address: {doctor.address.street}, {doctor.address.city}, {doctor.address.state}
                </p>
              )}
              {doctor.medicalHistory && doctor.medicalHistory.length > 0 && (
                <div className="doctor-medical-history">
                  <h4>Medical History:</h4>
                  <ul>
                    {doctor.medicalHistory.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
