import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL; // Replace with your actual backend URL

// Function that checks if the clinic session is live and returns the clinic data
export const IsClinicSessionLive = async () => {
  try {
    const response = await axios.get(`${URL}/api/auth/clinic-auth`, {
      withCredentials: true, // Ensure that cookies (like the JWT) are sent with the request
    });

    if (response.data.success) {
      // Session is live, return clinic data along with success flag
      return { isAuthenticated: true, clinicData: response.data.clinic };
    } else {
      // Session is not live, return an unauthenticated state
      return { isAuthenticated: false, clinicData: null };
    }
  } catch (err) {
    console.error('Error checking session:', err);
    // Return an error state and no clinic data
    return { isAuthenticated: false, clinicData: null, error: err.message };
  }
};