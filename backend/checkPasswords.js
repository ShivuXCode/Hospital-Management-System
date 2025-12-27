const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const testPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const users = await User.find({});
    
    console.log('=== Testing User Passwords ===\n');
    
    for (const user of users) {
      console.log(`User: ${user.email} (${user.role})`);
      console.log(`Name: ${user.name}`);
      console.log(`Password Hash: ${user.password.substring(0, 20)}...`);
      
      // Test common passwords
      const testPasswords = ['Admin@123', 'admin123', 'Doctor@123', 'Nurse@123', 'password', 'demo123'];
      
      for (const testPwd of testPasswords) {
        const isMatch = await bcrypt.compare(testPwd, user.password);
        if (isMatch) {
          console.log(`✅ Correct Password: "${testPwd}"`);
          break;
        }
      }
      console.log('---\n');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPasswords();
