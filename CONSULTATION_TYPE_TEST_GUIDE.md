# Testing Guide: Consultation Type-Based UI

## Quick Test Steps

### Setup
1. Ensure backend is running: `cd backend && npm start`
2. Ensure frontend is running: `cd frontend && npm run dev`
3. Database should have demo doctors seeded with different consultation types

### Test Case 1: Video Consult Doctor ✅
**Objective:** Verify video doctors can see and access Consultations

1. **Login** as a video consultation doctor
   - Check seeded doctors in `backend/server.js` for video consultation type
   - Or check MongoDB: `db.doctors.find({ consultationTypes: 'video' })`

2. **Dashboard Sidebar Check**
   - ✓ Should see "Consultations" menu item in sidebar
   - Menu items order: Dashboard, Appointments, Patients, Prescriptions, Messages, **Consultations**, Reviews

3. **Click Consultations**
   - ✓ Should navigate to `/dashboard/doctor/consultations`
   - ✓ Should see "Video Consultations" page with scheduled consultations
   - ✓ No access restrictions

4. **Direct URL Access**
   - Navigate to `/dashboard/doctor/consultations` manually
   - ✓ Should work without restrictions

### Test Case 2: Physical Check-Up Doctor 🚫
**Objective:** Verify physical-only doctors cannot see or access Consultations

1. **Login** as a physical-only doctor
   - Check seeded doctors in `backend/server.js` for physical-only type
   - Or check MongoDB: `db.doctors.find({ consultationTypes: 'physical' })`

2. **Dashboard Sidebar Check**
   - ✓ Should NOT see "Consultations" menu item
   - Menu items should be: Dashboard, Appointments, Patients, Prescriptions, Messages, Reviews (no Consultations)

3. **Direct URL Access Test**
   - Manually navigate to `/dashboard/doctor/consultations` in browser
   - ✓ Should see "Access Restricted" message with video icon
   - ✓ Message: "Video Consultations are only available for doctors with Video Consultation privileges"
   - ✓ Should show "Redirecting to dashboard..." text
   - ✓ After 2 seconds, automatically redirected to `/dashboard/doctor`

### Test Case 3: Doctor with Both Types 🎯
**Objective:** Verify doctors with 'both' consultation types have full access

1. **Check/Create Doctor with Both Types**
   ```javascript
   // In MongoDB or backend
   db.doctors.updateOne(
     { email: 'test@doctor.com' },
     { $set: { consultationTypes: ['both'] } }
   )
   ```

2. **Login and Verify**
   - ✓ Should see "Consultations" in sidebar
   - ✓ Should access consultations page without issues

## Verification Checklist

### Backend API Response
Open browser DevTools → Network tab when on doctor dashboard:
```
Request: GET /api/doctors/me
Response: {
  "success": true,
  "doctor": {
    ...
    "consultationTypes": ["video"] or ["physical"] or ["both"]
  }
}
```

### Frontend State
In browser console (when on doctor dashboard):
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('user'))

// Should contain role: 'doctor'
```

### Menu Filtering Logic
The sidebar should automatically hide/show Consultations based on:
- `consultationTypes.includes('video')` → Show Consultations ✓
- `consultationTypes.includes('both')` → Show Consultations ✓
- `consultationTypes === ['physical']` → Hide Consultations ✓

## Common Issues & Solutions

### Issue 1: Consultations Still Shows for Physical Doctor
**Solution:**
- Check browser console for API errors
- Verify `/api/doctors/me` returns correct consultationTypes
- Clear browser cache and localStorage
- Restart frontend dev server

### Issue 2: Access Denied Not Showing
**Solution:**
- Check DoctorConsultationsPage component mounted correctly
- Verify `getDoctorProfile()` method exists in api.ts
- Check browser console for errors

### Issue 3: Menu Not Updating After Login
**Solution:**
- Check useEffect dependencies in DashboardLayout.tsx
- Verify role prop passed correctly to DashboardLayout
- Try logging out and logging back in

## Demo Doctor Accounts
Check `backend/server.js` for seeded demo doctors:
- Look for doctors with different `consultationTypes` values
- Default password should be in seed script

## Database Queries for Testing

### Find All Video Doctors
```javascript
db.doctors.find({ consultationTypes: 'video' })
```

### Find All Physical Doctors
```javascript
db.doctors.find({ consultationTypes: 'physical' })
```

### Update a Doctor's Type (for testing)
```javascript
db.doctors.updateOne(
  { email: 'doctor@example.com' },
  { $set: { consultationTypes: ['video'] } }
)
```

## Expected Results Summary

| Doctor Type | Consultations in Menu | Can Access Page | Redirect on Direct Access |
|-------------|----------------------|-----------------|---------------------------|
| Video       | ✅ Yes               | ✅ Yes          | ❌ No                     |
| Physical    | ❌ No                | ❌ No           | ✅ Yes (2s delay)         |
| Both        | ✅ Yes               | ✅ Yes          | ❌ No                     |

## Success Criteria
- ✅ Video doctors see Consultations menu and can access page
- ✅ Physical doctors don't see Consultations menu
- ✅ Physical doctors redirected if they try direct URL access
- ✅ No console errors during navigation
- ✅ Menu updates immediately after login
- ✅ Access restriction message displays correctly
