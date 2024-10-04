import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL; // Replace with your actual backend URL

// Function that checks if the patient session is live and returns the patient data
export const IsPatientSessionLive = async () => {
  try {
    const response = await axios.get(`${URL}/api/auth/patient-auth`, {
      withCredentials: true, // Ensure that cookies (like the JWT) are sent with the request
    });

    if (response.data.success) {
      // Session is live, return patient data along with success flag
      return { isAuthenticated: true, patientData: response.data.patient };
    } else {
      // Session is not live, return an unauthenticated state
      return { isAuthenticated: false, patientData: null };
    }
  } catch (err) {
    console.error('Error checking session:', err);
    // Return an error state and no patient data
    return { isAuthenticated: false, patientData: null, error: err.message };
  }
};