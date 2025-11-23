const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const IntegratedBilling = require('./models/IntegratedBilling');

mongoose.connect('mongodb://localhost:27017/mediflow').then(async () => {
  let patient = await User.findOne({ email: 'demo.patient@example.com' });
  
  if (!patient) {
    const hashedPassword = await bcrypt.hash('Patient@123', 10);
    patient = await User.create({
      name: 'Demo Patient',
      email: 'demo.patient@example.com',
      password: hashedPassword,
      role: 'Patient',
      phone: '9999999999'
    });
    console.log('✅ Created demo patient');
  } else {
    console.log('ℹ️  Demo patient exists');
  }
  
  const bill = await IntegratedBilling.findById('6920ae1bc3089cd2f92d58f6');
  bill.patient = patient._id;
  bill.patientName = patient.name;
  bill.patientEmail = patient.email;
  await bill.save();
  
  console.log('✅ Bill updated to demo patient');
  console.log('   Email: demo.patient@example.com');
  console.log('   Password: Patient@123');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
