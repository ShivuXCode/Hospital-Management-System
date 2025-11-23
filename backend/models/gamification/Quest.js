const mongoose = require('mongoose');

const QuestTaskSchema = new mongoose.Schema(
  {
    taskCode: { type: String, required: true },
    description: String,
    target: Number,
    progressType: { type: String, enum: ['count','value','boolean'], default: 'count' },
  },
  { _id: false }
);

const QuestSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    description: String,
    tasks: { type: [QuestTaskSchema], default: [] },
    rewards: { points: { type: Number, default: 0 }, badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }] },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quest', QuestSchema);
