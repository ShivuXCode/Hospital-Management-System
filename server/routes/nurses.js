const express = require('express');
const Nurse = require('../models/Nurse');
const Doctor = require('../models/Doctor');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/nurses - list nurses with assigned doctors (Admin)
router.get('/', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const nurses = await Nurse.find()
      .populate('userId', 'name email')
      .populate('assignedDoctors', 'name specialization');

    res.status(200).json({ success: true, nurses, count: nurses.length });
  } catch (error) {
    console.error('Get nurses error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// POST /api/nurses/assign-doctor - Admin only, safe reassign if doctor already assigned
router.post('/assign-doctor', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { nurseId, doctorId } = req.body;
    if (!nurseId || !doctorId) {
      return res.status(400).json({ success: false, message: 'Nurse ID and Doctor ID are required' });
    }

    const nurse = await Nurse.findById(nurseId);
    const doctor = await Doctor.findById(doctorId);

    if (!nurse || !doctor) {
      return res.status(404).json({ success: false, message: 'Nurse or Doctor not found' });
    }

    if (nurse.assignedDoctors.length >= 2) {
      return res.status(400).json({ success: false, message: 'This nurse is already managing 2 doctors (maximum limit)' });
    }

    if (nurse.assignedDoctors.includes(doctorId)) {
      return res.status(400).json({ success: false, message: 'This doctor is already assigned to this nurse' });
    }

    if (doctor.assignedNurse && doctor.assignedNurse.toString() !== nurseId.toString()) {
      const prev = await Nurse.findById(doctor.assignedNurse);
      if (prev) {
        prev.assignedDoctors = prev.assignedDoctors.filter((id) => id.toString() !== doctorId.toString());
        await prev.save();
      }
    }

    nurse.assignedDoctors.push(doctorId);
    await nurse.save();

    doctor.assignedNurse = nurseId;
    await doctor.save();

    res.status(200).json({ success: true, message: 'Doctor assigned successfully', nurse });
  } catch (error) {
    console.error('Assign doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// DELETE /api/nurses/unassign-doctor - Admin only
router.delete('/unassign-doctor', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { nurseId, doctorId } = req.body;

    const nurse = await Nurse.findById(nurseId);
    const doctor = await Doctor.findById(doctorId);

    if (!nurse || !doctor) {
      return res.status(404).json({ success: false, message: 'Nurse or Doctor not found' });
    }

    nurse.assignedDoctors = nurse.assignedDoctors.filter((id) => id.toString() !== doctorId.toString());
    await nurse.save();

    if (doctor.assignedNurse && doctor.assignedNurse.toString() === nurseId.toString()) {
      doctor.assignedNurse = null;
      await doctor.save();
    }

    res.status(200).json({ success: true, message: 'Doctor unassigned successfully' });
  } catch (error) {
    console.error('Unassign doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// DELETE /api/nurses/assignments - Admin only: clear all mappings
router.delete('/assignments', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const doctorResult = await Doctor.updateMany({ assignedNurse: { $ne: null } }, { $set: { assignedNurse: null } });
    const nurseResult = await Nurse.updateMany({ assignedDoctors: { $exists: true, $ne: [] } }, { $set: { assignedDoctors: [] } });

    res.status(200).json({
      success: true,
      message: 'All doctor-nurse assignments cleared',
      result: { doctorsUpdated: doctorResult.modifiedCount || 0, nursesUpdated: nurseResult.modifiedCount || 0 },
    });
  } catch (error) {
    console.error('Clear assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
