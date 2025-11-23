const User = require('../models/User');
const Bill = require('../models/Bill');
const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');

// Helper: generate contiguous date strings (YYYY-MM-DD) for last N days including today
function generateDateRange(days) {
  const dates = [];
  const today = new Date();
  // Normalize to local midnight
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// Helper: fill missing dates in aggregation result
function fillDateSeries(rawMap, days) {
  const fullDates = generateDateRange(days);
  return fullDates.map(date => ({ date, count: rawMap[date] || 0 }));
}

// Helper: generate last N months labels YYYY-MM (including current month)
function generateMonthRange(months) {
  const result = [];
  const ref = new Date();
  ref.setDate(1);
  ref.setHours(0, 0, 0, 0);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(ref);
    d.setMonth(ref.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
  }
  return result;
}

function fillMonthSeries(rawMap, months) {
  const monthsList = generateMonthRange(months);
  return monthsList.map(month => ({ month, value: rawMap[month] || 0 }));
}

// Generic aggregation for counts over last N days grouped by day
async function aggregateCountsByDay(model, match, dateField, days) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const pipeline = [
    { $match: { ...match, [dateField]: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ];
  const rows = await model.aggregate(pipeline);
  const map = rows.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {});
  return fillDateSeries(map, days);
}

// Revenue aggregation by day
async function aggregateRevenueByDay(days) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const pipeline = [
    { $match: { status: 'Paid', createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } }
  ];
  const rows = await Bill.aggregate(pipeline);
  const map = rows.reduce((acc, r) => { acc[r._id] = r.total; return acc; }, {});
  // Return date + total (0 if missing)
  return generateDateRange(days).map(date => ({ date, total: map[date] || 0 }));
}

// Generic aggregation for counts grouped by month over last N months
async function aggregateCountsByMonth(model, match, dateField, months) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));

  const pipeline = [
    { $match: { ...match, [dateField]: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: `$${dateField}` } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ];
  const rows = await model.aggregate(pipeline);
  const map = rows.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {});
  return fillMonthSeries(map, months);
}

// Revenue aggregation by month
async function aggregateRevenueByMonth(months) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));

  const pipeline = [
    { $match: { status: 'Paid', createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } }
  ];
  const rows = await Bill.aggregate(pipeline);
  const map = rows.reduce((acc, r) => { acc[r._id] = r.total; return acc; }, {});
  return fillMonthSeries(map, months).map(x => ({ month: x.month, total: x.value }));
}

// Patients analytics
async function getPatientAnalytics() {
  const totalPatients = await User.countDocuments({ role: 'Patient' });

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dailyCount, weeklyCount, monthlyCount, weeklyTrend, monthlyTrend, monthsTrend] = await Promise.all([
    User.countDocuments({ role: 'Patient', createdAt: { $gte: dayAgo } }),
    User.countDocuments({ role: 'Patient', createdAt: { $gte: weekAgo } }),
    User.countDocuments({ role: 'Patient', createdAt: { $gte: monthAgo } }),
    aggregateCountsByDay(User, { role: 'Patient' }, 'createdAt', 7),
    aggregateCountsByDay(User, { role: 'Patient' }, 'createdAt', 30),
    aggregateCountsByMonth(User, { role: 'Patient' }, 'createdAt', 12)
  ]);

  return {
    total: totalPatients,
    daily: { count: dailyCount },
    weekly: { count: weeklyCount, trend: weeklyTrend },
    monthly: { count: monthlyCount, trend: monthlyTrend, monthsTrend }
  };
}

// Revenue analytics
async function getRevenueAnalytics() {
  // Total paid revenue
  const totalPaidPipeline = [
    { $match: { status: 'Paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ];
  const totalPaidRow = await Bill.aggregate(totalPaidPipeline);
  const totalRevenue = totalPaidRow[0]?.total || 0;

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dailyRow, weeklyRow, monthlyRow, weeklyTrend, monthlyTrend, monthsTrend] = await Promise.all([
    Bill.aggregate([{ $match: { status: 'Paid', createdAt: { $gte: dayAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Bill.aggregate([{ $match: { status: 'Paid', createdAt: { $gte: weekAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Bill.aggregate([{ $match: { status: 'Paid', createdAt: { $gte: monthAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    aggregateRevenueByDay(7),
    aggregateRevenueByDay(30),
    aggregateRevenueByMonth(12)
  ]);

  return {
    total: totalRevenue,
    daily: { total: dailyRow[0]?.total || 0 },
    weekly: { total: weeklyRow[0]?.total || 0, trend: weeklyTrend },
    monthly: { total: monthlyRow[0]?.total || 0, trend: monthlyTrend, monthsTrend }
  };
}

// Performance analytics (Doctors & Nurses)
async function getPerformanceAnalytics() {
  // Doctor reviews aggregation
  const reviewAgg = await Review.aggregate([
    { $group: { _id: '$doctor', totalReviews: { $sum: 1 }, averageRating: { $avg: '$rating' }, ratings: { $push: '$rating' } } },
    { $sort: { averageRating: -1 } }
  ]);

  const doctorIds = reviewAgg.map(r => r._id).filter(Boolean);
  const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('_id name specialization');
  const doctorMap = doctors.reduce((acc, d) => { acc[d._id.toString()] = d; return acc; }, {});

  const doctorPerformance = reviewAgg.map(r => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    r.ratings.forEach(rt => { dist[rt] = (dist[rt] || 0) + 1; });
    return {
      doctorId: r._id,
      name: doctorMap[r._id.toString()]?.name || 'Unknown Doctor',
      specialization: doctorMap[r._id.toString()]?.specialization || null,
      totalReviews: r.totalReviews,
      averageRating: Number(r.averageRating?.toFixed(2) || 0),
      ratingDistribution: dist
    };
  });

  // Nurses currently do not have reviews; return list with zero metrics
  const nurses = await Nurse.find().select('_id name');
  const nursePerformance = nurses.map(n => ({
    nurseId: n._id,
    name: n.name,
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }));

  return { doctors: doctorPerformance, nurses: nursePerformance };
}

module.exports = {
  getPatientAnalytics,
  getRevenueAnalytics,
  getPerformanceAnalytics
};
