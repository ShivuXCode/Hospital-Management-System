const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema(
  {
    temperature: Number,
    bloodPressure: String,
    pulse: Number,
    respirationRate: Number,
    spo2: Number,
  },
  { _id: false }
);

const MedicationSchema = new mongoose.Schema(
  {
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    notes: String,
  },
  { _id: false }
);

const LabResultSchema = new mongoose.Schema(
  {
    testName: String,
    result: String,
    unit: String,
    referenceRange: String,
    date: { type: Date, default: Date.now },
    attachmentUrl: String,
  },
  { _id: false }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    visitDate: { type: Date, default: Date.now },
    reason: String,
    diagnosis: String,
    notes: String,
    vitals: VitalSchema,
    medications: { type: [MedicationSchema], default: [] },
    labResults: { type: [LabResultSchema], default: [] },
    attachments: [{ url: String, name: String }],
    followUpDate: Date,
    status: { type: String, enum: ['open','closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
