const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Source doctors from the request
const RAW_DOCTORS = [
  { name: 'Karan Mehta', specialization: 'Cardiology', qualification: 'MBBS, MD (Cardiology)', experience: '8', rating: 4.5 },
  { name: 'Dr. Arun Patel', specialization: 'Orthopedics', qualification: 'MBBS, MS (Orthopedics)', experience: '18', rating: 4.5 },
  { name: 'Dr. Priya Sharma', specialization: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics)', experience: '12', rating: 4.5 },
  { name: 'Dr. Rajesh Kumar', specialization: 'Neurology', qualification: 'MD, DM (Neurology)', experience: '12 years', rating: 4.9 },
  { name: 'Dr. Sanjay Nair', specialization: 'Ophthalmology', qualification: 'MS (Ophthalmology), FRCS', experience: '14 years', rating: 4.6 },
  { name: 'Dr. Deepa Menon', specialization: 'Oncology', qualification: 'MD (Oncology), DM', experience: '9 years', rating: 4.6 },
  { name: 'Dr. Meera Patel', specialization: 'General Medicine', qualification: 'MBBS, MD (General Medicine)', experience: '7 years', rating: 4.9 },
  { name: 'Dr. Arjun Rao', specialization: 'Emergency Medicine', qualification: 'MBBS, MD (Emergency Medicine)', experience: '11 years', rating: 4.9 },
  { name: 'Dr. Suresh Iyer', specialization: 'Gastroenterology', qualification: 'MD, DM (Gastroenterology)', experience: '8 years', rating: 4.9 },
  { name: 'Dr. Kavitha Desai', specialization: 'Obstetrics & Gynecology', qualification: 'MD (OBG), MRCOG', experience: '13 years', rating: 4.7 },
  { name: 'Dr. Amit Verma', specialization: 'Radiology', qualification: 'MD (Radiology), FRCR', experience: '6 years', rating: 4.8 },
  { name: 'Dr. Lakshmi Krishnan', specialization: 'General Surgery', qualification: 'MS (General Surgery), FICS', experience: '10 years', rating: 4.7 },
];

function normalizeName(name) {
  return name.replace(/^Dr\.?\s*/i, '').trim();
}

function firstName(name) {
  const clean = normalizeName(name);
  return clean.split(' ')[0];
}

function genEmail(name) {
  const first = firstName(name).toLowerCase();
  return `${first}.doctor@gmail.com`;
}

function genPassword(name) {
  const f = firstName(name);
  // e.g., Karan@123
  return `${f.charAt(0).toUpperCase()}${f.slice(1)}@123`;
}

function parseExperience(exp) {
  if (!exp) return 0;
  const m = String(exp).match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

async function upsertDoctorUser(doc) {
  const name = normalizeName(doc.name);
  const email = genEmail(doc.name);
  const password = genPassword(doc.name);
  const userData = {
    name,
    email,
    role: 'Doctor',
    department: doc.specialization,
    specialization: doc.specialization,
    qualification: doc.qualification,
    experience: `${parseExperience(doc.experience)} years`,
    rating: doc.rating || 0,
  };

  let created = false;
  let updated = false;

  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({ ...userData, password: hashed });
    created = true;
  } else {
    // Update profile fields but do NOT overwrite password
    await User.updateOne({ _id: user._id }, { $set: userData });
    updated = true;
  }

  return { user, email, password, created, updated };
}

async function upsertDoctorProfile(doc, linkedUserId) {
  const name = normalizeName(doc.name);
  const email = genEmail(doc.name);
  const experienceNum = parseExperience(doc.experience);

  const profileData = {
    userId: linkedUserId,
    name: `Dr. ${name}`,
    email,
    specialization: doc.specialization,
    qualification: doc.qualification,
    experience: experienceNum,
    languages: [],
    consultationTypes: ['both'],
  };

  let created = false;
  let updated = false;

  let prof = await Doctor.findOne({ email });
  if (!prof) {
    prof = await Doctor.create(profileData);
    created = true;
  } else {
    await Doctor.updateOne({ _id: prof._id }, { $set: profileData });
    updated = true;
  }

  return { profile: prof, created, updated };
}

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
  await mongoose.connect(uri);
  const results = [];
  for (const doc of RAW_DOCTORS) {
    const userRes = await upsertDoctorUser(doc);
    const profRes = await upsertDoctorProfile(doc, userRes.user._id);
    // Link user to doctor profile if not already
    if (!userRes.user.doctorId || String(userRes.user.doctorId) !== String(profRes.profile._id)) {
      await User.updateOne({ _id: userRes.user._id }, { $set: { doctorId: profRes.profile._id } });
    }
    results.push({
      name: normalizeName(doc.name),
      email: userRes.email,
      password: userRes.created ? userRes.password : '(unchanged)',
      userCreated: userRes.created,
      userUpdated: userRes.updated,
      profileCreated: profRes.created,
      profileUpdated: profRes.updated,
    });
  }

  console.log('\n📋 Doctor login setup summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach(r => {
    console.log(`${r.name.padEnd(20)} | ${r.email.padEnd(28)} | ${r.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(JSON.stringify({ success: true, created: results.filter(r=>r.userCreated).length, updated: results.filter(r=>r.userUpdated).length }, null, 2));
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Seed doctors failed:', err.message);
  process.exit(1);
});
