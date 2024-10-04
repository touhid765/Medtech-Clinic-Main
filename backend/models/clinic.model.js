import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const clinicSchema = new mongoose.Schema({
  clinicId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
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
  contactNumber: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  servicesOffered: {
    type: [String], // Array of services offered by the clinic (e.g., general check-up, pediatric care)
    default: []
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'  // Reference to the doctors associated with the clinic
  }],
  operatingHours: {
    days: {
      type: [String], // Array of operating days e.g., ['Monday', 'Friday']
      default: []
    },
    timeSlots: {
      type: [String], // Array of time slots e.g., ['09:00-12:00', '14:00-18:00']
      default: []
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  },
  insuranceAccepted: {
    type: [String],  // Array of insurance providers accepted at the clinic
    default: []
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0
    },
    reviews: [{
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
      },
      rating: {
        type: Number,
        required: true
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
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

// Apply the auto-increment plugin to the clinicSchema
clinicSchema.plugin(AutoIncrement, { inc_field: 'clinicId', start_seq: 101 });

export const Clinic = mongoose.model('Clinic', clinicSchema);
