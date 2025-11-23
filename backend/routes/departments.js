const express = require('express');
const Department = require('../models/Department');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/admin/departments
// @desc    List all departments (Admin only)
// @access  Private/Admin
router.get('/admin/departments', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email')
      .populate('staff', 'name email');

    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
