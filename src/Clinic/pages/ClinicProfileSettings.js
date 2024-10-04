import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClinicProfileSettings.css';
import { IsClinicSessionLive } from '../utils/IsClinicSessionLive';

const URL = process.env.REACT_APP_BACKEND_URL;

const ClinicProfileSettings = () => {
  const [clinicData, setClinicData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    servicesOffered: [],
    operatingHours: {
      days: [],
      timeSlots: []
    },
    emergencyContact: {
      name: '',
      relationship: '',
      contactNumber: ''
    },
    insuranceAccepted: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      const { isAuthenticated, clinicData } = await IsClinicSessionLive();

      if (!isAuthenticated) {
        setError('You are not authenticated. Please log in again.');
        return;
      }
      setClinicData(clinicData);
      const clinic = clinicData;
      if (clinic) {
        setFormData({
          name: clinic.name,
          email: clinic.email,
          contactNumber: clinic.contactNumber,
          address: clinic.address || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          servicesOffered: clinic.servicesOffered || [],
          operatingHours: clinic.operatingHours || {
            days: [],
            timeSlots: []
          },
          emergencyContact: clinic.emergencyContact || {
            name: '',
            relationship: '',
            contactNumber: ''
          },
          insuranceAccepted: clinic.insuranceAccepted || []
        });
      }
      
      setLoading(false);
    };

    fetchClinicData();
  }, []);

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;

    if (dataset.address) {
      setFormData(prevData => ({
        ...prevData,
        address: {
          ...prevData.address,
          [name]: value
        }
      }));
    } else if (dataset.emergencyContact) {
      setFormData(prevData => ({
        ...prevData,
        emergencyContact: {
          ...prevData.emergencyContact,
          [name]: value
        }
      }));
    } else if (dataset.operatingHours) {
      setFormData(prevData => ({
        ...prevData,
        operatingHours: {
          ...prevData.operatingHours,
          [name]: value
        }
      }));
    } else if (name === 'servicesOffered' || name === 'insuranceAccepted') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Construct the data object with attributes explicitly defined
    const data = {
      clinicId: clinicData._id,
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      address: {
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        postalCode: formData.address.postalCode,
        country: formData.address.country
      },
      servicesOffered: formData.servicesOffered,
      operatingHours: {
        days: formData.operatingHours.days,
        timeSlots: formData.operatingHours.timeSlots
      },
      emergencyContact: {
        name: formData.emergencyContact.name,
        relationship: formData.emergencyContact.relationship,
        contactNumber: formData.emergencyContact.contactNumber
      },
      insuranceAccepted: formData.insuranceAccepted
    };
  
    try {
      const response = await axios.post(`${URL}/api/auth/update-clinic`, data);
      if (response.data.success) {
        const clinic = response.data.clinicData;
        if (clinic) {
          setFormData({
            name: clinic.name,
            email: clinic.email,
            contactNumber: clinic.contactNumber,
            address: clinic.address || {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            servicesOffered: clinic.servicesOffered || [],
            operatingHours: clinic.operatingHours || {
              days: [],
              timeSlots: []
            },
            emergencyContact: clinic.emergencyContact || {
              name: '',
              relationship: '',
              contactNumber: ''
            },
            insuranceAccepted: clinic.insuranceAccepted || []
          });
        }
      }
    } catch (error) {
      console.error('Error updating clinic:', error);
      // Handle error (e.g., show an error message)
    }
  };
  

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="clinic-profile-settings-container">
      <h2>Clinic Profile Settings</h2>
      <form onSubmit={handleSubmit} className="profile-settings-form">
        <div className="form-group">
          <label htmlFor="name">Clinic Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="address-street">Street:</label>
          <input
            type="text"
            id="address-street"
            name="street"
            data-address
            value={formData.address.street}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address-city">City:</label>
          <input
            type="text"
            id="address-city"
            name="city"
            data-address
            value={formData.address.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address-state">State:</label>
          <input
            type="text"
            id="address-state"
            name="state"
            data-address
            value={formData.address.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address-postalCode">Postal Code:</label>
          <input
            type="text"
            id="address-postalCode"
            name="postalCode"
            data-address
            value={formData.address.postalCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address-country">Country:</label>
          <input
            type="text"
            id="address-country"
            name="country"
            data-address
            value={formData.address.country}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="servicesOffered">Services Offered (comma-separated):</label>
          <input
            type="text"
            id="servicesOffered"
            name="servicesOffered"
            value={formData.servicesOffered.join(', ')}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="operatingHours-days">Operating Days (comma-separated):</label>
          <input
            type="text"
            id="operatingHours-days"
            name="days"
            data-operating-hours
            value={formData.operatingHours.days.join(', ')}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="operatingHours-timeSlots">Operating Time Slots (comma-separated):</label>
          <input
            type="text"
            id="operatingHours-timeSlots"
            name="timeSlots"
            data-operating-hours
            value={formData.operatingHours.timeSlots.join(', ')}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContact-name">Emergency Contact Name:</label>
          <input
            type="text"
            id="emergencyContact-name"
            name="name"
            data-emergency-contact
            value={formData.emergencyContact.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContact-relationship">Emergency Contact Relationship:</label>
          <input
            type="text"
            id="emergencyContact-relationship"
            name="relationship"
            data-emergency-contact
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContact-contactNumber">Emergency Contact Number:</label>
          <input
            type="text"
            id="emergencyContact-contactNumber"
            name="contactNumber"
            data-emergency-contact
            value={formData.emergencyContact.contactNumber}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="insuranceAccepted">Insurance Accepted (comma-separated):</label>
          <input
            type="text"
            id="insuranceAccepted"
            name="insuranceAccepted"
            value={formData.insuranceAccepted.join(', ')}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="save-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default ClinicProfileSettings;
