import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

const NurseAppointmentsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const load = async () => {
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

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id: string) => {
    try {
      const res = await apiService.nurseConfirmAppointment(id);
      if (res.success) {
        toast({ title: 'Appointment confirmed', description: 'Patient has been notified.' });
        load();
      } else {
        toast({ title: 'Error', description: res.message || 'Unable to confirm', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Unable to confirm appointment', variant: 'destructive' });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Rescheduled': return 'bg-purple-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage assigned doctors' appointments</p>
        </div>
        <Button variant="outline" onClick={load}>
          <Calendar className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm mt-1">Your assigned doctors' appointments will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((apt) => (
                <Card key={apt._id} className="shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{apt.patientName}</span>
                          <span className="text-xs text-muted-foreground">with Dr. {apt.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(apt.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {apt.time}</div>
                        </div>
                        {apt.reason && (
                          <div className="text-sm text-muted-foreground">Reason: {apt.reason}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColor(apt.status)}>{apt.status}</Badge>
                        {apt.status === 'Pending' && (
                          <Button size="sm" onClick={() => handleConfirm(apt._id)}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseAppointmentsPage;
