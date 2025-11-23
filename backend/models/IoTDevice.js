const mongoose = require('mongoose');

const IoTReadingSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    value: { type: Number },
    unit: { type: String },
    status: { type: String, enum: ['normal','warning','critical','error'], default: 'normal' },
    location: {
      room: String,
      bed: String,
      ward: String,
    },
  },
  { _id: false }
);

const IoTDeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true, trim: true },
    // keep legacy name field for compatibility
    name: { type: String, trim: true },
    deviceType: { 
      type: String, 
      enum: ['heart_monitor','blood_pressure','temperature','oxygen_saturation','glucose_meter','weight_scale','smart_bed','infusion_pump','ventilator','defibrillator'], 
      required: true 
    },
    manufacturer: String,
    model: String,
    serialNumber: String,
    macAddress: String,
    ipAddress: String,
    location: {
      ward: String,
      room: String,
      bed: String,
      floor: String,
      building: String,
    },
    patientId: String,
    patientName: String,
    status: { type: String, enum: ['online','offline','maintenance','error'], default: 'offline' },
    batteryLevel: { type: Number, min: 0, max: 100 },
    lastReading: IoTReadingSchema,
    readings: { type: [IoTReadingSchema], default: [] },
    calibrationDate: Date,
    nextCalibrationDate: Date,
    maintenanceSchedule: {
      lastMaintenance: Date,
      nextMaintenance: Date,
      maintenanceInterval: Number, // in days
    },
    alerts: [
      {
        type: { type: String, enum: ['low_battery','disconnected','abnormal_reading','maintenance_due','calibration_due'] },
        message: String,
        severity: { type: String, enum: ['low','medium','high','critical'], default: 'low' },
        timestamp: { type: Date, default: Date.now },
        acknowledged: { type: Boolean, default: false },
        acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      }
    ],
    settings: {
      samplingRate: Number,
      alertThresholds: { min: Number, max: Number },
      autoCalibration: { type: Boolean, default: false },
    },
    connectivity: {
      protocol: { type: String, enum: ['wifi','bluetooth','zigbee','lora','cellular'] },
      signalStrength: Number,
      lastConnected: Date,
      connectionStability: Number,
    },
    dataRetention: {
      period: Number,
      compressionEnabled: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    firmwareVersion: String,
    lastSeenAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('IoTDevice', IoTDeviceSchema);
