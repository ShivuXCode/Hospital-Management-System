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
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
  Loader2,
  Send,
  Mail,
  MailOpen,
  AlertTriangle,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL, apiService } from '@/services/api';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Top tabs removed; keep dashboard as default view and use sidebar routes for navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Real data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]); // inbox (unused in new multi-role UI but kept for stats)
  const [assignedNurse, setAssignedNurse] = useState<any>(null); // retained for other sections
  // Multi-role messaging states
  const [participants, setParticipants] = useState<{ nurses: any[]; patients: any[]; admins: any[] }>({ nurses: [], patients: [], admins: [] });
  const [activeRoleFilter, setActiveRoleFilter] = useState<'nurses' | 'patients' | 'admins'>('nurses');
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<{ id?: string; averageRating?: number; reviewCount?: number; consultationTypes?: string[] }>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingPrescriptions: 0,
    videoConsultations: 0,
    unreadMessages: 0,
  });

  // Prescription form
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    duration: '',
    notes: '',
  });

  // Message form
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: '', message: '', priority: 'normal', relatedAppointment: '' });

  // Fetch data on mount and tab change
  useEffect(() => {
    // allow deep-linking from a route that passes { state: { tab: 'messages' } }
    const target = (location.state as any)?.tab;
    if (target && typeof target === 'string') {
      setActiveTab(target);
    }
    fetchStats();
    fetchDoctorAndReviews();
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'patients') fetchPatients();
    if (activeTab === 'prescriptions') fetchPrescriptions();
    if (activeTab === 'messages') {
      fetchParticipants();
      if (selectedParticipant) fetchConversation(selectedParticipant._id);
    }
  }, [activeTab]);
  // Poll conversation when messages tab active and participant selected
  useEffect(() => {
    if (activeTab !== 'messages' || !selectedParticipant) return;
    const interval = setInterval(() => {
      fetchConversation(selectedParticipant._id);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab, selectedParticipant]);

  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/messages/participants`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || { nurses: [], patients: [], admins: [] });
        // Auto-select first available participant if none selected
        if (!selectedParticipant) {
          const first = data.participants.nurses[0] || data.participants.patients[0] || data.participants.admins[0];
          if (first) setSelectedParticipant(first);
        }
      }
    } catch (e) {
      console.error('Failed to load participants', e);
    }
  };

  const fetchConversation = async (userId: string) => {
    setConversationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/messages/conversation/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setConversation(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load conversation', e);
    } finally {
      setConversationLoading(false);
    }
  };

  // Poll messages when messages tab is active for near real-time updates
  useEffect(() => {
    if (activeTab !== 'messages') return;
    const interval = setInterval(() => {
      fetchMessages();
    }, 6000); // 6s interval for responsiveness without excessive load
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch appointments
      const appointmentsRes = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appointmentsData = await appointmentsRes.json();
      
      // Fetch patients
      const patientsRes = await fetch(`${API_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const patientsData = await patientsRes.json();
      
      // Fetch prescriptions
      const prescriptionsRes = await fetch(`${API_URL}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prescriptionsData = await prescriptionsRes.json();
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayAppts = appointmentsData.appointments?.filter((apt: any) => 
        new Date(apt.date).toDateString() === today
      ) || [];
      
      const uniquePatients = new Set(
        (appointmentsData.appointments || []).map((apt: any) => apt.patientEmail || apt.patientName)
      ).size;
      
      // Count completed appointments without prescriptions
      const completedAppointments = (appointmentsData.appointments || []).filter(
        (apt: any) => apt.status === 'Completed'
      );
      
      const prescribedPatients = new Set(
        (prescriptionsData.prescriptions || []).map((rx: any) => rx.patientEmail || rx.patient?.email)
      );
      
      const pendingPrescriptions = completedAppointments.filter(
        (apt: any) => !prescribedPatients.has(apt.patientEmail || apt.email)
      ).length;
      
      setStats({
        todayAppointments: todayAppts.length,
        totalPatients: patientsData.patients?.length || uniquePatients,
        pendingPrescriptions: pendingPrescriptions,
        videoConsultations: 0,
        unreadMessages: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/appointments`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAndReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/doctors/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.doctor) {
        if (data.doctor.assignedNurse) setAssignedNurse(data.doctor.assignedNurse);
        const info = {
          id: data.doctor._id || data.doctor.id,
          averageRating: typeof data.doctor.averageRating === 'number' ? data.doctor.averageRating : 0,
          reviewCount: typeof data.doctor.reviewCount === 'number' ? data.doctor.reviewCount : 0,
          consultationTypes: data.doctor.consultationTypes || ['physical'],
        };
        setDoctorInfo(info);
        if (info.id) {
          setReviewsLoading(true);
          try {
            const revRes = await apiService.getDoctorReviews(info.id);
            if (revRes.success) {
              setReviews(revRes.reviews || []);
            } else {
              setReviews([]);
            }
          } catch (err) {
            console.error('Failed to load reviews', err);
            setReviews([]);
          } finally {
            setReviewsLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };

  // Legacy stats inbox fetch (retain unread counts)
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setStats(prev => ({ ...prev, unreadMessages: data.unreadCount || 0 }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      const res = await apiService.updateAppointment(appointmentId, { status: 'Completed' });
      if (res.success) {
        toast({ title: 'Success', description: 'Appointment marked as completed' });
        fetchAppointments();
        fetchStats();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to complete appointment', variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete appointment',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) {
      toast({ title: 'Select recipient', description: 'Choose a participant', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedParticipant._id,
          subject: messageForm.subject,
          message: messageForm.message,
          priority: messageForm.priority,
          relatedAppointment: messageForm.relatedAppointment || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Message sent to nurse successfully',
        });
        setIsSendMessageOpen(false);
        setMessageForm({
          subject: '',
          message: '',
          priority: 'normal',
          relatedAppointment: '',
        });
        fetchConversation(selectedParticipant._id);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/messages/${messageId}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (selectedParticipant) fetchConversation(selectedParticipant._id);
    } catch (error) {
      console.error('Error marking message as read:', error);
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
                  Total Reviews
                </CardTitle>
                <div className="p-2 rounded-lg bg-amber-100">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctorInfo.reviewCount || 0}</div>
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
                  {(doctorInfo.consultationTypes?.includes('video') || doctorInfo.consultationTypes?.includes('both')) && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-purple-50">
                      <Video className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium">{stats.videoConsultations} Video Consultations</p>
                        <p className="text-sm text-muted-foreground">Scheduled consultations</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Patient Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-semibold">{(doctorInfo.averageRating || 0).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/ 5</span>
                    </span>
                    <Badge variant="outline">{doctorInfo.reviewCount || 0} review{doctorInfo.reviewCount === 1 ? '' : 's'}</Badge>
                  </div>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.slice(0,5).map((rev: any) => (
                        <div key={rev._id || rev.id} className="border rounded-md p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-4 w-4 fill-amber-400" />
                              <span className="font-medium">{rev.rating}</span>
                              <span className="text-xs text-muted-foreground">/5</span>
                            </div>
                            {rev.createdAt && (
                              <span className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          {rev.comment && <p className="text-muted-foreground mb-1">{rev.comment}</p>}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {rev.patient?.name && <span>Patient: {rev.patient.name}</span>}
                            {rev.appointment && rev.appointment.date && (
                              <span>Appointment: {rev.appointment.date}{rev.appointment.time ? ` ${rev.appointment.time}` : ''}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {reviews.length > 5 && (
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('reviews')}>
                          View All Reviews
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                      <TableHead>Status</TableHead>
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
                        <TableCell>
                          <Badge variant={apt.status === 'Completed' ? 'secondary' : 'outline'}>
                            {apt.status || 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedPatient({
                                name: apt.patientName,
                                email: apt.email,
                                phone: apt.phone,
                                date: apt.date,
                                time: apt.time,
                                reason: apt.reason,
                                status: apt.status
                              });
                              setIsViewPatientOpen(true);
                            }}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate('/dashboard/doctor/prescriptions', { 
                                state: { patientName: apt.patientName, patientEmail: apt.email } 
                              })}
                            >
                              <Pill className="h-4 w-4 mr-1" />
                              Prescribe
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              disabled={apt.status === 'Completed'}
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
                  Patient Details
                </DialogTitle>
                <DialogDescription>Appointment and patient information</DialogDescription>
              </DialogHeader>
              {selectedPatient && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-muted-foreground">Patient Name</Label>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium text-sm">{selectedPatient.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedPatient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Appointment Date</Label>
                      <p className="font-medium">{selectedPatient.date ? new Date(selectedPatient.date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Appointment Time</Label>
                      <p className="font-medium">{selectedPatient.time || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className="mt-1">{selectedPatient.status || 'Scheduled'}</Badge>
                    </div>
                  </div>
                  {selectedPatient.reason && (
                    <div className="space-y-2">
                      <Label>Reason for Visit</Label>
                      <div className="p-3 border rounded-lg text-sm">
                        <p>{selectedPatient.reason}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsViewPatientOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setIsViewPatientOpen(false);
                      navigate('/dashboard/doctor/prescriptions', { 
                        state: { patientName: selectedPatient.name, patientEmail: selectedPatient.email } 
                      });
                    }}>
                      <Pill className="h-4 w-4 mr-2" />
                      Create Prescription
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

        {/* MESSAGES TAB */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Participants List */}
            <Card className="shadow-soft lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {(['nurses','patients','admins'] as const).map(role => (
                    <Button key={role} size="sm" variant={activeRoleFilter===role ? 'default':'outline'} onClick={()=>setActiveRoleFilter(role)}>{role.charAt(0).toUpperCase()+role.slice(1)}</Button>
                  ))}
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {participants[activeRoleFilter].length === 0 ? (
                    <p className="text-sm text-muted-foreground">No {activeRoleFilter} available</p>
                  ) : (
                    participants[activeRoleFilter].map(p => (
                      <button
                        key={p._id}
                        onClick={() => { setSelectedParticipant(p); fetchConversation(p._id); }}
                        className={`w-full text-left p-3 border rounded-md hover:bg-muted transition-colors ${selectedParticipant?._id===p._id ? 'bg-muted' : ''}`}
                      >
                        <div className="font-medium flex items-center justify-between">
                          <span>{p.name}</span>
                          <Badge variant="outline" className="text-xs">{p.role}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Conversation Panel */}
            <Card className="shadow-soft lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <MailOpen className="h-5 w-5" />
                  {selectedParticipant ? `Conversation with ${selectedParticipant.name}` : 'Select a participant'}
                </CardTitle>
                <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={!selectedParticipant}><Send className="h-4 w-4 mr-2"/>New Message</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Message</DialogTitle>
                      <DialogDescription>{selectedParticipant ? `To: ${selectedParticipant.name} (${selectedParticipant.role})` : 'Select a participant first'}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <Label>Subject *</Label>
                        <Input value={messageForm.subject} onChange={e=>setMessageForm({...messageForm, subject:e.target.value})} required />
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={messageForm.priority} onValueChange={v=>setMessageForm({...messageForm, priority:v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Related Appointment (optional)</Label>
                        <Select value={messageForm.relatedAppointment} onValueChange={v=>setMessageForm({...messageForm, relatedAppointment:v})}>
                          <SelectTrigger><SelectValue placeholder="Link appointment" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {appointments.map(apt => (
                              <SelectItem key={apt._id} value={apt._id}>{new Date(apt.date).toLocaleDateString()} {apt.time} - {apt.patientName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Message *</Label>
                        <Textarea rows={4} value={messageForm.message} onChange={e=>setMessageForm({...messageForm, message:e.target.value})} required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={()=>setIsSendMessageOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={!selectedParticipant || loading}>{loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Sending...</>) : (<><Send className="h-4 w-4 mr-2"/>Send</>)}</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!selectedParticipant ? (
                  <p className="text-sm text-muted-foreground">Select a participant to view messages.</p>
                ) : conversationLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                ) : conversation.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MailOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages</p>
                    <p className="text-sm mt-1">Start a conversation with {selectedParticipant.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {conversation.map(m => (
                      <div key={m._id} className={`p-3 border rounded-lg ${m.sender?._id===selectedParticipant._id ? 'bg-muted/50':'bg-background'}`}>
                        <div className="flex items-center gap-2">
                          {!m.isRead && m.recipient?._id === doctorInfo.id && <Badge variant="destructive">New</Badge>}
                          <span className="font-medium">{m.subject}</span>
                          {m.priority !== 'normal' && (<Badge variant={m.priority==='emergency'?'destructive':'default'}>{m.priority}</Badge>)}
                        </div>
                        <p className="text-xs text-muted-foreground">{m.sender?.name} • {new Date(m.createdAt).toLocaleString()}</p>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{m.message}</p>
                        {m.relatedAppointment && (
                          <p className="text-xs text-muted-foreground mt-1">Appt: {new Date(m.relatedAppointment.date).toLocaleDateString()} {m.relatedAppointment.time} - {m.relatedAppointment.patientName}</p>
                        )}
                        {!m.isRead && m.recipient?._id === doctorInfo.id && (
                          <div className="mt-2">
                            <Button size="xs" variant="outline" onClick={()=>handleMarkAsRead(m._id)}>Mark read</Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
