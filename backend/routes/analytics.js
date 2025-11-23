const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getPatientAnalytics,
  getRevenueAnalytics,
  getPerformanceAnalytics
} = require('../utils/analytics');

const router = express.Router();

// All analytics are Admin-only for now
router.use(authMiddleware, authorizeRoles('Admin'));

// GET /api/analytics/patients
// Returns total patients plus daily/weekly/monthly counts and trends
router.get('/patients', async (req, res) => {
  try {
    const data = await getPatientAnalytics();
    res.json({ success: true, analytics: data });
  } catch (err) {
    console.error('Patients analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute patient analytics' });
  }
});

// GET /api/analytics/revenue
// Returns total revenue plus daily/weekly/monthly revenue aggregates & trends
router.get('/revenue', async (req, res) => {
  try {
    const data = await getRevenueAnalytics();
    res.json({ success: true, analytics: data });
  } catch (err) {
    console.error('Revenue analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute revenue analytics' });
  }
});

// GET /api/analytics/performance
// Returns doctor & nurse performance (reviews, avg rating, distribution)
router.get('/performance', async (req, res) => {
  try {
    const data = await getPerformanceAnalytics();
    res.json({ success: true, analytics: data });
  } catch (err) {
    console.error('Performance analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute performance analytics' });
  }
});

module.exports = router;
