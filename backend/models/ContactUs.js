const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['pending', 'resolved'], 
      default: 'pending' 
    },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactUs', contactUsSchema);
