import React, { useState } from 'react';
import './DoctorRegister.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    otp: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
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

    console.log(formData);

    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${URL}/api/auth/doctor-register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialty: formData.specialty
      });

      if (response.data.success) {
        // OTP sent successfully, show the verification form
        setIsOtpSent(true);
      } else {
        setError(response.data.message || 'Registration failed.');
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
      const response = await axios.post(`${URL}/api/auth/doctor-verify`, {
        code: formData.otp
      });

      if (response.data.success) {
        navigate('/doctor-home');
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
    <div className="doctor-register-page">
      <div className="doctor-register-left-container">
      <button className="reg-btn">
          <Link to="/">← Back</Link>
        </button>
        <h2>Doctor Registration</h2>
        {!isOtpSent ? (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="doc-reg-form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="doc-reg-form-group">
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
            <div className="doc-reg-form-group">
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
            <div className="doc-reg-form-group">
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
            <div className="doc-reg-form-group">
              <label htmlFor="specialty">Specialty:</label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p>
              <Link to="/doctor-login">
                Already registered? Click here to login!
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="verification-form">
            <div className="doc-reg-form-group">
              <label htmlFor="otp">Enter 6-digit OTP sent to your email:</label>
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
      <div className="doctor-register-right-container">
        <h2>Welcome to MedTech Clinic!!</h2>
      </div>
    </div>
  );
};

export default DoctorRegister;