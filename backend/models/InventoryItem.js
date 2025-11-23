const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    quantity: Number,
    usedBy: String,
    purpose: String,
    patientId: String,
  },
  { _id: false }
);

const InventoryItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true, trim: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, enum: ['medication','equipment','supplies','consumables','instruments'], required: true },
    description: String,
    unit: { type: String, enum: ['pieces','boxes','bottles','vials','tubes','packs','liters','grams','milliliters'], required: true },
    currentStock: { type: Number, min: 0, required: true },
    minimumStock: { type: Number, min: 0, required: true },
    maximumStock: { type: Number, min: 0, required: true },
    unitPrice: { type: Number, min: 0, required: true },
    supplier: {
      name: String,
      contact: String,
      email: String,
      phone: String,
    },
    expiryDate: Date,
    batchNumber: String,
    location: {
      ward: String,
      shelf: String,
      position: String,
    },
    status: { type: String, enum: ['available','low_stock','out_of_stock','expired','damaged'], default: 'available' },
    lastRestocked: Date,
    lastUsed: Date,
    usageHistory: { type: [UsageSchema], default: [] },
    reorderLevel: { type: Number, default: 10 },
    isCritical: { type: Boolean, default: false },
    // Backward compatibility fields
    sku: { type: String, trim: true, sparse: true },
    name: { type: String, trim: true },
    quantity: { type: Number },
    minLevel: { type: Number },
    maxLevel: { type: Number },
    purchasePrice: { type: Number },
    sellingPrice: { type: Number },
    barcode: String,
    isActive: { type: Boolean, default: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
