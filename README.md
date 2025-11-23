# Hospital Management System

A comprehensive full-stack hospital management system built with modern web technologies for managing patients, appointments, doctors, nurses, billing, prescriptions, and more.

## 🚀 Features

- **Patient Management** - Register, view, and manage patient records
- **Appointment Scheduling** - Book and manage appointments with doctors
- **Doctor & Nurse Management** - Manage medical staff profiles and assignments
- **Billing System** - Integrated billing and invoicing
- **Prescription Management** - Create and manage patient prescriptions
- **Inventory Tracking** - Monitor medical supplies and equipment
- **Video Consultation** - Online consultation support
- **Analytics Dashboard** - Real-time hospital analytics and reports
- **Department Management** - Organize hospital departments
- **Emergency Alerts** - Handle emergency situations
- **IoT Integration** - Connect with medical IoT devices

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Backend
- **Node.js + Express** - Web server
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password encryption
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm, yarn, or bun

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd med
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Environment Variables**

   Create `.env` file in the `backend` folder:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:8080
   PORT=5002
   ```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5002`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:8080`

## 📦 Build for Production

### Build Frontend
```bash
cd frontend
npm run build
```

## 🌱 Seeding Demo Data

To populate the database with demo users and data:
```bash
cd backend
npm run seed
```

## 📁 Project Structure

```
med/
├── backend/              # Express backend
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Server entry point
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
└── docs/                # Documentation
```

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- CORS configured for specific origins
- Environment variables for sensitive data

## 📝 API Endpoints

- `/api/auth` - Authentication routes
- `/api/doctors` - Doctor management
- `/api/nurses` - Nurse management
- `/api/appointments` - Appointment scheduling
- `/api/patients` - Patient records
- `/api/billing` - Billing operations
- `/api/prescriptions` - Prescription management
- `/api/inventory` - Inventory tracking
- `/api/analytics` - Analytics data
- `/api/departments` - Department management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👥 Authors

Hospital Management System Development Team

---

**Note:** Make sure to set up your MongoDB connection and environment variables before running the application.
