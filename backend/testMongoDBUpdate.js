const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/mediflow';

async function testMongoDBUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the doctor user
    const doctor = await User.findOne({ email: 'karan.doctor@gmail.com' });
    
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }

    console.log('\n📊 Current Doctor Data in MongoDB:');
    console.log('Name:', doctor.name);
    console.log('Email:', doctor.email);
    console.log('Department:', doctor.department || 'N/A');
    console.log('Specialization:', doctor.specialization || 'N/A');
    console.log('Qualification:', doctor.qualification || 'N/A');
    console.log('Experience:', doctor.experience || 'N/A');
    console.log('Phone:', doctor.phone || 'N/A');
    console.log('Available Days:', doctor.availableDays || 'N/A');
    console.log('Available Timings:', doctor.availableTimings || 'N/A');
    console.log('Languages:', doctor.languages || 'N/A');
    console.log('Patients Treated:', doctor.patientsTreated || 'N/A');
    console.log('Publications:', doctor.publications || 'N/A');
    console.log('Awards:', doctor.awards || 'N/A');
    console.log('About:', doctor.about ? 'Set (' + doctor.about.length + ' chars)' : 'N/A');

    console.log('\n✅ MongoDB connection test successful!');
    console.log('💡 Profile edits will be saved to this database.');
    
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMongoDBUpdate();
