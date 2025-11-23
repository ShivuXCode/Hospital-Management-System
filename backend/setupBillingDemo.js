const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

mongoose.connect('mongodb://localhost:27017/mediflow').then(async () => {
  try {
    console.log('🔍 Setting up billing demo...\n');

    // 1. Find or create test patient
    let patient = await User.findOne({ email: 'testpatient@example.com' });
    if (!patient) {
      patient = new User({
        name: 'Test Patient',
        email: 'testpatient@example.com',
        password: 'password123',
        role: 'Patient',
        phone: '1234567890'
      });
      await patient.save();
      console.log('✅ Created test patient:', patient.email);
    } else {
      console.log('ℹ️  Found test patient:', patient.email);
    }

    // 2. Find Karan doctor user
    const karanUser = await User.findOne({ email: 'karan.doctor@gmail.com' });
    if (!karanUser) {
      console.log('❌ Karan doctor user not found. Run seedDemoUsers.js first.');
      process.exit(1);
    }
    console.log('✅ Found doctor user:', karanUser.name);

    // 3. Find or create Doctor profile for Karan
    let karanDoctor = await Doctor.findOne({ userId: karanUser._id });
    if (!karanDoctor) {
      karanDoctor = await Doctor.create({
        userId: karanUser._id,
        name: karanUser.name,
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        experience: 10,
        consultationFee: 500,
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }]
        }
      });
      console.log('✅ Created doctor profile for Karan');
    } else {
      console.log('✅ Found doctor profile for Karan');
    }

    // 4. Create completed appointment
    const existingAppointment = await Appointment.findOne({
      user: patient._id,
      doctor: karanDoctor._id,
      status: 'Completed'
    });

    let appointment;
    if (existingAppointment) {
      appointment = existingAppointment;
      console.log('ℹ️  Using existing completed appointment');
    } else {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      appointment = await Appointment.create({
        user: patient._id,
        doctor: karanDoctor._id,
        doctorName: karanUser.name,
        patientName: patient.name,
        email: patient.email,
        patientEmail: patient.email,
        phone: patient.phone || '1234567890',
        consultationType: 'physical',
        date: dateStr,
        time: '10:00 AM',
        status: 'Completed',
        reason: 'Regular checkup for billing demo'
      });
      console.log('✅ Created new completed appointment');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Billing Demo Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Demo Data:');
    console.log('  Appointment ID:', appointment._id);
    console.log('  Patient:', patient.name, '(' + patient.email + ')');
    console.log('  Password: password123');
    console.log('  Doctor:', karanUser.name, '(' + karanUser.email + ')');
    console.log('  Password: Doctor@123');
    console.log('  Status:', appointment.status);
    console.log('\n🚀 Next Steps:');
    console.log('  1. Login as doctor (karan.doctor@gmail.com)');
    console.log('  2. Add consultation fee to appointment:', appointment._id);
    console.log('  3. Login as admin to add hospital charges');
    console.log('  4. Login as patient (testpatient@example.com) to view bill\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
