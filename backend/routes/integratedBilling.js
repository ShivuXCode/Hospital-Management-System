const express = require('express');
const IntegratedBilling = require('../models/IntegratedBilling');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// ==================== DOCTOR ENDPOINTS ====================

// @route   POST /api/integrated-billing/consultation-fee
// @desc    Doctor adds/updates consultation fee for a completed appointment
// @access  Private (Doctor)
router.post('/consultation-fee', authMiddleware, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const { appointmentId, amount, notes } = req.body;

    if (!appointmentId || amount === undefined || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and valid amount are required'
      });
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId).populate('user', 'name email');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Get doctor profile to verify ownership
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile) {
      return res.status(403).json({ success: false, message: 'Doctor profile not found' });
    }

    // Verify appointment belongs to this doctor
    if (appointment.doctorName !== doctorProfile.name) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only add consultation fees for your own appointments' 
      });
    }

    // Check if appointment is completed
    const isCompleted = appointment.status?.toLowerCase() === 'completed';
    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee can only be added for completed appointments'
      });
    }

    // Check if bill exists
    let bill = await IntegratedBilling.findOne({ appointment: appointmentId });

    if (bill) {
      // Check if bill is finalized
      if (bill.status === 'finalized' || bill.status === 'paid') {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify consultation fee - bill is already finalized'
        });
      }

      // Update existing consultation fee
      bill.consultationFee = {
        amount: Number(amount),
        addedBy: req.user.id,
        addedAt: bill.consultationFee.addedAt || new Date(),
        lastUpdatedAt: new Date(),
        notes: notes || bill.consultationFee.notes
      };

      bill.status = 'pending';
      await bill.save();

      return res.status(200).json({
        success: true,
        message: 'Consultation fee updated successfully',
        bill
      });
    } else {
      // Create new bill with consultation fee
      bill = new IntegratedBilling({
        appointment: appointmentId,
        patient: appointment.user._id,
        patientName: appointment.patientName || appointment.user.name,
        patientEmail: appointment.email || appointment.user.email,
        doctor: req.user.id,
        doctorName: appointment.doctorName,
        consultationFee: {
          amount: Number(amount),
          addedBy: req.user.id,
          addedAt: new Date(),
          lastUpdatedAt: new Date(),
          notes: notes || ''
        },
        status: 'pending'
      });

      await bill.save();

      return res.status(201).json({
        success: true,
        message: 'Consultation fee added successfully',
        bill
      });
    }
  } catch (error) {
    console.error('❌ Add consultation fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/integrated-billing/doctor/appointments
// @desc    Get completed appointments with billing status for doctor
// @access  Private (Doctor)
router.get('/doctor/appointments', authMiddleware, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Get completed appointments for this doctor
    const appointments = await Appointment.find({
      doctorName: doctorProfile.name,
      status: 'Completed'
    })
      .populate('user', 'name email')
      .sort({ date: -1, time: -1 });

    // Get billing info for these appointments
    const appointmentIds = appointments.map(a => a._id);
    const bills = await IntegratedBilling.find({ appointment: { $in: appointmentIds } });

    // Create map of appointment ID to bill
    const billMap = {};
    bills.forEach(bill => {
      billMap[bill.appointment.toString()] = bill;
    });

    // Filter out demo/test patients and combine appointment and billing data
    const appointmentsWithBilling = appointments
      .filter(apt => {
        // Filter out demo, test, and dummy patients
        const patientName = apt.patientName?.toLowerCase() || '';
        const patientEmail = apt.user?.email?.toLowerCase() || '';
        return !patientName.includes('demo') && 
               !patientName.includes('test') && 
               !patientName.includes('dummy') &&
               !patientEmail.includes('demo') && 
               !patientEmail.includes('test') &&
               !patientEmail.includes('dummy');
      })
      .map(apt => {
        const bill = billMap[apt._id.toString()];
        return {
          _id: apt._id,
          patientName: apt.patientName,
          date: apt.date,
          time: apt.time,
          reason: apt.reason,
          consultationFee: bill?.consultationFee?.amount || 0,
          consultationFeeNotes: bill?.consultationFee?.notes || '',
          consultationFeeAdded: !!bill?.consultationFee?.amount,
          billStatus: bill?.status || 'none',
          billId: bill?._id,
          canEdit: bill?.status !== 'finalized' && bill?.status !== 'paid'
        };
      });

    res.status(200).json({
      success: true,
      appointments: appointmentsWithBilling,
      count: appointmentsWithBilling.length
    });
  } catch (error) {
    console.error('❌ Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// @route   POST /api/integrated-billing/hospital-charges
// @desc    Admin adds/updates hospital charges to a bill
// @access  Private (Admin)
router.post('/hospital-charges', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { appointmentId, labTests, scans, medicines, bedCharges, serviceFees } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId).populate('user', 'name email');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Find or create bill
    let bill = await IntegratedBilling.findOne({ appointment: appointmentId });

    if (!bill) {
      // Create new bill with hospital charges only
      bill = new IntegratedBilling({
        appointment: appointmentId,
        patient: appointment.user._id,
        patientName: appointment.patientName || appointment.user.name,
        patientEmail: appointment.email || appointment.user.email,
        doctorName: appointment.doctorName,
        status: 'pending'
      });
    }

    // Check if bill is finalized
    if (bill.status === 'finalized' || bill.status === 'paid') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify hospital charges - bill is already finalized'
      });
    }

    // Update hospital charges
    bill.hospitalCharges = {
      labTests: labTests || [],
      scans: scans || [],
      medicines: medicines || [],
      bedCharges: bedCharges || { days: 0, ratePerDay: 0, amount: 0 },
      serviceFees: serviceFees || [],
      addedBy: bill.hospitalCharges.addedBy || req.user.id,
      lastUpdatedBy: req.user.id,
      lastUpdatedAt: new Date()
    };

    bill.status = 'pending';
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Hospital charges updated successfully',
      bill
    });
  } catch (error) {
    console.error('❌ Add hospital charges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   PUT /api/integrated-billing/:billId/finalize
// @desc    Admin finalizes a bill (locks it)
// @access  Private (Admin)
router.put('/:billId/finalize', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await IntegratedBilling.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.status === 'finalized' || bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Bill is already finalized'
      });
    }

    // Finalize the bill
    bill.status = 'finalized';
    bill.finalizedBy = req.user.id;
    bill.finalizedAt = new Date();
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill finalized successfully',
      bill
    });
  } catch (error) {
    console.error('❌ Finalize bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/integrated-billing/admin/pending
// @desc    Get all pending bills for admin review
// @access  Private (Admin)
router.get('/admin/pending', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const allBills = await IntegratedBilling.find({
      status: { $in: ['draft', 'pending'] }
    })
      .populate('patient', 'name email')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });

    // Filter out demo/test patients
    const bills = allBills.filter(bill => {
      const patientName = bill.patientName?.toLowerCase() || '';
      const patientEmail = bill.patient?.email?.toLowerCase() || '';
      return !patientName.includes('demo') && 
             !patientName.includes('test') && 
             !patientName.includes('dummy') &&
             !patientEmail.includes('demo') && 
             !patientEmail.includes('test') &&
             !patientEmail.includes('dummy');
    });

    res.status(200).json({
      success: true,
      bills,
      count: bills.length
    });
  } catch (error) {
    console.error('❌ Get pending bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/integrated-billing/admin/all
// @desc    Get all bills for admin
// @access  Private (Admin)
router.get('/admin/all', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const allBills = await IntegratedBilling.find(query)
      .populate('patient', 'name email')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });

    // Filter out demo/test patients
    const bills = allBills.filter(bill => {
      const patientName = bill.patientName?.toLowerCase() || '';
      const patientEmail = bill.patient?.email?.toLowerCase() || '';
      return !patientName.includes('demo') && 
             !patientName.includes('test') && 
             !patientName.includes('dummy') &&
             !patientEmail.includes('demo') && 
             !patientEmail.includes('test') &&
             !patientEmail.includes('dummy');
    });

    res.status(200).json({
      success: true,
      bills,
      count: bills.length
    });
  } catch (error) {
    console.error('❌ Get all bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// ==================== PATIENT ENDPOINTS ====================

// @route   GET /api/integrated-billing/patient/my-bills
// @desc    Get all bills for the authenticated patient
// @access  Private (Patient)
router.get('/patient/my-bills', authMiddleware, authorizeRoles('Patient'), async (req, res) => {
  try {
    const bills = await IntegratedBilling.find({ patient: req.user.id })
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bills,
      count: bills.length
    });
  } catch (error) {
    console.error('❌ Get patient bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// ==================== CREATE BILL MANUALLY ====================

// @route   POST /api/integrated-billing/create-manual
// @desc    Create a bill manually for a patient (Admin or Doctor)
// @access  Private (Admin, Doctor)
router.post('/create-manual', authMiddleware, authorizeRoles('Admin', 'Doctor'), async (req, res) => {
  try {
    const { patientId, patientName, patientEmail, doctorId, doctorName, consultationFee, notes } = req.body;

    // Validate required fields
    if (!patientId || !patientName || !patientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Patient information is required'
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'Patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // For doctors, verify they're creating bill for themselves
    let finalDoctorId = doctorId;
    let finalDoctorName = doctorName;

    if (req.user.role === 'Doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (!doctorProfile) {
        return res.status(403).json({ success: false, message: 'Doctor profile not found' });
      }
      finalDoctorId = req.user.id;
      finalDoctorName = doctorProfile.name;
    }

    // Create new bill without appointment
    const bill = new IntegratedBilling({
      patient: patientId,
      patientName,
      patientEmail,
      doctor: finalDoctorId,
      doctorName: finalDoctorName || 'N/A',
      consultationFee: {
        amount: Number(consultationFee) || 0,
        addedBy: req.user.id,
        addedAt: new Date(),
        notes: notes || ''
      },
      status: 'draft'
    });

    await bill.save();

    return res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill
    });

  } catch (error) {
    console.error('❌ Create manual bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/integrated-billing/available-patients
// @desc    Get list of patients to create bills for
// @access  Private (Admin, Doctor)
router.get('/available-patients', authMiddleware, authorizeRoles('Admin', 'Doctor'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'Patient' })
      .select('name email')
      .sort({ name: 1 });

    // Filter out demo/test patients
    const filteredPatients = patients.filter(patient => {
      const patientName = patient.name?.toLowerCase() || '';
      const patientEmail = patient.email?.toLowerCase() || '';
      return !patientName.includes('demo') && 
             !patientName.includes('test') && 
             !patientName.includes('dummy') &&
             !patientEmail.includes('demo') && 
             !patientEmail.includes('test') &&
             !patientEmail.includes('dummy');
    });

    res.status(200).json({
      success: true,
      patients: filteredPatients
    });
  } catch (error) {
    console.error('❌ Get available patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/integrated-billing/:billId
// @desc    Get detailed bill by ID
// @access  Private (Doctor, Admin, Patient - own bill only)
router.get('/:billId', authMiddleware, authorizeRoles('Doctor', 'Admin', 'Patient'), async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await IntegratedBilling.findById(billId)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('appointment', 'date time reason status')
      .populate('finalizedBy', 'name');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Authorization check
    if (req.user.role === 'Patient' && bill.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own bills'
      });
    }

    if (req.user.role === 'Doctor' && bill.doctor?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view bills for your own appointments'
      });
    }

    res.status(200).json({
      success: true,
      bill
    });
  } catch (error) {
    console.error('❌ Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router;
