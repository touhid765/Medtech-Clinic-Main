import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TestResultsManage.css';
import { IsClinicSessionLive } from '../utils/IsClinicSessionLive';
import { useNavigate } from 'react-router-dom';

const URL = process.env.REACT_APP_BACKEND_URL; // Ensure this is correctly set in .env

const TestResultsManage = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    appointmentId:'',
    testType: '',
    testResult: '',
    file: null,
  });

  useEffect(() => {
    const authenticateAndFetchAppointments = async () => {
      const { isAuthenticated } = await IsClinicSessionLive();

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        navigate('/clinic-login');
        setLoading(false);
        return;
      }
      setLoading(false);
    };

    authenticateAndFetchAppointments();
  }, [navigate]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.post(`${URL}/api/auth/fetch-test-result`);

        if (response.data.success) {
          setTestResults(response.data.testResults);
        } else {
          setError(response.data.message || 'Failed to fetch tests');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong while fetching tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []); // Fetch tests once

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { file, ...testDetails } = formData;
  
    let fileId = '';
    let fileName = '';
    if (file) {
      const formDataFile = new FormData();
      formDataFile.append('file', file); // Ensure the field name matches 'uploadTestResult'
  
      try {
        const response = await axios.post(`${URL}/api/auth/upload-test-result`, formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        fileId = response.data.file.id;
        fileName = response.data.file.filename;
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Error uploading file. Please try again.');
        return;
      }
    }
  
    try {
      const response = await axios.post(`${URL}/api/auth/create-test-result`, {
        ...testDetails,
        fileReference: fileId,
        fileName:fileName
      });
      if (response.data.success) {
        setFormData({
          patientName: '',
          patientId: '',
          appointmentId: '',
          testType: '',
          testResult: '',
          file: null,
        });
        setTestResults((prevResults) => [...prevResults, response.data.newTestResult]); // Add new test result to the state
      } else {
        setError(response.data.message || 'Error saving test result.');
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      setError('Error saving test result. Please try again.');
    }
  };

  const handleDownload = (fileId) => {
    window.open(`${URL}/api/auth/test-download/${fileId}`);
  };

  return (
    <div className="test-results-manage-container">
      <h1>Test Results Management</h1>

      <div className="form-section">
        <h2>Submit Test Result</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Patient Name:
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Patient ID:
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Appointment ID:
            <input
              type="text"
              name="appointmentId"
              value={formData.appointmentId}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Test Type:
            <input
              type="text"
              name="testType"
              value={formData.testType}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Test Result (Overview):
            <input
              type="text"
              name="testResult"
              value={formData.testResult}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            File:
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
            />
          </label>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>

      {loading && <p>Loading tests...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results-table">
        <h2>Submitted Test Results</h2>
        <table>
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient Name</th>
              <th>Patient ID</th>
              <th>Test Type</th>
              <th>Test Result</th>
              <th>File</th>
              <th>Action</th>
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
                <td><button>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestResultsManage;
