const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');

const restoreAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Find admin user
    const adminUser = await User.findOne({ email: 'shivani.admin@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('🔄 Restoring Admin Password...');
    
    // Original password: "Admin@123"
    const originalPassword = 'Admin@123';
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(originalPassword, saltRounds);
    
    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Admin password restored to: Admin@123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring password:', error.message);
    process.exit(1);
  }
};

restoreAdminPassword();
