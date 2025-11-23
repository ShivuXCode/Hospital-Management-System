// Ensures a Nurse document exists for each User with role 'Nurse'
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
let Nurse;
try {
  Nurse = require('../models/Nurse');
} catch (e) {
  console.error('❌ Nurse model not found');
  process.exit(1);
}

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
  await mongoose.connect(uri);
  const nurseUsers = await User.find({ role: 'Nurse' });
  let created = 0;
  for (const u of nurseUsers) {
    const existing = await Nurse.findOne({ email: u.email });
    if (!existing) {
      await Nurse.create({
        userId: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        department: u.department || '',
        shift: u.shift || '',
        qualification: u.qualification || '',
        experience: Number(u.experience) || 0,
        languages: [],
        about: '',
        status: 'active'
      });
      created++;
      console.log(`✅ Nurse doc created for user ${u.email}`);
    }
  }
  const count = await Nurse.countDocuments();
  console.log(JSON.stringify({ success: true, nurseUsers: nurseUsers.length, nurseDocs: count, newlyCreated: created }, null, 2));
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
