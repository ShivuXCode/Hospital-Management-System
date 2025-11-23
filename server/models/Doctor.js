const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Link back to authentication User (optional)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  specialization: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  experience: { type: Number, default: 0 },
  qualification: { type: String, trim: true },
  availability: { type: String, trim: true },
  photo: { type: String, trim: true },
  languages: { type: [String], default: [] },
  about: { type: String, trim: true },
  consultationTypes: { 
    type: [String], 
    enum: ['video', 'physical', 'both'], 
    default: ['both'] 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
