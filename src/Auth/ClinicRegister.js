import React, { useState } from 'react';
import './ClinicRegister.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios

const URL = process.env.REACT_APP_BACKEND_URL;

const ClinicRegister = () => {
  const [formData, setFormData] = useState({
    clinicName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    otp: ''
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
      const response = await axios.post(`${URL}/api/auth/clinic-register`, {
        clinicName: formData.clinicName,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.contactNumber
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
      setError('Enter a 6-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${URL}/api/auth/clinic-verify`, {
        code: formData.otp
      });

      if (response.data.success) {
        // Verification successful, navigate to clinic home page
        navigate('/clinic-home');
      } else {
        setError(response.data.message || 'Verification failed.');
      }
    } catch (err) {
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
    <div className="clinic-register-page">
      <div className="clinic-register-left-container">
      `<button className="reg-btn">
          <Link to="/">← Back</Link>
        </button>
        <h2>Clinic Registration</h2>
        {!isOtpSent ? (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="clinic-reg-form-group">
              <label htmlFor="clinicName">Clinic Name:</label>
              <input
                type="text"
                id="clinicName"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="clinic-reg-form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="clinic-reg-form-group">
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
            <div className="clinic-reg-form-group">
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
            <div className="clinic-reg-form-group">
              <label htmlFor="contactNumber">Contact Number:</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p>
              <Link to="/clinic-login">
                Already registered? Click here to login!
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="verification-form">
            <div className="clinic-reg-form-group">
              <label htmlFor="otp">
                Enter the 6-digit OTP sent to your email:
              </label>
              <input
                type="text"
                id="otp"
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
      <div className="clinic-register-right-container">
        <h2>Welcome to MedTech Clinic!!</h2>
      </div>
    </div>
  );
};

export default ClinicRegister;
