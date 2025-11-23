const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const InventoryItem = require('../models/InventoryItem');
const InventoryTransaction = require('../models/InventoryTransaction');

const router = express.Router();

// List items
router.get('/inventory', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (e) {
    console.error('Inventory list error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create item
router.post('/inventory', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body || {});
    res.status(201).json({ success: true, item });
  } catch (e) {
    console.error('Inventory create error', e);
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
});

// Update item
router.put('/inventory/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, item });
  } catch (e) {
    console.error('Inventory update error', e);
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
});

// Delete item
router.delete('/inventory/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const deleted = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Inventory delete error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List transactions for an item
router.get('/inventory/:id/transactions', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const tx = await InventoryTransaction.find({ item: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tx.length, transactions: tx });
  } catch (e) {
    console.error('Inventory transactions list error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a transaction and adjust stock
router.post('/inventory/:id/transactions', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const { transactionType, quantity, purpose, notes, metadata, unitPrice, fromLocation, toLocation, patientId } = req.body || {};
    const type = transactionType || req.body.type; // accept legacy 'type'
    if (!type || !quantity) return res.status(400).json({ success: false, message: 'transactionType and quantity required' });

    let newQty = item.quantity || 0;
    if (type === 'in') newQty += Number(quantity);
    else if (type === 'out' || type === 'wastage' || type === 'return') newQty -= Number(quantity);
    else if (type === 'adjustment') newQty = Number(quantity);

    if (newQty < 0) newQty = 0;

    item.quantity = newQty;
    await item.save();

    const tx = await InventoryTransaction.create({
      item: item._id,
      transactionType: type,
      quantity,
      unitPrice,
      totalValue: unitPrice ? Number(unitPrice) * Number(quantity) : undefined,
      fromLocation,
      toLocation,
      purpose,
      patientId,
      balanceAfter: newQty,
      notes,
      metadata,
      performedBy: req.user?.id,
    });

    res.status(201).json({ success: true, transaction: tx, item });
  } catch (e) {
    console.error('Inventory create transaction error', e);
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
});

module.exports = router;
