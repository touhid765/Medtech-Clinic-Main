import './PrescriptionPage.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IsDoctorSessionLive } from '../utils/IsDoctorSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL; // Ensure this is correctly set in .env

const PrescriptionPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const authenticateAndFetchAppointments = async () => {
      const { isAuthenticated, doctorData } = await IsDoctorSessionLive();

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/clinic-login');
        setLoading(false);
        return;
      }
      setLoading(false);
      setDoctorId(doctorData._id)
    };

    authenticateAndFetchAppointments();
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchPrescription = async () => {
      if (!isMounted) return;

      try {
        const response = await axios.post(`${URL}/api/auth/fetch-prescriptions`);
        if (!isMounted) return;

        if (response.data.success) {
          const temp = response.data.prescriptions.filter(
            (item) => item.doctor._id === doctorId
          );
          
          setPrescriptions(temp);
        } else {
          setError(response.data.message || 'Failed to fetch prescriptions');
        }
      } catch (error) {
        if (isMounted) setError(error.response?.data?.message || error.message || 'Something went wrong while fetching prescriptions. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }

    };

    fetchPrescription();
    
    return () => {
      isMounted = false;
    };
  }, [navigate , doctorId]);

  if (loading) return <p>Loading prescriptions...</p>;

  return (
    <div className="prescriptions-container">
      <h1>Prescriptions Logs</h1>
      
      {error && <p className="error">{error}</p>}

      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        prescriptions.map((prescription) => (
          <div key={prescription._id} className="prescription-details">
            <h2>Prescription ID: {prescription.prescriptionId}</h2>
            <div className="prescription-info">
              <p><strong>Patient:</strong> {prescription.patient.name} (ID: {prescription.patient.patientId})</p>
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
              <div>
                <button>Edit</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PrescriptionPage;