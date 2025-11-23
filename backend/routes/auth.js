const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    // Optional server-side match validation if confirmPassword provided
    if (typeof confirmPassword !== 'undefined' && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists. Please log in.',
        redirect: '/login'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    // Public signup always creates a Patient account by default
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Patient'
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Signup successful! Please log in.',
      redirect: '/login'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup. Please try again.'
    });
  }
});

// @route   POST /api/login
// @desc    Authenticate user and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // If user not found, explicitly say user does not exist
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Role-based redirect (include id for profile routes)
    const roleRedirects = {
      Admin: `/dashboard/admin`,
      Doctor: `/dashboard/doctor`,
      Nurse: `/dashboard/nurse`,
      Patient: `/dashboard/patient`
    };

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      redirect: roleRedirects[user.role] || '/'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

// @route   GET /api/user
// @desc    Get current user info
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    console.log('📥 Fetching User Profile from MongoDB');
    console.log('👤 User ID:', req.user.id);
    console.log('📊 Profile Data:', {
      name: user.name,
      department: user.department,
      specialization: user.specialization,
      patientsTreated: user.patientsTreated,
      languages: user.languages,
      about: user.about ? 'Set' : 'Not set'
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        qualification: user.qualification,
        experience: user.experience,
        phone: user.phone,
        shift: user.shift,
        availableDays: user.availableDays,
        availableTimings: user.availableTimings,
        languages: user.languages,
        about: user.about,
        profileImage: user.profileImage,
        rating: user.rating,
        patientsTreated: user.patientsTreated,
        publications: user.publications,
        awards: user.awards,
        consultationTypes: user.consultationTypes,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update current user profile
// @access  Private
router.put('/user/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      department,
      specialization,
      qualification,
      experience,
      shift,
      availableDays,
      availableTimings,
      languages,
      about,
      profileImage,
      patientsTreated,
      publications,
      awards
    } = req.body;

    console.log('📝 Profile Update Request for User ID:', userId);
    console.log('📦 Update Data:', {
      name,
      email,
      phone,
      department,
      specialization,
      qualification,
      experience,
      availableDays,
      availableTimings,
      languages,
      about,
      patientsTreated,
      publications,
      awards,
      consultationTypes
    });

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    console.log('👤 Current User Data:', {
      name: user.name,
      department: user.department,
      specialization: user.specialization
    });

    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account.'
        });
      }
      user.email = email.toLowerCase();
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department) user.department = department;
    if (specialization) user.specialization = specialization;
    if (qualification) user.qualification = qualification;
    if (experience) user.experience = experience;
    if (shift) user.shift = shift;
    if (availableDays !== undefined) user.availableDays = availableDays;
    if (availableTimings !== undefined) user.availableTimings = availableTimings;
    if (languages !== undefined) user.languages = languages;
    if (about !== undefined) user.about = about;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (patientsTreated !== undefined) user.patientsTreated = patientsTreated;
    if (publications !== undefined) user.publications = publications;
    if (awards !== undefined) user.awards = awards;
    if (consultationTypes !== undefined) user.consultationTypes = consultationTypes;

    await user.save();

    console.log('✅ Profile Updated Successfully in MongoDB');
    console.log('💾 Saved Data:', {
      name: user.name,
      department: user.department,
      specialization: user.specialization,
      patientsTreated: user.patientsTreated
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        qualification: user.qualification,
        experience: user.experience,
        phone: user.phone,
        shift: user.shift,
        availableDays: user.availableDays,
        availableTimings: user.availableTimings,
        languages: user.languages,
        about: user.about,
        profileImage: user.profileImage,
        patientsTreated: user.patientsTreated,
        publications: user.publications,
        awards: user.awards,
        consultationTypes: user.consultationTypes
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   PUT /api/user/change-password
// @desc    Change user password (no current password required)
// @access  Private
router.put('/user/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    console.log('🔐 Password Change Request for User ID:', userId);

    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password.'
      });
    }

    // Check password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password Changed Successfully for User:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   POST /api/admin/doctor
// @desc    Get all doctors (Admin only)
// @access  Private/Admin
router.get('/admin/doctors', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    // Fetch doctor profiles from Doctor collection
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   POST /api/admin/create-doctor
// @desc    Admin creates a doctor account (creates both User and Doctor documents)
// @access  Private/Admin
router.post('/admin/create-doctor', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      phone,
      experience,
      qualification,
      availability,
      photo,
      consultationTypes,
      languages,
      about,
      department
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if email exists in either Users or Doctor collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingUser || existingDoctor) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user for authentication
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Doctor'
    });

    await user.save();

    // Create doctor profile in Doctor collection and link to user
    const doctor = new Doctor({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      specialization: specialization || 'General Medicine',
      phone,
      experience: experience || 0,
      qualification,
      availability,
      photo,
      consultationTypes: consultationTypes || ['both'],
      languages: languages || [],
      about,
      department
    });

    await doctor.save();

    // Link doctorId back on user
    user.doctorId = doctor._id;
    await user.save();

    // Return created records (omit password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId
    };

    res.status(201).json({ success: true, message: 'Doctor created', user: userResponse, doctor });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error creating doctor.' });
  }
});

// @route   POST /api/admin/create-nurse
// @desc    Admin creates a nurse account (creates both User and Nurse documents)
// @access  Private/Admin
router.post('/admin/create-nurse', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      qualification,
      experience,
      department,
      shift,
      certifications,
      languages,
      about,
      status
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    const existingNurse = await Nurse.findOne({ email: email.toLowerCase() });
    if (existingUser || existingNurse) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create auth user
    const user = new User({ name, email: email.toLowerCase(), password: hashedPassword, role: 'Nurse' });
    await user.save();

    // Create nurse profile
    const nurse = new Nurse({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      phone,
      qualification,
      experience: experience || 0,
      department,
      shift,
      certifications: certifications || [],
      languages: languages || [],
      about,
      status: status || 'active'
    });
    await nurse.save();

    // Link nurseId back on user
    user.nurseId = nurse._id;
    await user.save();

    res.status(201).json({ success: true, message: 'Nurse created', user: { id: user._id, name: user.name, email: user.email, role: user.role, nurseId: user.nurseId }, nurse });
  } catch (error) {
    console.error('Create nurse error:', error);
    res.status(500).json({ success: false, message: 'Server error creating nurse.' });
  }
});

// @route   GET /api/admin/nurses
// @desc    Get all nurses (Admin only)
// @access  Private/Admin
router.get('/admin/nurses', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    // Fetch nurse profiles from Nurse collection
    const nurses = await Nurse.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: nurses.length, nurses });
  } catch (error) {
    console.error('Get nurses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/patients
// @desc    Get all patients (Doctor, Nurse, Admin access)
// @access  Private
router.get('/patients', authMiddleware, authorizeRoles('Admin', 'Doctor', 'Nurse'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'Patient' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/admin/patients
// @desc    Get all patients (Admin only)
// @access  Private/Admin
router.get('/admin/patients', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'Patient' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/admin/doctors/:id
// @desc    Get single doctor details (Admin only)
// @access  Private/Admin
router.get('/admin/doctors/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    // Fetch doctor profile from Doctor collection by doctor _id
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'email');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/admin/nurses/:id
// @desc    Get single nurse details (Admin only)
// @access  Private/Admin
router.get('/admin/nurses/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    // Fetch nurse profile from Nurse collection by nurse _id
    const nurse = await Nurse.findById(req.params.id).populate('userId', 'email');
    if (!nurse) {
      return res.status(404).json({ success: false, message: 'Nurse not found.' });
    }
    res.status(200).json({ success: true, nurse });
  } catch (error) {
    console.error('Get nurse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/admin/patients/:id
// @desc    Get single patient details (Admin only)
// @access  Private/Admin
router.get('/admin/patients/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'Patient' })
      .select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.'
      });
    }

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router;
