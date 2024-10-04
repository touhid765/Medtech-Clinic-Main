import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL; // Replace with your actual backend URL

// Function that checks if the doctor session is live and returns the doctor data
export const IsDoctorSessionLive = async () => {
  try {
    const response = await axios.get(`${URL}/api/auth/doctor-auth`, {
      withCredentials: true, // Ensure that cookies (like the JWT) are sent with the request
    });

    if (response.data.success) {
      // Session is live, return doctor data along with success flag
      return { isAuthenticated: true, doctorData: response.data.doctor };
    } else {
      // Session is not live, return an unauthenticated state
      return { isAuthenticated: false, doctorData: null };
    }
  } catch (err) {
    console.error('Error checking session:', err);
    // Return an error state and no doctor data
    return { isAuthenticated: false, doctorData: null, error: err.message };
  }
};