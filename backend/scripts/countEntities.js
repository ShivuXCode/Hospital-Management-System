const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
  try {
    await mongoose.connect(uri);
    const [doctors, nurses] = await Promise.all([
      Doctor.countDocuments(),
      Nurse.countDocuments(),
    ]);
    console.log(JSON.stringify({ success: true, doctors, nurses }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err.message }, null, 2));
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
}

run();
