const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    const karanUser = await User.findOne({ email: 'karan.doctor@gmail.com' });
    console.log('👨‍⚕️ Karan User:', karanUser._id);

    const karanDoctor = await Doctor.findOne({ userId: karanUser._id });
    console.log('\n📋 Doctor Document:');
    console.log(JSON.stringify(karanDoctor, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

check();
