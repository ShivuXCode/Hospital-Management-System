const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

mongoose.connect('mongodb://localhost:27017/medicare').then(async () => {
  try {
    // Create test patient with pre-hashed password (bcrypt hash of 'password123')
    let patient = await User.findOne({ email: 'testpatient@example.com' });
    if (!patient) {
      patient = await User.create({
        name: 'Test Patient',
        email: 'testpatient@example.com',
        password: '$2a$10$YourHashedPasswordHere', // Will use User model's pre-save hook
        role: 'Patient',
        phone: '1234567890'
      });
      // Update with plain password to trigger hashing
      patient.password = 'password123';
      await patient.save();
      console.log('✅ Created test patient:', patient.email);
    } else {
      console.log('ℹ️  Test patient already exists:', patient.email);
    }

    // Find doctor
    const doctorUser = await User.findOne({ email: 'karan.doctor@gmail.com' });
    const doctor = await Doctor.findOne({ userId: doctorUser._id });

    if (!doctor) {
      console.error('❌ Doctor not found');
      process.exit(1);
    }

    // Create completed appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: new Date(),
      timeSlot: '10:00 AM',
      status: 'Completed',
      reason: 'Regular checkup for billing demo'
    });

    console.log('✅ Created completed appointment');
    console.log('  - Appointment ID:', appointment._id);
    console.log('  - Patient:', patient.name, '(' + patient.email + ')');
    console.log('  - Doctor: Dr. Karan');
    console.log('  - Status:', appointment.status);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
