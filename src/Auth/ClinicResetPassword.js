import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ClinicResetPassword.css'; // Add your CSS file if needed

const URL = process.env.REACT_APP_BACKEND_URL;

const ClinicResetPassword = () => {
  const { token } = useParams(); // Extract the token from the URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);  // State to manage loading state

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true before making API call

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false); // Set loading state to false after API call
      return;
    }

    try {
      const response = await axios.post(`${URL}/api/auth/clinic-reset/${token}`, {
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess('Password reset successfully. Redirecting to login page...');
        setTimeout(() => navigate('/clinic-login'), 3000); // Redirect to login after 3 seconds
      } else {
        setError(response.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally{
      setLoading(false); // Set loading state to false after API call
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className="reset-password-btn" disabled={loading}>
          {loading ? 'Working...' : 'Reset'}
        </button>
      </form>
    </div>
  );
};

export default ClinicResetPassword;
