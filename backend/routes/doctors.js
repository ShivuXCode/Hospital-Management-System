const express = require('express');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const { authMiddleware } = require('../middleware/authMiddleware');

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

const isAppointmentReviewable = (appointment) => {
  if (!appointment) return false;
  const status = appointment.status?.toString().toLowerCase();
  if (status === 'completed') return true;
  return hasAppointmentExpired(appointment);
};

const refreshDoctorRating = async (doctorId) => {
  const stats = await Review.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averages = stats[0];

  await Doctor.findByIdAndUpdate(doctorId, {
    averageRating: averages ? Number(averages.averageRating.toFixed(2)) : 0,
    reviewCount: averages ? averages.reviewCount : 0,
  });
};

// @route   GET /api/doctors
// @desc    Get all doctors (public) with optional consultation type filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { consultationType } = req.query;
    
    let query = {};
    
    // Filter by consultation type if provided
    if (consultationType && ['video', 'physical'].includes(consultationType)) {
      if (consultationType === 'video') {
        // For video consultation, only show doctors with 'video' consultation type
        query.consultationTypes = 'video';
        query.specialization = { $regex: /general medicine/i };
      } else {
        // For physical consultation, show all doctors EXCEPT video-only doctors
        query.consultationTypes = { $ne: 'video' };
      }
    }
    
    const doctors = await Doctor.find(query)
      .populate({
        path: 'assignedNurses',
        select: 'name email phone userId',
      });
    
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/doctors/me
// @desc    Get the doctor profile for the authenticated doctor, including assigned nurse
// @access  Private (Doctor)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Find doctor by linked userId
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate({
        path: 'assignedNurses',
        select: 'name email phone userId',
      });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error('Get current doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/doctors/reviewable-appointments
// @desc    Get completed appointments for patient to review
// @access  Private (Patient)
router.get('/reviewable-appointments', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching reviewable appointments for patient:', req.user.id);
    
    if (req.user.role !== 'Patient') {
      return res.status(403).json({ success: false, message: 'Only patients can view reviewable appointments.' });
    }

    const appointments = await Appointment.find({
      user: req.user.id,
      status: 'Completed'
    }).populate('doctor', 'name email specialization department').sort({ date: -1 });

    console.log(`✅ Found ${appointments.length} completed appointments for patient`);

    const appointmentsWithReview = await Promise.all(
      appointments.map(async (apt) => {
        const review = await Review.findOne({ appointment: apt._id, patient: req.user.id });
        return {
          _id: apt._id,
          doctor: apt.doctor,
          doctorName: apt.doctorName,
          date: apt.date,
          time: apt.time,
          hasReview: !!review,
          review: review ? { rating: review.rating, comment: review.comment, _id: review._id } : null
        };
      })
    );

    res.status(200).json({ success: true, appointments: appointmentsWithReview });
  } catch (error) {
    console.error('❌ Get reviewable appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by id (protected)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error('Get doctor by id error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/doctors/:id/reviews
// @desc    Get all reviews for a doctor
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('_id');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name')
      .populate('appointment', 'date time status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/doctors/:id/reviews/mine
// @desc    Get the authenticated patient's review for a doctor
// @access  Private (Patient)
router.get('/:id/reviews/mine', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Patient') {
      return res.status(403).json({ success: false, message: 'Only patients can view their review.' });
    }

    const doctor = await Doctor.findById(req.params.id).select('_id');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { appointmentId } = req.query;

    const filter = {
      doctor: doctor._id,
      patient: req.user.id,
    };

    if (appointmentId) {
      filter.appointment = appointmentId;
    }

    const review = await Review.findOne(filter).populate('patient', 'name');

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error('Get patient doctor review error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// @route   POST /api/doctors/:id/reviews
// @desc    Create or update a review for a doctor by a patient
// @access  Private (Patient)
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Patient') {
      return res.status(403).json({ success: false, message: 'Only patients can leave reviews.' });
    }

    const { rating, comment, appointmentId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'An appointmentId is required to leave a review.' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found for this patient.' });
    }

    const appointmentDoctorId = appointment.doctor?.toString();
    const doctorMatchesAppointment =
      appointmentDoctorId === doctor._id.toString() ||
      (!appointmentDoctorId && appointment.doctorName === doctor.name);

    if (!doctorMatchesAppointment) {
      return res.status(400).json({
        success: false,
        message: 'The appointment is not linked to this doctor.',
      });
    }

    if (!isAppointmentReviewable(appointment)) {
      return res.status(400).json({
        success: false,
        message: 'You can only review this doctor after your appointment is completed.',
      });
    }

    let review = await Review.findOne({ appointment: appointment._id, patient: req.user.id });

    const operation = review ? 'updated' : 'created';

    if (!review) {
      review = new Review({
        doctor: doctor._id,
        patient: req.user.id,
        appointment: appointment._id,
        rating,
        comment,
      });
    } else {
      review.rating = rating;
      review.comment = comment;
    }

    await review.save();

    await refreshDoctorRating(doctor._id);

    const populatedReview = await Review.findById(review._id)
      .populate('patient', 'name')
      .populate('appointment', 'date time status');

    res.status(operation === 'created' ? 201 : 200).json({
      success: true,
      review: populatedReview,
      operation,
    });
  } catch (error) {
    console.error('Create doctor review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A review already exists for this appointment.',
      });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
