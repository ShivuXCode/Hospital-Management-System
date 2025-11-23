const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const nurses = await User.find({ role: 'Nurse' }).select('name role email');
    const admins = await User.find({ role: 'Admin' }).select('name role email');
    const doctors = await User.find({ role: 'Doctor' }).select('name role email');

    console.log('\n👩‍⚕️ Nurses:', nurses.length);
    nurses.forEach(n => console.log(`  - ${n.name} (${n.email})`));

    console.log('\n👨‍💼 Admins:', admins.length);
    admins.forEach(a => console.log(`  - ${a.name} (${a.email})`));

    console.log('\n👨‍⚕️ Doctors:', doctors.length);
    doctors.forEach(d => console.log(`  - ${d.name} (${d.email})`));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
