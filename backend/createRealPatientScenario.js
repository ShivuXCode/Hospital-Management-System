const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const IntegratedBilling = require('./models/IntegratedBilling');

mongoose.connect('mongodb://localhost:27017/mediflow').then(async () => {
  try {
    console.log('\n🏥 Creating Real Patient Billing Scenario...\n');

    // 1. Create a real patient (not demo/test)
    let patient = await User.findOne({ email: 'john.smith@email.com' });
    if (!patient) {
      const hashedPassword = await bcrypt.hash('Patient@123', 10);
      patient = await User.create({
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: hashedPassword,
        role: 'Patient',
        phone: '555-1234'
      });
      console.log('✅ Created real patient: John Smith');
    } else {
      console.log('ℹ️  Using existing patient: John Smith');
    }

    // 2. Find doctor
    const doctorUser = await User.findOne({ email: 'karan.doctor@gmail.com' });
    const doctor = await Doctor.findOne({ userId: doctorUser._id });

    // 3. Create completed appointment
    let appointment = await Appointment.findOne({
      user: patient._id,
      doctor: doctor._id,
      status: 'Completed'
    });

    if (!appointment) {
      const today = new Date();
      appointment = await Appointment.create({
        user: patient._id,
        doctor: doctor._id,
        doctorName: 'Dr. Karan Mehta',
        patientName: patient.name,
        email: patient.email,
        patientEmail: patient.email,
        phone: patient.phone,
        consultationType: 'physical',
        date: today.toISOString().split('T')[0],
        time: '11:00 AM',
        status: 'Completed',
        reason: 'Annual health checkup'
      });
      console.log('✅ Created completed appointment');
    } else {
      console.log('ℹ️  Using existing appointment');
    }

    // 4. Add consultation fee
    let bill = await IntegratedBilling.findOne({ appointment: appointment._id });
    
    if (!bill) {
      bill = await IntegratedBilling.create({
        appointment: appointment._id,
        patient: patient._id,
        patientName: patient.name,
        patientEmail: patient.email,
        doctor: doctorUser._id,
        doctorName: 'Dr. Karan Mehta',
        consultationFee: {
          amount: 150,
          addedBy: doctorUser._id,
          addedAt: new Date(),
          lastUpdatedAt: new Date(),
          notes: 'Annual checkup consultation'
        },
        status: 'pending'
      });
      console.log('✅ Added consultation fee: $150');
    } else {
      console.log('ℹ️  Bill already exists');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Real Patient Scenario Created Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Scenario Details:');
    console.log('   Patient: John Smith (john.smith@email.com)');
    console.log('   Password: Patient@123');
    console.log('   Doctor: Dr. Karan Mehta');
    console.log('   Appointment: ' + appointment.date + ' at ' + appointment.time);
    console.log('   Consultation Fee: $150');
    console.log('   Bill Status: pending');
    console.log('   Bill ID: ' + bill._id);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Doctor can see this appointment in billing page');
    console.log('   2. Admin can add hospital charges to this bill');
    console.log('   3. Patient John Smith can login and view the bill\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
