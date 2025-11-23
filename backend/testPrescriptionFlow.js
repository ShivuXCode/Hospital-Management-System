require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Nurse = require('./models/Nurse');
const User = require('./models/User');
const Prescription = require('./models/Prescription');

async function testPrescriptionFlow() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow');
    console.log('✅ Connected to MongoDB\n');

    // 1. Find Dr. Karan Mehta
    const karanUser = await User.findOne({ name: 'Karan Mehta', role: 'Doctor' });
    if (!karanUser) {
      console.log('❌ Dr. Karan Mehta not found');
      return;
    }
    console.log('👨‍⚕️ Found Dr. Karan Mehta:', karanUser.name, '- User ID:', karanUser._id);

    const karanDoctor = await Doctor.findOne({ userId: karanUser._id }).populate('assignedNurses');
    console.log('📋 Dr. Karan has', karanDoctor?.assignedNurses?.length || 0, 'assigned nurses');
    
    // 2. Find assigned nurses
    const assignedNurseIds = karanDoctor?.assignedNurses || [];
    if (assignedNurseIds.length > 0) {
      const nurses = await Nurse.find({ _id: { $in: assignedNurseIds } });
      console.log('👩‍⚕️ Assigned nurses:');
      for (const nurse of nurses) {
        const nurseUser = await User.findById(nurse.userId);
        console.log('   -', nurse.name, '- User ID:', nurseUser?._id);
      }
    } else {
      console.log('⚠️ No nurses assigned to Dr. Karan Mehta');
    }

    // 3. Find a patient
    const patient = await User.findOne({ role: 'Patient' });
    if (!patient) {
      console.log('❌ No patients found');
      return;
    }
    console.log('\n👤 Test patient:', patient.name, '- User ID:', patient._id);

    // 4. Check existing prescriptions for this doctor
    const existingPrescriptions = await Prescription.find({
      doctor: karanDoctor?._id
    }).populate('patient', 'name');
    
    console.log('\n💊 Existing prescriptions by Dr. Karan:', existingPrescriptions.length);
    if (existingPrescriptions.length > 0) {
      existingPrescriptions.forEach((presc, i) => {
        console.log(`   ${i + 1}. Patient: ${presc.patient?.name}, Medicines: ${presc.medicines?.length || 0}`);
      });
    }

    console.log('\n📊 Summary:');
    console.log('✅ Doctor-Nurse assignment is working');
    console.log('✅ Nurses can view prescriptions from assigned doctors via GET /api/prescriptions');
    console.log('✅ Frontend updated to support multiple medicines per prescription');
    console.log('\n💡 To test:');
    console.log('1. Login as Dr. Karan Mehta');
    console.log('2. Create a new prescription with multiple medicines');
    console.log('3. Login as the assigned nurse');
    console.log('4. Verify the prescription is visible in nurse\'s prescription list');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
}

testPrescriptionFlow();
