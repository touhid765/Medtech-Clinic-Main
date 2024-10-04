import './ManageAppointments.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IsClinicSessionLive } from '../utils/IsClinicSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL;

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [cancelId, setCancelId] = useState(null); // For cancel confirmation
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const authenticateAndFetchDoctors = async () => {
      const { isAuthenticated } = await IsClinicSessionLive();

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/clinic-login');
        setLoading(false);
        return;
      }
    };

    authenticateAndFetchDoctors();
  }, [navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.post(`${URL}/api/auth/fetch-appointments`);

        if (response.data.success) {
          let temp = response.data.appointment;
          // Update state with filtered appointments
          setAppointments(temp);
          setAppointmentHistory(temp);
        } else {
          setError(response.data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong while fetching appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []); 

  const handleStatusChange = async (id, status) => {
    try {
      await axios.post(`${URL}/api/auth/change-status-appointment`, {
        appointmentId: id,
        status: status
      });

      setAppointments(
        appointments.map((appointment) =>
          appointment._id === id ? { ...appointment, status } : appointment
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDateChange = (appointmentId, event) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);

    const appointment = appointments.find(app => app._id === appointmentId);
    if (!appointment) return;

    const doctor = appointment.doctor;

    if (doctor.availability.dateUnavailable.includes(selectedDate)) return;

    let timeSlots = doctor.availability.timeSlots.filter(slot => {
      return !appointmentHistory.some(his => {
        const appointmentDateOnly = new Date(his.appointmentDate).toISOString().split('T')[0];
        return his.doctor === doctor._id &&
               appointmentDateOnly === selectedDate &&
               his.timeSlot === slot &&
               his.status !== "Cancelled";
      });
    });

    setAvailableTimeSlots(timeSlots.map(slot => ({ time: slot, selected: false })));
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    const updatedTimeSlots = availableTimeSlots.map(slot => ({
      ...slot,
      selected: slot.time === time
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
        setAppointments(prevAppointments =>
          prevAppointments.map(app => app._id === cancelId ? { ...app, status: 'Cancelled' } : app)
        );
      } else {
        setError(response.data.message || 'Unable to cancel appointment. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
    
    setCancelId(null);

    setTimeout(() => {
      setError(null);
    }, 3000);
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
              ? { ...app, status: "Rescheduled", appointmentDate: selectedDate, timeSlot: selectedTime }
              : app
          )
        );
      } else {
        setError(response.data.message || 'Unable to reschedule appointment. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
    
    setRescheduleId(null);

    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  return (
    <div className="manage-appointments-container">
      <h1>Manage Appointments</h1>

      {loading && <p>Loading appointments...</p>}
      {error && <p className="error-message">{error}</p>}

      <table className="appointments-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.appointmentId}</td>
              <td>{appointment.patient.name + ' ID: ' + appointment.patient.patientId}</td>
              <td>{new Date(appointment.appointmentDate).toISOString().split('T')[0]}</td>
              <td>{appointment.timeSlot}</td>
              <td>{appointment.status}</td>
              <td>
                <button
                  className="pending-button"
                  onClick={() => handleStatusChange(appointment._id, 'Pending')}
                >
                  Pending
                </button>
                <button
                  className="reschedule-button"
                  onClick={() => handleReschedule(appointment._id)}
                >
                  Reschedule
                </button>
                <button
                  className="cancel-button"
                  onClick={() => handleCancel(appointment._id)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-button"
                  onClick={() => handleStatusChange(appointment._id, 'Confirm')}
                >
                  Confirm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cancel Confirmation Popup */}
      {cancelId && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this appointment?</p>
            <button className="popup-confirm-button" onClick={confirmCancel}>Yes, Cancel</button>
            <button className="popup-cancel-button" onClick={() => setCancelId(null)}>No, Go Back</button>
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

            <button className="popup-confirm-button" onClick={confirmReschedule}>Confirm</button>
            <button className="popup-cancel-button" onClick={() => setRescheduleId(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
