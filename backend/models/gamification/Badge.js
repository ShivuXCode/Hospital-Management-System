const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    description: String,
    icon: String,
    level: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    criteria: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', BadgeSchema);
