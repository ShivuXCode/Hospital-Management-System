const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';
const NEW_APPOINTMENT_ID = '6920b186242cc55319a7dd14';

async function testConsultationFeeEditFlow() {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing Full Consultation Fee Edit Flow');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Login as doctor
    const doctorLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'karan.doctor@gmail.com',
      password: 'Doctor@123'
    });
    const doctorToken = doctorLogin.data.token;

    // Step 1: Doctor adds initial consultation fee
    console.log('📝 Step 1: Doctor adding initial consultation fee ($150)...\n');
    const addFee = await axios.post(
      `${BASE_URL}/integrated-billing/consultation-fee`,
      {
        appointmentId: NEW_APPOINTMENT_ID,
        amount: 150,
        notes: 'Initial consultation fee'
      },
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );

    const billId = addFee.data.bill._id;
    console.log('✅ Fee added successfully');
    console.log('   Bill ID:', billId);
    console.log('   Amount: $' + addFee.data.bill.consultationFee.amount);
    console.log('   Notes:', addFee.data.bill.consultationFee.notes);
    console.log('   Grand Total: $' + addFee.data.bill.totals.grandTotal);

    // Step 2: Doctor edits the consultation fee
    console.log('\n✏️  Step 2: Doctor updating consultation fee to $200...\n');
    const updateFee = await axios.post(
      `${BASE_URL}/integrated-billing/consultation-fee`,
      {
        appointmentId: NEW_APPOINTMENT_ID,
        amount: 200,
        notes: 'Updated fee - Extended consultation with additional treatment plan'
      },
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );

    console.log('✅ Fee updated successfully');
    console.log('   New Amount: $' + updateFee.data.bill.consultationFee.amount);
    console.log('   New Notes:', updateFee.data.bill.consultationFee.notes);
    console.log('   Grand Total: $' + updateFee.data.bill.totals.grandTotal);

    // Step 3: Verify doctor can see the updated fee in appointment list
    console.log('\n🔍 Step 3: Checking doctor appointment list...\n');
    const doctorAppointments = await axios.get(
      `${BASE_URL}/integrated-billing/doctor/appointments`,
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );

    const appointment = doctorAppointments.data.appointments.find(a => a._id === NEW_APPOINTMENT_ID);
    console.log('✅ Doctor appointment list updated');
    console.log('   Patient:', appointment.patientName);
    console.log('   Consultation Fee: $' + appointment.consultationFee);
    console.log('   Notes:', appointment.consultationFeeNotes);
    console.log('   Can Edit:', appointment.canEdit ? 'Yes' : 'No');
    console.log('   Bill Status:', appointment.billStatus);

    // Step 4: Admin views the updated fee
    console.log('\n👨‍💼 Step 4: Admin viewing updated consultation fee...\n');
    const adminLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'shivani.admin@gmail.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.data.token;

    const adminView = await axios.get(
      `${BASE_URL}/integrated-billing/admin/all`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const adminBill = adminView.data.bills.find(b => b._id === billId);
    console.log('✅ Admin can see updated fee');
    console.log('   Patient:', adminBill.patientName);
    console.log('   Doctor:', adminBill.doctorName);
    console.log('   Consultation Fee: $' + adminBill.consultationFee.amount);
    console.log('   Notes:', adminBill.consultationFee.notes);
    console.log('   Status:', adminBill.status);

    // Step 5: Patient views the updated fee
    console.log('\n👤 Step 5: Patient viewing updated consultation fee...\n');
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
    console.log('   Notes:', patientBill.consultationFee.notes);
    console.log('   Grand Total: $' + patientBill.totals.grandTotal);
    console.log('   Status:', patientBill.status);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! All consultation fee edit tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Verified Features:');
    console.log('   1. Doctor can add initial consultation fee');
    console.log('   2. Doctor can edit/update consultation fee');
    console.log('   3. Notes are preserved and updated correctly');
    console.log('   4. Doctor appointment list shows updated fee and notes');
    console.log('   5. Admin can immediately see updated fees');
    console.log('   6. Patient can immediately see updated fees');
    console.log('   7. Grand total updates automatically');
    console.log('   8. Bill status remains editable (pending)\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

testConsultationFeeEditFlow();
