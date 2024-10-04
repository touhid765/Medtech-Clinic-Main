import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
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
    ref: 'Patient',  // Reference to the patient receiving the prescription
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // Reference to the prescribing doctor
    required: true
  },
  prescriptionDate: {
    type: Date,
    default: Date.now,  // Default to the date when the prescription is created
    required: true
  },
  medications: [{
    medicineName: {
      type: String,
      required: true  // Medicine name is required
    },
    dosage: {
      type: String,
      required: true  // Example: '500mg', '1 tablet'
    },
    form: {
      type: String,  // Example: 'tablet', 'capsule', 'syrup'
      required: true
    },
    frequency: {
      type: String,  // Example: 'twice a day', 'once a day'
      required: true
    },
    duration: {
      type: String,  // Example: '7 days', '2 weeks'
      required: true
    },
    route: {
      type: String,  // Example: 'oral', 'topical', 'intravenous'
      required: true
    },
    specialInstructions: {
      type: String,  // Example: 'Take with food', 'Avoid alcohol'
      default: ''
    }
  }],
  refillInfo: {
    refillsAllowed: {
      type: Number,  // Number of times the prescription can be refilled
      default: 0
    },
    refillsUsed: {
      type: Number,  // Track the number of refills already used
      default: 0
    }
  },
  diagnosis: {
    type: String,  // Doctor’s diagnosis or reason for prescribing the medication
    required: true
  },
  isEmergency: {
    type: Boolean,
    default: false  // Whether the prescription is for emergency use
  },
  followUpDate: {
    type: Date  // Date for follow-up visit or review
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // User who created the prescription, could be the doctor or admin
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // User who last updated the prescription, for audit purposes
  }
}, { timestamps: true });

// Apply the auto-increment plugin to the prescriptionSchema
prescriptionSchema.plugin(AutoIncrement, { inc_field: 'prescriptionId', start_seq: 1 });

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
