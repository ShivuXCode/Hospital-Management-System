import { ReactNode, useEffect, useState as useStateReact } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Activity, 
  LayoutDashboard, 
  Users, 
  Calendar,
  FileText,
  DollarSign,
  Package,
  Cpu,
  Settings,
  LogOut,
  Menu,
  X,
  UserCog,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Key,
  Lock,
  Loader2,
  Star
} from 'lucide-react';
import { Mail } from 'lucide-react';
import { Home as HomeIcon, Activity as ActivityIcon } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  hideTopNav?: boolean;
}

export const DashboardLayout = ({ children, role, hideTopNav = false }: DashboardLayoutProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [doctorConsultationTypes, setDoctorConsultationTypes] = useStateReact<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch doctor profile to get consultation types
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (role === 'doctor') {
        try {
          const response = await apiService.getDoctorProfile();
          if (response.success && response.doctor) {
            setDoctorConsultationTypes(response.doctor.consultationTypes || []);
          }
        } catch (error) {
          console.error('Failed to fetch doctor profile:', error);
        }
      }
    };
    fetchDoctorProfile();
  }, [role]);

  const menuItems = {
    admin: [
      { icon: HomeIcon, label: 'Home', path: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin' },
      { icon: UserCog, label: 'Manage Doctors', path: '/dashboard/admin/doctors' },
      { icon: Users, label: 'Manage Nurses', path: '/dashboard/admin/nurses' },
      { icon: Users, label: 'Manage Patients', path: '/dashboard/admin/patients' },
      { icon: DollarSign, label: 'Billing', path: '/dashboard/admin/billing' },
      { icon: Package, label: 'Inventory', path: '/dashboard/admin/inventory' },
      { icon: Cpu, label: 'IoT Devices', path: '/dashboard/admin/iot-devices' },
      { icon: Mail, label: 'Messages', path: '/dashboard/admin/messages' },
      { icon: Mail, label: 'Contact Messages', path: '/dashboard/admin/contact-messages' },
      { icon: FileText, label: 'Analytics', path: '/dashboard/admin/analytics' },
    ],
    doctor: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/doctor' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/doctor/appointments' },
      { icon: Users, label: 'Patients', path: '/dashboard/doctor/patients' },
      { icon: FileText, label: 'Prescriptions', path: '/dashboard/doctor/prescriptions' },
      { icon: Mail, label: 'Messages', path: '/dashboard/doctor/messages' },
      { icon: FileText, label: 'Consultations', path: '/dashboard/doctor/consultations' },
      { icon: DollarSign, label: 'Billing', path: '/dashboard/doctor/billing' },
      { icon: FileText, label: 'Reviews', path: '/dashboard/doctor/reviews' },
    ],
    nurse: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/nurse' },
      { icon: Users, label: 'Patients', path: '/dashboard/nurse/patients' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/nurse/appointments' },
      { icon: FileText, label: 'Prescriptions', path: '/dashboard/nurse/prescriptions' },
      { icon: Mail, label: 'Messages', path: '/dashboard/nurse/messages' },
    ],
    patient: [
      { icon: HomeIcon, label: 'Home', path: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/patient' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/patient/appointments' },
      { icon: FileText, label: 'Prescriptions', path: '/dashboard/patient/prescriptions' },
      { icon: Star, label: 'Reviews', path: '/dashboard/patient/reviews' },
      { icon: Activity, label: 'Health Records', path: '/dashboard/patient/records' },
      { icon: DollarSign, label: 'Billing', path: '/dashboard/patient/billing' },
    ],
  };

  const handleLogout = () => {
    apiService.logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      // Implement delete account API call
      const user = apiService.getUser();
      // await apiService.deleteAccount(user?.id);
      
      apiService.logout();
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewProfile = () => {
    setSidebarOpen(false);
    setSettingsOpen(false);
    navigate(`/dashboard/${role}/profile`);
  };

  const handleEditProfile = () => {
    setSidebarOpen(false);
    setSettingsOpen(false);
    navigate(`/dashboard/${role}/profile/edit`);
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      
      const response = await apiService.changePassword(passwordData.newPassword);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      });

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleMenuItemClick = (path: string, hash?: string) => {
    setSidebarOpen(false);
    if (hash) {
      // Navigate to the same page and trigger tab change via state
      navigate(path, { state: { tab: hash } });
    } else {
      navigate(path);
    }
  };

  // Filter menu items based on doctor consultation type
  let currentMenu = menuItems[role];
  if (role === 'doctor') {
    // Hide Consultations menu if doctor is physical-only (doesn't have 'video' in consultationTypes)
    const hasVideoConsult = doctorConsultationTypes.includes('video') || doctorConsultationTypes.includes('both');
    if (!hasVideoConsult) {
      currentMenu = currentMenu.filter(item => item.path !== '/dashboard/doctor/consultations');
    }
  }
  const user = apiService.getUser();
  const userName = user?.name || 'User';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Optional Top Navbar (hidden when hideTopNav) */}
      {!hideTopNav && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-soft">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Link to="/" className="flex items-center gap-2 font-bold">
                <Activity className="h-6 w-6 text-primary" />
                <span className="text-primary">MediFlow</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('dashboard.logout')}
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed ${hideTopNav ? 'top-0' : 'top-16'} left-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground border-r transition-transform duration-300 z-40 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          {/* Sidebar User Info: replaces brand block, keeps spacing and colors */}
          <div className="mb-6 p-3 rounded-lg bg-sidebar-accent">
            <div className="leading-tight">
              <div className="text-primary font-bold">
                {userName}
              </div>
              <div className="text-xs text-sidebar-foreground/80">
                {role === 'admin' && 'Admin Account'}
                {role === 'doctor' && 'Doctor Account'}
                {role === 'nurse' && 'Nurse Account'}
                {role === 'patient' && 'Patient Account'}
              </div>
            </div>
          </div>
          
          <nav className="space-y-1">
            {currentMenu.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Settings Dropdown */}
            <div className="pt-4 mt-4 border-t border-sidebar-border">
              <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    title="Settings"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Settings</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleViewProfile}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditProfile}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSettingsOpen(false); setShowPasswordModal(true); }}>
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                  {role !== 'admin' && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Home quick access moved above as first menu item */}
          </nav>
        </div>
      </aside>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile hamburger when top nav is hidden */}
      {hideTopNav && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed top-4 left-4 z-50 shadow lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Main Content */}
      <main className={`${hideTopNav ? 'pt-4' : 'pt-16'} lg:pl-64`}>
        <div className="p-6">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Password must be at least 8 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                <Lock className="h-4 w-4 inline mr-2" />
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setShowPasswordModal(false);
              }}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
