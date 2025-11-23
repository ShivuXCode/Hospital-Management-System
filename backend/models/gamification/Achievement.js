const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    description: String,
    points: { type: Number, default: 10 },
    icon: String,
    criteria: mongoose.Schema.Types.Mixed, // flexible rule definition
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', AchievementSchema);
