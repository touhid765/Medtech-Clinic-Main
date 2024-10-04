import { Doctor } from '../models/doctor.model.js';

// Controller for fetching doctors
export const fetchAllDoctors = async (req, res) => {
    try {
        // Fetch doctors from the database
        const doctors = await Doctor.find();
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