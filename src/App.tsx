import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardLayout } from "@/components/DashboardLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import Doctors from "./pages/Doctors";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import NurseDashboard from "./pages/dashboard/NurseDashboard";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import PatientAppointments from "./pages/dashboard/PatientAppointments";
import PatientPrescriptions from "./pages/dashboard/PatientPrescriptions";
import PatientHealthRecords from "./pages/dashboard/PatientHealthRecords";
import PatientBilling from "./pages/dashboard/PatientBilling";
import ProfileView from "./pages/dashboard/ProfileView";
import ProfileEdit from "./pages/dashboard/ProfileEdit";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfile from "./pages/DoctorProfile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/departments" element={<PublicLayout><Departments /></PublicLayout>} />
            <Route path="/doctors" element={<PublicLayout><Doctors /></PublicLayout>} />
            <Route path="/doctor/:id" element={<PublicLayout><DoctorProfile /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/appointment" element={<PublicLayout><Appointment /></PublicLayout>} />
            <Route path="/book-appointment" element={<PublicLayout><Appointment /></PublicLayout>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin">
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin">
                    <ProfileView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin">
                    <ProfileEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor">
                    <DoctorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/profile"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor">
                    <ProfileView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor">
                    <ProfileEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/nurse"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse">
                    <NurseDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/profile"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse">
                    <ProfileView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse">
                    <ProfileEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <PatientDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <PatientAppointments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <PatientPrescriptions />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient/records"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <PatientHealthRecords />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient/billing"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <PatientBilling />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient/profile"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <ProfileView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <ProfileEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Patient Profile Route */}
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
