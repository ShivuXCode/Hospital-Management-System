const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const Doctor = require('./models/Doctor');

const verifyConsultationTypes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('       CONSULTATION TYPES VERIFICATION REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    // Get video consultation doctors
    const videoDoctors = await Doctor.find({ 
      consultationTypes: { $in: ['video'] } 
    }, 'name email specialization consultationTypes').sort({ name: 1 });

    console.log('🎥 VIDEO CONSULTATION DOCTORS (Can Access Consultations Section)');
    console.log('─────────────────────────────────────────────────────────');
    if (videoDoctors.length === 0) {
      console.log('  ❌ No video consultation doctors found!\n');
    } else {
      videoDoctors.forEach((doc, idx) => {
        console.log(`  ${idx + 1}. ${doc.name}`);
        console.log(`     Email: ${doc.email}`);
        console.log(`     Specialization: ${doc.specialization}`);
        console.log(`     Type: ${doc.consultationTypes.join(', ')}\n`);
      });
    }

    // Get physical consultation doctors
    const physicalDoctors = await Doctor.find({ 
      consultationTypes: { $nin: ['video'] }
    }, 'name email specialization consultationTypes').sort({ name: 1 });

    console.log('🏥 PHYSICAL CONSULTATION DOCTORS (No Consultations Section)');
    console.log('─────────────────────────────────────────────────────────');
    if (physicalDoctors.length === 0) {
      console.log('  ✓ No physical-only doctors found\n');
    } else {
      console.log(`  Total: ${physicalDoctors.length} doctors\n`);
      physicalDoctors.forEach((doc, idx) => {
        console.log(`  ${idx + 1}. ${doc.name} (${doc.specialization})`);
        console.log(`     ${doc.email} - Type: ${doc.consultationTypes.join(', ')}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ Verification Complete!');
    console.log(`   Video Doctors: ${videoDoctors.length}`);
    console.log(`   Physical Doctors: ${physicalDoctors.length}`);
    console.log(`   Total Doctors: ${videoDoctors.length + physicalDoctors.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying consultation types:', error.message);
    process.exit(1);
  }
};

verifyConsultationTypes();
