const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all doctors with the old assignedNurse field
    const doctors = await Doctor.find({});
    console.log(`📊 Found ${doctors.length} doctors`);

    let migratedCount = 0;
    for (const doctor of doctors) {
      let needsSave = false;
      const rawDoc = doctor.toObject();
      
      // Check if has old assignedNurse field in raw document
      if (rawDoc.assignedNurse) {
        console.log(`🔄 Migrating ${doctor.name}: assignedNurse=${rawDoc.assignedNurse}`);
        
        // Initialize assignedNurses array if it doesn't exist
        if (!doctor.assignedNurses || doctor.assignedNurses.length === 0) {
          doctor.assignedNurses = [];
        }
        
        // Add the old assignedNurse to the new assignedNurses array if not already there
        if (!doctor.assignedNurses.some(id => id.toString() === rawDoc.assignedNurse.toString())) {
          doctor.assignedNurses.push(rawDoc.assignedNurse);
          needsSave = true;
        }
        
        // Use unset to remove the old field
        await Doctor.updateOne(
          { _id: doctor._id },
          { $unset: { assignedNurse: "" }, $set: { assignedNurses: doctor.assignedNurses } }
        );
        
        migratedCount++;
        console.log(`✅ Migrated ${doctor.name}: assignedNurses=${doctor.assignedNurses}`);
      } else if (!doctor.assignedNurses || doctor.assignedNurses.length === 0) {
        // Initialize empty array for doctors without any assignment
        doctor.assignedNurses = [];
        await doctor.save();
      }
    }

    console.log(`\n✅ Migration complete! ${migratedCount} doctors migrated.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
