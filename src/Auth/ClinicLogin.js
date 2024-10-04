import React, { useState } from 'react';
import './ClinicLogin.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;

const ClinicLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);  // State to manage error messages
  const [loadingLogin, setLoadingLogin] = useState(false);  // State to manage loading state
  const [loadingForgot, setLoadingForgot] = useState(false);  // State to manage loading state

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setError(null);

    try {
      const response = await axios.post(`${URL}/api/auth/clinic-login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Logged in successfully, navigate to clinic home page
        navigate('/clinic-home');
      } else {
        // Handle error case
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      // Handle different error cases
      if (err.response) {
        setError(err.response.data.message || 'Something went wrong.');
      } else {
        setError('Server is not responding.');
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoadingForgot(true);
    setError(null);

    try {
      const response = await axios.post(`${URL}/api/auth/clinic-forgot`, {
        email: formData.email
      });

      if (!response.data.success) {
        // Handle error case
        setError(response.data.message || 'Reset link failed to send.');
      } else {
        setError(response.data.message || 'Reset link sent successfully.');
      }
    } catch (err) {
      // Handle different error cases
      if (err.response) {
        setError(err.response.data.message || 'Something went wrong.');
      } else {
        setError('Server is not responding.');
      }
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <div className="clinic-login-page">
      <div className="clinic-login-left-container">
        <button className="hm-btn">
          <Link to="/">← Back</Link>
        </button>
        <h2>Welcome Back!!</h2>
      </div>
      <div className="clinic-login-right-container">
        <h2>Clinic Login</h2>
        
        <form onSubmit={handleSubmit} className="clinic-login-form">
          <div className="clinic-form-group">
            <label htmlFor="email">Username:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="clinic-form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="clinic-login-btn" disabled={loadingLogin}>
            {loadingLogin ? "Logging in..." : "Login"}
          </button>
          </div>
          
          <button
            type="button"
            className="forgot-btn"
            disabled={loadingForgot}
            onClick={handleForgot}
          >
            {loadingForgot ? "Sending reset link..." : "Forgot Password?"}
          </button>
          {error && <div className="error-message">{error}</div>}
          <p>
            <Link to="/clinic-register">
              Not registered? Click here to register!
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ClinicLogin;
