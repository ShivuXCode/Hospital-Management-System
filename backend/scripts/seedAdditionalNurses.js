const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Nurse = require('../models/Nurse');

// Nurse names (include existing Asha Thomas). Emails: firstName.nurse@gmail.com, Password: FirstName@123
const RAW_NURSES = [
  { name: 'Asha Thomas', department: 'General Ward', shift: 'Morning' },
  { name: 'Neha Singh', department: 'Emergency', shift: 'Evening' },
  { name: 'Riya Patel', department: 'Pediatrics', shift: 'Morning' },
  { name: 'Anita Rao', department: 'ICU', shift: 'Night' },
  { name: 'Divya Menon', department: 'Oncology', shift: 'Morning' },
  { name: 'Sneha Varma', department: 'Cardiology', shift: 'Evening' },
  { name: 'Kavya Nair', department: 'Neurology', shift: 'Morning' },
  { name: 'Pooja Sharma', department: 'Orthopedics', shift: 'Evening' },
  { name: 'Meena Iyer', department: 'Radiology', shift: 'Morning' },
  { name: 'Lakshmi Das', department: 'Surgery', shift: 'Night' },
  { name: 'Sara George', department: 'Ophthalmology', shift: 'Morning' },
  { name: 'Priya Kulkarni', department: 'Gastroenterology', shift: 'Evening' },
  { name: 'Nisha Joseph', department: 'Gynecology', shift: 'Morning' },
  { name: 'Shalini Desai', department: 'Dermatology', shift: 'Evening' },
  { name: 'Anjali Verma', department: 'General Ward', shift: 'Morning' },
];

function firstName(full) {
  return full.split(' ')[0];
}

function genEmail(name) {
  return `${firstName(name).toLowerCase()}.nurse@gmail.com`;
}

function genPassword(name) {
  const f = firstName(name);
  return `${f.charAt(0).toUpperCase()}${f.slice(1)}@123`; // e.g. Asha@123
}

async function upsertNurseUser(entry) {
  const email = genEmail(entry.name);
  const existing = await User.findOne({ email });
  const baseData = {
    name: entry.name,
    email,
    role: 'Nurse',
    department: entry.department,
    shift: entry.shift,
  };
  let passwordShown;
  let created = false;
  let updated = false;
  let user;

  if (!existing) {
    const hashed = await bcrypt.hash(genPassword(entry.name), 10);
    user = await User.create({ ...baseData, password: hashed });
    passwordShown = genPassword(entry.name);
    created = true;
  } else {
    await User.updateOne({ _id: existing._id }, { $set: baseData });
    user = existing;
    passwordShown = '(unchanged)';
    updated = true;
  }
  return { user, email, passwordShown, created, updated };
}

async function upsertNurseProfile(entry, userId) {
  const email = genEmail(entry.name);
  let doc = await Nurse.findOne({ email });
  let created = false; let updated = false;
  const profileData = {
    userId,
    name: entry.name,
    email,
    phone: '',
    qualification: '',
    experience: 0,
    department: entry.department,
    shift: entry.shift,
    status: 'active'
  };
  if (!doc) {
    doc = await Nurse.create(profileData);
    created = true;
  } else {
    await Nurse.updateOne({ _id: doc._id }, { $set: profileData });
    updated = true;
  }
  return { profile: doc, created, updated };
}

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
  await mongoose.connect(uri);
  const results = [];
  for (const n of RAW_NURSES) {
    const userRes = await upsertNurseUser(n);
    const profileRes = await upsertNurseProfile(n, userRes.user._id);
    // Link user to nurse profile if needed
    if (!userRes.user.nurseId || String(userRes.user.nurseId) !== String(profileRes.profile._id)) {
      await User.updateOne({ _id: userRes.user._id }, { $set: { nurseId: profileRes.profile._id } });
    }
    results.push({
      name: n.name,
      email: userRes.email,
      password: userRes.passwordShown,
      userCreated: userRes.created,
      userUpdated: userRes.updated,
      profileCreated: profileRes.created,
      profileUpdated: profileRes.updated
    });
  }

  console.log('\n📋 Nurse login setup summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach(r => {
    console.log(`${r.name.padEnd(20)} | ${r.email.padEnd(28)} | ${r.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const nurseCount = await Nurse.countDocuments();
  console.log(JSON.stringify({ success: true, nurseDocuments: nurseCount, createdUsers: results.filter(r=>r.userCreated).length }, null, 2));
  await mongoose.disconnect();
}

run().catch(err => { console.error('❌ Seed nurses failed:', err.message); process.exit(1); });
