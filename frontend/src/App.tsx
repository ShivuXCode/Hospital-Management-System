import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import AdminNurseAssignmentsPage from "./pages/dashboard/AdminNurseAssignmentsPage";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import NurseDashboard from "./pages/dashboard/NurseDashboard";
import NurseAppointmentsPage from "./pages/dashboard/NurseAppointmentsPage";
import NursePrescriptionsPage from "./pages/dashboard/NursePrescriptionsPage";
import NurseMessagesPage from "./pages/dashboard/NurseMessagesPage";
import NursePatientsPage from "./pages/dashboard/NursePatientsPage";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import PatientAppointments from "./pages/dashboard/PatientAppointments";
import PatientPrescriptions from "./pages/dashboard/PatientPrescriptions";
import PatientHealthRecords from "./pages/dashboard/PatientHealthRecords";
import PatientBilling from "./pages/dashboard/PatientBilling";
import PatientReviewsPage from "./pages/dashboard/PatientReviewsPage";
import ProfileView from "./pages/dashboard/ProfileView";
import ProfileEdit from "./pages/dashboard/ProfileEdit";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorProfilePage from "./pages/dashboard/DoctorProfilePage";
import DoctorReviewsPage from "./pages/dashboard/DoctorReviewsPage";
import DoctorAppointmentsPage from "./pages/dashboard/DoctorAppointmentsPage";
import DoctorPatientsPage from "./pages/dashboard/DoctorPatientsPage";
import DoctorPrescriptionsPage from "./pages/dashboard/DoctorPrescriptionsPage";
import DoctorMessagesPage from "./pages/dashboard/DoctorMessagesPage";
import DoctorConsultationsPage from "./pages/dashboard/DoctorConsultationsPage";
import DoctorBillingPage from "./pages/dashboard/DoctorBillingPage";
import AdminBillingPage from "./pages/dashboard/AdminBillingPage";
import PatientBillingPage from "./pages/dashboard/PatientBillingPage";
import BillingSystemPage from "./pages/dashboard/BillingSystemPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminQueriesPage from "./pages/admin/AdminQueriesPage";
import AdminNewsletterPage from "./pages/admin/AdminNewsletterPage";
import AdminInventoryManager from "./pages/dashboard/AdminInventoryManager";
import AdminIoTDevices from "./pages/dashboard/AdminIoTDevices";
import AdminContactMessagesPage from "./pages/dashboard/AdminContactMessagesPage";
import AdminMessagesPage from "./pages/dashboard/AdminMessagesPage";
import { apiService } from "./services/api";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const RoleAwareHome = () => {
  const isAuthenticated = apiService.isAuthenticated();
  const user = apiService.getUser();

  if (isAuthenticated && user?.role) {
    const target =
      user.role === 'Doctor' ? '/dashboard/doctor' :
      user.role === 'Nurse' ? '/dashboard/nurse' : '/';
    if (target !== '/') {
      return <Navigate to={target} replace />;
    }
  }

  return (
    <PublicLayout><Home /></PublicLayout>
  );
};

const RoleDashboardRedirect = () => {
  const isAuthenticated = apiService.isAuthenticated();
  const user = apiService.getUser();
  if (!isAuthenticated || !user?.role) return <Navigate to="/login" replace />;
  const target =
    user.role === 'Doctor' ? '/dashboard/doctor' :
    user.role === 'Nurse' ? '/dashboard/nurse' : '/';
  return <Navigate to={target} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleAwareHome />} />
            <Route path="/dashboard" element={<RoleDashboardRedirect />} />
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
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/nurses"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminNurseAssignmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/patients"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/billing"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminBillingPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/billing-system"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <BillingSystemPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/inventory"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminInventoryManager />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/iot-devices"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminIoTDevices />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/contact-messages"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminContactMessagesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/messages"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminMessagesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <ProfileView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <ProfileEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* New Admin Module Routes (aliases from legacy spec) */}
            <Route
              path="/admin-department"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminDepartmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-query"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminQueriesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-newsletter"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout role="admin" hideTopNav>
                    <AdminNewsletterPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/appointments"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorAppointmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/patients"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorPatientsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorPrescriptionsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/messages"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorMessagesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/consultations"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorConsultationsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/billing"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorBillingPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/profile"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/reviews"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <DoctorReviewsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DashboardLayout role="doctor" hideTopNav>
                    <ProfileEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/nurse"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
                    <NurseDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/appointments"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
                    <NurseAppointmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
                    <NursePrescriptionsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/messages"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
                    <NurseMessagesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/patients"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
                    <NursePatientsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/profile"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
                    <ProfileView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['Nurse']}>
                  <DashboardLayout role="nurse" hideTopNav>
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
              path="/dashboard/patient/reviews"
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <DashboardLayout role="patient">
                    <PatientReviewsPage />
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
                    <PatientBillingPage />
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
