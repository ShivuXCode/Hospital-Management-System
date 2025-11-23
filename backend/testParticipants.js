const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Nurse = require('./models/Nurse');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test for Dr. Karan
    const karanUser = await User.findOne({ email: 'karan.doctor@gmail.com' });
    console.log('👨‍⚕️ Testing for Dr. Karan');
    console.log('   User ID:', karanUser._id);

    const doctor = await Doctor.findOne({ userId: karanUser._id });
    console.log('   Doctor Profile ID:', doctor._id);
    console.log('   Assigned Nurses:', doctor.assignedNurses);
    console.log('   Assigned Nurses Count:', doctor.assignedNurses.length);

    // Get assigned nurses
    const assignedNurseUserIds = [];
    if (doctor.assignedNurses && doctor.assignedNurses.length > 0) {
      const assignedNurses = await Nurse.find({ _id: { $in: doctor.assignedNurses } });
      console.log('\n   Found Nurse Profiles:', assignedNurses.length);
      assignedNurses.forEach(nurse => {
        console.log('   - Nurse:', nurse.name, 'User ID:', nurse.userId);
        if (nurse.userId) {
          assignedNurseUserIds.push(nurse.userId.toString());
        }
      });
    }

    console.log('\n   Assigned Nurse User IDs:', assignedNurseUserIds);

    // Get users
    if (assignedNurseUserIds.length > 0) {
      const assignedNurseUsers = await User.find({ 
        _id: { $in: assignedNurseUserIds },
        role: 'Nurse' 
      }).select('name role email').lean();
      console.log('\n   ✅ Should return to API:', assignedNurseUsers.length, 'nurses');
      assignedNurseUsers.forEach(u => {
        console.log('      -', u.name, '(', u.email, ')');
      });
    }

    // Test for Asha (Nurse)
    console.log('\n\n👩‍⚕️ Testing for Nurse Asha');
    const ashaUser = await User.findOne({ email: 'asha.nurse@gmail.com' });
    console.log('   User ID:', ashaUser._id);

    const nurse = await Nurse.findOne({ userId: ashaUser._id }).populate('assignedDoctors');
    console.log('   Nurse Profile ID:', nurse._id);
    console.log('   Assigned Doctors:', nurse.assignedDoctors);
    console.log('   Assigned Doctors Count:', nurse.assignedDoctors?.length || 0);

    // Get assigned doctors
    const assignedDoctorUserIds = [];
    if (nurse.assignedDoctors && nurse.assignedDoctors.length > 0) {
      console.log('\n   Found Doctor Profiles:', nurse.assignedDoctors.length);
      nurse.assignedDoctors.forEach(doc => {
        console.log('   - Doctor:', doc.name, 'User ID:', doc.userId);
        if (doc.userId) {
          assignedDoctorUserIds.push(doc.userId.toString());
        }
      });
    }

    console.log('\n   Assigned Doctor User IDs:', assignedDoctorUserIds);

    // Get users
    if (assignedDoctorUserIds.length > 0) {
      const assignedDoctorUsers = await User.find({ 
        _id: { $in: assignedDoctorUserIds },
        role: 'Doctor' 
      }).select('name role email').lean();
      console.log('\n   ✅ Should return to API:', assignedDoctorUsers.length, 'doctors');
      assignedDoctorUsers.forEach(u => {
        console.log('      -', u.name, '(', u.email, ')');
      });
    } else {
      console.log('\n   ❌ No assigned doctors found!');
    }

    await mongoose.disconnect();
    console.log('\n\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

test();
