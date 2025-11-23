const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testBillingWorkflow() {
  try {
    // Step 3: Login as patient and view bill
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Patient Viewing Complete Bill');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const patientLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'demo.patient@example.com',
      password: 'Patient@123'
    });

    const patientToken = patientLogin.data.token;
    console.log('✅ Logged in as:', patientLogin.data.user.name);

    const billResponse = await axios.get(
      `${BASE_URL}/integrated-billing/6920ae1bc3089cd2f92d58f6`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );

    const bill = billResponse.data.bill;
    const totals = bill.totals;
    const consultation = bill.consultationFee;
    const charges = bill.hospitalCharges;
    const bedCharges = charges.bedCharges;

    console.log('\n' + '='.repeat(70));
    console.log('        🏥 PATIENT BILL VIEW - COMPLETE BREAKDOWN 🏥');
    console.log('='.repeat(70));
    console.log(`\n📋 Bill ID: ${bill._id}`);
    console.log(`👤 Patient: ${bill.patientName}`);
    console.log(`👨‍⚕️  Doctor: ${bill.doctorName}`);
    console.log(`📌 Status: ${bill.status.toUpperCase()}`);
    console.log(`💳 Payment: ${bill.paymentStatus.toUpperCase()}`);

    console.log('\n' + '─'.repeat(70));
    console.log('💰 CONSULTATION FEE');
    console.log('─'.repeat(70));
    console.log(`   Doctor Consultation Fee: $${consultation.amount}`);
    if (consultation.notes) {
      console.log(`   Note: ${consultation.notes}`);
    }

    console.log('\n' + '─'.repeat(70));
    console.log('🏥 HOSPITAL CHARGES');
    console.log('─'.repeat(70));

    // Lab Tests
    if (charges.labTests && charges.labTests.length > 0) {
      console.log('\n   🧪 Lab Tests:');
      charges.labTests.forEach(test => {
        console.log(`      • ${test.name}: $${test.amount}`);
      });
      console.log(`      ➜ Subtotal: $${totals.labTests}`);
    }

    // Scans
    if (charges.scans && charges.scans.length > 0) {
      console.log('\n   🔬 Scans/Imaging:');
      charges.scans.forEach(scan => {
        console.log(`      • ${scan.name}: $${scan.amount}`);
      });
      console.log(`      ➜ Subtotal: $${totals.scans}`);
    }

    // Medicines
    if (charges.medicines && charges.medicines.length > 0) {
      console.log('\n   💊 Medicines:');
      charges.medicines.forEach(med => {
        console.log(`      • ${med.name} (Qty: ${med.quantity} × $${med.unitPrice}): $${med.amount}`);
      });
      console.log(`      ➜ Subtotal: $${totals.medicines}`);
    }

    // BED CHARGES - HIGHLIGHTED
    if (bedCharges && bedCharges.days) {
      console.log('\n   🛏️  BED/ROOM CHARGES:');
      console.log(`      • ${bedCharges.roomType}: ${bedCharges.days} days × $${bedCharges.ratePerDay}/day = $${bedCharges.amount}`);
      if (bedCharges.notes) {
        console.log(`        📝 ${bedCharges.notes}`);
      }
      console.log(`      ➜ Subtotal: $${totals.bedCharges}`);
    }

    // Service Fees
    if (charges.serviceFees && charges.serviceFees.length > 0) {
      console.log('\n   🔧 Service Fees:');
      charges.serviceFees.forEach(svc => {
        console.log(`      • ${svc.description}: $${svc.amount}`);
      });
      console.log(`      ➜ Subtotal: $${totals.serviceFees}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 TOTAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`   Consultation Fee:              $${totals.consultationFee.toFixed(2).padStart(8)}`);
    console.log(`   Hospital Charges Total:         $${totals.hospitalChargesTotal.toFixed(2).padStart(8)}`);
    console.log('   ' + '─'.repeat(65));
    console.log(`   GRAND TOTAL:                    $${totals.grandTotal.toFixed(2).padStart(8)}`);
    console.log('='.repeat(70));
    console.log('\n✅ STEP 3 COMPLETE: Patient Successfully Viewed Complete Bill!');
    console.log('\n🎉 ALL THREE STEPS COMPLETED SUCCESSFULLY! 🎉\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

testBillingWorkflow();
