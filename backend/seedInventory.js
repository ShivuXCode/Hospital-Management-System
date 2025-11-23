const mongoose = require('mongoose');
const InventoryItem = require('./models/InventoryItem');

const sampleInventory = [
  // Medications
  {
    itemCode: 'MED-PARA-001',
    itemName: 'Paracetamol 500mg',
    category: 'medication',
    unit: 'boxes',
    currentStock: 150,
    minimumStock: 30,
    maximumStock: 500,
    unitPrice: 5.99,
    supplier: { name: 'MediPharm Inc', phone: '555-0101', email: 'orders@medipharm.com' },
    location: { ward: 'Pharmacy', shelf: 'A1', position: 'Top' },
    status: 'available'
  },
  {
    itemCode: 'MED-AMOX-002',
    itemName: 'Amoxicillin 250mg',
    category: 'medication',
    unit: 'bottles',
    currentStock: 80,
    minimumStock: 20,
    maximumStock: 300,
    unitPrice: 12.50,
    supplier: { name: 'MediPharm Inc', phone: '555-0101', email: 'orders@medipharm.com' },
    location: { ward: 'Pharmacy', shelf: 'A2', position: 'Middle' },
    status: 'available'
  },
  {
    itemCode: 'MED-IBU-003',
    itemName: 'Ibuprofen 400mg',
    category: 'medication',
    unit: 'bottles',
    currentStock: 120,
    minimumStock: 25,
    maximumStock: 400,
    unitPrice: 8.75,
    supplier: { name: 'HealthCare Supplies', phone: '555-0102', email: 'sales@healthcare.com' },
    location: { ward: 'Pharmacy', shelf: 'A1', position: 'Bottom' },
    status: 'available'
  },
  {
    itemCode: 'MED-INSU-004',
    itemName: 'Insulin Glargine 100U/ml',
    category: 'medication',
    unit: 'vials',
    currentStock: 45,
    minimumStock: 15,
    maximumStock: 150,
    unitPrice: 45.00,
    supplier: { name: 'Diabetes Care Co', phone: '555-0103', email: 'orders@diabetescare.com' },
    location: { ward: 'Pharmacy', shelf: 'B1', position: 'Refrigerated' },
    status: 'available'
  },
  {
    itemCode: 'MED-ASPI-005',
    itemName: 'Aspirin 75mg',
    category: 'medication',
    unit: 'boxes',
    currentStock: 18,
    minimumStock: 20,
    maximumStock: 200,
    unitPrice: 4.25,
    supplier: { name: 'MediPharm Inc', phone: '555-0101', email: 'orders@medipharm.com' },
    location: { ward: 'Pharmacy', shelf: 'A3', position: 'Top' },
    status: 'low_stock'
  },
  
  // Equipment
  {
    itemCode: 'EQP-BP-001',
    itemName: 'Blood Pressure Monitor',
    category: 'equipment',
    unit: 'pieces',
    currentStock: 12,
    minimumStock: 5,
    maximumStock: 30,
    unitPrice: 85.00,
    supplier: { name: 'MedTech Solutions', phone: '555-0201', email: 'sales@medtech.com' },
    location: { ward: 'Equipment Room', shelf: 'E1', position: 'Cabinet A' },
    status: 'available'
  },
  {
    itemCode: 'EQP-THERM-002',
    itemName: 'Digital Thermometer',
    category: 'equipment',
    unit: 'pieces',
    currentStock: 25,
    minimumStock: 10,
    maximumStock: 50,
    unitPrice: 15.99,
    supplier: { name: 'MedTech Solutions', phone: '555-0201', email: 'sales@medtech.com' },
    location: { ward: 'Equipment Room', shelf: 'E2', position: 'Drawer 1' },
    status: 'available'
  },
  {
    itemCode: 'EQP-STET-003',
    itemName: 'Stethoscope',
    category: 'equipment',
    unit: 'pieces',
    currentStock: 8,
    minimumStock: 6,
    maximumStock: 20,
    unitPrice: 65.00,
    supplier: { name: 'Medical Instruments Ltd', phone: '555-0202', email: 'orders@medinst.com' },
    location: { ward: 'Equipment Room', shelf: 'E1', position: 'Cabinet B' },
    status: 'available'
  },
  {
    itemCode: 'EQP-PULOX-004',
    itemName: 'Pulse Oximeter',
    category: 'equipment',
    unit: 'pieces',
    currentStock: 15,
    minimumStock: 8,
    maximumStock: 40,
    unitPrice: 42.50,
    supplier: { name: 'MedTech Solutions', phone: '555-0201', email: 'sales@medtech.com' },
    location: { ward: 'Equipment Room', shelf: 'E2', position: 'Drawer 2' },
    status: 'available'
  },
  
  // Supplies
  {
    itemCode: 'SUP-GLOVE-001',
    itemName: 'Latex Gloves (Medium)',
    category: 'supplies',
    unit: 'boxes',
    currentStock: 200,
    minimumStock: 50,
    maximumStock: 800,
    unitPrice: 12.99,
    supplier: { name: 'SafeCare Supplies', phone: '555-0301', email: 'orders@safecare.com' },
    location: { ward: 'Storage', shelf: 'S1', position: 'Floor Level' },
    status: 'available'
  },
  {
    itemCode: 'SUP-MASK-002',
    itemName: 'Surgical Masks (50pk)',
    category: 'supplies',
    unit: 'boxes',
    currentStock: 150,
    minimumStock: 40,
    maximumStock: 600,
    unitPrice: 18.50,
    supplier: { name: 'SafeCare Supplies', phone: '555-0301', email: 'orders@safecare.com' },
    location: { ward: 'Storage', shelf: 'S2', position: 'Middle' },
    status: 'available'
  },
  {
    itemCode: 'SUP-SYRINGE-003',
    itemName: 'Disposable Syringes 5ml',
    category: 'supplies',
    unit: 'boxes',
    currentStock: 80,
    minimumStock: 30,
    maximumStock: 400,
    unitPrice: 22.00,
    supplier: { name: 'MedSupply Pro', phone: '555-0302', email: 'sales@medsupply.com' },
    location: { ward: 'Storage', shelf: 'S3', position: 'Locked Cabinet' },
    status: 'available'
  },
  {
    itemCode: 'SUP-BAND-004',
    itemName: 'Adhesive Bandages (100pk)',
    category: 'supplies',
    unit: 'boxes',
    currentStock: 45,
    minimumStock: 20,
    maximumStock: 200,
    unitPrice: 8.99,
    supplier: { name: 'SafeCare Supplies', phone: '555-0301', email: 'orders@safecare.com' },
    location: { ward: 'Storage', shelf: 'S1', position: 'Top Shelf' },
    status: 'available'
  },
  {
    itemCode: 'SUP-GAUZE-005',
    itemName: 'Sterile Gauze Pads 4x4',
    category: 'supplies',
    unit: 'boxes',
    currentStock: 8,
    minimumStock: 15,
    maximumStock: 150,
    unitPrice: 14.75,
    supplier: { name: 'SafeCare Supplies', phone: '555-0301', email: 'orders@safecare.com' },
    location: { ward: 'Storage', shelf: 'S2', position: 'Bottom' },
    status: 'low_stock'
  },
  
  // Consumables
  {
    itemCode: 'CON-COTTON-001',
    itemName: 'Cotton Swabs (500pk)',
    category: 'consumables',
    unit: 'packs',
    currentStock: 60,
    minimumStock: 25,
    maximumStock: 250,
    unitPrice: 6.50,
    supplier: { name: 'General Medical Supplies', phone: '555-0401', email: 'info@genmed.com' },
    location: { ward: 'Storage', shelf: 'C1', position: 'Bin 1' },
    status: 'available'
  },
  {
    itemCode: 'CON-ALCOHOL-002',
    itemName: 'Alcohol Prep Pads (200pk)',
    category: 'consumables',
    unit: 'boxes',
    currentStock: 95,
    minimumStock: 30,
    maximumStock: 300,
    unitPrice: 11.25,
    supplier: { name: 'General Medical Supplies', phone: '555-0401', email: 'info@genmed.com' },
    location: { ward: 'Storage', shelf: 'C2', position: 'Bin 2' },
    status: 'available'
  },
  {
    itemCode: 'CON-SALINE-003',
    itemName: 'Saline Solution 0.9% (1L)',
    category: 'consumables',
    unit: 'bottles',
    currentStock: 120,
    minimumStock: 40,
    maximumStock: 400,
    unitPrice: 3.75,
    supplier: { name: 'IV Solutions Inc', phone: '555-0402', email: 'orders@ivsolutions.com' },
    location: { ward: 'Storage', shelf: 'C3', position: 'Floor Level' },
    status: 'available'
  },
  
  // Instruments
  {
    itemCode: 'INS-SCALPEL-001',
    itemName: 'Disposable Scalpel Blades #10',
    category: 'instruments',
    unit: 'boxes',
    currentStock: 25,
    minimumStock: 10,
    maximumStock: 100,
    unitPrice: 28.50,
    supplier: { name: 'Surgical Instruments Co', phone: '555-0501', email: 'sales@surginst.com' },
    location: { ward: 'OR Supply', shelf: 'I1', position: 'Locked' },
    status: 'available'
  },
  {
    itemCode: 'INS-FORCEPS-002',
    itemName: 'Surgical Forceps',
    category: 'instruments',
    unit: 'pieces',
    currentStock: 18,
    minimumStock: 8,
    maximumStock: 50,
    unitPrice: 45.00,
    supplier: { name: 'Surgical Instruments Co', phone: '555-0501', email: 'sales@surginst.com' },
    location: { ward: 'OR Supply', shelf: 'I2', position: 'Sterilized Cabinet' },
    status: 'available'
  },
  {
    itemCode: 'INS-SCISSORS-003',
    itemName: 'Surgical Scissors',
    category: 'instruments',
    unit: 'pieces',
    currentStock: 0,
    minimumStock: 5,
    maximumStock: 30,
    unitPrice: 38.75,
    supplier: { name: 'Surgical Instruments Co', phone: '555-0501', email: 'sales@surginst.com' },
    location: { ward: 'OR Supply', shelf: 'I2', position: 'Sterilized Cabinet' },
    status: 'out_of_stock'
  }
];

async function seedInventory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mediflow');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing inventory
    await InventoryItem.deleteMany({});
    console.log('🗑️  Cleared existing inventory items\n');

    // Insert sample items
    const result = await InventoryItem.insertMany(sampleInventory);
    console.log(`✅ Successfully added ${result.length} inventory items!\n`);

    // Show summary
    const categories = await InventoryItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('📊 Inventory Summary by Category:');
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} items, Total Value: $${cat.totalValue.toFixed(2)}`);
    });

    console.log('\n📦 Stock Status:');
    const outOfStock = await InventoryItem.countDocuments({ currentStock: 0 });
    const lowStock = await InventoryItem.countDocuments({ currentStock: { $gt: 0, $lte: 20 } });
    const available = await InventoryItem.countDocuments({ currentStock: { $gt: 20 } });
    console.log(`   Out of Stock: ${outOfStock} items`);
    console.log(`   Low Stock: ${lowStock} items`);
    console.log(`   Available: ${available} items`);

    console.log('\n✅ Inventory seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
}

seedInventory();
