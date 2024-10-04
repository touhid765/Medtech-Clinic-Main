import './MyPrescriptions.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IsPatientSessionLive } from '../utils/IsPatientSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL;

const MyPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const authenticateAndFetchPrescription = async () => {
      const { isAuthenticated, patientData } = await IsPatientSessionLive();

      if (!isMounted) return;

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/patient-login');
        setLoading(false);
        return;
      }

      if (patientData && patientData._id) {
        try {
          const response = await axios.post(`${URL}/api/auth/fetch-my-prescriptions`, {
            patientId: patientData._id,
          });
          if (!isMounted) return;

          if (response.data.success) {
            setPrescriptions(response.data.prescriptions);
          } else {
            setError(response.data.message || 'Failed to fetch prescriptions');
          }
        } catch (error) {
          if (isMounted) setError(error.response?.data?.message || error.message || 'Something went wrong while fetching prescriptions. Please try again.');
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    authenticateAndFetchPrescription();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) return <p>Loading prescriptions...</p>;

  return (
    <div className="prescriptions-container">
      <h1>My Prescriptions</h1>
      <p>Here you can view your prescriptions.</p>
      
      {error && <p className="error">{error}</p>}

      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        prescriptions.map((prescription) => (
          <div key={prescription._id} className="prescription-details">
            <h2>Prescription ID: {prescription.prescriptionId}</h2>
            <div className="prescription-info">
              <p><strong>Doctor:</strong> {prescription.doctor.name} (ID: {prescription.doctor.doctorId})</p>
              <p><strong>Appointment Date:</strong> {new Date(prescription.appointment.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Appointment ID:</strong> {prescription.appointment.appointmentId}</p>
            </div>
            <div className="medications-section">
              <h3>Medications</h3>
              <table>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Form</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Route</th>
                    <th>Special Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medications.map((med, index) => (
                    <tr key={index}>
                      <td>{med.medicineName}</td>
                      <td>{med.dosage}</td>
                      <td>{med.form}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td>{med.route}</td>
                      <td>{med.specialInstructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="prescription-info">
              <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
            </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyPrescriptions;
