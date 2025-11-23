const mongoose = require('mongoose');

const EmergencyAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low','medium','high','critical'], default: 'low' },
    category: { type: String, enum: ['system','medical','security','infrastructure','weather','other'], default: 'other' },
    status: { type: String, enum: ['active','resolved','dismissed'], default: 'active' },
    acknowledgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acknowledgedAt: Date,
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    targetRoles: [{ type: String, enum: ['Admin','Doctor','Nurse','Patient'] }],
    expiresAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyAlert', EmergencyAlertSchema);
