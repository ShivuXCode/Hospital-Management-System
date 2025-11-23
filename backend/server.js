const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Nurse = require('./models/Nurse');
const authRoutes = require('./routes/auth');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');
const patientsRoutes = require('./routes/patients');
const nursesRoutes = require('./routes/nurses');
const messagesRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const departmentsRoutes = require('./routes/departments');
const billingRoutes = require('./routes/billing');
const inventoryRoutes = require('./routes/inventory');
const iotRoutes = require('./routes/iot');
const prescriptionsRoutes = require('./routes/prescriptions');
const integratedBillingRoutes = require('./routes/integratedBilling');

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
    // Auto-seed demo nurse
    await seedDemoNurseOnStartup();
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
      availability: 'Mon–Fri, 9 AM – 2 PM',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi'],
      about: 'Experienced cardiologist specializing in complex cardiac care and preventive cardiology.',
      consultationTypes: ['physical']
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'priya@hospital.com',
      specialization: 'Pediatrics',
      phone: '+1-555-0101',
      experience: 12,
      qualification: 'MBBS, MD (Pediatrics)',
      availability: 'Tue–Thu, 10 AM – 4 PM',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      languages: ['English', 'Tamil'],
      about: 'Pediatrician focused on child wellness, vaccinations, and developmental care.',
      consultationTypes: ['physical']
    },
    {
      name: 'Dr. Arun Patel',
      email: 'arun@hospital.com',
      specialization: 'Orthopedics',
      phone: '+1-555-0102',
      experience: 18,
      qualification: 'MBBS, MS (Orthopedics)',
      availability: 'Mon, Wed, Fri, 11 AM – 5 PM',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
      languages: ['English', 'Gujarati'],
      about: 'Orthopedic surgeon with expertise in joint replacements and sports injuries.',
      consultationTypes: ['physical']
    },
    {
      name: 'Dr. Sarah Mitchell',
      email: 'sarah.mitchell@hospital.com',
      specialization: 'General Medicine',
      phone: '+1-555-0103',
      experience: 10,
      qualification: 'MBBS, MD (General Medicine)',
      availability: 'Mon–Fri, 9 AM – 5 PM',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi'],
      about: 'General physician specializing in preventive care and chronic disease management. Available for video consultations only.',
      consultationTypes: ['video']
    },
    {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@hospital.com',
      specialization: 'General Medicine',
      phone: '+1-555-0104',
      experience: 8,
      qualification: 'MBBS, MD (General Medicine)',
      availability: 'Mon–Sat, 10 AM – 6 PM',
      photo: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&h=400&fit=crop',
      languages: ['English', 'Tamil', 'Mandarin'],
      about: 'Experienced general practitioner with focus on family medicine and telemedicine consultations only.',
      consultationTypes: ['video']
    },
    {
      name: 'Dr. Anjali Verma',
      email: 'anjali.verma@hospital.com',
      specialization: 'Dermatology',
      phone: '+1-555-0105',
      experience: 12,
      qualification: 'MBBS, MD (Dermatology)',
      availability: 'Tue–Sat, 9 AM – 4 PM',
      photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Bengali'],
      about: 'Dermatology specialist with expertise in skin conditions and cosmetic treatments. Available for in-person consultations only.',
      consultationTypes: ['physical']
    }
  ];

  // Create auth users for new doctors
  const doctorAuthUsers = [
    { name: 'Dr. Sarah Mitchell', email: 'sarah.mitchell@hospital.com', password: 'Sarah@123', role: 'Doctor' },
    { name: 'Dr. Michael Chen', email: 'michael.chen@hospital.com', password: 'Michael@123', role: 'Doctor' },
    { name: 'Dr. Anjali Verma', email: 'anjali.verma@hospital.com', password: 'Anjali@123', role: 'Doctor' }
  ];

  try {
    // Create auth users first
    for (const authUser of doctorAuthUsers) {
      const existingUser = await User.findOne({ email: authUser.email.toLowerCase() });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(authUser.password, 10);
        const newUser = await User.create({ 
          ...authUser, 
          email: authUser.email.toLowerCase(),
          password: hashedPassword 
        });
        console.log(`✅ Doctor auth user created: ${authUser.email} (Password: ${authUser.password})`);
      }
    }

    // Create doctor profiles
    for (const doc of demoDoctors) {
      const existing = await Doctor.findOne({ email: doc.email });
      if (!existing) {
        const user = await User.findOne({ email: doc.email.toLowerCase() });
        const doctorProfile = await Doctor.create({
          ...doc,
          userId: user ? user._id : null
        });
        
        if (user) {
          user.doctorId = doctorProfile._id;
          await user.save();
        }
        
        console.log(`✅ Demo doctor created: ${doc.email}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Demo doctors seeding error:', error.message);
  }
};

// Auto-seed a demo nurse and assign first available doctor if none assigned
const seedDemoNurseOnStartup = async () => {
  try {
    const nurseEmail = 'nurse.demo@hospital.com';
    let nurseUser = await User.findOne({ email: nurseEmail.toLowerCase() });
    if (!nurseUser) {
      const hashed = await bcrypt.hash('Nurse@123', 10);
      nurseUser = await User.create({ name: 'Nurse User', email: nurseEmail.toLowerCase(), password: hashed, role: 'Nurse' });
      console.log(`✅ Demo nurse auth user created: ${nurseEmail}`);
    }

    let nurseProfile = await Nurse.findOne({ email: nurseEmail.toLowerCase() });
    if (!nurseProfile) {
      nurseProfile = await Nurse.create({
        userId: nurseUser._id,
        name: 'Nurse User',
        email: nurseEmail.toLowerCase(),
        phone: '+1-555-0200',
        qualification: 'BSc Nursing',
        experience: 5,
        department: 'General Care',
        shift: 'Morning',
        certifications: ['ACLS', 'BLS'],
        languages: ['English'],
        about: 'Demo nurse seeded automatically for testing.',
        status: 'active'
      });
      nurseUser.nurseId = nurseProfile._id;
      await nurseUser.save();
      console.log('✅ Demo nurse profile created and linked');
    }

    // Assign a doctor if nurse has none
    if (nurseProfile.assignedDoctors.length === 0) {
      const firstDoctor = await Doctor.findOne();
      if (firstDoctor) {
        nurseProfile.assignedDoctors.push(firstDoctor._id);
        await nurseProfile.save();
        // Ensure doctor's assignedNurses array reflects the assignment
        if (!Array.isArray(firstDoctor.assignedNurses)) {
          firstDoctor.assignedNurses = [];
        }
        if (!firstDoctor.assignedNurses.some(id => id.toString() === nurseProfile._id.toString())) {
          firstDoctor.assignedNurses.push(nurseProfile._id);
          await firstDoctor.save();
        }
        console.log(`🔗 Assigned Doctor ${firstDoctor.name} to Demo Nurse`);
      }
    }
  } catch (err) {
    console.error('⚠️  Demo nurse seeding error:', err.message);
  }
};

// Add request logger
app.use((req, res, next) => {
  if (req.path.includes('prescriptions')) {
    console.log(`📨 Request: ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/nurses', nursesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes); // MOVED BEFORE CATCH-ALL ROUTES
app.use('/api/integrated-billing', integratedBillingRoutes);
app.use('/api/contact', require('./routes/contact'));
app.use('/api', inventoryRoutes); // MOVED BEFORE BILLING to avoid route conflicts
app.use('/api', iotRoutes); // MOVED BEFORE BILLING to avoid route conflicts
app.use('/api', departmentsRoutes);
app.use('/api', billingRoutes);

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
