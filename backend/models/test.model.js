import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const testSchema = new mongoose.Schema({
  testId: {
    type: Number,
    unique: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',  // Reference to the associated appointment
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Reference to the patient receiving the test
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // Reference to the doctor who ordered the test
    required: true
  },
  testType: {
    type: String,
    required: true,  // Example: 'Blood Test', 'X-ray', etc.
  },
  testDate: {
    type: Date,
    default: Date.now,  // Default to the date when the test is created
    required: true
  },
  results: {
    type: String,  // Short description of test results
    required: true
  },
  diagnosis: {
    type: String,  // Doctor’s diagnosis or reason for the test
  },
  followUpDate: {
    type: Date,  // Optional date for a follow-up test or appointment
  },
  fileReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files',  // Reference to the file in GridFS (PDF, image)
    required: false  // Optional, if there are attached files
  },
  fileName: {
    type: String,
    required:true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // User who created the test, could be the doctor or admin
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // User who last updated the test, for audit purposes
  }
}, { timestamps: true });

// Apply the auto-increment plugin to the testSchema
testSchema.plugin(AutoIncrement, { inc_field: 'testId', start_seq: 1 });

export const Test = mongoose.model('Test', testSchema);