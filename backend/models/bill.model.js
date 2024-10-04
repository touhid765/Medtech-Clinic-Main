import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const billSchema = new mongoose.Schema({
  billId: {
    type: Number,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Reference to the patient who made the bill
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // Reference to the doctor with whom the bill is booked
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',  // Reference to the appointment for the bill
    required: true
  },
  billDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value <= new Date();  // Prevent future dates
      },
      message: 'Bill date cannot be in the future'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Requested', 'Paid','Cancelled', 'Confirm'],
    default: 'Requested'
  },
  amount: {
    type: Number,
    required: true,
    min: 0 // Ensures the amount can't be negative
  },
  notes: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User (either admin or clinic) who created the bill
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User who last updated the bill
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Apply the auto-increment plugin to the billSchema
billSchema.plugin(AutoIncrement, { inc_field: 'billId', start_seq: 1 });

export const Bill = mongoose.model('Bill', billSchema);
