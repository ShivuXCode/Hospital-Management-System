const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const IntegratedBilling = require('./models/IntegratedBilling');

async function createFreshPatient() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mediflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('\n🔍 Creating fresh patient scenario...\n');

    // Find doctor (stored in User collection)
    const doctor = await User.findOne({ role: 'Doctor', email: 'karan.doctor@gmail.com' });
    if (!doctor) {
      console.error('❌ Doctor not found!');
      process.exit(1);
    }
    console.log(`✅ Found doctor: ${doctor.name}`);

    // Create a new patient - Sarah Johnson
    const patientExists = await User.findOne({ email: 'sarah.johnson@email.com' });
    let patient;
    
    if (patientExists) {
      console.log('ℹ️  Patient Sarah Johnson already exists, using existing account');
      patient = patientExists;
    } else {
      patient = new User({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        password: 'Patient@123', // Will be hashed by pre-save middleware
        role: 'Patient',
        contact: '555-0123',
        address: '456 Oak Street, City, State'
      });
      await patient.save();
      console.log('✅ Created new patient: Sarah Johnson');
    }

    // Create appointment
    const appointment = new Appointment({
      user: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      email: patient.email,
      phone: patient.contact,
      doctor: doctor._id,
      doctorName: doctor.name,
      department: doctor.department || 'General',
      consultationType: 'physical',
      date: '2025-11-22',
      time: '02:00 PM',
      reason: 'Follow-up consultation for health checkup',
      status: 'Completed',
      notes: 'Patient consultation completed successfully'
    });
    await appointment.save();
    console.log(`✅ Created appointment: ${appointment.date} at ${appointment.time}`);

    // Create integrated billing with consultation fee
    const billing = new IntegratedBilling({
      patient: patient._id,
      patientName: patient.name,
      doctor: doctor._id,
      doctorName: doctor.name,
      appointment: appointment._id,
      consultationFee: {
        amount: 200,
        notes: 'Specialist follow-up consultation'
      },
      status: 'pending'
    });
    await billing.save();
    console.log(`✅ Created consultation fee: $${billing.consultationFee.amount}`);
    console.log(`   Bill ID: ${billing._id}`);
    console.log(`   Status: ${billing.status}`);

    console.log('\n🎉 Fresh patient scenario created successfully!\n');
    console.log('Patient Details:');
    console.log(`  Email: sarah.johnson@email.com`);
    console.log(`  Password: Patient@123`);
    console.log(`  Appointment: ${appointment.date} at ${appointment.time}`);
    console.log(`  Consultation Fee: $${billing.consultationFee.amount}`);
    console.log(`  Bill Status: ${billing.status}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createFreshPatient();
