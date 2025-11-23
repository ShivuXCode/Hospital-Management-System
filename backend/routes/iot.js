const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const IoTDevice = require('../models/IoTDevice');

const router = express.Router();

// List devices
router.get('/iot/devices', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const devices = await IoTDevice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: devices.length, devices });
  } catch (e) {
    console.error('IoT list error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create device
router.post('/iot/devices', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const data = req.body || {};
    // Handle legacy field mappings
    if (data.name && !data.deviceName) data.deviceName = data.name;
    if (data.type && !data.deviceType) data.deviceType = data.type;
    const device = await IoTDevice.create(data);
    res.status(201).json({ success: true, device });
  } catch (e) {
    console.error('IoT create error', e);
    res.status(400).json({ success: false, message: 'Invalid data', error: e.message });
  }
});

// Update device
router.put('/iot/devices/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const data = req.body || {};
    // Handle legacy field mappings
    if (data.name && !data.deviceName) data.deviceName = data.name;
    if (data.type && !data.deviceType) data.deviceType = data.type;
    const device = await IoTDevice.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    res.status(200).json({ success: true, device });
  } catch (e) {
    console.error('IoT update error', e);
    res.status(400).json({ success: false, message: 'Invalid data', error: e.message });
  }
});

// Delete device
router.delete('/iot/devices/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const deleted = await IoTDevice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Device not found' });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('IoT delete error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
