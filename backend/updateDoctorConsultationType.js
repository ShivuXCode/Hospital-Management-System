const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

// Load environment variables
dotenv.config();

const updateKaranMehta = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Find and update Karan Mehta's doctor record
    const doctor = await Doctor.findOne({ 
      $or: [
        { name: 'Karan Mehta' },
        { name: 'Dr. Karan Mehta' },
        { email: 'karan.doctor@gmail.com' }
      ]
    });

    if (doctor) {
      // Update consultation type to physical only
      doctor.consultationTypes = ['physical'];
      await doctor.save();
      
      console.log('✅ Updated Dr. Karan Mehta consultation type:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Name: ${doctor.name}`);
      console.log(`Email: ${doctor.email}`);
      console.log(`Specialization: ${doctor.specialization}`);
      console.log(`Consultation Types: ${doctor.consultationTypes.join(', ')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️  Dr. Karan Mehta not found in Doctor collection.');
      console.log('Creating new Doctor record for Karan Mehta...\n');
      
      // Create new doctor record
      const newDoctor = new Doctor({
        name: 'Karan Mehta',
        email: 'karan.doctor@gmail.com',
        specialization: 'Cardiology',
        phone: '+91 90000 00002',
        experience: 8,
        qualification: 'MBBS, MD (Cardiology)',
        availability: 'Monday - Friday, 9:00 AM - 5:00 PM',
        languages: ['English', 'Hindi', 'Tamil'],
        about: 'Dr. Karan Mehta is a highly experienced cardiologist with over 8 years of expertise in treating cardiovascular diseases. He specializes in interventional cardiology, heart failure management, and preventive cardiology. Dr. Mehta is committed to providing personalized care and uses the latest medical technologies to ensure the best outcomes for his patients.',
        consultationTypes: ['physical']
      });
      
      await newDoctor.save();
      
      console.log('✅ Created Dr. Karan Mehta in Doctor collection:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Name: ${newDoctor.name}`);
      console.log(`Email: ${newDoctor.email}`);
      console.log(`Specialization: ${newDoctor.specialization}`);
      console.log(`Consultation Types: ${newDoctor.consultationTypes.join(', ')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('🎉 Update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating doctor:', error);
    process.exit(1);
  }
};

// Run update
updateKaranMehta();
