import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const patientSchema = new mongoose.Schema({
  patientId: {
    type: Number,
    unique:true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  contactNumber: {
    type: Number
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  },
  medicalHistory: {
    type: [String],  // Array of medical conditions, allergies, etc.
    default: []
  },
  insuranceProvider: {
    type: String,
    default: null
  },
  insurancePolicyNumber: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpireAt: Date,
  verificationToken: String,
  verificationExpireAt: Date
}, { timestamps: true });

// Apply the auto-increment plugin to the patientSchema
patientSchema.plugin(AutoIncrement, { inc_field: 'patientId', start_seq: 101 });

export const Patient = mongoose.model('Patient', patientSchema);
