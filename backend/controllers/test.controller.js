import { Appointment } from '../models/appointment.model.js';
import { Patient } from '../models/patient.model.js';
import mongoose from 'mongoose';
import { Doctor } from '../models/doctor.model.js';
import { Test } from '../models/test.model.js'
import multer from 'multer';
import { bucket } from '../db/connectDb.js'; // Import the GridFS instance
import { Readable } from 'stream';

// Setup multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });


export const uploadTestResult = (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      const { file } = req;
  
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const readableStream = Readable.from(file.buffer);
  
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });
  
      readableStream.pipe(uploadStream);
  
      uploadStream.on('finish', () => {
        res.status(201).json({
          file: {
            filename: uploadStream.filename,
            id: uploadStream.id,
            contentType: uploadStream.contentType,
          },
        });
      });
  
      uploadStream.on('error', (error) => {
        res.status(500).json({ error: error.message });
      });
    });
  };
  

export const createTestResult = async (req, res) => {
    try {
      const { patientId, appointmentId, testType, testResult, fileReference, fileName } = req.body;
      let patient_id;
      if (patientId) {
        const patient = await Patient.findOne({ patientId: patientId }); // Use your custom ID field
        if (!patient) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        patient_id = patient._id; // Or use patient.customId if needed
      }
  
      let appointment_id;
      let doctor_id;
      if (appointmentId) {
        const appointment = await Appointment.findOne({ appointmentId: appointmentId }) // Use your custom ID field
          .populate('doctor')
          .exec();
        if (!appointment) {
          return res.status(404).json({ error: 'Appointment not found' });
        }
        appointment_id = appointment._id; // Or use appointment.customId if needed
        doctor_id = appointment.doctor._id; // Or appointment.doctor.customId if needed
      }
  
      // Save test details to the database
      const newTestResult = new Test({
        appointment: appointment_id,
        patient: patient_id,
        doctor: doctor_id,
        testType: testType,
        results: testResult,
        fileReference: fileReference,
        fileName:fileName
      });
  
      await newTestResult.save();
  
      return res.status(201).json({
        success: true,
        message: 'Test result uploaded successfully.',
        newTestResult,
      });
    } catch (error) {
      console.error('Error creating test result:', error);
      res.status(500).json({ error: error.message });
    }
};

export const fetchTestResult = async (req, res) => {
    try {
      const testResults = await Test.find()
        .populate('patient')
        .populate('appointment')
        .populate('doctor')
        .exec();
        
      return res.status(201).json({
        success: true,
        testResults:testResults,
      });
    } catch (error) {
      console.error('Error fetching test result:', error);
      res.status(500).json({ error: error.message });
    }
};
  

// export const downloadTestResult = async (req, res) => {

//     const { fileId } = req.params;
  
//     if (!fileId) {
//       return res.status(400).json({ error: 'No file ID provided' });
//     }
//     let fileName = '';
//     try {
//         const test = await Test.find({fileReference:fileId})
//         fileName = test.fileName;
//     } catch (error) {
//         return res.status(400).json({ error: 'filename not found' });
//     }
  
//     // Convert string ID to MongoDB ObjectId
//     const objectId = new mongoose.Types.ObjectId(fileId);
  
//     // Create a download stream from GridFS using ObjectId
//     const downloadStream = bucket.openDownloadStream(objectId);
  
//     // Handle errors
//     downloadStream.on('error', (error) => {
//       return res.status(404).json({ error: 'File not found' });
//     });
  
//     // Set proper headers for download
//     res.set({
//       'Content-Type': 'application/octet-stream',
//       'Content-Disposition': `attachment; filename="${fileName || 'report.pdf'}"`, // You can dynamically set the filename from metadata
//     });
  
//     // Pipe the download stream to the response
//     downloadStream.pipe(res);
//   };

export const downloadTestResult = async (req, res) => {
  const { fileId } = req.params;

  // Check if fileId is provided
  if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
  }

  let fileName = 'report.pdf'; // Default filename if not found
  let fileType = 'application/octet-stream'; // Default file type for general binary data

  try {
      // Find the test record by fileReference
      const test = await Test.findOne({ fileReference: fileId });
      
      if (!test) {
          return res.status(404).json({ error: 'Test record not found' });
      }

      fileName = test.fileName || fileName; // Set filename from DB, or default

      // Guess the MIME type based on fileName extension, fallback to octet-stream
      const fileExtension = fileName.split('.').pop().toLowerCase();
      switch (fileExtension) {
          case 'pdf':
              fileType = 'application/pdf';
              break;
          case 'png':
              fileType = 'image/png';
              break;
          case 'jpg':
          case 'jpeg':
              fileType = 'image/jpeg';
              break;
          case 'txt':
              fileType = 'text/plain';
              break;
          default:
              fileType = 'application/octet-stream'; // Generic binary file
      }
  } catch (error) {
      return res.status(500).json({ error: 'Error retrieving test data' });
  }

  // Convert fileId to MongoDB ObjectId
  const objectId = new mongoose.Types.ObjectId(fileId);

  try {
      // Create a download stream from GridFS
      const downloadStream = bucket.openDownloadStream(objectId);

      // Handle errors during file download
      downloadStream.on('error', (error) => {
          return res.status(404).json({ error: 'File not found in GridFS' });
      });

      // Set appropriate headers for file download
      res.set({
          'Content-Type': fileType,  // Set content type dynamically
          'Content-Disposition': `attachment; filename="${fileName}"`, // Dynamically set filename
      });

      // Pipe the download stream to the response
      downloadStream.pipe(res);

  } catch (error) {
      // Handle any other errors during the file download process
      return res.status(500).json({ error: 'Error during file download' });
  }
};

