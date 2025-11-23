const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Demo users to seed (restricted to the three approved accounts)
const demoUsers = [
  {
    name: 'Admin User',
    email: 'shivani.admin@gmail.com',
    password: 'Admin@123',
    role: 'Admin'
  },
  {
    name: 'Karan Mehta',
    email: 'karan.doctor@gmail.com',
    password: 'Doctor@123',
    role: 'Doctor',
    department: 'General Medicine',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    experience: '8 years',
    phone: '+91 90000 00002'
  },
  {
    name: 'Asha Thomas',
    email: 'asha.nurse@gmail.com',
    password: 'Nurse@123',
    role: 'Nurse',
    department: 'General Ward',
    shift: 'Morning',
    phone: '+91 90000 00001'
  }
];

// Seed function
const seedDemoUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    // Hash passwords and insert users
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        console.log(`✅ Created demo user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
      }
    }

    console.log('\n🎉 Demo users seeding completed!');
    console.log('\n📋 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    demoUsers.forEach(user => {
      console.log(`${user.role.padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    process.exit(1);
  }
};

// Run seeding
seedDemoUsers();
