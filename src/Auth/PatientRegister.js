import React, { useState } from 'react';
import './PatientRegister.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios

const URL = process.env.REACT_APP_BACKEND_URL;

const PatientRegister = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp:''
  });
  const [error, setError] = useState(null);  // State to manage error messages
  const [loading, setLoading] = useState(false);  // State to manage loading state
  const [isOtpSent, setIsOtpSent] = useState(false); // State to manage form visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${URL}/api/auth/patient-register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // OTP sent successfully, show the verification form
        setIsOtpSent(true);
        
      } else {
          // Handle error case
          setError(response.data.message || 'Registration failed.');
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (formData.otp.length !== 6) {
      setError('Enter 6 digit otp.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${URL}/api/auth/patient-verify`, {
        code: formData.otp
      });

      if (response.data.success) {
        // Verification successful, navigate to patient home page
        navigate('/patient-home');
      } else {
        setError(response.data.message || 'Verification failed.');
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
    <div className="register-page">
      <div className="register-left-container">
        
        <button className="reg-btn">
          <Link to="/">← Back</Link>
        </button>
        <h2>Patient Registration</h2>
        {!isOtpSent ? (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="reg-form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="email">Email Id:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p>
              <Link to="/patient-login">
                Already registered? Click here to login!
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="verification-form">
            <div className="reg-form-group">
              <label htmlFor="otp">Enter 6 digit otp sent to you email:</label>
              <input
                type="text"
                id="otpe"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}
      </div>
      <div className="register-right-container">
        <h2>Welcome to MedTech Clinic!!</h2>
      </div>
    </div>
  );
};

export default PatientRegister;
