const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Nurse = require('../models/Nurse');
// Ensure Doctor model is registered for populate
require('../models/Doctor');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
  await mongoose.connect(uri);
  const nurses = await Nurse.find().sort({ name: 1 }).populate('assignedDoctors', 'name email');
  const out = nurses.map(n => ({
    nurse: n.name,
    email: n.email,
    assignedDoctors: (n.assignedDoctors || []).map(d => ({ name: d.name, email: d.email })),
    count: (n.assignedDoctors || []).length,
  }));
  console.log(JSON.stringify({ success: true, nurses: out }, null, 2));
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
