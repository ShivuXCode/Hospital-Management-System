const express = require('express');
const router = express.Router();
const PatientProfile = require('../models/PatientProfile');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const { authMiddleware } = require('../middleware/authMiddleware');

const parseAppointmentDateTime = (appointment) => {
  if (!appointment) return null;

  if (appointment.dateTime) {
    const explicit = new Date(appointment.dateTime);
    if (!Number.isNaN(explicit.getTime())) {
      return explicit;
    }
  }

  if (!appointment.date) return null;

  const baseDate = new Date(appointment.date);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  if (!appointment.time) {
    return baseDate;
  }

  const match = appointment.time.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) {
    return baseDate;
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const meridiem = match[4]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (!meridiem && hours === 24) hours = 0;

  const composed = new Date(baseDate);
  composed.setHours(hours, minutes, seconds, 0);
  return composed;
};

const isAppointmentExpired = (appointment) => {
  const appointmentDate = parseAppointmentDateTime(appointment);
  if (!appointmentDate) return false;
  return appointmentDate.getTime() < Date.now();
};

const isPrescriptionExpired = (prescription) => {
  if (!prescription?.validUntil) return false;
  const validUntilDate = new Date(prescription.validUntil);
  if (Number.isNaN(validUntilDate.getTime())) return false;
  validUntilDate.setHours(23, 59, 59, 999);
  return validUntilDate.getTime() < Date.now();
};

// Get patient profile by user ID
router.get('/:userId/profile', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is authorized (patient themselves or admin/doctor)
    if (req.user.id !== userId && !['Admin', 'Doctor', 'Nurse'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let profile = await PatientProfile.findOne({ userId }).populate('userId', 'name email');
    
    // Create profile if doesn't exist
    if (!profile) {
      profile = new PatientProfile({ userId });
      await profile.save();
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get prescriptions with expiry filter
router.get('/:userId/prescriptions', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { expired } = req.query;

    if (req.user.id !== userId && !['Admin', 'Doctor', 'Nurse'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const prescriptions = await Prescription.find({ patient: userId })
      .populate('doctor', 'name specialization')
      .sort({ dateIssued: -1 });

    const normalized = prescriptions.map((doc) => ({
      id: doc._id,
      doctorName: doc.doctorName || doc.doctor?.name,
      dateIssued: doc.dateIssued ? doc.dateIssued.toISOString().split('T')[0] : null,
      validUntil: doc.validUntil ? doc.validUntil.toISOString().split('T')[0] : null,
      medicines: doc.medicines || [],
      diagnosis: doc.diagnosis,
      notes: doc.notes,
    }));

    let filtered = normalized;
    if (expired !== undefined) {
      const expiredFlag = expired === 'true';
      filtered = normalized.filter((prescription) => {
        if (!prescription.validUntil) {
          return expiredFlag ? false : true;
        }

        const expiryDate = new Date(prescription.validUntil);
        if (Number.isNaN(expiryDate.getTime())) {
          return expiredFlag ? false : true;
        }

        expiryDate.setHours(23, 59, 59, 999);
        const hasExpired = expiryDate.getTime() < Date.now();
        return expiredFlag ? hasExpired : !hasExpired;
      });
    }

    res.json({
      success: true,
      prescriptions: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message,
    });
  }
});

// Update patient profile
router.put('/:userId/profile', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is authorized (patient themselves only)
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const updateData = req.body;
    delete updateData.userId; // Prevent userId update

    let profile = await PatientProfile.findOne({ userId });
    
    if (!profile) {
      profile = new PatientProfile({ userId, ...updateData });
    } else {
      Object.assign(profile, updateData);
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Update health tracker specifically
router.put('/:userId/health-tracker', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is authorized (patient themselves only)
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own health data'
      });
    }

    const { height, weight, bloodPressure, sugarLevel } = req.body;

    // Validate height
    if (height !== undefined && height !== null && height !== '') {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        return res.status(400).json({
          success: false,
          message: 'Height must be between 100 and 250 cm'
        });
      }
    }

    // Validate weight
    if (weight !== undefined && weight !== null && weight !== '') {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 30 || weightNum > 250) {
        return res.status(400).json({
          success: false,
          message: 'Weight must be between 30 and 250 kg'
        });
      }
    }

    let profile = await PatientProfile.findOne({ userId });
    
    if (!profile) {
      profile = new PatientProfile({ userId });
    }

    // Update health tracker fields
    profile.healthTracker = {
      ...profile.healthTracker,
      height: height ? parseFloat(height) : profile.healthTracker.height,
      weight: weight ? parseFloat(weight) : profile.healthTracker.weight,
      bloodPressure: bloodPressure !== undefined ? bloodPressure : profile.healthTracker.bloodPressure,
      sugarLevel: sugarLevel ? parseFloat(sugarLevel) : profile.healthTracker.sugarLevel,
      lastUpdated: new Date()
    };

    // BMI will be calculated automatically by the pre-save middleware
    await profile.save();

    res.json({
      success: true,
      message: '✅ Health tracker updated successfully',
      healthTracker: profile.healthTracker
    });
  } catch (error) {
    console.error('Update health tracker error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update health tracker',
      error: error.message
    });
  }
});

// Get health tracker data
router.get('/:userId/health-tracker', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is authorized
    if (req.user.id !== userId && !['Admin', 'Doctor', 'Nurse'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let profile = await PatientProfile.findOne({ userId });
    
    if (!profile) {
      return res.json({
        success: true,
        healthTracker: {
          height: null,
          weight: null,
          bloodPressure: null,
          sugarLevel: null,
          bmi: null,
          lastUpdated: null
        }
      });
    }

    res.json({
      success: true,
      healthTracker: profile.healthTracker
    });
  } catch (error) {
    console.error('Get health tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health tracker data',
      error: error.message
    });
  }
});

router.get('/:userId/dashboard', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && !['Admin', 'Doctor', 'Nurse'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const [appointments, prescriptions, bills, profile] = await Promise.all([
      Appointment.find({ user: userId }).lean(),
      Prescription.find({ patient: userId }).lean(),
      Bill.find({ patient: userId }).lean(),
      PatientProfile.findOne({ userId }).lean(),
    ]);

    const upcomingAppointmentsCount = appointments.filter((appointment) => !isAppointmentExpired(appointment)).length;

    const activePrescriptionsCount = prescriptions.filter((prescription) => !isPrescriptionExpired(prescription)).length;

    const pendingBillsCount = bills.filter((bill) => bill.status && bill.status.toLowerCase() === 'pending').length;

    const recentHealthRecord = profile?.healthTracker
      ? {
          lastUpdated: profile.healthTracker.lastUpdated ? new Date(profile.healthTracker.lastUpdated).toISOString() : null,
          bloodPressure: profile.healthTracker.bloodPressure ?? null,
          sugarLevel: profile.healthTracker.sugarLevel ?? null,
          weight: profile.healthTracker.weight ?? null,
          bmi: profile.healthTracker.bmi ?? null,
        }
      : null;

    const activityEntries = [];

    appointments.forEach((appointment) => {
      const appointmentDate = parseAppointmentDateTime(appointment) || (appointment.updatedAt ? new Date(appointment.updatedAt) : null);
      if (!appointmentDate) return;

      activityEntries.push({
        id: `appointment-${appointment._id}`,
        type: 'appointment',
        title: `Appointment with ${appointment.doctorName || 'Doctor'}`,
        description: appointment.reason || appointment.department || undefined,
        status: appointment.status,
        date: appointmentDate.toISOString(),
      });
    });

    prescriptions.forEach((prescription) => {
      const issueDate = prescription.dateIssued ? new Date(prescription.dateIssued) : prescription.createdAt ? new Date(prescription.createdAt) : null;
      if (!issueDate) return;

      const medicineCount = Array.isArray(prescription.medicines) ? prescription.medicines.length : 0;
      const descriptionParts = [];
      if (prescription.doctorName) descriptionParts.push(`Prescribed by ${prescription.doctorName}`);
      if (medicineCount > 0) descriptionParts.push(`${medicineCount} medicine${medicineCount > 1 ? 's' : ''}`);
      const description = descriptionParts.length > 0 ? descriptionParts.join(' · ') : undefined;

      activityEntries.push({
        id: `prescription-${prescription._id}`,
        type: 'prescription',
        title: 'Prescription issued',
        description,
        status: isPrescriptionExpired(prescription) ? 'Expired' : 'Active',
        date: issueDate.toISOString(),
      });
    });

    bills.forEach((bill) => {
      const referenceDate = bill.updatedAt ? new Date(bill.updatedAt) : bill.date ? new Date(bill.date) : null;
      if (!referenceDate) return;

      activityEntries.push({
        id: `bill-${bill._id}`,
        type: 'bill',
        title: `Bill #${bill.billNumber}`,
        description: bill.description || `Amount ₹${bill.amount}`,
        status: bill.status,
        date: referenceDate.toISOString(),
      });
    });

    if (recentHealthRecord?.lastUpdated) {
      const metrics = [];
      if (recentHealthRecord.bloodPressure) metrics.push(`BP ${recentHealthRecord.bloodPressure}`);
      if (recentHealthRecord.sugarLevel) metrics.push(`Sugar ${recentHealthRecord.sugarLevel}`);
      if (recentHealthRecord.weight) metrics.push(`Weight ${recentHealthRecord.weight}kg`);
      if (recentHealthRecord.bmi) metrics.push(`BMI ${recentHealthRecord.bmi}`);

      activityEntries.push({
        id: `health-${recentHealthRecord.lastUpdated}`,
        type: 'health',
        title: 'Health record updated',
        description: metrics.length ? metrics.join(' · ') : undefined,
        status: 'Updated',
        date: recentHealthRecord.lastUpdated,
      });
    }

    const recentActivity = activityEntries
      .filter((entry) => entry.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    res.json({
      success: true,
      dashboard: {
        upcomingAppointmentsCount,
        activePrescriptionsCount,
        pendingBillsCount,
        recentHealthRecord,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

module.exports = router;
