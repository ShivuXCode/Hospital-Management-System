const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const Doctor = require('./models/Doctor');

const updateConsultationTypes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Update Dr. Sarah Mitchell - Video only
    const sarahResult = await Doctor.updateOne(
      { email: 'sarah.mitchell@hospital.com' },
      { 
        $set: { 
          consultationTypes: ['video'],
          about: 'General physician specializing in preventive care and chronic disease management. Available for video consultations only.'
        } 
      }
    );
    console.log('✅ Dr. Sarah Mitchell updated to VIDEO only:', sarahResult.modifiedCount > 0 ? 'Success' : 'Already set');

    // Update Dr. Michael Chen - Video only
    const michaelResult = await Doctor.updateOne(
      { email: 'michael.chen@hospital.com' },
      { 
        $set: { 
          consultationTypes: ['video'],
          about: 'Experienced general practitioner with focus on family medicine and telemedicine consultations only.'
        } 
      }
    );
    console.log('✅ Dr. Michael Chen updated to VIDEO only:', michaelResult.modifiedCount > 0 ? 'Success' : 'Already set');

    // Update ALL other doctors to Physical only
    const othersResult = await Doctor.updateMany(
      { 
        email: { 
          $nin: ['sarah.mitchell@hospital.com', 'michael.chen@hospital.com'] 
        } 
      },
      { 
        $set: { 
          consultationTypes: ['physical']
        } 
      }
    );
    console.log(`✅ ${othersResult.modifiedCount} other doctors updated to PHYSICAL only`);

    // Display final configuration
    console.log('\n📋 Final Consultation Types Configuration:');
    const allDoctors = await Doctor.find({}, 'name email consultationTypes').sort({ email: 1 });
    allDoctors.forEach(doc => {
      const type = doc.consultationTypes.includes('video') ? '🎥 VIDEO' : '🏥 PHYSICAL';
      console.log(`  ${type} - ${doc.name} (${doc.email})`);
    });

    console.log('\n✅ All consultation types updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating consultation types:', error.message);
    process.exit(1);
  }
};

updateConsultationTypes();
