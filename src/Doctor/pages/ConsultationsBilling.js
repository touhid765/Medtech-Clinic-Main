import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IsDoctorSessionLive } from '../utils/IsDoctorSessionLive';
import { useNavigate } from 'react-router-dom';
import './ConsultationsBilling.css';

const URL = process.env.REACT_APP_BACKEND_URL;

const ConsultationsBilling = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newBill, setNewBill] = useState({
    appointmentId: '',
    date: '',
    amount: '',
    notes: ''
  });
  const navigate = useNavigate();

  // Fetch bills and authenticate
  useEffect(() => {
    const authenticateAndFetchBills = async () => {
      const { isAuthenticated } = await IsDoctorSessionLive();
      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/doctor-login');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${URL}/api/auth/fetch-bills`);
        setBills(response.data.bills);
      } catch (err) {
        setError('Error fetching bills.');
      }
      setLoading(false);
    };

    authenticateAndFetchBills();
  }, [navigate]);

  // Handle input changes for the bill form
  const handleInputChange = (e) => {
    setNewBill({
      ...newBill,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission to create a new bill
  const handleFormSubmit = async (e) => {
    // e.preventDefault();

    try {
      const response = await axios.post(`${URL}/api/auth/create-bill`, {
        appointmentId:newBill.appointmentId,
        date:newBill.date,
        amount:newBill.amount,
        notes:newBill.notes
      });
      if (response.data.success) {
        setNewBill({ appointmentId: '', date: '', amount: '', notes: '' }); // Reset form
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Failed to create a new bill.');
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Mark bill as paid, pending, or cancelled
  const handleStatusChange = async (billId, newStatus) => {
    try {
      await axios.post(`${URL}/api/auth/update-bill-status`, { billId, status: newStatus });
      setBills(bills.map(bill => bill._id === billId ? { ...bill, status: newStatus } : bill));
    } catch (error) {
      setError('Failed to update bill status.');
    }
  };

  return (
    <div className="billing-management-container">
      <h2>Billing Management</h2>

      {/* Bill Creation Form */}
      <form className="bill-form" onSubmit={handleFormSubmit}>
        <label>
          Appointment ID:
          <input 
            type="text" 
            name="appointmentId" 
            value={newBill.appointmentId} 
            onChange={handleInputChange} 
            required 
          />
        </label>
        <label>
          Bill Date:
          <input 
            type="date" 
            name="date" 
            value={newBill.date} 
            onChange={handleInputChange} 
            required 
          />
        </label>
        <label>
          Amount:
          <input 
            type="number" 
            name="amount" 
            value={newBill.amount} 
            onChange={handleInputChange} 
            required 
          />
        </label>
        <label>
          Notes:
          <textarea 
            name="notes" 
            value={newBill.notes} 
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" className="submit-btn">Create Bill</button>
      </form>

      {/* Filter for Bills */}
      <div className="filter-container">
        <label htmlFor="filter">Filter by Status:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Requested">Requested</option>
        </select>
      </div>

      {/* Displaying Bills */}
      <div className="billing-list">
        {loading ? (
          <p>Loading bills...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills
                .filter((bill) => filter === 'all' || bill.status === filter)
                .map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.appointment.appointmentId}</td>
                    <td>{bill.patient.name + ' ID' + bill.patient.patientId}</td>
                    <td>{bill.doctor.name + ' ID' + bill.doctor.doctorId}</td>
                    <td>{bill.amount}</td>
                    <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td>{bill.status}</td>
                    <td>
                      <button
                        onClick={() => handleStatusChange(bill._id, 'Paid')}
                        className="status-btn"
                        disabled={bill.status === 'Paid'}
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => handleStatusChange(bill._id, 'Pending')}
                        className="status-btn"
                        disabled={bill.status === 'Pending'}
                      >
                        Mark as Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(bill._id, 'Cancelled')}
                        className="status-btn"
                        disabled={bill.status === 'Cancelled'}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ConsultationsBilling;
