const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const allUsers = [
  // Admin
  {
    name: 'Admin User',
    email: 'shivani.admin@gmail.com',
    password: 'Admin@123',
    role: 'Admin'
  },
  
  // Doctors
  {
    name: 'Karan Mehta',
    email: 'karan.doctor@gmail.com',
    password: 'Doctor@123',
    role: 'Doctor',
    department: 'Cardiology',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD (Cardiology)',
    experience: '8 years',
    phone: '+91 90000 00002',
    availableDays: 'Monday - Friday',
    availableTimings: '9:00 AM - 5:00 PM',
    languages: ['English', 'Hindi', 'Tamil'],
    about: 'Experienced cardiologist specializing in interventional cardiology and heart failure management.',
    rating: 4.7,
    patientsTreated: 1200
  },
  {
    name: 'Arun Patel',
    email: 'arun.doctor@gmail.com',
    password: 'Arun@123',
    role: 'Doctor',
    department: 'Orthopedics',
    specialization: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: '6 years'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.doctor@gmail.com',
    password: 'Priya@123',
    role: 'Doctor',
    department: 'Pediatrics',
    specialization: 'Pediatrician',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '7 years'
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.doctor@gmail.com',
    password: 'Rajesh@123',
    role: 'Doctor',
    department: 'Neurology',
    specialization: 'Neurologist',
    qualification: 'MBBS, DM (Neurology)',
    experience: '9 years'
  },
  {
    name: 'Sanjay Nair',
    email: 'sanjay.doctor@gmail.com',
    password: 'Sanjay@123',
    role: 'Doctor',
    department: 'Dermatology',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '5 years'
  },
  {
    name: 'Deepa Menon',
    email: 'deepa.doctor@gmail.com',
    password: 'Deepa@123',
    role: 'Doctor',
    department: 'Gynecology',
    specialization: 'Gynecologist',
    qualification: 'MBBS, MS (OB-GYN)',
    experience: '11 years'
  },
  {
    name: 'Meera Patel',
    email: 'meera.doctor@gmail.com',
    password: 'Meera@123',
    role: 'Doctor',
    department: 'Ophthalmology',
    specialization: 'Ophthalmologist',
    qualification: 'MBBS, MS (Ophthalmology)',
    experience: '8 years'
  },
  {
    name: 'Arjun Rao',
    email: 'arjun.doctor@gmail.com',
    password: 'Arjun@123',
    role: 'Doctor',
    department: 'ENT',
    specialization: 'ENT Specialist',
    qualification: 'MBBS, MS (ENT)',
    experience: '7 years'
  },
  {
    name: 'Suresh Iyer',
    email: 'suresh.doctor@gmail.com',
    password: 'Suresh@123',
    role: 'Doctor',
    department: 'Radiology',
    specialization: 'Radiologist',
    qualification: 'MBBS, MD (Radiology)',
    experience: '10 years'
  },
  {
    name: 'Kavitha Desai',
    email: 'kavitha.doctor@gmail.com',
    password: 'Kavitha@123',
    role: 'Doctor',
    department: 'Psychiatry',
    specialization: 'Psychiatrist',
    qualification: 'MBBS, MD (Psychiatry)',
    experience: '6 years'
  },
  {
    name: 'Amit Verma',
    email: 'amit.doctor@gmail.com',
    password: 'Amit@123',
    role: 'Doctor',
    department: 'Urology',
    specialization: 'Urologist',
    qualification: 'MBBS, MCh (Urology)',
    experience: '9 years'
  },
  {
    name: 'Lakshmi Krishnan',
    email: 'lakshmi.doctor@gmail.com',
    password: 'Lakshmi@123',
    role: 'Doctor',
    department: 'Endocrinology',
    specialization: 'Endocrinologist',
    qualification: 'MBBS, DM (Endocrinology)',
    experience: '8 years'
  },
  
  // Video Consultation Doctors
  {
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@hospital.com',
    password: 'Sarah@123',
    role: 'Doctor',
    department: 'General Medicine',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    experience: '10 years',
    availableDays: 'Monday - Friday',
    availableTimings: '9:00 AM - 5:00 PM',
    consultationType: ['Video', 'Both']
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@hospital.com',
    password: 'Michael@123',
    role: 'Doctor',
    department: 'General Medicine',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    experience: '8 years',
    availableDays: 'Monday - Saturday',
    availableTimings: '10:00 AM - 6:00 PM',
    consultationType: ['Video', 'Both']
  },
  {
    name: 'Dr. Anjali Verma',
    email: 'anjali.verma@hospital.com',
    password: 'Anjali@123',
    role: 'Doctor',
    department: 'General Medicine',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    experience: '12 years',
    availableDays: 'Tuesday - Saturday',
    availableTimings: '9:00 AM - 4:00 PM',
    consultationType: ['Physical', 'Both']
  },
  
  // Nurses
  {
    name: 'Asha Thomas',
    email: 'asha.nurse@gmail.com',
    password: 'Nurse@123',
    role: 'Nurse',
    department: 'General Ward',
    shift: 'Morning',
    phone: '+91 90000 00001'
  },
  {
    name: 'Neha Singh',
    email: 'neha.nurse@gmail.com',
    password: 'Neha@123',
    role: 'Nurse',
    department: 'ICU',
    shift: 'Evening'
  },
  {
    name: 'Riya Patel',
    email: 'riya.nurse@gmail.com',
    password: 'Riya@123',
    role: 'Nurse',
    department: 'Emergency',
    shift: 'Night'
  },
  {
    name: 'Anita Rao',
    email: 'anita.nurse@gmail.com',
    password: 'Anita@123',
    role: 'Nurse',
    department: 'Pediatrics',
    shift: 'Morning'
  },
  {
    name: 'Divya Menon',
    email: 'divya.nurse@gmail.com',
    password: 'Divya@123',
    role: 'Nurse',
    department: 'Surgery',
    shift: 'Evening'
  },
  {
    name: 'Sneha Varma',
    email: 'sneha.nurse@gmail.com',
    password: 'Sneha@123',
    role: 'Nurse',
    department: 'Cardiology',
    shift: 'Morning'
  },
  {
    name: 'Kavya Nair',
    email: 'kavya.nurse@gmail.com',
    password: 'Kavya@123',
    role: 'Nurse',
    department: 'Orthopedics',
    shift: 'Night'
  },
  {
    name: 'Pooja Sharma',
    email: 'pooja.nurse@gmail.com',
    password: 'Pooja@123',
    role: 'Nurse',
    department: 'Neurology',
    shift: 'Evening'
  },
  {
    name: 'Meena Iyer',
    email: 'meena.nurse@gmail.com',
    password: 'Meena@123',
    role: 'Nurse',
    department: 'Gynecology',
    shift: 'Morning'
  },
  {
    name: 'Lakshmi Das',
    email: 'lakshmi.nurse@gmail.com',
    password: 'Lakshmi@123',
    role: 'Nurse',
    department: 'Dermatology',
    shift: 'Evening'
  },
  {
    name: 'Sara George',
    email: 'sara.nurse@gmail.com',
    password: 'Sara@123',
    role: 'Nurse',
    department: 'ENT',
    shift: 'Night'
  },
  {
    name: 'Priya Kulkarni',
    email: 'priya.nurse@gmail.com',
    password: 'Priya@123',
    role: 'Nurse',
    department: 'Ophthalmology',
    shift: 'Morning'
  },
  {
    name: 'Nisha Joseph',
    email: 'nisha.nurse@gmail.com',
    password: 'Nisha@123',
    role: 'Nurse',
    department: 'General Ward',
    shift: 'Evening'
  },
  {
    name: 'Shalini Desai',
    email: 'shalini.nurse@gmail.com',
    password: 'Shalini@123',
    role: 'Nurse',
    department: 'ICU',
    shift: 'Night'
  },
  {
    name: 'Anjali Verma',
    email: 'anjali.nurse@gmail.com',
    password: 'Anjali@123',
    role: 'Nurse',
    department: 'Emergency',
    shift: 'Morning'
  }
];

const seedAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared all users\n');

    console.log('👥 Creating users...\n');
    
    let adminCount = 0;
    let doctorCount = 0;
    let nurseCount = 0;

    for (const userData of allUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      
      if (userData.role === 'Admin') adminCount++;
      else if (userData.role === 'Doctor') doctorCount++;
      else if (userData.role === 'Nurse') nurseCount++;
      
      console.log(`✅ Created: ${userData.name.padEnd(25)} | ${userData.email.padEnd(35)} | ${userData.role}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 User Seeding Completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total Users Created: ${allUsers.length}`);
    console.log(`   👔 Admins: ${adminCount}`);
    console.log(`   👨‍⚕️ Doctors: ${doctorCount}`);
    console.log(`   👩‍⚕️ Nurses: ${nurseCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 LOGIN CREDENTIALS:\n');
    
    console.log('ADMIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const admin = allUsers.find(u => u.role === 'Admin');
    console.log(`Email: ${admin.email} | Password: ${admin.password}\n`);

    console.log('DOCTORS (15):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    allUsers.filter(u => u.role === 'Doctor').forEach(d => {
      console.log(`${d.name.padEnd(25)} | ${d.email.padEnd(35)} | ${d.password}`);
    });

    console.log('\nNURSES (15):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    allUsers.filter(u => u.role === 'Nurse').forEach(n => {
      console.log(`${n.name.padEnd(25)} | ${n.email.padEnd(35)} | ${n.password}`);
    });
    console.log('\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedAllUsers();
