const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Details
  phone: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  // Medical Details
  allergies: {
    type: String,
    trim: true
  },
  ongoingTreatments: {
    type: String,
    trim: true
  },
  // Health Tracker
  healthTracker: {
    height: {
      type: Number,
      min: 100,
      max: 250,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (v >= 100 && v <= 250);
        },
        message: 'Height must be between 100 and 250 cm'
      }
    },
    weight: {
      type: Number,
      min: 30,
      max: 250,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (v >= 30 && v <= 250);
        },
        message: 'Weight must be between 30 and 250 kg'
      }
    },
    bloodPressure: {
      type: String,
      trim: true
    },
    sugarLevel: {
      type: Number,
      min: 0,
      max: 1000
    },
    bmi: {
      type: Number,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to calculate BMI before saving
patientProfileSchema.pre('save', function(next) {
  if (this.healthTracker.height && this.healthTracker.weight) {
    const heightInMeters = this.healthTracker.height / 100;
    this.healthTracker.bmi = parseFloat((this.healthTracker.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
