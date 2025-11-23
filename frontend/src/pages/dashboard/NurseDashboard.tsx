import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarCheck, Loader2, CheckCircle, User, FileText, Pill } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiService, API_URL } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NurseDashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const res = await apiService.getAppointments();
        if (res.success) setAppointments(res.appointments || []);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load appointments', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    // initial load
    load();
    // light polling to keep stats dynamic
    const id = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadPrescriptions = async () => {
      if (!mounted) return;
      setPrescriptionsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/prescriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setPrescriptions(data.prescriptions || []);
        } else {
          console.error('Failed to load prescriptions:', data.message);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setPrescriptionsLoading(false);
      }
    };
    
    loadPrescriptions();
    // Refresh prescriptions every 30 seconds
    const id = setInterval(loadPrescriptions, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const uniquePatients = useMemo(() => {
    const map = new Map<string, any>();
    for (const apt of appointments) {
      const key = apt.user?._id || `${apt.patientEmail || apt.email}`;
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          id: apt.user?._id || key,
          name: apt.user?.name || apt.patientName,
          email: apt.user?.email || apt.patientEmail || apt.email,
          phone: apt.user?.phone || apt.phone || '-',
          lastAppointment: apt.date,
        });
      } else {
        const curr = map.get(key);
        // Update last appointment if newer
        const prev = new Date(curr.lastAppointment || 0).getTime();
        const now = new Date(apt.date).getTime();
        if (now > prev) curr.lastAppointment = apt.date;
      }
    }
    return Array.from(map.values());
  }, [appointments]);

  const pendingAppointments = useMemo(() => (
    (appointments || []).filter((a) => a.status === 'Pending')
  ), [appointments]);

  const stats = [
    { title: 'Assigned Patients', value: String(uniquePatients.length), icon: Users },
    { title: 'Pending Appointments', value: String(pendingAppointments.length), icon: CalendarCheck },
  ];

  const handleConfirm = async (appointmentId: string) => {
    try {
      const res = await apiService.nurseConfirmAppointment(appointmentId);
      if (res.success) {
        toast({ title: 'Confirmed', description: 'Appointment confirmed and visible to doctor' });
        const refreshed = await apiService.getAppointments();
        if (refreshed.success) setAppointments(refreshed.appointments || []);
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to confirm appointment', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to confirm appointment', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nurse Dashboard</h1>
        <p className="text-muted-foreground">Manage patient care and vitals</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Patient Management: list of all patients assigned via doctors */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Patient Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : uniquePatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No patients found for your assigned doctors.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Appointment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniquePatients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.lastAppointment ? new Date(p.lastAppointment).toLocaleDateString() : '-'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Appointments to confirm */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" /> Appointments Awaiting Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending appointments.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAppointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="font-medium">{apt.patientName}</TableCell>
                    <TableCell>{apt.doctorName}</TableCell>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleConfirm(apt._id)}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions from assigned doctors */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Prescriptions from Assigned Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No prescriptions found from your assigned doctors.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((prescription) => (
                  <TableRow key={prescription._id}>
                    <TableCell className="font-medium">
                      {prescription.patient?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{prescription.doctorName}</TableCell>
                    <TableCell>
                      {prescription.diagnosis || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Pill className="h-4 w-4" />
                        <span>{prescription.medicines?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString() : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseDashboard;
