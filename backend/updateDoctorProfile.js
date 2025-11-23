const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Update doctor profile with complete data
const updateDoctorProfile = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for updating');

    // Find and update doctor user
    const doctorEmail = 'karan.doctor@gmail.com';
    const doctor = await User.findOne({ email: doctorEmail });

    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }

    // Update doctor profile with all fields
    doctor.department = 'Cardiology';
    doctor.specialization = 'Cardiologist';
    doctor.qualification = 'MBBS, MD (Cardiology)';
    doctor.experience = '8 years';
    doctor.phone = '+91 90000 00002';
    doctor.availableDays = 'Monday - Friday';
    doctor.availableTimings = '9:00 AM - 5:00 PM';
    doctor.languages = ['English', 'Hindi', 'Tamil'];
    doctor.about = 'Dr. Karan Mehta is a highly experienced cardiologist with over 8 years of expertise in treating cardiovascular diseases. He specializes in interventional cardiology, heart failure management, and preventive cardiology. Dr. Mehta is committed to providing personalized care and uses the latest medical technologies to ensure the best outcomes for his patients. He has successfully treated over 1200 patients and continues to stay updated with the latest advancements in cardiac care.';
    doctor.rating = 4.7;
    doctor.patientsTreated = 1200;
    doctor.publications = 8;
    doctor.awards = ['Best Doctor Award 2023', 'Excellence in Patient Care 2022', 'Outstanding Achievement in Cardiology 2021'];

    await doctor.save();

    console.log('✅ Doctor profile updated successfully!');
    console.log('\n📋 Updated Profile:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Name:', doctor.name);
    console.log('Email:', doctor.email);
    console.log('Department:', doctor.department);
    console.log('Specialization:', doctor.specialization);
    console.log('Qualification:', doctor.qualification);
    console.log('Experience:', doctor.experience);
    console.log('Phone:', doctor.phone);
    console.log('Available Days:', doctor.availableDays);
    console.log('Available Timings:', doctor.availableTimings);
    console.log('Languages:', doctor.languages.join(', '));
    console.log('Patients Treated:', doctor.patientsTreated);
    console.log('Publications:', doctor.publications);
    console.log('Awards:', doctor.awards.length);
    console.log('About:', doctor.about.substring(0, 100) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating doctor profile:', error);
    process.exit(1);
  }
};

// Run update
updateDoctorProfile();
