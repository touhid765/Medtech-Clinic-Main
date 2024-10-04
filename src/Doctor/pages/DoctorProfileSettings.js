import React, { useState } from 'react';
import './DoctorProfileSettings.css';

const DoctorProfileSettings = () => {
  const [formData, setFormData] = useState({
    doctorName: 'Dr. John Doe',
    email: 'doctor@example.com',
    password: '',
    confirmPassword: '',
    specialty: 'Cardiology',
    clinicAddress: '123 Clinic Street, City',
    timeSlots: ['9:00-10:00', '10:00-11:00'],
    dateUnavailable: ['2024-09-24', '2024-09-25']
  });

  // Function to handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle adding a new time slot
  const handleAddTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, '']
    });
  };

  // Handle deleting a time slot
  const handleDeleteTimeSlot = (index) => {
    const updatedTimeSlots = formData.timeSlots.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      timeSlots: updatedTimeSlots
    });
  };

  // Handle adding a new unavailable date
  const handleAddDateUnavailable = () => {
    setFormData({
      ...formData,
      dateUnavailable: [...formData.dateUnavailable, '']
    });
  };

  // Handle deleting an unavailable date
  const handleDeleteDateUnavailable = (index) => {
    const updatedDates = formData.dateUnavailable.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      dateUnavailable: updatedDates
    });
  };

  // Handle time slot change
  const handleTimeSlotChange = (index, value) => {
    const updatedTimeSlots = formData.timeSlots.map((slot, i) =>
      i === index ? value : slot
    );
    setFormData({
      ...formData,
      timeSlots: updatedTimeSlots
    });
  };

  // Handle unavailable date change
  const handleDateUnavailableChange = (index, value) => {
    const updatedDates = formData.dateUnavailable.map((date, i) =>
      i === index ? value : date
    );
    setFormData({
      ...formData,
      dateUnavailable: updatedDates
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here (e.g., sending data to backend)
    console.log('Updated Profile Data:', formData);
  };

  return (
    <div className="doctor-profile-settings-container">
      <h2>Doctor Profile Settings</h2>
      <form onSubmit={handleSubmit} className="profile-settings-form">

        {/* Section 1: Basic Info */}
        <section className="section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="doctorName">Doctor Name:</label>
            <input
              type="text"
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
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
        </section>

        {/* Section 2: Password */}
        <section className="section">
          <h3>Password</h3>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Section 3: Professional Details */}
        <section className="section">
          <h3>Professional Details</h3>
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor="clinicAddress">Clinic Address:</label>
            <input
              type="text"
              id="clinicAddress"
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        {/* Section 4: Availability */}
        <section className="section">
          <h3>Availability</h3>

          {/* Time Slots */}
          <div className="form-group">
            <label>Time Slots:</label>
            {formData.timeSlots.map((slot, index) => (
              <div key={index} className="time-slot-row">
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                />
                <button type="button" onClick={() => handleDeleteTimeSlot(index)}>Delete</button>
              </div>
            ))}
            <button type="button" onClick={handleAddTimeSlot}>Add Time Slot</button>
          </div>

          {/* Unavailable Dates */}
          <div className="form-group">
            <label>Dates Unavailable:</label>
            {formData.dateUnavailable.map((date, index) => (
              <div key={index} className="date-row">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateUnavailableChange(index, e.target.value)}
                />
                <button type="button" onClick={() => handleDeleteDateUnavailable(index)}>Delete</button>
              </div>
            ))}
            <button type="button" onClick={handleAddDateUnavailable}>Add Unavailable Date</button>
          </div>
        </section>

        <button type="submit" className="save-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default DoctorProfileSettings;
