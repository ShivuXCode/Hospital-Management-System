const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Nurse = require('./models/Nurse');

// Load environment variables
dotenv.config();

// Doctor updates with department info from doctors.json
const doctorUpdates = [
  {
    email: 'doctor@hospital.com',
    updates: {
      department: 'General Medicine',
      specialization: 'General Medicine',
      qualification: 'MBBS, MD',
      experience: '10 years',
      phone: '+91 98765 00000'
    }
  },
  {
    email: 'priya.sharma@mediflow.com',
    updates: {
      department: 'Cardiology',
      specialization: 'Cardiology',
      qualification: 'MD, DM (Cardiology)',
      experience: '8 years',
      phone: '+91 98765 43210'
    }
  },
  {
    email: 'rajesh.kumar@mediflow.com',
    updates: {
      department: 'Neurology',
      specialization: 'Neurology',
      qualification: 'MD, DM (Neurology)',
      experience: '12 years',
      phone: '+91 98765 43211'
    }
  },
  {
    email: 'ananya.reddy@mediflow.com',
    updates: {
      department: 'Orthopedics',
      specialization: 'Orthopedics',
      qualification: 'MS (Ortho), MCh (Ortho)',
      experience: '10 years',
      phone: '+91 98765 43212'
    }
  },
  {
    email: 'vikram.singh@mediflow.com',
    updates: {
      department: 'Pediatrics',
      specialization: 'Pediatrics',
      qualification: 'MD (Pediatrics), DCH',
      experience: '15 years',
      phone: '+91 98765 43213'
    }
  },
  {
    email: 'meera.patel@mediflow.com',
    updates: {
      department: 'General Medicine',
      specialization: 'General Medicine',
      qualification: 'MBBS, MD (General Medicine)',
      experience: '7 years',
      phone: '+91 98765 43214'
    }
  },
  {
    email: 'arun.verma@mediflow.com',
    updates: {
      department: 'Dermatology',
      specialization: 'Dermatology',
      qualification: 'MD (Dermatology), DNB',
      experience: '9 years',
      phone: '+91 98765 43215'
    }
  },
  {
    email: 'lakshmi.iyer@mediflow.com',
    updates: {
      department: 'ENT',
      specialization: 'ENT',
      qualification: 'MS (ENT), FICS',
      experience: '11 years',
      phone: '+91 98765 43216'
    }
  },
  {
    email: 'kavitha.menon@mediflow.com',
    updates: {
      department: 'Gynecology',
      specialization: 'Gynecology',
      qualification: 'MD (OBG), MRCOG',
      experience: '13 years',
      phone: '+91 98765 43217'
    }
  },
  {
    email: 'arjun.desai@mediflow.com',
    updates: {
      department: 'Psychiatry',
      specialization: 'Psychiatry',
      qualification: 'MD (Psychiatry), DNB',
      experience: '6 years',
      phone: '+91 98765 43218'
    }
  },
  {
    email: 'sanjay.nair@mediflow.com',
    updates: {
      department: 'Ophthalmology',
      specialization: 'Ophthalmology',
      qualification: 'MS (Ophthalmology), FRCS',
      experience: '14 years',
      phone: '+91 98765 43219'
    }
  }
];

// Nurse update
const nurseUpdate = {
  email: 'nurse@hospital.com',
  updates: {
    department: 'General Ward',
    shift: 'Morning',
    phone: '+91 98765 00001'
  }
};

// Update function
const updateDoctorsDepartments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for updating');

    // Update doctors in Doctor collection (if exists) otherwise update User
    for (const doctor of doctorUpdates) {
      const result = await Doctor.updateOne(
        { email: doctor.email },
        { $set: doctor.updates }
      );
      if (result.matchedCount === 0) {
        // fallback to User updates if Doctor doc not present
        const userResult = await User.updateOne({ email: doctor.email }, { $set: doctor.updates });
        if (userResult.modifiedCount > 0) {
          console.log(`✅ Updated doctor (User record): ${doctor.email}`);
        } else {
          console.log(`ℹ️  No changes for doctor: ${doctor.email}`);
        }
      } else if (result.modifiedCount > 0) {
        console.log(`✅ Updated doctor (Doctor collection): ${doctor.email}`);
      } else {
        console.log(`ℹ️  No changes for doctor: ${doctor.email}`);
      }
    }

    // Update nurse in Nurse collection or fallback to User
    const nurseResult = await Nurse.updateOne({ email: nurseUpdate.email }, { $set: nurseUpdate.updates });
    if (nurseResult.matchedCount === 0) {
      const userNurseResult = await User.updateOne({ email: nurseUpdate.email }, { $set: nurseUpdate.updates });
      if (userNurseResult.modifiedCount > 0) {
        console.log(`✅ Updated nurse (User record): ${nurseUpdate.email}`);
      } else {
        console.log(`ℹ️  No changes for nurse: ${nurseUpdate.email}`);
      }
    } else if (nurseResult.modifiedCount > 0) {
      console.log(`✅ Updated nurse (Nurse collection): ${nurseUpdate.email}`);
    } else {
      console.log(`ℹ️  No changes for nurse: ${nurseUpdate.email}`);
    }

    console.log('\n🎉 Update completed!');
    console.log('\n📋 All Doctors now have department information:');
    
    const doctors = await Doctor.find().select('name email department specialization experience');
    doctors.forEach(doc => {
      console.log(`${doc.name.padEnd(25)} | ${doc.email.padEnd(30)} | ${doc.department || 'N/A'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating doctors:', error);
    process.exit(1);
  }
};

// Run update
updateDoctorsDepartments();
