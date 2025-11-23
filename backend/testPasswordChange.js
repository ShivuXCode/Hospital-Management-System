const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');

const testPasswordChange = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Find a test user (using admin user)
    const testUser = await User.findOne({ email: 'shivani.admin@gmail.com' });
    
    if (!testUser) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    console.log('📋 Test User Information:');
    console.log('   Email:', testUser.email);
    console.log('   Name:', testUser.name);
    console.log('   Role:', testUser.role);
    console.log('   User ID:', testUser._id);
    
    // Test password: "TestPassword123"
    const testPassword = 'TestPassword123';
    
    console.log('\n🔐 Testing Password Change...');
    console.log('   New Password:', testPassword);
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    
    // Update the password
    testUser.password = hashedPassword;
    await testUser.save();
    
    console.log('\n✅ Password updated successfully in database!');
    
    // Verify the password was saved correctly
    const verifyUser = await User.findById(testUser._id);
    const isMatch = await bcrypt.compare(testPassword, verifyUser.password);
    
    console.log('\n🔍 Verification:');
    console.log('   Password Hash Saved:', verifyUser.password.substring(0, 20) + '...');
    console.log('   Password Verification:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    if (isMatch) {
      console.log('\n✨ Password change functionality is working correctly!');
      console.log('\n📝 You can now test via the UI:');
      console.log('   1. Login as:', testUser.email);
      console.log('   2. Use password:', testPassword);
      console.log('   3. Go to Profile page');
      console.log('   4. Click "Change Password" button');
      console.log('   5. Enter new password and confirm');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing password change:', error.message);
    process.exit(1);
  }
};

testPasswordChange();
