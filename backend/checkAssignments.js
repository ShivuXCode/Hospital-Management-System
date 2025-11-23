const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Nurse = require('./models/Nurse');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all doctors and their assigned nurses
    const doctors = await Doctor.find().populate('assignedNurses');
    console.log('👨‍⚕️ Doctors with Assigned Nurses:');
    console.log('═'.repeat(60));
    
    for (const doc of doctors) {
      const user = await User.findById(doc.userId);
      console.log(`\n📋 Doctor: ${doc.name} (${user?.email || 'no email'})`);
      console.log(`   User ID: ${doc.userId}`);
      console.log(`   Assigned Nurses: ${doc.assignedNurses?.length || 0}`);
      
      if (doc.assignedNurses && doc.assignedNurses.length > 0) {
        for (const nurse of doc.assignedNurses) {
          const nurseUser = await User.findById(nurse.userId);
          console.log(`   ├─ ${nurse.name} (${nurseUser?.email || 'no email'})`);
          console.log(`   │  Nurse User ID: ${nurse.userId}`);
        }
      }
    }

    // Check all nurses and their assigned doctors
    const nurses = await Nurse.find().populate('assignedDoctors');
    console.log('\n\n👩‍⚕️ Nurses with Assigned Doctors:');
    console.log('═'.repeat(60));
    
    for (const nurse of nurses) {
      const user = await User.findById(nurse.userId);
      console.log(`\n📋 Nurse: ${nurse.name} (${user?.email || 'no email'})`);
      console.log(`   User ID: ${nurse.userId}`);
      console.log(`   Assigned Doctors: ${nurse.assignedDoctors?.length || 0}`);
      
      if (nurse.assignedDoctors && nurse.assignedDoctors.length > 0) {
        for (const doc of nurse.assignedDoctors) {
          const docUser = await User.findById(doc.userId);
          console.log(`   ├─ ${doc.name} (${docUser?.email || 'no email'})`);
          console.log(`   │  Doctor User ID: ${doc.userId}`);
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();
