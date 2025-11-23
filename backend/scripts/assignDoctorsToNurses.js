// Assigns doctors to nurses at a 2:1 ratio and links both sides
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';
  await mongoose.connect(uri);

  const doctors = await Doctor.find().sort({ name: 1 });
  const nurses = await Nurse.find().sort({ name: 1 });

  if (nurses.length === 0) {
    console.error('❌ No nurses found to assign');
    process.exit(1);
  }

  // Reset all assignments
  await Promise.all(nurses.map(n => { n.assignedDoctors = []; return n.save(); }));
  await Promise.all(doctors.map(d => { d.assignedNurse = null; return d.save(); }));

  // Determine how many nurses are needed to cover doctors (2 doctors per nurse)
  const neededNurses = Math.min(nurses.length, Math.ceil(doctors.length / 2));

  let nurseIndex = 0;
  let assigned = 0;
  for (let i = 0; i < doctors.length; i++) {
    const nurse = nurses[nurseIndex];
    if (nurse.assignedDoctors.length >= 2) {
      // move to next nurse that still has capacity
      do {
        nurseIndex++;
      } while (nurseIndex < neededNurses && nurses[nurseIndex].assignedDoctors.length >= 2);
    }
    if (nurseIndex >= neededNurses) break; // safety

    const chosen = nurses[nurseIndex];
    chosen.assignedDoctors.push(doctors[i]._id);
    doctors[i].assignedNurse = chosen._id;
    assigned++;

    // After assigning two doctors to a nurse, move to next nurse
    if (chosen.assignedDoctors.length >= 2) nurseIndex++;
  }

  await Promise.all(nurses.slice(0, neededNurses).map(n => n.save()));
  await Promise.all(doctors.map(d => d.save()));

  console.log(JSON.stringify({ success: true, doctors: doctors.length, nurses: nurses.length, assignedDoctorLinks: assigned, nursesUsed: neededNurses }, null, 2));
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
