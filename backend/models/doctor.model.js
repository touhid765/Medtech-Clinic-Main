import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: Number,
    unique: true
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
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  specialty: {
    type: String,
    required: true
  },
  qualifications: {
    type: [String], // Array of qualifications, degrees, etc.
    default: []
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  clinicDetails: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    contactNumber: String
  },
  availability: {
    dateUnavailable: {
      type: [Date], // Array of dates not available
      default: []
    },
    timeSlots: {
      type: [String], // Array of time slots e.g. ['09:00-11:00', '14:00-17:00']
      default: ['9:00-10:00','10:00-11:00','11:00-12:00','12:00-1:00','2:00-3:00','3:00-4:00']
    }
  },
  patientsManaged: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Patient',
    default: []
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

// Apply the auto-increment plugin to the doctorSchema
doctorSchema.plugin(AutoIncrement, { inc_field: 'doctorId', start_seq: 101 });

export const Doctor = mongoose.model('Doctor', doctorSchema);
