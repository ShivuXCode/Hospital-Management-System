const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  // Link to auth User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  qualification: { type: String, trim: true },
  experience: { type: Number, default: 0 },
  department: { type: String, trim: true },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', ''], default: '' },
  certifications: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  about: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Nurse', nurseSchema);
