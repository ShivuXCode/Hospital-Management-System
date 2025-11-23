const mongoose = require('mongoose');

const integratedBillingSchema = new mongoose.Schema({
  // Link to appointment (optional for manual bills)
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false,
    unique: false,
    sparse: true
  },
  
  // Patient information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  
  // Doctor information
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorName: { type: String, required: true },
  
  // Doctor Consultation Fee (set by doctor)
  consultationFee: {
    amount: { type: Number, default: 0, min: 0 },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: { type: Date },
    lastUpdatedAt: { type: Date },
    notes: { type: String, trim: true }
  },
  
  // Hospital Charges (set by admin)
  hospitalCharges: {
    // Lab tests
    labTests: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      notes: { type: String }
    }],
    
    // Scans/Imaging
    scans: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      notes: { type: String }
    }],
    
    // Medicines
    medicines: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      amount: { type: Number, required: true, min: 0 },
      notes: { type: String }
    }],
    
    // Bed charges
    bedCharges: {
      days: { type: Number, default: 0, min: 0 },
      ratePerDay: { type: Number, default: 0, min: 0 },
      amount: { type: Number, default: 0, min: 0 },
      roomType: { type: String },
      notes: { type: String }
    },
    
    // Other service fees
    serviceFees: [{
      description: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      notes: { type: String }
    }],
    
    // Metadata
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdatedAt: { type: Date }
  },
  
  // Calculated totals (auto-computed)
  totals: {
    consultationFee: { type: Number, default: 0, min: 0 },
    labTests: { type: Number, default: 0, min: 0 },
    scans: { type: Number, default: 0, min: 0 },
    medicines: { type: Number, default: 0, min: 0 },
    bedCharges: { type: Number, default: 0, min: 0 },
    serviceFees: { type: Number, default: 0, min: 0 },
    hospitalChargesTotal: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 }
  },
  
  // Bill status
  status: {
    type: String,
    enum: ['draft', 'pending', 'finalized', 'paid', 'cancelled'],
    default: 'draft'
  },
  
  // Finalization
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalizedAt: { type: Date },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paidAmount: { type: Number, default: 0, min: 0 },
  paymentDate: { type: Date },
  paymentMethod: { type: String },
  paymentNotes: { type: String },
  
  // Audit trail
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate totals
integratedBillingSchema.pre('save', function(next) {
  // Calculate consultation fee total
  this.totals.consultationFee = this.consultationFee.amount || 0;
  
  // Calculate lab tests total
  this.totals.labTests = (this.hospitalCharges.labTests || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate scans total
  this.totals.scans = (this.hospitalCharges.scans || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate medicines total
  this.totals.medicines = (this.hospitalCharges.medicines || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate bed charges total
  this.totals.bedCharges = this.hospitalCharges.bedCharges?.amount || 0;
  
  // Calculate service fees total
  this.totals.serviceFees = (this.hospitalCharges.serviceFees || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate hospital charges total
  this.totals.hospitalChargesTotal = 
    this.totals.labTests + 
    this.totals.scans + 
    this.totals.medicines + 
    this.totals.bedCharges + 
    this.totals.serviceFees;
  
  // Calculate grand total
  this.totals.grandTotal = this.totals.consultationFee + this.totals.hospitalChargesTotal;
  
  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

// Index for faster queries
integratedBillingSchema.index({ appointment: 1 });
integratedBillingSchema.index({ patient: 1 });
integratedBillingSchema.index({ status: 1 });
integratedBillingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('IntegratedBilling', integratedBillingSchema);
