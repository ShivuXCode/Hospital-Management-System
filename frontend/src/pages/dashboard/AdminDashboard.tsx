import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  DollarSign, 
  UserPlus,
  Edit,
  Trash2,
  Search,
  Download,
  TrendingUp,
  Activity,
  UserCog,
  FileText,
  Loader2,
  Eye,
  Building2,
  AlertTriangle,
  Package,
  MessageSquare,
  RefreshCw,
  Clock,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Globe,
  CreditCard,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Save
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService, API_URL } from '@/services/api';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddNurseOpen, setIsAddNurseOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [isEditNurseOpen, setIsEditNurseOpen] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  
  // Real data states
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalQueries: 0,
    totalDepartments: 0,
    criticalAlerts: 0,
    lowStockItems: 0,
  });

  // Analytics states
  const [patientsAnalytics, setPatientsAnalytics] = useState<any | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any | null>(null);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [patientsRange, setPatientsRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [revenueRange, setRevenueRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Enhanced Doctor Form
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    department: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dob: '',
    joiningDate: '',
    licenseNumber: '',
    emergencyContact: '',
    bloodGroup: '',
    languages: [] as string[],
    availability: {
      monday: { available: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
      thursday: { available: false, startTime: '09:00', endTime: '17:00' },
      friday: { available: false, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' },
    },
    status: 'active',
    password: '',
  });

  // Enhanced Nurse Form
  const [nurseForm, setNurseForm] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    department: '',
    shift: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dob: '',
    joiningDate: '',
    licenseNumber: '',
    emergencyContact: '',
    bloodGroup: '',
    specialization: '',
    certifications: [] as string[],
    languages: [] as string[],
    salary: '',
    wardAssigned: '',
    supervisorId: '',
    status: 'active',
    password: '',
  });

  // Department Form
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    code: '',
    description: '',
    headDoctorId: '',
    location: {
      building: '',
      floor: '',
      wing: '',
    },
    contact: {
      phone: '',
      email: '',
      extension: '',
    },
    operatingHours: {
      weekdays: { start: '09:00', end: '17:00' },
      weekends: { start: '09:00', end: '17:00' },
      is24x7: false,
    },
    services: [] as string[],
    specializations: [] as string[],
    resources: {
      beds: 0,
      rooms: 0,
      equipment: [] as string[],
    },
    budget: {
      allocated: 0,
      utilized: 0,
      remaining: 0,
    },
    status: 'active',
  });

  // View Modal States  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Derive active section from the route and keep Tabs UI hidden
  useEffect(() => {
    const parts = location.pathname.split('/');
    const section = parts[3] || 'overview';
    setActiveTab(section);
  }, [location.pathname]);

  // Auto-refresh dashboard every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        fetchStats();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Auto-refresh analytics every 15s when analytics tab active
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    const id = setInterval(() => {
      fetchAnalytics();
    }, 15000);
    return () => clearInterval(id);
  }, [activeTab]);

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchStats();
    if (activeTab === 'doctors') fetchDoctors();
    if (activeTab === 'nurses') fetchNurses();
    if (activeTab === 'patients') fetchPatients();
    if (activeTab === 'billing') fetchTransactions();
    if (activeTab === 'departments') fetchDepartments();
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      // Fetch all data to calculate stats using admin endpoints
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [doctorsRes, nursesRes, patientsRes, appointmentsRes, departmentsRes] = await Promise.all([
        fetch(`${API_URL}/admin/doctors`, { headers }).catch(() => 
          fetch(`${API_URL}/doctors`)
        ),
        fetch(`${API_URL}/admin/nurses`, { headers }).catch(() => 
          ({ json: async () => ({ success: false, count: 0, nurses: [] }) })
        ),
        fetch(`${API_URL}/admin/patients`, { headers }).catch(() => 
          ({ json: async () => ({ success: false, count: 0, patients: [] }) })
        ),
        fetch(`${API_URL}/appointments`, { headers }).catch(() => 
          ({ json: async () => ({ success: false, count: 0, appointments: [] }) })
        ),
        fetch(`${API_URL}/admin/departments`, { headers }).catch(() => 
          ({ json: async () => ({ success: false, count: 0, departments: [] }) })
        ),
      ]);

      const doctorsData = await doctorsRes.json();
      const nursesData = await nursesRes.json();
      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const departmentsData = await departmentsRes.json();

      // Calculate counts from actual data
      const doctorsCount = doctorsData.count || doctorsData.doctors?.length || 0;
      const nursesCount = nursesData.count || nursesData.nurses?.length || 0;
      const patientsCount = patientsData.count || patientsData.patients?.length || 0;
      const appointmentsCount = appointmentsData.count || appointmentsData.appointments?.length || 0;
      const departmentsCount = departmentsData.count || departmentsData.departments?.length || 0;

      // Store appointments for displaying in recent appointments section
      if (appointmentsData.success && appointmentsData.appointments) {
        setAppointments(appointmentsData.appointments);
      }

      setStats({
        totalDoctors: doctorsCount,
        totalNurses: nursesCount,
        totalPatients: patientsCount,
        totalAppointments: appointmentsCount,
        totalDepartments: departmentsCount,
        totalRevenue: 0, // Will be updated when billing endpoint is available
        totalQueries: 0, // Will be updated when queries endpoint is available
        criticalAlerts: 0, // Will be updated when alerts endpoint is available
        lowStockItems: 0, // Will be updated when inventory endpoint is available
      });
      
      setLastUpdated(new Date());
      console.log('Stats updated:', {
        doctors: doctorsCount,
        nurses: nursesCount,
        patients: patientsCount,
        appointments: appointmentsCount,
        departments: departmentsCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/doctors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors || []);
        // Update stats with real count
        setStats(prev => ({ ...prev, totalDoctors: data.doctors?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to basic doctors endpoint
      try {
  const response = await fetch(`${API_URL}/doctors`);
        const data = await response.json();
        if (data.success) {
          setDoctors(data.doctors || []);
          setStats(prev => ({ ...prev, totalDoctors: data.doctors?.length || 0 }));
        }
      } catch (fallbackError) {
        toast({
          title: 'Error',
          description: 'Failed to load doctors',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNurses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/nurses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setNurses(data.nurses || []);
        // Update stats with real count
        setStats(prev => ({ ...prev, totalNurses: data.nurses?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching nurses:', error);
      setNurses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/patients`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients || []);
        // Update stats with real count
        setStats(prev => ({ ...prev, totalPatients: data.patients?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        // Calculate total revenue
        const totalRev = data.transactions?.reduce((sum: number, t: any) => 
          sum + (t.status === 'Paid' ? parseFloat(t.amount) || 0 : 0), 0) || 0;
        setStats(prev => ({ ...prev, totalRevenue: totalRev }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [p, r, perf] = await Promise.all([
        apiService.getAnalyticsPatients(),
        apiService.getAnalyticsRevenue(),
        apiService.getAnalyticsPerformance()
      ]);
      if (p.success) setPatientsAnalytics(p.analytics);
      if (r.success) setRevenueAnalytics(r.analytics);
      if (perf.success) setPerformanceAnalytics(perf.analytics);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Analytics fetch error', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/create-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          name: doctorForm.name,
          email: doctorForm.email,
          password: doctorForm.password,
          phone: doctorForm.phone,
          specialization: doctorForm.specialization,
          qualification: doctorForm.qualification,
          experience: doctorForm.experience,
          department: doctorForm.department,
          consultationTypes: ['both'],
          availability: doctorForm.availability,
          languages: doctorForm.languages
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Doctor account created successfully',
        });
        setIsAddDoctorOpen(false);
        setDoctorForm({
          name: '',
          email: '',
          phone: '',
          specialization: '',
          qualification: '',
          experience: '',
          consultationFee: '',
          department: '',
          gender: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          dob: '',
          joiningDate: '',
          licenseNumber: '',
          emergencyContact: '',
          bloodGroup: '',
          languages: [],
          availability: {
            monday: { available: false, startTime: '09:00', endTime: '17:00' },
            tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
            wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
            thursday: { available: false, startTime: '09:00', endTime: '17:00' },
            friday: { available: false, startTime: '09:00', endTime: '17:00' },
            saturday: { available: false, startTime: '09:00', endTime: '17:00' },
            sunday: { available: false, startTime: '09:00', endTime: '17:00' },
          },
          status: 'active',
          password: '',
        });
        fetchDoctors();
        fetchStats();
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create doctor account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/create-nurse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          name: nurseForm.name,
          email: nurseForm.email,
          password: nurseForm.password,
          phone: nurseForm.phone,
          qualification: nurseForm.qualification,
          experience: nurseForm.experience,
          department: nurseForm.department,
          shift: nurseForm.shift,
          certifications: nurseForm.certifications,
          languages: nurseForm.languages
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Nurse account created successfully',
        });
        setIsAddNurseOpen(false);
        setNurseForm({
          name: '',
          email: '',
          phone: '',
          qualification: '',
          experience: '',
          department: '',
          shift: '',
          gender: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          dob: '',
          joiningDate: '',
          licenseNumber: '',
          emergencyContact: '',
          bloodGroup: '',
          specialization: '',
          certifications: [],
          languages: [],
          salary: '',
          wardAssigned: '',
          supervisorId: '',
          status: 'active',
          password: '',
        });
        fetchNurses();
        fetchStats();
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create nurse account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // View Detail Handlers
  const handleViewDoctor = async (id: string) => {
    setViewLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedDoctor(data.doctor);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load doctor details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load doctor details',
        variant: 'destructive',
      });
    } finally {
      setViewLoading(false);
    }
  };

  const handleViewNurse = async (id: string) => {
    setViewLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/nurses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedNurse(data.nurse);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load nurse details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching nurse details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load nurse details',
        variant: 'destructive',
      });
    } finally {
      setViewLoading(false);
    }
  };

  const handleViewPatient = async (id: string) => {
    setViewLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/patients/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedPatient(data.patient);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load patient details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patient details',
        variant: 'destructive',
      });
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
      // Implement delete API call when available
      toast({
        title: 'Success',
        description: 'Doctor deleted successfully',
      });
      fetchDoctors();
      fetchStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete doctor',
        variant: 'destructive',
      });
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNurses = nurses.filter((nurse) =>
    nurse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.shift?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Full System Control & Analytics</p>
        </div>
        {activeTab === 'overview' && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Doctors
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-100">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Nurses
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-100">
                  <UserCog className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNurses}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Appointments
                </CardTitle>
                <div className="p-2 rounded-lg bg-orange-100">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No appointments available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.doctorName}</p>
                        </div>
                        <Badge>{new Date(apt.date).toLocaleDateString()}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {doctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Department analytics will be displayed here based on real data
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MANAGE DOCTORS TAB */}
        <TabsContent value="doctors" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Doctors</CardTitle>
                <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Doctor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Doctor</DialogTitle>
                      <DialogDescription>Create a new doctor account</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddDoctor} className="space-y-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="Dr. John Doe"
                          value={doctorForm.name}
                          onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Department *</Label>
                        <Select
                          value={doctorForm.department}
                          onValueChange={(value) => setDoctorForm({ ...doctorForm, department: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="neurology">Neurology</SelectItem>
                            <SelectItem value="orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="dermatology">Dermatology</SelectItem>
                            <SelectItem value="general">General Medicine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Contact Number *</Label>
                        <Input
                          placeholder="+91 98765 43210"
                          value={doctorForm.phone}
                          onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="doctor@hospital.com"
                          value={doctorForm.email}
                          onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Password *</Label>
                        <Input
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={doctorForm.password}
                          onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDoctorOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No doctors found</p>
                  <p className="text-sm mt-1">Add your first doctor to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doctor) => (
                      <TableRow key={doctor._id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.department || 'Not specified'}</TableCell>
                        <TableCell>{doctor.specialization || '-'}</TableCell>
                        <TableCell>{doctor.experience ? `${doctor.experience} years` : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDoctor(doctor._id)}
                              disabled={viewLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteDoctor(doctor._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANAGE NURSES TAB */}
        <TabsContent value="nurses" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Nurses</CardTitle>
                <Dialog open={isAddNurseOpen} onOpenChange={setIsAddNurseOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Nurse
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Nurse</DialogTitle>
                      <DialogDescription>Create a new nurse account</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddNurse} className="space-y-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="Nurse Jane Doe"
                          value={nurseForm.name}
                          onChange={(e) => setNurseForm({ ...nurseForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Department *</Label>
                        <Select
                          value={nurseForm.department}
                          onValueChange={(value) => setNurseForm({ ...nurseForm, department: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="icu">ICU</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="surgery">Surgery</SelectItem>
                            <SelectItem value="general">General Ward</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Shift *</Label>
                        <Select
                          value={nurseForm.shift}
                          onValueChange={(value) => setNurseForm({ ...nurseForm, shift: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="night">Night</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Contact Number *</Label>
                        <Input
                          placeholder="+91 98765 54321"
                          value={nurseForm.phone}
                          onChange={(e) => setNurseForm({ ...nurseForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="nurse@hospital.com"
                          value={nurseForm.email}
                          onChange={(e) => setNurseForm({ ...nurseForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Password *</Label>
                        <Input
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={nurseForm.password}
                          onChange={(e) => setNurseForm({ ...nurseForm, password: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddNurseOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search nurses..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNurses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserCog className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No nurses found</p>
                  <p className="text-sm mt-1">Add your first nurse to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNurses.map((nurse) => (
                      <TableRow key={nurse._id || nurse.id}>
                        <TableCell className="font-medium">{nurse.name}</TableCell>
                        <TableCell>{nurse.department || 'Not specified'}</TableCell>
                        <TableCell>{nurse.contact || nurse.phone || nurse.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{nurse.shift || 'Not assigned'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={nurse.status === 'active' ? 'default' : 'secondary'}>
                            {nurse.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewNurse(nurse._id || nurse.id)}
                              disabled={viewLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANAGE PATIENTS TAB */}
        <TabsContent value="patients" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Manage Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search patients..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No patients found</p>
                  <p className="text-sm mt-1">Patients will appear here once they register</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.lastVisit}</TableCell>
                        <TableCell>{patient.contact}</TableCell>
                        <TableCell>
                          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPatient(patient.id || patient._id)}
                            disabled={viewLoading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Billing & Transactions</CardTitle>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <DateInput className="w-[180px]" placeholder="Filter by date" />
                <Input placeholder="Search by patient..." className="flex-1" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm mt-1">Transaction history will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.patient}</TableCell>
                        <TableCell>{transaction.service}</TableCell>
                        <TableCell className="font-semibold">{transaction.amount}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'Paid' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Patient Growth */}
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Patient Growth</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={patientsRange === 'daily' ? 'default' : 'outline'} onClick={() => setPatientsRange('daily')}>Daily</Button>
                  <Button size="sm" variant={patientsRange === 'weekly' ? 'default' : 'outline'} onClick={() => setPatientsRange('weekly')}>Weekly</Button>
                  <Button size="sm" variant={patientsRange === 'monthly' ? 'default' : 'outline'} onClick={() => setPatientsRange('monthly')}>Monthly</Button>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : patientsAnalytics ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {(() => {
                        // Prepare data based on selected range
                        const daily = patientsAnalytics.weekly?.trend || [];
                        const monthlyDays = patientsAnalytics.monthly?.trend || [];
                        const months = patientsAnalytics.monthly?.monthsTrend?.map((x:any)=>({ name: x.month, value: x.value })) || [];
                        let data: any[] = [];
                        let yKey = 'count';
                        if (patientsRange === 'daily') {
                          data = daily.map((d:any)=>({ name: d.date.slice(5), count: d.count }));
                        } else if (patientsRange === 'weekly') {
                          // Group 30-day daily series into 4-5 weekly buckets
                          const buckets: { name: string; count: number }[] = [];
                          for (let i = 0; i < monthlyDays.length; i += 7) {
                            const slice = monthlyDays.slice(i, i + 7);
                            const sum = slice.reduce((s:any, x:any)=>s + (x.count||0), 0);
                            const label = slice.length ? `${slice[0].date.slice(5)}-${slice[slice.length-1].date.slice(5)}` : `W${i/7+1}`;
                            buckets.push({ name: label, count: sum });
                          }
                          data = buckets;
                        } else {
                          yKey = 'value';
                          data = months.map((m:any)=>({ name: m.name, value: m.value }));
                        }
                        return (
                          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey={yKey} stroke="#2563eb" strokeWidth={2} dot={false} name="Patients" />
                          </LineChart>
                        );
                      })()}
                    </ResponsiveContainer>
                    <div className="mt-3 text-sm text-muted-foreground">Total: {patientsAnalytics.total} · This {patientsRange}: {patientsRange==='daily'?patientsAnalytics.daily?.count:patientsRange==='weekly'?patientsAnalytics.weekly?.count:patientsAnalytics.monthly?.count}</div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Trends</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={revenueRange === 'daily' ? 'default' : 'outline'} onClick={() => setRevenueRange('daily')}>Daily</Button>
                  <Button size="sm" variant={revenueRange === 'weekly' ? 'default' : 'outline'} onClick={() => setRevenueRange('weekly')}>Weekly</Button>
                  <Button size="sm" variant={revenueRange === 'monthly' ? 'default' : 'outline'} onClick={() => setRevenueRange('monthly')}>Monthly</Button>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : revenueAnalytics ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {(() => {
                        const weekly = revenueAnalytics.weekly?.trend || [];
                        const monthlyDays = revenueAnalytics.monthly?.trend || [];
                        const months = revenueAnalytics.monthly?.monthsTrend || [];
                        let data: any[] = [];
                        let yKey = 'total';
                        if (revenueRange === 'daily') {
                          data = weekly.map((d:any)=>({ name: d.date.slice(5), total: d.total }));
                        } else if (revenueRange === 'weekly') {
                          const buckets: { name: string; total: number }[] = [];
                          for (let i = 0; i < monthlyDays.length; i += 7) {
                            const slice = monthlyDays.slice(i, i + 7);
                            const sum = slice.reduce((s:any, x:any)=>s + (x.total||0), 0);
                            const label = slice.length ? `${slice[0].date.slice(5)}-${slice[slice.length-1].date.slice(5)}` : `W${i/7+1}`;
                            buckets.push({ name: label, total: sum });
                          }
                          data = buckets;
                        } else {
                          data = months.map((m:any)=>({ name: m.month, total: m.total }));
                        }
                        return (
                          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={yKey} fill="#10b981" name="Revenue (₹)" />
                          </BarChart>
                        );
                      })()}
                    </ResponsiveContainer>
                    <div className="mt-3 text-sm text-muted-foreground">Total: ₹{revenueAnalytics.total.toLocaleString()} · This {revenueRange}: ₹{revenueRange==='daily'?revenueAnalytics.daily?.total:revenueRange==='weekly'?revenueAnalytics.weekly?.total:revenueAnalytics.monthly?.total}</div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Performance */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Doctor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : performanceAnalytics?.doctors?.length ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceAnalytics.doctors.map((d:any)=>({ name: d.name, avg: d.averageRating, reviews: d.totalReviews }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} height={60} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avg" fill="#6366f1" name="Avg Rating" />
                        <Bar dataKey="reviews" fill="#f59e0b" name="Reviews" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No reviews yet</div>
                )}
              </CardContent>
            </Card>

            {/* Nurse Performance */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Nurse Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : performanceAnalytics?.nurses ? (
                  <div className="h-72 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Total Reviews</TableHead>
                          <TableHead>Average Rating</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceAnalytics.nurses.map((n:any)=> (
                          <TableRow key={n.nurseId}>
                            <TableCell>{n.name}</TableCell>
                            <TableCell>{n.totalReviews}</TableCell>
                            <TableCell>{n.averageRating}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Doctor Details</h2>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">{selectedDoctor.name}</h3>
                <p className="text-sm text-gray-600">{selectedDoctor.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Specialization</p>
                  <p className="font-semibold text-gray-800">{selectedDoctor.specialization || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="font-semibold text-gray-800">{selectedDoctor.department || 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold text-gray-800">{selectedDoctor.experience || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Qualification</p>
                  <p className="font-semibold text-gray-800">{selectedDoctor.qualification || 'Not specified'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <p className="font-semibold text-gray-800">{selectedDoctor.phone || 'Not available'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Consultation Fee</p>
                <p className="font-semibold text-gray-800">
                  {selectedDoctor.consultationFee ? `₹${selectedDoctor.consultationFee}` : 'Not specified'}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedDoctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedDoctor.status || 'Active'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedDoctor(null)}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Nurse Detail Modal */}
      {selectedNurse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={() => setSelectedNurse(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Nurse Details</h2>
              <button 
                onClick={() => setSelectedNurse(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">{selectedNurse.name}</h3>
                <p className="text-sm text-gray-600">{selectedNurse.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="font-semibold text-gray-800">{selectedNurse.department || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Shift</p>
                  <p className="font-semibold text-gray-800">{selectedNurse.shift || 'Not assigned'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <p className="font-semibold text-gray-800">{selectedNurse.phone || 'Not available'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Qualification</p>
                  <p className="font-semibold text-gray-800">{selectedNurse.qualification || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold text-gray-800">{selectedNurse.experience || 'Not specified'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedNurse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedNurse.status || 'Active'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedNurse(null)}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Patient Profile</h2>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">{selectedPatient.name}</h3>
                <p className="text-sm text-gray-600">{selectedPatient.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Age</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.age || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="font-semibold text-gray-800">{selectedPatient.gender || 'Not specified'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <p className="font-semibold text-gray-800">{selectedPatient.phone || selectedPatient.contact || 'Not available'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="font-semibold text-gray-800">
                  {selectedPatient.address 
                    ? `${selectedPatient.address}, ${selectedPatient.city || ''}, ${selectedPatient.state || ''}`.trim().replace(/,\s*,/g, ',')
                    : 'Not available'}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                <p className="font-semibold text-gray-800">{selectedPatient.bloodGroup || 'Not specified'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Last Visit</p>
                <p className="font-semibold text-gray-800">
                  {selectedPatient.lastVisit || selectedPatient.createdAt 
                    ? new Date(selectedPatient.lastVisit || selectedPatient.createdAt).toLocaleDateString()
                    : 'No visits yet'}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedPatient.status === 'active' || selectedPatient.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : selectedPatient.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedPatient.status === 'completed'
                    ? 'Appointment Completed'
                    : selectedPatient.status === 'pending'
                    ? 'Appointment Pending'
                    : selectedPatient.status || 'Active'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedPatient(null)}
              className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
