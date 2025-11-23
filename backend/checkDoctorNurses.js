const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Karan Mehta
    const karanUser = await User.findOne({ email: 'karan.doctor@gmail.com' });
    if (!karanUser) {
      console.log('❌ Karan user not found');
      return;
    }
    console.log('👨‍⚕️ Karan User ID:', karanUser._id);

    const karanDoctor = await Doctor.findOne({ userId: karanUser._id }).populate('assignedNurse');
    if (!karanDoctor) {
      console.log('❌ Karan doctor profile not found');
      return;
    }

    console.log('\n📋 Doctor Profile:');
    console.log('  Name:', karanDoctor.name);
    console.log('  Assigned Nurse:', karanDoctor.assignedNurse);
    console.log('  Assigned Nurse ID:', karanDoctor.assignedNurse?._id);
    console.log('  Assigned Nurse UserId:', karanDoctor.assignedNurse?.userId);

    // Check all nurses
    const allNurses = await User.find({ role: 'Nurse' }).select('name email');
    console.log('\n👩‍⚕️ All Nurses in DB:', allNurses.length);
    allNurses.forEach(n => console.log(`  - ${n.name} (${n.email})`));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();
