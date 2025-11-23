const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name must be less than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: ['Admin', 'Doctor', 'Nurse', 'Patient'],
    default: 'Patient',
    required: true
  },
  // Doctor/Nurse specific fields
  department: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Nurse specific fields
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', ''],
    default: ''
  },
  // Additional profile fields
  availableDays: {
    type: String,
    trim: true
  },
  availableTimings: {
    type: String,
    trim: true
  },
  languages: {
    type: [String],
    default: []
  },
  about: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  patientsTreated: {
    type: Number,
    default: 0
  },
  publications: {
    type: Number,
    default: 0
  },
  awards: {
    type: [String],
    default: []
  },
  // Doctor consultation types
  consultationTypes: {
    type: [String],
    enum: ['video', 'physical', 'both'],
    default: ['physical']
  },
  // Reference to doctor profile (if role === 'Doctor')
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  // Reference to nurse profile (if role === 'Nurse')
  nurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nurse'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
