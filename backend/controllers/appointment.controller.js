import { Appointment } from "../models/appointment.model.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";

// Controller for booking an appointment (single clinic setup)
export const bookAppointment = async (req, res) => {
    const { patientId, doctorId, appointmentDate, timeSlot, serviceType, reasonForVisit, isEmergency } = req.body;
    try {
        // Validate required fields
        if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
            throw new Error("All fields are required");
        }

        // Check if patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Check for scheduling conflicts (optional)
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot: timeSlot,
            status: { $in: ['Pending', 'Scheduled', 'Rescheduled'] } // Only check for active appointments
        });

        if (existingAppointment) {
            return res.status(404).json({ success: false, message:"The doctor is not available at the selected time slot." });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot: timeSlot,
            serviceType: serviceType,
            reasonForVisit: reasonForVisit || '',
            isEmergency: isEmergency || false,
            status: 'Pending',  // Appointment status starts as Pending
            createdBy: patientId
        });

        // Save the appointment to the database
        await newAppointment.save();

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment: newAppointment
        });

    } catch (error) {
        console.error("Error booking appointment: ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Controller for fetching doctors
export const fetchDoctors = async (req, res) => {
    try {
        // Fetch doctors from the database
        const doctors = await Doctor.find().select('doctorId name availability specialty');
        
        // Return doctors' data
        res.status(200).json({
            success: true,
            doctors: doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctors.'
        });
    }
};

// Controller for fetching appoinments
export const fetchAppointments = async (req, res) => {
    try {
        // Fetch appointment from the database
        const appointment = await Appointment.find()
        .populate('patient')
        .populate('doctor')
        .exec();
        
        // Return appoitnments' data
        res.status(200).json({
            success: true,
            appointment: appointment
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctors.'
        });
    }
};

// Controller for fetching patient appointments
export const fetchMyAppointments = async (req, res) => {
    const { patientId } = req.body;
    // Validate that the patientId is provided
    if (!patientId) {
        return res.status(400).json({
            success: false,
            message: 'Patient ID is required.',
        });
    }

    try {
        // Fetch appointments from the database based on patientId
        const appointments = await Appointment.find({ patient: patientId });
        
        if (!appointments.length) {
            return res.status(404).json({
                success: false,
                message: 'No appointments found for this patient.',
            });
        }

        // Return the appointment data
        res.status(200).json({
            success: true,
            appointments:appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching appointments.',
        });
    }
};


// Controller for canceling patient appointments
export const cancelAppointment = async (req, res) => {
    const { appointmentId } = req.body;

    // Validate that the appointmentId is provided
    if (!appointmentId) {
        return res.status(400).json({
            success: false,
            message: 'Appointment ID is required.',
        });
    }

    try {
        // Fetch the appointment from the database based on appointmentId
        const appointment = await Appointment.findById(appointmentId);

        // If no appointment is found
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'No appointment found with the given ID.',
            });
        }

        // Check if the appointment is already canceled
        if (appointment.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'The appointment is already canceled.',
            });
        }

        // Update the appointment status to "Cancelled"
        appointment.status = 'Cancelled';
        await appointment.save();

        // Return the updated appointment data
        return res.status(200).json({
            success: true,
            message: 'Appointment successfully canceled.',
            appointment,
        });
    } catch (error) {
        console.error('Error canceling appointment:', error);

        // Handle any server errors
        return res.status(500).json({
            success: false,
            message: 'Server error while canceling the appointment.',
            error: error.message,
        });
    }
};

// Controller for reshechduling patient appointments
export const rescheduleAppointment = async (req, res) => {
    const { appointmentId, newDate, newTimeSlot } = req.body;
    
    // Validate that the appointmentId is provided
    if (!appointmentId) {
        return res.status(400).json({
            success: false,
            message: 'Appointment ID is required.',
        });
    }

    try {
        // Fetch the appointment from the database based on appointmentId
        const appointment = await Appointment.findById(appointmentId);

        // If no appointment is found
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'No appointment found with the given ID.',
            });
        }

        // Check if the appointment is already canceled
        if (appointment.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'The appointment is already canceled.',
            });
        }

        // Update the appointment status to "Cancelled"
        appointment.appointmentDate = new Date(newDate);
        appointment.appointmentTime = newTimeSlot;
        appointment.status = 'Rescheduled';
        await appointment.save();

        // Return the updated appointment data
        return res.status(200).json({
            success: true,
            message: 'Appointment successfully canceled.',
            appointment,
        });
    } catch (error) {
        console.error('Error reschedule appointment:', error);

        // Handle any server errors
        return res.status(500).json({
            success: false,
            message: 'Server error while rescheduling the appointment.',
            error: error.message,
        });
    }
};


// Controller for reshechduling patient appointments
export const changeStatusOfAppointment = async (req, res) => {
    const { appointmentId, status } = req.body;
    // Validate that the appointmentId is provided
    if (!appointmentId) {
        return res.status(400).json({
            success: false,
            message: 'Appointment ID is required.',
        });
    }

    try {

        // Fetch the appointment from the database based on appointmentId
        const appointment = await Appointment.findById(appointmentId);
        
        // If no appointment is found
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'No appointment found with the given ID.',
            });
        }

        // Check if the appointment is already canceled
        if (appointment.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'The appointment is already canceled.',
            });
        }
        console.log(status);
        appointment.status = status;
        await appointment.save();

        // Return the updated appointment data
        return res.status(200).json({
            success: true,
            message: 'Appointment status changes successfully.',
            appointment,
        });
    } catch (error) {
        console.error('Error status changes appointment:', error);

        // Handle any server errors
        return res.status(500).json({
            success: false,
            message: 'Server error while status changes the appointment.',
            error: error.message,
        });
    }
};