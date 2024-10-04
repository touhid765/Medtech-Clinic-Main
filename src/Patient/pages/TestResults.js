import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TestResults.css';
import { IsPatientSessionLive } from '../utils/IsPatientSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL; // Ensure this is correctly set in .env

const TestResults = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateAndFetchAppointments = async () => {
      try {
        const { isAuthenticated, patientData } = await IsPatientSessionLive();

        if (!isAuthenticated) {
          setError('You are not authenticated. Please log in again.');
          navigate('/patient-login');
          return;
        }

        const patientId = patientData._id;
        // Fetch test results once the patient is authenticated
        const response = await axios.post(`${URL}/api/auth/fetch-test-result`);
        if (response.data.success) {
          const temp = response.data.testResults.filter(
            (item) => item.patient._id === patientId
          );
          setTestResults(temp);
        } else {
          setError(response.data.message || 'Failed to fetch tests');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong while fetching tests.');
      } finally {
        setLoading(false);
      }
    };

    authenticateAndFetchAppointments();
  }, [navigate]);

  const handleDownload = (fileId) => {
    window.open(`${URL}/api/auth/test-download/${fileId}`);
  };

  return (
    <div className="test-results-manage-container">
      <h1>Test Results</h1>

      {loading && <p>Loading tests...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Test Type</th>
                <th>Test Result</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test) => (
                <tr key={test._id}>
                  <td>{test.appointment.appointmentId}</td>
                  <td>{test.patient.name}</td>
                  <td>{test.patient.patientId}</td>
                  <td>{test.testType}</td>
                  <td>{test.results}</td>
                  <td>
                    {test.fileReference ? (
                      <button onClick={() => handleDownload(test.fileReference)} className="download-btn">
                        Download
                      </button>
                    ) : (
                      'No file'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestResults;
