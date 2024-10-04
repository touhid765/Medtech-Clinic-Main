import { Prescription } from '../models/prescription.model.js';
import { Appointment } from '../models/appointment.model.js';
import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';

// Create a prescription controller
export const createPrescription = async (req, res) => {
  const { appointmentId, patientId, doctorId, medications, diagnosis, followUpDate, isEmergency } = req.body;
  try {
    // Validate the appointment, patient, and doctor references
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(400).json({ message: 'Appointment not found' });
    }
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found' });
    }

    // Create the new prescription
    const newPrescription = new Prescription({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,
      medications:medications,      // List of medications provided by the user
      diagnosis:diagnosis,        // The diagnosis or reason for prescription
      followUpDate:followUpDate,     // Date for follow-up appointment (optional)
      isEmergency:isEmergency,      // Emergency flag (optional)
    });

    // Save the prescription to the database
    await newPrescription.save();

    appointment.prescription = newPrescription._id;
    await appointment.save();

    // Return success response with the created prescription
    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: newPrescription
    });

  } catch (error) {
    // Handle any errors
    console.error('Error creating prescription:', error);
    return res.status(500).json({
      message: 'Server error, could not create prescription'
    });
  }
};

// Controller for fetching patient prescriptions
export const fetchMyPrescriptions = async (req, res) => {
  const { patientId } = req.body;

  // Validate that the patientId is provided
  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: 'Patient ID is required.',
    });
  }

  try {
    // Fetch prescriptions from the database for the given patientId
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name doctorId') // Populate doctor details
      .populate('appointment', 'appointmentDate appointmentId') // Populate appointment details
      .exec();

    // If no prescriptions are found
    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No prescriptions found for this patient.',
      });
    }

    // Return the prescriptions data
    return res.status(200).json({
      success: true,
      prescriptions:prescriptions,
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching prescriptions.',
    });
  }
};

// Controller for fetching patient prescriptions
export const fetchPrescriptions = async (req, res) => {
  try {
    // Fetch prescriptions from the database for the given patientId
    const prescriptions = await Prescription.find()
      .populate('doctor', 'name doctorId') // Populate doctor details
      .populate('appointment', 'appointmentDate appointmentId') // Populate appointment details
      .populate('patient', 'name patientId')
      .exec();

    // If no prescriptions are found
    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No prescriptions found',
      });
    }

    // Return the prescriptions data
    return res.status(200).json({
      success: true,
      prescriptions:prescriptions,
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching prescriptions.',
    });
  }
};

