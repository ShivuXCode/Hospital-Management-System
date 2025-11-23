const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const authRoutes = require('./routes/auth');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');
const patientsRoutes = require('./routes/patients');
const nursesRoutes = require('./routes/nurses');

// Load environment variables from server/.env reliably
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// MongoDB Connection with debug logs
console.log('🟡 Connecting to MongoDB...');
console.log('📍 MONGO_URI:', process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds max wait
    });
    console.log('✅ MongoDB Connected');
    // Auto-seed demo users on server start
    await seedDemoUsersOnStartup();
    // Auto-seed demo doctors
    await seedDemoDoctorsOnStartup();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

connectDB();

console.log('🚀 Server starting...');

// Auto-seed demo users function
const seedDemoUsersOnStartup = async () => {
  // Seed only the primary Admin account. Other demo accounts are intentionally disabled.
  const demoUsers = [
    { name: 'Admin User', email: 'shivani.admin@gmail.com', password: 'Admin@123', role: 'Admin' }
  ];

  try {
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });
        console.log(`✅ Admin user ensured: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Admin user seeding error:', error.message);
  }
};

// Auto-seed demo doctors function
const seedDemoDoctorsOnStartup = async () => {
  const demoDoctors = [
    {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh@hospital.com',
      specialization: 'Cardiology',
      phone: '+1-555-0100',
      experience: 15,
      qualification: 'MBBS, MD, DM (Cardiology)',
      availability: 'Mon-Fri 9:00-14:00',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop'
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'priya@hospital.com',
      specialization: 'Pediatrics',
      phone: '+1-555-0101',
      experience: 12,
      qualification: 'MBBS, MD (Pediatrics)',
      availability: 'Tue-Thu 10:00-16:00',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'
    },
    {
      name: 'Dr. Arun Patel',
      email: 'arun@hospital.com',
      specialization: 'Orthopedics',
      phone: '+1-555-0102',
      experience: 18,
      qualification: 'MBBS, MS (Orthopedics)',
      availability: 'Mon, Wed, Fri 11:00-17:00',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop'
    }
  ];

  try {
    for (const doc of demoDoctors) {
      const existing = await Doctor.findOne({ email: doc.email });
      if (!existing) {
        await Doctor.create(doc);
        console.log(`✅ Demo doctor created: ${doc.email}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Demo doctors seeding error:', error.message);
  }
};

// API Routes
app.use('/api', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/nurses', nursesRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital Management API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`🏥 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
