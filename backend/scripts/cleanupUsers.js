const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const ALLOWED_EMAILS = [
  'shivani.admin@gmail.com',
  'asha.nurse@gmail.com',
  'karan.doctor@gmail.com',
];

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const before = await User.countDocuments();
    const delRes = await User.deleteMany({ email: { $nin: ALLOWED_EMAILS } });

    const after = await User.countDocuments();
    const users = await User.find({}, { name: 1, email: 1, role: 1 }).sort({ role: 1, email: 1 });

    console.log(`Removed ${delRes.deletedCount} user(s). Before: ${before}, After: ${after}`);
    console.log('\n📋 Remaining users in DB:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(u => {
      console.log(`${String(u.role).padEnd(8)} | ${String(u.name).padEnd(20)} | ${u.email}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
}

run();
