import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IsPatientSessionLive } from '../utils/IsPatientSessionLive';
import { useNavigate } from 'react-router-dom';
import './BillingPayments.css';

const URL = process.env.REACT_APP_BACKEND_URL;

const BillingPayments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch bills and authenticate
  useEffect(() => {
    const authenticateAndFetchBills = async () => {
      const { isAuthenticated , patientData} = await IsPatientSessionLive();
      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/patient-login');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${URL}/api/auth/fetch-bills`);
        const temp = response.data.bills.filter(
          (item) => item.patient._id === patientData._id
        );
        setBills(temp);
      } catch (err) {
        setError('Error fetching bills.');
      }
      setLoading(false);
    };

    authenticateAndFetchBills();
  }, [navigate]);


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

      {/* Filter for Bills */}
      <div className="filter-container">
        <label htmlFor="filter">Filter by Status:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Requested">Requested</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Confirm">Confirm</option>
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
                    <td>{bill.doctor.name + ' ID' + bill.doctor.doctorId}</td>
                    <td>{bill.amount}</td>
                    <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td>{bill.status}</td>
                    <td>
                      <button
                        onClick={() => handleStatusChange(bill._id, 'Confirm')}
                        className="status-btn"
                        disabled={bill.status === 'Confirm'}
                      >
                        Confirm
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

export default BillingPayments;
