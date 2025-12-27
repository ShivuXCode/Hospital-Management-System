# Integrated Billing System - Quick Start Guide

## System Status
✅ Backend running on port 5002 with integrated billing routes
✅ Frontend available on port 8080
✅ All billing pages implemented (Doctor, Admin, Patient)
✅ Navigation menus updated with billing links

## Quick Test Instructions

### 1. Doctor: Add Consultation Fee

**Login Credentials:** Use any doctor account (e.g., `dr.emily.johnson@example.com` / `password123`)

**Steps:**
1. Login to the system
2. Navigate to **Billing** from the left sidebar (new menu item)
3. You'll see a list of your completed appointments
4. Click **"Add Fee"** on any appointment
5. Enter a consultation fee amount (e.g., `150`)
6. Add optional notes
7. Click **"Save Fee"**

**Expected Result:**
- Fee saved successfully
- Bill created in database with status "draft"
- Statistics update (Fees Added count increases)
- Bill appears in admin pending list

### 2. Admin: Add Hospital Charges & Finalize

**Login Credentials:** `shivani.admin@gmail.com` / `Admin@123`

**Steps:**
1. Login as admin
2. Navigate to **Billing** from the left sidebar
3. You'll see pending bills (bills with consultation fees)
4. Click **"Manage Charges"** on a bill
5. View the doctor's consultation fee (read-only section at top)

**Add Hospital Charges:**
6. **Lab Tests:**
   - Click "+ Add Test"
   - Enter test name (e.g., "Complete Blood Count")
   - Enter amount (e.g., "50")
   - Repeat for multiple tests

7. **Scans/Imaging:**
   - Click "+ Add Scan"
   - Enter scan type (e.g., "X-Ray Chest")
   - Enter amount (e.g., "100")

8. **Medicines:**
   - Click "+ Add Medicine"
   - Enter medicine name (e.g., "Amoxicillin")
   - Enter quantity (e.g., "10")
   - Enter unit price (e.g., "5")
   - Amount auto-calculates (10 × $5 = $50)

9. **Bed Charges:**
   - Enter days (e.g., "2")
   - Enter rate per day (e.g., "200")
   - Amount auto-calculates (2 × $200 = $400)

10. **Service Fees:**
    - Click "+ Add Service"
    - Enter service type (e.g., "Nursing Care")
    - Enter amount (e.g., "75")

**Save & Finalize:**
11. Click **"Save Charges"** to save without locking
12. Review the total summary:
    - Consultation Fee: $150
    - Hospital Charges: (sum of all above)
    - Grand Total: (consultation + hospital)
13. Click **"Finalize Bill"**
14. Confirm the action (this locks the bill)

**Expected Result:**
- Bill status changes to "finalized"
- Bill disappears from pending list
- Doctor can no longer edit consultation fee
- Admin can no longer edit hospital charges
- Patient can now view the complete bill

### 3. Patient: View Bills

**Login Credentials:** Use any patient account (e.g., `karan@example.com` / `password123`)

**Steps:**
1. Login as patient
2. Navigate to **Billing** from the left sidebar
3. View all your bills with status badges
4. Statistics show: Total Bills, Pending, Unpaid, Total Amount Due
5. Click **"View Details"** on any bill

**Bill Details View:**
6. See bill information (doctor, date, status, payment status)
7. View consultation fee section
8. View hospital charges breakdown:
   - Lab Tests with individual amounts
   - Scans/Imaging with amounts
   - Medicines with quantity and calculations
   - Bed charges with daily rate
   - Service fees
9. See total summary:
   - Consultation Fee total
   - Hospital Charges total
   - Grand Total
   - Payment status (if any payment made)

**Expected Result:**
- Complete bill breakdown visible
- All charges properly categorized
- Totals calculated correctly
- Status badges show current state

## API Endpoints Testing

### Test Endpoints with cURL

```bash
# 1. Login as Admin
curl -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shivani.admin@gmail.com","password":"Admin@123"}'

# Save the token from response

# 2. Get Pending Bills
curl http://localhost:5002/api/integrated-billing/admin/pending \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get All Bills (with status filter)
curl http://localhost:5002/api/integrated-billing/admin/all?status=pending \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get Doctor's Completed Appointments (login as doctor first)
curl http://localhost:5002/api/integrated-billing/doctor/appointments \
  -H "Authorization: Bearer DOCTOR_TOKEN"

# 5. Add Consultation Fee (as doctor)
curl -X POST http://localhost:5002/api/integrated-billing/consultation-fee \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "appointmentId": "APPOINTMENT_ID",
    "amount": 150,
    "notes": "Follow-up consultation"
  }'

# 6. Add Hospital Charges (as admin)
curl -X POST http://localhost:5002/api/integrated-billing/hospital-charges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "billId": "BILL_ID",
    "labTests": [
      {"testName": "CBC", "amount": 50},
      {"testName": "Blood Sugar", "amount": 30}
    ],
    "scans": [
      {"scanType": "X-Ray", "amount": 100}
    ],
    "medicines": [
      {"medicineName": "Amoxicillin", "quantity": 10, "unitPrice": 5, "amount": 50}
    ],
    "bedCharges": {
      "days": 2,
      "ratePerDay": 200,
      "amount": 400
    },
    "serviceFees": [
      {"serviceType": "Nursing Care", "amount": 75}
    ]
  }'

# 7. Finalize Bill (as admin)
curl -X PUT http://localhost:5002/api/integrated-billing/BILL_ID/finalize \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 8. Get Patient's Bills (as patient)
curl http://localhost:5002/api/integrated-billing/patient/my-bills \
  -H "Authorization: Bearer PATIENT_TOKEN"

# 9. Get Specific Bill Details
curl http://localhost:5002/api/integrated-billing/BILL_ID \
  -H "Authorization: Bearer TOKEN"
```

## Verification Checklist

### Backend Verification
- [ ] Server running on port 5002
- [ ] MongoDB connected
- [ ] IntegratedBilling routes registered
- [ ] Auth endpoints working (/api/login)
- [ ] All billing endpoints responding (see cURL commands above)

### Frontend Verification
- [ ] Doctor Billing page accessible at `/dashboard/doctor/billing`
- [ ] Admin Billing page accessible at `/dashboard/admin/billing`
- [ ] Patient Billing page accessible at `/dashboard/patient/billing`
- [ ] All three pages visible in navigation menus
- [ ] Components render without errors

### Workflow Verification
- [ ] Doctor can add consultation fees
- [ ] Doctor cannot edit fees after finalization
- [ ] Admin can view pending bills
- [ ] Admin can add all 5 types of hospital charges
- [ ] Admin can save charges without finalizing
- [ ] Admin can finalize bills with confirmation
- [ ] Finalized bills prevent further edits
- [ ] Patient can view all their bills
- [ ] Patient can see detailed breakdowns
- [ ] Totals calculate correctly in real-time

### Database Verification
```bash
# Connect to MongoDB and check
mongosh
use mediflow
db.integratedbillings.find().pretty()  # View all bills
db.integratedbillings.find({status: 'pending'}).pretty()  # View pending bills
```

## Common Issues & Solutions

### Issue: "Failed to load appointments/bills"
**Solution:** Ensure you have completed appointments in the database. Run demo seed script if needed.

### Issue: "Cannot add consultation fee"
**Solution:** Verify:
- Appointment status is "completed"
- You are the assigned doctor for the appointment
- Bill is not finalized

### Issue: "Cannot add hospital charges"
**Solution:** Verify:
- Bill exists (doctor added consultation fee first)
- Bill is not finalized
- You are logged in as Admin

### Issue: Totals not calculating
**Solution:** Refresh the page. The pre-save middleware should auto-calculate totals on every save.

### Issue: "Cannot finalize bill"
**Solution:** Ensure bill status is not already "finalized". Finalization is irreversible.

## Database Schema Reference

```javascript
IntegratedBilling {
  appointment: ObjectId (ref: Appointment)
  patient: ObjectId (ref: User)
  doctor: ObjectId (ref: Doctor)
  
  consultationFee: {
    amount: Number
    addedBy: ObjectId (ref: User)
    addedAt: Date
    notes: String
  }
  
  hospitalCharges: {
    labTests: [{ testName, amount }]
    scans: [{ scanType, amount }]
    medicines: [{ medicineName, quantity, unitPrice, amount }]
    bedCharges: { days, ratePerDay, amount }
    serviceFees: [{ serviceType, amount }]
  }
  
  totals: {
    consultationTotal, labTotal, scanTotal,
    medicineTotal, bedTotal, serviceTotal,
    hospitalTotal, grandTotal
  }
  
  status: 'draft' | 'pending' | 'finalized' | 'paid' | 'cancelled'
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  
  finalization: {
    finalizedBy: ObjectId (ref: User)
    finalizedAt: Date
  }
  
  payment: {
    paidAmount: Number
    paymentDate: Date
    paymentMethod: String
    transactionId: String
  }
}
```

## Next Development Steps

1. **Test with real appointments** - Create appointments and complete them
2. **Add payment functionality** - Integrate payment gateway
3. **Generate PDF bills** - Implement PDF generation and download
4. **Email notifications** - Send emails on bill finalization
5. **Revenue reports** - Build analytics dashboard for billing

## Support & Documentation

- Full implementation details: `INTEGRATED_BILLING_IMPLEMENTATION.md`
- API documentation: See `/api/integrated-billing/*` endpoints
- Database models: `backend/models/IntegratedBilling.js`
- Frontend components: `frontend/src/pages/dashboard/*BillingPage.tsx`

---

**System Ready for Testing!** 🎉

Start by logging in as a doctor, adding consultation fees, then as admin to add hospital charges and finalize bills, and finally as a patient to view the complete bills.
