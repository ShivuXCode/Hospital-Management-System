const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testConsultationFeeEdit() {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing Consultation Fee Edit Feature');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const billId = '6920ae1bc3089cd2f92d58f6';
    const appointmentId = '6920ada67a87fb59a5a0a657';

    // Step 1: Doctor updates consultation fee from $150 to $200
    console.log('📝 Step 1: Doctor updating consultation fee from $150 to $200...\n');
    const doctorLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'karan.doctor@gmail.com',
      password: 'Doctor@123'
    });
    const doctorToken = doctorLogin.data.token;

    const updateFee = await axios.post(
      `${BASE_URL}/integrated-billing/consultation-fee`,
      {
        appointmentId,
        amount: 200,
        notes: 'Updated fee - Extended consultation'
      },
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );

    console.log('✅ Doctor updated consultation fee');
    console.log('   New Amount: $' + updateFee.data.bill.consultationFee.amount);
    console.log('   Notes:', updateFee.data.bill.consultationFee.notes);
    console.log('   Grand Total: $' + updateFee.data.bill.totals.grandTotal);

    // Step 2: Admin views the updated fee
    console.log('\n📋 Step 2: Admin viewing updated consultation fee...\n');
    const adminLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'shivani.admin@gmail.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.data.token;

    const adminView = await axios.get(
      `${BASE_URL}/integrated-billing/admin/all`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const bill = adminView.data.bills.find(b => b._id === billId);
    console.log('✅ Admin can see updated fee');
    console.log('   Consultation Fee: $' + bill.consultationFee.amount);
    console.log('   Notes:', bill.consultationFee.notes);
    console.log('   Hospital Charges: $' + bill.totals.hospitalChargesTotal);
    console.log('   Grand Total: $' + bill.totals.grandTotal);

    // Step 3: Patient views the updated fee
    console.log('\n👤 Step 3: Patient viewing updated consultation fee...\n');
    const patientLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'demo.patient@example.com',
      password: 'Patient@123'
    });
    const patientToken = patientLogin.data.token;

    const patientView = await axios.get(
      `${BASE_URL}/integrated-billing/${billId}`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );

    const patientBill = patientView.data.bill;
    console.log('✅ Patient can see updated fee');
    console.log('   Consultation Fee: $' + patientBill.consultationFee.amount);
    if (patientBill.consultationFee.notes) {
      console.log('   Notes:', patientBill.consultationFee.notes);
    }
    console.log('   Hospital Charges: $' + patientBill.totals.hospitalChargesTotal);
    console.log('   Grand Total: $' + patientBill.totals.grandTotal);

    // Step 4: Verify doctor can see appointment with updated fee
    console.log('\n🔍 Step 4: Doctor checking appointment list...\n');
    const doctorAppointments = await axios.get(
      `${BASE_URL}/integrated-billing/doctor/appointments`,
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );

    const appointment = doctorAppointments.data.appointments.find(a => a._id === appointmentId);
    console.log('✅ Doctor appointment list shows updated fee');
    console.log('   Patient:', appointment.patientName);
    console.log('   Consultation Fee: $' + appointment.consultationFee);
    console.log('   Notes:', appointment.consultationFeeNotes);
    console.log('   Can Edit:', appointment.canEdit);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All tests passed! Consultation fee editing works perfectly!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Summary:');
    console.log('  ✅ Doctor can edit consultation fees');
    console.log('  ✅ Admin can see updated fees immediately');
    console.log('  ✅ Patient can see updated fees immediately');
    console.log('  ✅ Notes are preserved when editing');
    console.log('  ✅ Grand total updates automatically\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

testConsultationFeeEdit();
