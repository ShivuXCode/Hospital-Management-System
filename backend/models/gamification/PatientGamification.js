const mongoose = require('mongoose');

const PatientGamificationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    activeQuests: [
      {
        quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
        progress: mongoose.Schema.Types.Mixed,
        startedAt: { type: Date, default: Date.now },
      },
    ],
    completedQuests: [
      {
        quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientGamification', PatientGamificationSchema);
