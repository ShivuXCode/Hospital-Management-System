const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

// Common password for all demo users
const DEMO_PASSWORD = 'Demo@123';

const resetAllPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    
    console.log('=== Resetting All User Passwords ===\n');
    
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    
    for (const user of users) {
      user.password = hashedPassword;
      await user.save();
      console.log(`✅ Reset password for: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 All passwords have been reset!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Password for ALL users: Demo@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    users.forEach(user => {
      console.log(`${user.role.padEnd(10)} | ${user.email}`);
    });
    console.log('\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAllPasswords();
