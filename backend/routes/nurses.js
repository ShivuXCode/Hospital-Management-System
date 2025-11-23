const express = require('express');
const Nurse = require('../models/Nurse');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/nurses/assign-doctor
// @desc    Assign a doctor to a nurse (max 2 doctors). Admin-only. If doctor is assigned to another nurse, reassign safely.
// @access  Private (Admin)
router.post('/assign-doctor', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { nurseId, doctorId } = req.body;

    if (!nurseId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Nurse ID and Doctor ID are required'
      });
    }

  const nurse = await Nurse.findById(nurseId);
  const doctor = await Doctor.findById(doctorId);

    if (!nurse || !doctor) {
      return res.status(404).json({
        success: false,
        message: 'Nurse or Doctor not found'
      });
    }

    // Check if nurse already has 2 doctors
    if (nurse.assignedDoctors.length >= 2) {
      return res.status(400).json({
        success: false,
        message: 'This nurse is already managing 2 doctors (maximum limit)'
      });
    }

    // Check if doctor is already assigned to this nurse
    if (nurse.assignedDoctors.includes(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already assigned to this nurse'
      });
    }

    // Assign doctor to target nurse (add to nurse's assignedDoctors array)
    if (!nurse.assignedDoctors.includes(doctorId)) {
      nurse.assignedDoctors.push(doctorId);
      await nurse.save();
    }

    // Update doctor's assigned nurses array (add this nurse if not already there)
    if (!doctor.assignedNurses) {
      doctor.assignedNurses = [];
    }
    if (!doctor.assignedNurses.some(id => id.toString() === nurseId.toString())) {
      doctor.assignedNurses.push(nurseId);
      await doctor.save();
    }

    console.log(`✅ Doctor ${doctor.name} assigned to Nurse ${nurse.name}`);

    res.status(200).json({
      success: true,
      message: 'Doctor assigned successfully',
      nurse
    });
  } catch (error) {
    console.error('❌ Assign doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   DELETE /api/nurses/unassign-doctor
// @desc    Remove a doctor assignment from a nurse. Admin-only.
// @access  Private (Admin)
router.delete('/unassign-doctor', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { nurseId, doctorId } = req.body;

    const nurse = await Nurse.findById(nurseId);
    const doctor = await Doctor.findById(doctorId);

    if (!nurse || !doctor) {
      return res.status(404).json({
        success: false,
        message: 'Nurse or Doctor not found'
      });
    }

    // Remove doctor from nurse's assigned list
    nurse.assignedDoctors = nurse.assignedDoctors.filter(
      id => id.toString() !== doctorId.toString()
    );
    await nurse.save();

    // Remove nurse from doctor's assignedNurses array
    if (doctor.assignedNurses && doctor.assignedNurses.length > 0) {
      doctor.assignedNurses = doctor.assignedNurses.filter(
        id => id.toString() !== nurseId.toString()
      );
      await doctor.save();
    }

    console.log(`✅ Doctor ${doctor.name} unassigned from Nurse ${nurse.name}`);

    res.status(200).json({
      success: true,
      message: 'Doctor unassigned successfully'
    });
  } catch (error) {
    console.error('❌ Unassign doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/nurses/:nurseId/assigned-doctors
// @desc    Get doctors assigned to a nurse
// @access  Private (Admin, Nurse)
router.get('/:nurseId/assigned-doctors', authMiddleware, authorizeRoles('Admin', 'Nurse'), async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.nurseId)
      .populate('assignedDoctors', 'name email specialization phone availability userId');

    if (!nurse) {
      return res.status(404).json({
        success: false,
        message: 'Nurse not found'
      });
    }

    res.status(200).json({
      success: true,
      assignedDoctors: nurse.assignedDoctors
    });
  } catch (error) {
    console.error('❌ Get assigned doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/nurses/:nurseId/appointments
// @desc    Get appointments for nurse's assigned doctors
// @access  Private (Nurse)
router.get('/:nurseId/appointments', authMiddleware, authorizeRoles('Nurse', 'Admin'), async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.nurseId).populate('assignedDoctors', 'name');

    if (!nurse) {
      return res.status(404).json({
        success: false,
        message: 'Nurse not found'
      });
    }

    const doctorNames = nurse.assignedDoctors.map(doc => doc.name);

    const appointments = await Appointment.find({
      doctorName: { $in: doctorNames }
    })
      .populate('user', 'name email phone')
      .populate('confirmedBy', 'name')
      .populate('rescheduledBy', 'name')
      .sort({ date: 1, time: 1 });

    console.log(`✅ Found ${appointments.length} appointments for Nurse ${nurse.name}`);

    res.status(200).json({
      success: true,
      appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('❌ Get nurse appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   PUT /api/nurses/appointments/:appointmentId/confirm
// @desc    Nurse confirms an appointment
// @access  Private (Nurse)
router.put('/appointments/:appointmentId/confirm', authMiddleware, authorizeRoles('Nurse'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify nurse is assigned to this doctor
    const doctor = await Doctor.findOne({ name: appointment.doctorName });
    const nurse = await Nurse.findOne({ userId: req.user.id });

    if (!nurse || !nurse.assignedDoctors.includes(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to manage this doctor\'s appointments'
      });
    }

    appointment.status = 'Confirmed';
    appointment.confirmedBy = req.user.id;
    appointment.confirmedAt = new Date();
    await appointment.save();

    console.log(`✅ Appointment ${appointment._id} confirmed by Nurse`);

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('❌ Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   PUT /api/nurses/appointments/:appointmentId/reschedule
// @desc    Nurse reschedules an appointment
// @access  Private (Nurse)
router.put('/appointments/:appointmentId/reschedule', authMiddleware, authorizeRoles('Nurse'), async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required'
      });
    }

    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify nurse is assigned to this doctor
    const doctor = await Doctor.findOne({ name: appointment.doctorName });
    const nurse = await Nurse.findOne({ userId: req.user.id });

    if (!nurse || !nurse.assignedDoctors.includes(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to manage this doctor\'s appointments'
      });
    }

    // Store original date/time if not already rescheduled
    if (!appointment.originalDate) {
      appointment.originalDate = appointment.date;
      appointment.originalTime = appointment.time;
    }

    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = 'Rescheduled';
    appointment.rescheduledBy = req.user.id;
    appointment.rescheduledAt = new Date();
    appointment.rescheduleReason = reason || 'Rescheduled by nurse';

    await appointment.save();

    console.log(`✅ Appointment ${appointment._id} rescheduled by Nurse`);

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('❌ Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/nurses
// @desc    Get all nurses
// @access  Private (Admin)
router.get('/', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const nurses = await Nurse.find()
      .populate('userId', 'name email')
      .populate('assignedDoctors', 'name specialization');

    res.status(200).json({
      success: true,
      nurses,
      count: nurses.length
    });
  } catch (error) {
    console.error('❌ Get nurses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   DELETE /api/nurses/assignments
// @desc    Clear ALL doctor-nurse assignments (set all doctors.assignedNurse=null and nurses.assignedDoctors=[])
// @access  Private (Admin)
router.delete('/assignments', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const doctorResult = await Doctor.updateMany(
      { assignedNurses: { $exists: true, $ne: [] } },
      { $set: { assignedNurses: [] } }
    );

    const nurseResult = await Nurse.updateMany(
      { assignedDoctors: { $exists: true, $ne: [] } },
      { $set: { assignedDoctors: [] } }
    );

    console.log(`🧹 Cleared assignments: doctors updated ${doctorResult.modifiedCount}, nurses updated ${nurseResult.modifiedCount}`);

    res.status(200).json({
      success: true,
      message: 'All doctor-nurse assignments cleared',
      result: {
        doctorsUpdated: doctorResult.modifiedCount || 0,
        nursesUpdated: nurseResult.modifiedCount || 0,
      },
    });
  } catch (error) {
    console.error('❌ Clear assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
