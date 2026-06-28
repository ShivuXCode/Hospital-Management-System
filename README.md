# 🏥 Hospital Management System

A comprehensive full-stack hospital management system built with modern web technologies for managing patients, appointments, doctors, nurses, billing, prescriptions, and more.

## ✨ Features

### 👥 User Management
- **Multi-Role Authentication** - Admin, Doctor, Nurse, and Patient roles
- **Secure Login System** - JWT-based authentication with bcrypt password encryption
- **Profile Management** - Complete user profile customization

### 🏥 Medical Operations
- **Patient Management** - Register, view, and manage patient records
- **Appointment Scheduling** - Book appointments with doctors (Physical & Video Consultation)
- **Doctor & Nurse Management** - Manage medical staff profiles and assignments
- **Prescription Management** - Create, view, and manage patient prescriptions
- **Medical Records** - Comprehensive patient health history tracking

### 💰 Billing & Inventory
- **Integrated Billing System** - Complete billing and invoicing with itemized bills
- **Inventory Tracking** - Monitor medical supplies and equipment
- **Transaction History** - Track all financial transactions

### 📊 Analytics & Reporting
- **Analytics Dashboard** - Real-time hospital analytics and reports
- **Department Management** - Organize and track hospital departments
- **Performance Metrics** - Track doctor consultations, patient stats, and more

### 🎥 Advanced Features
- **Video Consultation** - Online consultation support with meeting links
- **Emergency Alerts** - Handle emergency situations
- **IoT Integration** - Connect with medical IoT devices
- **Review System** - Patient reviews and ratings for doctors

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible component library
- **TanStack Query** - Powerful server state management
- **React Hook Form + Zod** - Form handling and validation
- **React Router DOM** - Client-side routing
- **Recharts** - Interactive data visualization
- **Lucide React** - Icon library

### Backend
- **Node.js + Express** - High-performance web server
- **MongoDB + Mongoose** - NoSQL database with elegant ODM
- **JWT** - Secure token-based authentication
- **bcrypt** - Industry-standard password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas
- **Package Manager** - npm, yarn, or bun

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ShivuXCode/Hospital-Management-System.git
cd Hospital-Management-System
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
MONGO_URI=mongodb://localhost:27017/mediflow
JWT_SECRET=your_strong_jwt_secret_key_here
FRONTEND_URL=http://localhost:8080
PORT=5002
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5002/api
```

### 4. Seed Demo Users (Important!)
```bash
cd backend
node seedAllUsers.js
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
node server.js
```
Server runs on: `http://localhost:5002`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:8080`

## 🔐 Demo Credentials

### Admin Account
- **Email:** shivani.admin@gmail.com
- **Password:** Admin@123


## 📁 Project Structure

```
Hospital-Management-System/
├── backend/                    # Express.js Backend
│   ├── models/                # Mongoose Models
│   │   ├── User.js           # User authentication model
│   │   ├── Doctor.js         # Doctor profile model
│   │   ├── Nurse.js          # Nurse profile model
│   │   ├── Appointment.js    # Appointment model
│   │   ├── Prescription.js   # Prescription model
│   │   ├── Bill.js           # Billing model
│   │   ├── IntegratedBilling.js
│   │   ├── InventoryItem.js
│   │   ├── MedicalRecord.js
│   │   └── ...
│   ├── routes/               # API Routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── appointments.js  # Appointment management
│   │   ├── doctors.js       # Doctor operations
│   │   ├── nurses.js        # Nurse operations
│   │   ├── billing.js       # Billing operations
│   │   ├── prescriptions.js
│   │   ├── analytics.js
│   │   └── ...
│   ├── middleware/          # Custom Middleware
│   │   └── authMiddleware.js
│   ├── scripts/             # Utility Scripts
│   ├── seedAllUsers.js      # Seed all demo users
│   ├── checkPasswords.js    # Verify user passwords
│   ├── resetPasswords.js    # Reset passwords utility
│   ├── server.js           # Server entry point
│   ├── package.json
│   └── .env
├── frontend/                 # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/      # Reusable Components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ...
│   │   ├── pages/          # Page Components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Appointment.tsx
│   │   │   ├── dashboard/  # Dashboard Pages
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── DoctorDashboard.tsx
│   │   │   │   ├── NurseDashboard.tsx
│   │   │   │   └── PatientDashboard.tsx
│   │   │   └── ...
│   │   ├── services/       # API Service Layer
│   │   │   └── api.ts
│   │   ├── contexts/       # React Contexts
│   │   ├── lib/           # Utilities
│   │   ├── App.tsx        # Main App Component
│   │   └── main.tsx       # Entry Point
│   ├── public/            # Static Assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env
├── README.md
└── .gitignore
```

## 🔐 Security Features

- **Password Encryption** - All passwords hashed using bcrypt (10 rounds)
- **JWT Authentication** - Secure token-based authentication with 7-day expiry
- **Protected Routes** - Role-based access control for API endpoints
- **Helmet.js** - Security headers to protect against common vulnerabilities
- **CORS Configuration** - Configured for specific frontend origin
- **Environment Variables** - Sensitive data stored securely in .env files
- **Input Validation** - Server-side validation for all user inputs

## 📝 API Endpoints

### Authentication
- `POST /api/signup` - Register new patient
- `POST /api/login` - User login
- `GET /api/user` - Get current user info

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/me` - Get authenticated doctor's profile
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor profile

### Nurses
- `GET /api/nurses` - List all nurses
- `POST /api/nurses/assign-doctor` - Assign doctor to nurse
- `DELETE /api/nurses/unassign-doctor` - Unassign doctor from nurse

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Billing
- `GET /api/billing` - Get billing records
- `POST /api/billing` - Create new bill
- `GET /api/billing/:id` - Get bill by ID

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/appointments` - Get appointment analytics
- `GET /api/analytics/revenue` - Get revenue analytics

### Inventory
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item

## 🛠️ Utility Scripts

### Seed All Users
```bash
cd backend
node seedAllUsers.js
```
Creates all 31 demo users with their original passwords.

### Check Passwords
```bash
cd backend
node checkPasswords.js
```
Verifies and displays passwords for all users in the database.

### Reset Passwords
```bash
cd backend
node resetPasswords.js
```
Resets all user passwords to a common password (`Demo@123`).

## 📦 Build for Production

### Frontend Build
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/` directory.

### Backend Deployment
Ensure environment variables are set on your production server and run:
```bash
cd backend
node server.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👥 Authors

Hospital Management System Development Team

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**⚠️ Important Notes:**
- Make sure MongoDB is running before starting the backend server
- Run the seed script to populate demo users before testing
- Keep your `.env` files secure and never commit them to version control
- Use strong JWT secrets in production environments

**Happy Coding! 🚀**
