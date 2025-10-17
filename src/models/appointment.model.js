const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'Confirmed' },
  
  // Patient details
  patientDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    reasonForVisit: { type: String },
    preferredLanguage: { type: String, default: 'English' }
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
