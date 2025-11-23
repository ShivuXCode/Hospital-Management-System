const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const parseAppointmentDateTime = (appointment) => {
  if (!appointment?.date) return null;

  const baseDate = new Date(appointment.date);
  if (Number.isNaN(baseDate.getTime())) return null;

  const timeString = appointment.time;
  if (!timeString) return baseDate;

  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return baseDate;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10) || 0;
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (!meridiem && hours === 24) hours = 0;

  const dateWithTime = new Date(baseDate);
  dateWithTime.setHours(hours, minutes, 0, 0);
  return dateWithTime;
};

const hasAppointmentExpired = (appointment) => {
  const dateTime = parseAppointmentDateTime(appointment);
  if (dateTime) {
    return dateTime.getTime() < Date.now();
  }

  const status = appointment?.status?.toString().toLowerCase();
  return status ? ['completed', 'cancelled', 'rescheduled'].includes(status) : false;
};

// @route   POST /api/appointments
// @desc    Create an appointment (protected) - starts as "Pending" for nurse confirmation
// @access  Private (Patient)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📅 Creating new appointment...');
    const { 
      doctorName, 
      patientName, 
      email, 
      phone, 
      department, 
      consultationType,
      date, 
      time, 
      reason 
    } = req.body;

    // Validate required fields
    if (!doctorName || !patientName || !email || !date || !time || !consultationType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate consultationType
    if (!['video', 'physical'].includes(consultationType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid consultation type. Must be "video" or "physical"' 
      });
    }

    // Check if slot is already booked for this doctor on this date and time
    const existingAppointment = await Appointment.findOne({
      doctorName,
      date,
      time,
      status: { $nin: ['Cancelled', 'Rescheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'This time slot is already booked. Please select another time.' 
      });
    }

    // Find doctor to link appointment
    const doctor = await require('../models/Doctor').findOne({ name: doctorName });

    // Generate Google Meet link for video consultations
    let meetingLink = null;
    if (consultationType === 'video') {
      // Generate a unique meeting ID based on appointment details
      const meetingId = `${doctorName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${date}-${time.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
      meetingLink = `https://meet.google.com/${meetingId.substring(0, 10)}-${meetingId.substring(10, 14)}-${meetingId.substring(14, 17)}`;
    }

    const appointment = new Appointment({
      user: req.user.id,
      doctor: doctor ? doctor._id : null,
      doctorName,
      patientName,
      patientEmail: email,
      email,
      phone,
      department,
      consultationType,
      date,
      time,
      reason,
      meetingLink,
      status: 'Pending' // Changed from 'Scheduled' to 'Pending' for nurse confirmation
    });

    await appointment.save();
    console.log('✅ Appointment created successfully:', appointment._id, '- Status: Pending (awaiting nurse confirmation)');

    res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully. Awaiting nurse confirmation.',
      appointment 
    });
  } catch (error) {
    console.error('❌ Create appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments (for doctors: their appointments, for patients: their appointments, for nurses: assigned doctors' appointments)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role;
    let appointments = [];

    console.log('📥 Fetching appointments for:', req.user.name, 'Role:', userRole);

    if (userRole === 'Doctor') {
      // Get current doctor's name
      const doctor = await User.findById(req.user.id);
      if (doctor) {
        // Find all appointments for this doctor
        appointments = await Appointment.find({ doctorName: doctor.name })
          .populate('user', 'name email')
          .populate('confirmedBy', 'name')
          .populate('rescheduledBy', 'name')
          .sort({ date: -1, time: -1 });
        
        console.log(`✅ Found ${appointments.length} appointments for Dr. ${doctor.name}`);
      }
    } else if (userRole === 'Nurse') {
      // Get appointments for doctors assigned to this nurse
      const Nurse = require('../models/Nurse');
      const Doctor = require('../models/Doctor');
      
      const nurse = await Nurse.findOne({ userId: req.user.id }).populate('assignedDoctors', 'name');
      
      if (nurse && nurse.assignedDoctors.length > 0) {
        const doctorNames = nurse.assignedDoctors.map(doc => doc.name);
        appointments = await Appointment.find({ doctorName: { $in: doctorNames } })
          .populate('user', 'name email phone')
          .populate('confirmedBy', 'name')
          .populate('rescheduledBy', 'name')
          .sort({ date: -1, time: -1 });
        
        console.log(`✅ Found ${appointments.length} appointments for Nurse ${nurse.name} (${nurse.assignedDoctors.length} doctors)`);
      }
    } else if (userRole === 'Patient') {
      // Get appointments for this patient
      appointments = await Appointment.find({ user: req.user.id })
        .populate('confirmedBy', 'name')
        .populate('rescheduledBy', 'name')
        .sort({ date: -1, time: -1 });
      
      console.log(`✅ Found ${appointments.length} appointments for patient ${req.user.name}`);
    } else if (userRole === 'Admin') {
      // Admin can see all appointments
      appointments = await Appointment.find()
        .populate('user', 'name email')
        .populate('confirmedBy', 'name')
        .populate('rescheduledBy', 'name')
        .sort({ date: -1, time: -1 });
      
      console.log(`✅ Found ${appointments.length} total appointments`);
    }

    const { expired } = req.query;
    let filteredAppointments = appointments;

    if (expired !== undefined) {
      const expiredFlag = expired === 'true';
      filteredAppointments = appointments.filter((appointment) => hasAppointmentExpired(appointment) === expiredFlag);
    }

    res.status(200).json({ 
      success: true, 
      appointments: filteredAppointments,
      count: filteredAppointments.length 
    });
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/appointments/booked-slots/:doctorName/:date
// @desc    Get booked time slots for a specific doctor on a specific date
// @access  Public
router.get('/booked-slots/:doctorName/:date', async (req, res) => {
  try {
    const { doctorName, date } = req.params;
    
    // Find all appointments for this doctor on this date that are not cancelled or rescheduled
    const appointments = await Appointment.find({
      doctorName,
      date,
      status: { $nin: ['Cancelled', 'Rescheduled'] }
    }).select('time');

    const bookedSlots = appointments.map(apt => apt.time);
    
    console.log(`📅 Found ${bookedSlots.length} booked slots for ${doctorName} on ${date}`);
    
    res.status(200).json({ 
      success: true, 
      bookedSlots 
    });
  } catch (error) {
    console.error('❌ Get booked slots error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment (status, notes, etc.)
// @access  Private (Doctor/Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Enforce role-based updates for status changes
    if (status) {
      const normalized = String(status).toLowerCase();

      // Only Doctors (or Admin) can mark an appointment as Completed
      if (normalized === 'completed') {
        if (!['Doctor', 'Admin'].includes(req.user.role)) {
          return res.status(403).json({ success: false, message: 'Only doctors can complete appointments' });
        }

        // If doctor, ensure this is their appointment
        if (req.user.role === 'Doctor') {
          const doctorUser = await User.findById(req.user.id);
          if (!doctorUser || doctorUser.name !== appointment.doctorName) {
            return res.status(403).json({ success: false, message: 'You can only complete your own appointments' });
          }
        }
      }

      // Nurses should not change status via this endpoint
      if (req.user.role === 'Nurse') {
        return res.status(403).json({ success: false, message: 'Nurses cannot change appointment status here' });
      }

      appointment.status = status;
    }
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    console.log('✅ Appointment updated:', appointment._id, 'Status:', status);

    res.status(200).json({ 
      success: true, 
      message: 'Appointment updated successfully',
      appointment 
    });
  } catch (error) {
    console.error('❌ Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
