const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const ADMIN_EMAIL_NEW = 'shivani.admin@gmail.com';
const ADMIN_DEFAULT_PASSWORD = 'Admin@123';

// Desired Nurse account
const NURSE_NAME = 'Asha Thomas';
const NURSE_EMAIL = 'asha.nurse@gmail.com';
const NURSE_PASSWORD = 'Nurse@123';

// Desired Doctor account
const DOCTOR_NAME = 'Karan Mehta';
const DOCTOR_EMAIL = 'karan.doctor@gmail.com';
const DOCTOR_PASSWORD = 'Doctor@123';

async function upsertUser({ query, data }) {
  const existing = await User.findOne(query);
  if (existing) {
    const updates = { ...data };
    if (data.password) delete updates.password; // don't overwrite hash directly
    await User.updateOne({ _id: existing._id }, { $set: updates });
    return { ...existing.toObject(), ...updates, updated: true };
  } else {
    const hashed = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;
    const doc = new User({ ...data, ...(hashed ? { password: hashed } : {}) });
    await doc.save();
    return { ...doc.toObject(), created: true };
  }
}

async function ensureAdminEmail() {
  // Prefer finding by role Admin; if none, create one with desired email
  const admin = await User.findOne({ role: 'Admin' });
  if (admin) {
    if (admin.email !== ADMIN_EMAIL_NEW) {
      // Ensure new email is not taken
      const taken = await User.findOne({ email: ADMIN_EMAIL_NEW });
      if (!taken) {
        await User.updateOne({ _id: admin._id }, { $set: { email: ADMIN_EMAIL_NEW } });
        return { action: 'updated', id: admin._id.toString(), email: ADMIN_EMAIL_NEW };
      } else {
        return { action: 'skipped', reason: 'target email already exists', id: taken._id.toString(), email: ADMIN_EMAIL_NEW };
      }
    }
    return { action: 'noop', id: admin._id.toString(), email: admin.email };
  }

  // Create admin if missing
  const created = await upsertUser({
    query: { email: ADMIN_EMAIL_NEW },
    data: {
      name: 'Admin User',
      email: ADMIN_EMAIL_NEW,
      password: ADMIN_DEFAULT_PASSWORD,
      role: 'Admin',
    },
  });
  return { action: 'created', id: created._id?.toString?.() || '', email: ADMIN_EMAIL_NEW };
}

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // 1) Ensure admin email
    const adminResult = await ensureAdminEmail();
    console.log('Admin:', adminResult);

    // Cleanup any previous test accounts we created with old emails
    const oldEmails = ['shivani.nurse@gmail.com', 'shivani.doctor@gmail.com'];
    const delRes = await User.deleteMany({ email: { $in: oldEmails } });
    if (delRes.deletedCount) {
      console.log(`Cleanup: removed ${delRes.deletedCount} old test account(s)`);
    }

    // 2) Ensure Nurse user
    const nurse = await upsertUser({
      query: { email: NURSE_EMAIL },
      data: {
        name: NURSE_NAME,
        email: NURSE_EMAIL,
        password: NURSE_PASSWORD,
        role: 'Nurse',
        department: 'General Ward',
        shift: 'Morning',
        phone: '+91 90000 00001',
      },
    });
    console.log('Nurse:', nurse.created ? 'created' : 'updated', NURSE_EMAIL);

    // 3) Ensure Doctor user
    const doctor = await upsertUser({
      query: { email: DOCTOR_EMAIL },
      data: {
        name: DOCTOR_NAME,
        email: DOCTOR_EMAIL,
        password: DOCTOR_PASSWORD,
        role: 'Doctor',
        department: 'General Medicine',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        experience: '8 years',
        phone: '+91 90000 00002',
      },
    });
    console.log('Doctor:', doctor.created ? 'created' : 'updated', DOCTOR_EMAIL);

    // 4) List all credentials
    const users = await User.find({}, { name: 1, email: 1, role: 1 }).sort({ role: 1, email: 1 });
    console.log('\n📋 Current users in DB:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(u => {
      console.log(`${String(u.role).padEnd(8)} | ${String(u.name).padEnd(20)} | ${u.email}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

run();
