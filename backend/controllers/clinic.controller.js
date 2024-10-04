import { Clinic } from '../models/clinic.model.js';

export const updateClinicDetails = async (req, res) => {
  try {
    const clinicId = req.body.clinicId; // Clinic ID should be included in the request

    // Validate clinicId
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'Clinic ID is required' });
    }

    // Destructure the fields from the request body
    const {
      name,
      email,
      contactNumber,
      address,
      servicesOffered,
      operatingHours,
      emergencyContact,
      insuranceAccepted
    } = req.body;

    // Find the clinic by ID
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    // Update the clinic with the new details
    const updatedClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      {
        name,
        email,
        contactNumber,
        address,
        servicesOffered,
        operatingHours,
        emergencyContact,
        insuranceAccepted
      },
      { new: true, runValidators: true } // Return the updated document and validate the update
    );

    // Return success response with updated clinic details
    res.status(200).json({
      success: true,
      message: 'Clinic updated successfully',
      clinicData: updatedClinic
    });
  } catch (error) {
    console.error('Error updating clinic details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
