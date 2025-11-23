const express = require('express');
const Bill = require('../models/Bill');
const Billing = require('../models/Billing');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to generate bill number
async function generateBillNumber() {
  const lastBill = await Billing.findOne().sort({ createdAt: -1 });
  if (!lastBill || !lastBill.billNumber) {
    return 'BILL-001';
  }
  const lastNumber = parseInt(lastBill.billNumber.split('-')[1]);
  return `BILL-${String(lastNumber + 1).padStart(3, '0')}`;
}

// Helper function to calculate bill status
function calculateBillStatus(bill) {
  if (bill.balanceAmount === 0) return 'paid';
  if (bill.paidAmount > 0) return 'partial';
  if (bill.dueDate && new Date() > new Date(bill.dueDate)) return 'overdue';
  return 'pending';
}

// @route   POST /api/billing/create
// @desc    Create a new bill
// @access  Private/Admin
router.post('/create', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      appointmentId,
      doctorId,
      doctorName,
      items,
      discount,
      discountReason,
      taxRate,
      insuranceInfo,
      notes,
      dueDate
    } = req.body;

    // Validation
    if (!patientId || !patientName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, name, and at least one item are required'
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const effectiveTaxRate = taxRate || 0.18;
    const taxAmount = subtotal * effectiveTaxRate;
    const totalAmount = subtotal + taxAmount - (discount || 0);
    const balanceAmount = totalAmount;

    // Generate bill number
    const billNumber = await generateBillNumber();

    // Set due date (30 days from now if not provided)
    const effectiveDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const bill = new Billing({
      billNumber,
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      appointmentId,
      doctorId,
      doctorName,
      items,
      subtotal,
      taxRate: effectiveTaxRate,
      taxAmount,
      discount: discount || 0,
      discountReason,
      totalAmount,
      paidAmount: 0,
      balanceAmount,
      status: 'pending',
      insuranceInfo,
      notes,
      dueDate: effectiveDueDate,
      generatedBy: req.user.id
    });

    await bill.save();

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create bill',
      error: error.message 
    });
  }
});

// @route   GET /api/billing/list
// @desc    Get all bills with filters
// @access  Private/Admin
router.get('/list', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by patient name, bill number, or doctor name
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { billNumber: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }

    const bills = await Billing.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bills',
      error: error.message 
    });
  }
});

// @route   GET /api/billing/:id
// @desc    Get bill details by ID
// @access  Private/Admin
router.get('/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      success: true,
      bill
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bill details',
      error: error.message 
    });
  }
});

// @route   POST /api/billing/:id/payment
// @desc    Process payment for a bill
// @access  Private/Admin
router.post('/:id/payment', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { paymentMethod, amount, transactionId, notes } = req.body;

    // Validation
    if (!paymentMethod || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and valid amount are required'
      });
    }

    const bill = await Billing.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Check if payment exceeds balance
    if (amount > bill.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount ($${amount}) exceeds balance amount ($${bill.balanceAmount})`
      });
    }

    // Add payment record
    const payment = {
      paymentMethod,
      amount,
      transactionId,
      paymentDate: new Date(),
      status: 'completed',
      notes
    };

    bill.payments.push(payment);
    bill.paidAmount += amount;
    bill.balanceAmount = bill.totalAmount - bill.paidAmount;
    bill.status = calculateBillStatus(bill);

    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      bill
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment',
      error: error.message 
    });
  }
});

// @route   PUT /api/billing/:id
// @desc    Update bill details
// @access  Private/Admin
router.put('/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Don't allow updates to paid bills
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a paid bill'
      });
    }

    const {
      items,
      discount,
      discountReason,
      taxRate,
      insuranceInfo,
      notes,
      dueDate
    } = req.body;

    // If items are updated, recalculate totals
    if (items) {
      bill.items = items;
      bill.subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    if (taxRate !== undefined) bill.taxRate = taxRate;
    bill.taxAmount = bill.subtotal * bill.taxRate;
    
    if (discount !== undefined) bill.discount = discount;
    if (discountReason) bill.discountReason = discountReason;
    
    bill.totalAmount = bill.subtotal + bill.taxAmount - bill.discount;
    bill.balanceAmount = bill.totalAmount - bill.paidAmount;
    bill.status = calculateBillStatus(bill);

    if (insuranceInfo) bill.insuranceInfo = insuranceInfo;
    if (notes) bill.notes = notes;
    if (dueDate) bill.dueDate = dueDate;

    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      bill
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update bill',
      error: error.message 
    });
  }
});

// @route   DELETE /api/billing/:id
// @desc    Cancel a bill
// @access  Private/Admin
router.delete('/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Don't allow deletion of paid bills
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a paid bill'
      });
    }

    // Mark as cancelled instead of deleting
    bill.status = 'cancelled';
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill cancelled successfully',
      bill
    });
  } catch (error) {
    console.error('Cancel bill error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel bill',
      error: error.message 
    });
  }
});

// @route   GET /api/billing/transactions (legacy support)
// @desc    Get transaction summaries from Bills (Admin only)
// @access  Private/Admin
router.get('/transactions', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const bills = await Bill.find().populate('patient', 'name');

    const transactions = bills.map((b) => ({
      id: b._id,
      patient: b.patient?.name || 'Unknown',
      service: b.description || 'General',
      amount: b.amount,
      date: b.date,
      status: b.status,
    }));

    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
