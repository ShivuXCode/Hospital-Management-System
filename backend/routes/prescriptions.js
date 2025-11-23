const express = require('express');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const User = require('../models/User');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper: verify a nurse can manage a prescription for a given doctor (by ref or name)
async function nurseCanManageDoctor(nurseUserId, doctorRef, doctorName) {
  const nurse = await Nurse.findOne({ userId: nurseUserId }).populate('assignedDoctors', 'name');
  if (!nurse) return false;
  const assignedIds = nurse.assignedDoctors.map((d) => String(d._id));
  const assignedNames = nurse.assignedDoctors.map((d) => d.name);
  if (doctorRef && assignedIds.includes(String(doctorRef))) return true;
  if (doctorName && assignedNames.includes(doctorName)) return true;
  return false;
}

// GET /api/prescriptions
// Doctor: own prescriptions; Nurse: prescriptions for assigned doctors; Admin: all
router.get('/', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), async (req, res) => {
  try {
    console.log('🔍 GET /prescriptions - User:', req.user);
    const { patientId } = req.query;
    const role = req.user.role;
    let filter = {};

    if (patientId) {
      filter.patient = patientId;
    }

    if (role === 'Doctor') {
      const doctorUser = await User.findById(req.user.id);
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      // Match by both User name and Doctor profile name (with/without Dr. prefix)
      const nameVariations = [];
      if (doctorUser?.name) {
        nameVariations.push(doctorUser.name);
        // Add "Dr. " prefix if not present
        if (!doctorUser.name.startsWith('Dr. ')) {
          nameVariations.push(`Dr. ${doctorUser.name}`);
        }
      }
      if (doctorProfile?.name) {
        nameVariations.push(doctorProfile.name);
        // Also add version without "Dr. " prefix
        const nameWithoutPrefix = doctorProfile.name.replace(/^Dr\.\s*/i, '');
        if (nameWithoutPrefix !== doctorProfile.name) {
          nameVariations.push(nameWithoutPrefix);
        }
      }
      
      filter.$or = [
        { doctorName: { $in: nameVariations } }
      ];
      if (doctorProfile) {
        filter.$or.push({ doctor: doctorProfile._id });
      }
      
      console.log(`📋 Doctor ${doctorUser?.name} fetching prescriptions (matching: ${nameVariations.join(', ')})`);
    } else if (role === 'Nurse') {
      const nurse = await Nurse.findOne({ userId: req.user.id }).populate('assignedDoctors', 'name');
      const doctorIds = nurse?.assignedDoctors?.map((d) => d._id) || [];
      const doctorNames = nurse?.assignedDoctors?.map((d) => d.name) || [];
      filter.$or = [{ doctor: { $in: doctorIds } }, { doctorName: { $in: doctorNames } }];
      console.log(`👩‍⚕️ Nurse ${nurse?.name} can see prescriptions from ${doctorNames.length} assigned doctors`);
    }

    const pres = await Prescription.find(filter)
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        select: 'name specialization',
        // Don't fail if doctor reference doesn't exist
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${pres.length} prescriptions for role: ${role}`);
    res.json({ success: true, prescriptions: pres });
  } catch (err) {
    console.error('Get prescriptions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/prescriptions
// Create prescription (Doctor, Admin) - Nurses are NOT allowed to create
router.post('/', authMiddleware, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const { patientId, doctorName, validUntil, diagnosis, notes, medicines } = req.body;
    if (!patientId || !doctorName || !validUntil) {
      return res.status(400).json({ success: false, message: 'patientId, doctorName and validUntil are required' });
    }
    
    // Validate medicines array
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one medicine is required' });
    }

    // Safety: explicit block if somehow nurse hits this route (defense-in-depth)
    if (req.user.role === 'Nurse') {
      return res.status(403).json({ success: false, message: 'Nurses are not permitted to create prescriptions' });
    }

    // Find doctor by name (try multiple variations)
    let doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) {
      // Try with "Dr. " prefix
      doctor = await Doctor.findOne({ name: `Dr. ${doctorName}` });
    }
    if (!doctor) {
      // Try without "Dr. " prefix
      const nameWithoutPrefix = doctorName.replace(/^Dr\.\s*/i, '');
      doctor = await Doctor.findOne({ name: nameWithoutPrefix });
    }
    
    // Use the Doctor profile's name if found, otherwise use provided name
    const finalDoctorName = doctor ? doctor.name : doctorName;
    
    const doc = await Prescription.create({
      patient: patientId,
      doctor: doctor ? doctor._id : undefined,
      doctorName: finalDoctorName,
      validUntil,
      diagnosis: diagnosis || '',
      notes: notes || '',
      medicines: Array.isArray(medicines) ? medicines : [],
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const populated = await doc.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name specialization' },
    ]);

    // Find nurses assigned to this doctor and log for visibility
    if (doctor) {
      const assignedNurses = await Nurse.find({ assignedDoctors: doctor._id }).select('name email');
      console.log(`💊 Prescription created by Dr. ${doctorName} for patient`);
      console.log(`👩‍⚕️ ${assignedNurses.length} nurse(s) can now view this prescription:`, 
        assignedNurses.map(n => n.name).join(', ') || 'None');
    }

    res.status(201).json({ success: true, prescription: populated });
  } catch (err) {
    console.error('Create prescription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/prescriptions/:id
// Only Doctor and Admin can edit - Nurses have read-only access
router.put('/:id', authMiddleware, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const pres = await Prescription.findById(req.params.id).populate('patient', 'name email');
    if (!pres) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (req.user.role === 'Doctor') {
      const doctorUser = await User.findById(req.user.id);
      const doctorRef = await Doctor.findOne({ userId: req.user.id });
      if (String(pres.doctor) !== String(doctorRef?._id) && pres.doctorName !== doctorUser?.name) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const { doctorName, validUntil, diagnosis, notes, medicines } = req.body;
    if (doctorName) pres.doctorName = doctorName;
    if (validUntil) pres.validUntil = validUntil;
    if (diagnosis !== undefined) pres.diagnosis = diagnosis;
    if (notes !== undefined) pres.notes = notes;
    if (medicines !== undefined) pres.medicines = Array.isArray(medicines) ? medicines : [];
    pres.updatedBy = req.user.id;
    await pres.save();

    const populated = await pres.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name specialization' },
    ]);

    // Log update for nurses and patient to see changes dynamically
    const doctor = await Doctor.findById(pres.doctor);
    if (doctor) {
      const assignedNurses = await Nurse.find({ assignedDoctors: doctor._id }).select('name');
      console.log(`✏️ Prescription updated by ${req.user.role} for patient: ${pres.patient?.name}`);
      console.log(`👩‍⚕️ Update visible to ${assignedNurses.length} assigned nurse(s) and patient`);
    }

    res.json({ success: true, prescription: populated });
  } catch (err) {
    console.error('Update prescription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/prescriptions/:id
// Only Doctor and Admin can delete - Nurses have read-only access
router.delete('/:id', authMiddleware, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const pres = await Prescription.findById(req.params.id).populate('patient', 'name');
    if (!pres) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (req.user.role === 'Doctor') {
      const doctorUser = await User.findById(req.user.id);
      const doctorRef = await Doctor.findOne({ userId: req.user.id });
      if (String(pres.doctor) !== String(doctorRef?._id) && pres.doctorName !== doctorUser?.name) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Log deletion for nurses and patient to see changes dynamically
    const doctor = await Doctor.findById(pres.doctor);
    const patientName = pres.patient?.name || 'Unknown';
    if (doctor) {
      const assignedNurses = await Nurse.find({ assignedDoctors: doctor._id }).select('name');
      console.log(`🗑️ Prescription deleted by ${req.user.role} for patient: ${patientName}`);
      console.log(`👩‍⚕️ Deletion visible to ${assignedNurses.length} assigned nurse(s) and patient`);
    }

    await pres.deleteOne();
    res.json({ success: true, message: 'Prescription deleted' });
  } catch (err) {
    console.error('Delete prescription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
