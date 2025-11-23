const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    transactionType: { type: String, enum: ['in','out','transfer','adjustment','expired','damaged'], required: true },
    quantity: { type: Number, required: true },
    unitPrice: Number,
    totalValue: Number,
    fromLocation: String,
    toLocation: String,
    performedBy: String,
    purpose: String,
    patientId: String,
    notes: String,
    transactionDate: { type: Date, default: Date.now },
    balanceAfter: { type: Number },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);
