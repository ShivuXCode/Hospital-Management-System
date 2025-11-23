import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Users,
  FileText,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Plus,
  Activity,
  Pill,
  AlertCircle,
  Stethoscope,
  User,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle tab changes from sidebar navigation
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Real data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingPrescriptions: 0,
    videoConsultations: 0,
  });

  // Prescription form
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    duration: '',
    notes: '',
  });

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchStats();
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'patients') fetchPatients();
    if (activeTab === 'prescriptions') fetchPrescriptions();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const today = new Date().toDateString();
        const todayAppts = data.appointments?.filter((apt: any) => 
          new Date(apt.date).toDateString() === today
        ) || [];
        
        setStats({
          todayAppointments: todayAppts.length,
          totalPatients: 0, // Will be updated when patients API is ready
          pendingPrescriptions: 0, // Will be updated when prescriptions API is ready
          videoConsultations: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Placeholder - implement when patients API is ready
      setPatients([]);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // Placeholder - implement when prescriptions API is ready
      setPrescriptions([]);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Implement prescription creation API call
      toast({
        title: 'Success',
        description: 'Prescription created successfully',
      });
      setIsAddPrescriptionOpen(false);
      setPrescriptionForm({
        patientId: '',
        medication: '',
        dosage: '',
        duration: '',
        notes: '',
      });
      fetchPrescriptions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      // Implement appointment completion API call
      toast({
        title: 'Success',
        description: 'Appointment marked as completed',
      });
      fetchAppointments();
      fetchStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete appointment',
        variant: 'destructive',
      });
    }
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setIsViewPatientOpen(true);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Manage Appointments & Patient Care</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patient Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="consultation">Video Consult</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Appointments
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Prescriptions
                </CardTitle>
                <div className="p-2 rounded-lg bg-orange-100">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPrescriptions}</div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Video Consultations
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-100">
                  <Video className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.videoConsultations}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((apt) => (
                      <div key={apt._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.reason || 'General consultation'}</p>
                        </div>
                        <div className="text-right">
                          <Badge>{new Date(apt.date).toLocaleDateString()}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{apt.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => setActiveTab('appointments')}
                >
                  View All Appointments
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium">{stats.pendingPrescriptions} Prescriptions Pending</p>
                      <p className="text-sm text-muted-foreground">Review and sign prescriptions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Patient Reports</p>
                      <p className="text-sm text-muted-foreground">Review lab test results</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-purple-50">
                    <Video className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium">{stats.videoConsultations} Video Consultations</p>
                      <p className="text-sm text-muted-foreground">Scheduled consultations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Symptom Checker (Quick Access)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center">
                  <Stethoscope className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-3">AI-powered symptom analysis tool</p>
                  <Button>Open Symptom Checker</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPOINTMENTS TAB */}
        <TabsContent value="appointments" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Appointments</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No appointments found</p>
                  <p className="text-sm mt-1">Appointments will appear here once scheduled</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt._id}>
                        <TableCell className="font-medium">{apt.patientName}</TableCell>
                        <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell>{apt.reason || '-'}</TableCell>
                        <TableCell>{apt.email}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleCompleteAppointment(apt._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
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

        {/* PATIENT RECORDS TAB */}
        <TabsContent value="patients" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name or ID..."
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
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No patient records found</p>
                  <p className="text-sm mt-1">Patient records will appear here after consultations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.lastVisit}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.diagnosis}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPatient(patient)}
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

          {/* Patient Profile Dialog */}
          <Dialog open={isViewPatientOpen} onOpenChange={setIsViewPatientOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Profile
                </DialogTitle>
                <DialogDescription>Detailed medical history and records (Read-only)</DialogDescription>
              </DialogHeader>
              {selectedPatient && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Age / Gender</Label>
                      <p className="font-medium">
                        {selectedPatient.age} / {selectedPatient.gender}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Blood Type</Label>
                      <p className="font-medium">{selectedPatient.bloodType || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact</Label>
                      <p className="font-medium text-sm">{selectedPatient.contact}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Current Diagnosis</Label>
                      <Badge className="mt-1">{selectedPatient.diagnosis}</Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Allergies</Label>
                      <p className="font-medium text-red-600">{selectedPatient.allergies || 'None'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Medical History</Label>
                    <div className="p-3 border rounded-lg text-sm text-muted-foreground">
                      <p>Medical history and previous treatments will be displayed here</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsViewPatientOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* PRESCRIPTIONS TAB */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prescriptions Management</CardTitle>
                <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Prescription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Prescription</DialogTitle>
                      <DialogDescription>Add medication details for the patient</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPrescription} className="space-y-4">
                      <div>
                        <Label>Select Patient *</Label>
                        <Select
                          value={prescriptionForm.patientId}
                          onValueChange={(value) =>
                            setPrescriptionForm({ ...prescriptionForm, patientId: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Medication Name *</Label>
                        <Input
                          placeholder="e.g., Amoxicillin"
                          value={prescriptionForm.medication}
                          onChange={(e) =>
                            setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Dosage *</Label>
                        <Input
                          placeholder="e.g., 500mg twice daily"
                          value={prescriptionForm.dosage}
                          onChange={(e) =>
                            setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Duration *</Label>
                        <Input
                          placeholder="e.g., 7 days"
                          value={prescriptionForm.duration}
                          onChange={(e) =>
                            setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea
                          placeholder="Special instructions..."
                          rows={3}
                          value={prescriptionForm.notes}
                          onChange={(e) =>
                            setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddPrescriptionOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Pill className="h-4 w-4 mr-2" />
                              Create Prescription
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input placeholder="Search prescriptions..." className="flex-1" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Pill className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No prescriptions found</p>
                  <p className="text-sm mt-1">Create your first prescription to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((rx) => (
                      <TableRow key={rx.id}>
                        <TableCell className="font-medium">{rx.patient}</TableCell>
                        <TableCell>{rx.medication}</TableCell>
                        <TableCell>{rx.dosage}</TableCell>
                        <TableCell>{rx.duration}</TableCell>
                        <TableCell>{rx.date}</TableCell>
                        <TableCell>
                          <Badge variant={rx.status === 'Active' ? 'default' : 'secondary'}>
                            {rx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
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

        {/* VIDEO CONSULTATION TAB */}
        <TabsContent value="consultation" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Consultation Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Video className="h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Video Consultation</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Conduct secure video consultations with your patients. Integration with video SDK coming
                  soon.
                </p>
                <div className="flex gap-3">
                  <Button size="lg" disabled>
                    <Video className="h-5 w-5 mr-2" />
                    Start Consultation
                  </Button>
                  <Button size="lg" variant="outline" disabled>
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </div>

              {appointments.filter((apt) => apt.type === 'Video').length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Upcoming Video Consultations</h4>
                  <div className="space-y-2">
                    {appointments
                      .filter((apt) => apt.type === 'Video')
                      .map((apt) => (
                        <div
                          key={apt._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.reason || 'Video consultation'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge>{apt.time}</Badge>
                            <Button size="sm" disabled>
                              <Video className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
