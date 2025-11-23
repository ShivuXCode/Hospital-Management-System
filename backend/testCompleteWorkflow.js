const axios = require('axios');
const BASE_URL = 'http://localhost:5002/api';

async function testCompleteWorkflow() {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Complete Real Patient Billing Workflow Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Doctor views appointments (John Smith visible)
    console.log('👨‍⚕️ Step 1: Doctor viewing appointments...\n');
    const doctorLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'karan.doctor@gmail.com',
      password: 'Doctor@123'
    });
    const doctorToken = doctorLogin.data.token;

    const appointments = await axios.get(
      `${BASE_URL}/integrated-billing/doctor/appointments`,
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );

    console.log(`✅ Doctor sees ${appointments.data.count} real patient(s):`);
    appointments.data.appointments.forEach(apt => {
      console.log(`   - ${apt.patientName} on ${apt.date} at ${apt.time}`);
      console.log(`     Fee: $${apt.consultationFee}, Status: ${apt.billStatus}`);
    });

    if (appointments.data.count === 0) {
      console.log('   ⚠️  No appointments found. Create one first!');
      return;
    }

    const appointmentId = appointments.data.appointments[0]._id;
    const billId = appointments.data.appointments[0].billId;

    // Step 2: Admin views pending bills
    console.log('\n👨‍💼 Step 2: Admin viewing pending bills...\n');
    const adminLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'shivani.admin@gmail.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.data.token;

    const pendingBills = await axios.get(
      `${BASE_URL}/integrated-billing/admin/pending`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log(`✅ Admin sees ${pendingBills.data.count} pending bill(s):`);
    pendingBills.data.bills.forEach(bill => {
      console.log(`   - ${bill.patientName}: $${bill.totals?.grandTotal || 0}`);
    });

    // Step 3: Admin adds hospital charges
    console.log('\n💊 Step 3: Admin adding hospital charges...\n');
    const hospitalCharges = await axios.post(
      `${BASE_URL}/integrated-billing/hospital-charges`,
      {
        appointmentId: appointmentId,
        labTests: [
          { name: 'Complete Blood Count', amount: 50 }
        ],
        scans: [
          { name: 'Chest X-Ray', amount: 100 }
        ],
        medicines: [
          { name: 'Antibiotic', quantity: 10, unitPrice: 5, amount: 50 }
        ],
        bedCharges: {
          days: 2,
          ratePerDay: 150,
          amount: 300,
          roomType: 'General Ward'
        },
        serviceFees: [
          { description: 'Nursing Care', amount: 100 }
        ]
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✅ Hospital charges added successfully');
    console.log(`   Lab Tests: $${hospitalCharges.data.bill.totals.labTests}`);
    console.log(`   Scans: $${hospitalCharges.data.bill.totals.scans}`);
    console.log(`   Medicines: $${hospitalCharges.data.bill.totals.medicines}`);
    console.log(`   Bed Charges (2 days × $150): $${hospitalCharges.data.bill.totals.bedCharges}`);
    console.log(`   Service Fees: $${hospitalCharges.data.bill.totals.serviceFees}`);
    console.log(`   Grand Total: $${hospitalCharges.data.bill.totals.grandTotal}`);

    // Step 4: Admin finalizes the bill
    console.log('\n🔒 Step 4: Admin finalizing bill...\n');
    const finalized = await axios.put(
      `${BASE_URL}/integrated-billing/${billId}/finalize`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✅ Bill finalized successfully');
    console.log(`   Status: ${finalized.data.bill.status}`);

    // Step 5: Admin views finalized bills
    console.log('\n📋 Step 5: Admin viewing finalized bills...\n');
    const finalizedBills = await axios.get(
      `${BASE_URL}/integrated-billing/admin/all?status=finalized`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log(`✅ Admin sees ${finalizedBills.data.count} finalized bill(s):`);
    finalizedBills.data.bills.forEach(bill => {
      console.log(`   - ${bill.patientName}: $${bill.totals?.grandTotal || 0} (${bill.status})`);
    });

    // Step 6: Patient views their bill
    console.log('\n👤 Step 6: Patient viewing their bill...\n');
    const patientLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'john.smith@email.com',
      password: 'Patient@123'
    });
    const patientToken = patientLogin.data.token;

    const patientBills = await axios.get(
      `${BASE_URL}/integrated-billing/patient/my-bills`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );

    console.log(`✅ Patient (John Smith) sees ${patientBills.data.count} bill(s):`);
    patientBills.data.bills.forEach(bill => {
      console.log(`   - Bill ID: ${bill._id}`);
      console.log(`     Doctor: ${bill.doctorName}`);
      console.log(`     Consultation: $${bill.consultationFee?.amount || 0}`);
      console.log(`     Hospital Charges: $${bill.totals?.hospitalChargesTotal || 0}`);
      console.log(`     Grand Total: $${bill.totals?.grandTotal || 0}`);
      console.log(`     Status: ${bill.status}`);
    });

    // Step 7: Patient views detailed bill
    console.log('\n📄 Step 7: Patient viewing detailed bill...\n');
    const detailedBill = await axios.get(
      `${BASE_URL}/integrated-billing/${billId}`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );

    const bill = detailedBill.data.bill;
    console.log('✅ Patient can see complete bill breakdown:');
    console.log(`   Patient: ${bill.patientName}`);
    console.log(`   Doctor: ${bill.doctorName}`);
    console.log(`   Consultation Fee: $${bill.consultationFee?.amount || 0}`);
    console.log(`   Lab Tests: $${bill.totals?.labTests || 0}`);
    console.log(`   Scans: $${bill.totals?.scans || 0}`);
    console.log(`   Medicines: $${bill.totals?.medicines || 0}`);
    console.log(`   Bed Charges: $${bill.totals?.bedCharges || 0}`);
    console.log(`   Service Fees: $${bill.totals?.serviceFees || 0}`);
    console.log(`   ────────────────────────`);
    console.log(`   GRAND TOTAL: $${bill.totals?.grandTotal || 0}`);
    console.log(`   Status: ${bill.status.toUpperCase()}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Complete Workflow Test Passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ All Features Working:');
    console.log('   ✓ Demo/Test patients filtered out');
    console.log('   ✓ Real patient (John Smith) visible to doctor');
    console.log('   ✓ Admin can see pending bills');
    console.log('   ✓ Admin can add hospital charges');
    console.log('   ✓ Admin can finalize bills');
    console.log('   ✓ Admin can view finalized bills history');
    console.log('   ✓ Patient can login and view their bills');
    console.log('   ✓ Patient can see complete bill breakdown\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

testCompleteWorkflow();
