const mongoose = require('mongoose');

const LeaderboardEntrySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, default: 0 },
    rank: Number,
  },
  { _id: false }
);

const LeaderboardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    period: { type: String, enum: ['daily','weekly','monthly','all_time'], default: 'all_time' },
    snapshotDate: { type: Date, default: Date.now },
    entries: { type: [LeaderboardEntrySchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
