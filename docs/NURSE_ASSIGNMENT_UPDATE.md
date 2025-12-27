## How to Assign Multiple Nurses to Dr. Karan Mehta

### ✅ Changes Made:

1. **Doctor Model Updated**: Changed `assignedNurse` (singular) to `assignedNurses` (array)
2. **Bidirectional Relationship**: Now when you assign a nurse to a doctor:
   - Nurse's `assignedDoctors` array gets the doctor ID
   - Doctor's `assignedNurses` array gets the nurse ID
3. **Migration Complete**: Existing data has been migrated

### 🔧 How to Assign Nurses:

You can now assign up to multiple nurses to Dr. Karan Mehta. Here's how:

**Endpoint**: `POST /api/nurses/assign-doctor`

**Example Request** (assign Asha Thomas to Karan):
```bash
curl -X POST http://localhost:5002/api/nurses/assign-doctor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "nurseId": "690df12607565974c152d259",
    "doctorId": "6901ba5babbe7e4c3f6002d8"
  }'
```

**To find Nurse IDs**, you can query:
```bash
# Get all nurses
GET /api/nurses
```

### 📊 Current Status:

Dr. Karan Mehta currently has 1 nurse assigned:
- `assignedNurses: ["691d5bce765554c7d963398e"]` (Nurse User)

You can now assign a second nurse (e.g., Asha Thomas) and both will appear in:
1. Doctor's `assignedNurses` array
2. Each nurse's `assignedDoctors` array
3. Doctor's messages page (nurses list)

### 🎯 What This Solves:

- ✅ Doctors can have multiple nurses assigned
- ✅ Assignment is saved in both Doctor and Nurse collections
- ✅ Messages page will show all assigned nurses first
- ✅ Bidirectional relationship is maintained
- ✅ When you unassign, it removes from both sides
