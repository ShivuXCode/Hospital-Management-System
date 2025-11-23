const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema(
  {
    itemCode: String,
    itemName: String,
    description: String,
    quantity: { type: Number, min: 1, required: true },
    unitPrice: { type: Number, min: 0, required: true },
    totalPrice: { type: Number, min: 0, required: true },
    category: { 
      type: String, 
      enum: ['consultation','medication','procedure','lab_test','imaging','room_charge','other'],
      required: true
    },
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    paymentMethod: { type: String, enum: ['cash','card','insurance','bank_transfer','upi','cheque'], required: true },
    amount: { type: Number, min: 0, required: true },
    transactionId: String,
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
    notes: String,
  },
  { _id: false }
);

const BillingSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, trim: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: String,
    patientPhone: String,
    appointmentId: String,
    doctorId: String,
    doctorName: String,
    billDate: { type: Date, default: Date.now },
    dueDate: Date,
    items: { type: [BillItemSchema], default: [] },
    subtotal: { type: Number, min: 0, required: true },
    taxRate: { type: Number, default: 0.18 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    discountReason: String,
    totalAmount: { type: Number, min: 0, required: true },
    paidAmount: { type: Number, min: 0, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    payments: { type: [PaymentSchema], default: [] },
    status: { type: String, enum: ['draft','pending','partial','paid','overdue','cancelled'], default: 'pending' },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      coverageAmount: Number,
      claimNumber: String,
      status: { type: String, enum: ['pending','approved','rejected','partial'] }
    },
    notes: String,
    generatedBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Billing', BillingSchema);
