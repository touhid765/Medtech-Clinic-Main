import React, { useEffect, useState } from 'react';
import './MyAppointments.css';
import axios from 'axios';
import { IsPatientSessionLive } from '../utils/IsPatientSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL;

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [cancelId, setCancelId] = useState(null); // For cancel confirmation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const navigate = useNavigate();

  // Fetch appointments and doctors after patient authentication
  useEffect(() => {
    let isMounted = true;

    const authenticateAndFetchAppointments = async () => {
      const { isAuthenticated, patientData } = await IsPatientSessionLive();

      if (!isMounted) return;

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/patient-login');
        setLoading(false);
        return;
      }

      setPatientData(patientData);

      if (patientData && patientData._id) {
        try {
          const response = await axios.post(`${URL}/api/auth/fetch-my-appointments`, {
            patientId: patientData._id,
          });
          if (!isMounted) return;

          if (response.data.success) {
            setAppointments(response.data.appointments);
          } else {
            setError(response.data.message ||'Failed to fetch appointments');
          }
        } catch (error) {
          if (isMounted) setError(error.response?.data?.message || error.message || 'Something went wrong while fetching appointments. Please try again.');
          console.error(error.message);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await axios.post(`${URL}/api/auth/fetch-doctors`);
        if (!isMounted) return;
        setDoctors(response.data.doctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.response?.data?.message || err.message || 'Something went wrong while fetching doctors. Please try again.')
      }
    };

    const fetchAppointmentsHistory = async () => {
      try {
        const response = await axios.post(`${URL}/api/auth/fetch-appointments`);
        if (!isMounted) return;
        setAppointmentHistory(response.data.appointment);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError(err.response?.data?.message || err.message || 'Something went wrong while fetching appointments. Please try again.')
      }
    };
    fetchAppointmentsHistory();
    fetchDoctors();
    authenticateAndFetchAppointments();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const getDoctorName = (id) => {
    const doctor = doctors.find((doc) => doc._id === id);
    return doctor ? `${doctor.name} ID: ${doctor.doctorId}` : 'Unknown Doctor';
  };

  const handleDateChange = (appointmentId, event) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);

    const appointment = appointments.find(app => app._id === appointmentId);
    if (!appointment) return;

    const doctor = doctors.find(doc => doc._id === appointment.doctor);
    if (!doctor) return;

    if (doctor.availability.dateUnavailable.includes(selectedDate)) return;

    let timeSlots = doctor.availability.timeSlots.filter(slot => {
      return !appointmentHistory.some(his => {
        const appointmentDateOnly = new Date(his.appointmentDate).toISOString().split('T')[0];
        return his.doctor === doctor._id &&
               appointmentDateOnly === selectedDate &&
               his.timeSlot === slot &&
               his.status !== "Cancelled"; // Include the status check
      });
    });

    setAvailableTimeSlots(timeSlots.map(slot => ({ time: slot, selected: false })));
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    const updatedTimeSlots = availableTimeSlots.map(slot => ({
      ...slot,
      selected: slot.time === time // Mark the selected time slot
    }));
    setAvailableTimeSlots(updatedTimeSlots);
  };

  const handleCancel = (appointmentId) => {
    setCancelId(appointmentId);
  };

  const confirmCancel = async () => {
    try {
      const response = await axios.post(`${URL}/api/auth/cancel-appointment`, {
        appointmentId: cancelId
      });

      if (response.data.success) {
        // Update the specific appointment's status to "Cancelled"
        setAppointments(prevAppointments => 
          prevAppointments.map(app => app._id === cancelId ? { ...app, status: 'Cancelled' } : app)
        );  
      } else {
        // Set the error from response or use a default message
        setError(response.data.message || 'Unable to cancel appointment. Please try again.');
      }
    } catch (err) {
      console.error('Error canceling appointments:', err);
      // Set the error message based on the caught error
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
    
    setCancelId(null); // Close the popup in any case

    // Clear the error message after 3 seconds
    setTimeout(() => {
      setError(null);
    }, 3000); // 3000 milliseconds = 3 seconds
  };
  
  

  const handleReschedule = (appointmentId) => {
    setRescheduleId(appointmentId);
  };

  const confirmReschedule = async () => {
    try {
      const response = await axios.post(`${URL}/api/auth/reschedule-appointment`, {
        appointmentId: rescheduleId,
        newDate: selectedDate,
        newTime: selectedTime
      });
      
      if (response.data.success) {
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app._id === rescheduleId
              ? { ...app,status:"Rescheduled", appointmentDate: selectedDate, timeSlot: selectedTime }
              : app
          )
        );
      } else {
        // Set the error from response or use a default message
        setError(response.data.message || 'Unable to reschedule appointment. Please try again.');
      }
    } catch (err) {
      console.error('Error reschedule appointments:', err);
      // Set the error message based on the caught error
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
    
    setRescheduleId(null); // Close the popup

    // Clear the error message after 3 seconds
    setTimeout(() => {
      setError(null);
    }, 3000); // 3000 milliseconds = 3 seconds

  };

  return (
    <div className="appointments-container">
      <h1>My Appointments</h1>

      {loading && <p>Loading appointments...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{getDoctorName(appointment.doctor)}</td>
                <td>{new Date(appointment.appointmentDate).toISOString().split('T')[0]}</td>
                <td>{appointment.timeSlot}</td>
                <td>{appointment.status}</td>
                <td>
                  <button className="cancel-button" onClick={() => handleCancel(appointment._id)}>Cancel</button>
                  <button className="reschedule-button" onClick={() => handleReschedule(appointment._id)}>Reschedule</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Cancel Confirmation Popup */}
      {cancelId && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this appointment?</p>
            <button className="confirm-button" onClick={confirmCancel}>Yes, Cancel</button>
            <button className="cancel-button" onClick={() => setCancelId(null)}>No, Go Back</button>
          </div>
        </div>
      )}

      {/* Reschedule Popup */}
      {rescheduleId && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Reschedule Appointment</h2>
            <div className="form-group">
              <label htmlFor="date">Select Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(rescheduleId, e)}
              />
            </div>

            <div className="form-group">
              <label>Select Time Slot:</label>
              <div className="time-slot-list">
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`time-slot ${slot.selected ? 'selected' : 'unselected'}`}
                      onClick={() => handleTimeChange(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))
                ) : (
                  <p>No time slots available for the selected date.</p>
                )}
              </div>
            </div>

            <button className="confirm-button" onClick={confirmReschedule}>Confirm</button>
            <button className="cancel-button" onClick={() => setRescheduleId(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
