const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorName: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  department: { type: String },
  consultationType: { 
    type: String, 
    enum: ['video', 'physical'],
    required: true
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Pending'
  },
  // Nurse confirmation workflow
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: {
    type: Date
  },
  // Rescheduling tracking
  originalDate: { type: String },
  originalTime: { type: String },
  rescheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rescheduledAt: {
    type: Date
  },
  rescheduleReason: { type: String },
  notes: { type: String },
  meetingLink: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
