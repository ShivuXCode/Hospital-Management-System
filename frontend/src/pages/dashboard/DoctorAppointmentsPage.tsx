import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, Clock, Search, Eye, CheckCircle, Video, Building2, Loader2, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { apiService } from '@/services/api';

const DoctorAppointmentsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching doctor appointments...');
      const data = await apiService.getAppointments();
      if (data.success) {
        const normalized = (data.appointments || []).map((apt) => ({
          ...apt,
          patientId: apt.user?._id || apt.user || apt.patientId,
        }));
        setAppointments(normalized);
        console.log(`✅ Loaded ${data.appointments?.length || 0} appointments`);
      } else {
        console.error('❌ Failed to load appointments:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (appointment: any) => {
    // Set the selected patient with appointment info
    setSelectedPatient({
      name: appointment.patientName,
      email: appointment.patientEmail,
      phone: appointment.patientPhone || 'N/A',
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      consultationType: appointment.consultationType,
      reason: appointment.reason || 'General consultation',
    });
    setIsPatientModalOpen(true);
  };

  const handlePrescribe = (appointment: any) => {
    const patientId = appointment.user?._id || appointment.user || appointment.patientId;
    console.log('🔄 Navigating to prescription page with patient:', {
      name: appointment.patientName,
      email: appointment.patientEmail,
      id: patientId,
    });

    navigate('/dashboard/doctor/prescriptions', {
      state: {
        patientId,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
      },
    });
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const res = await apiService.updateAppointment(appointmentId, { status: 'Completed' });
      if (res.success) {
        toast({
          title: 'Updated',
          description: 'Appointment marked as completed',
        });
        fetchAppointments();
      } else {
        toast({
          title: 'Error',
          description: res.message || 'Failed to update status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete appointment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      Scheduled: { variant: 'default', color: 'bg-blue-100 text-blue-700' },
      Completed: { variant: 'secondary', color: 'bg-green-100 text-green-700' },
      Cancelled: { variant: 'destructive', color: 'bg-red-100 text-red-700' },
      Pending: { variant: 'outline', color: 'bg-yellow-100 text-yellow-700' },
    };
    const config = statusMap[status] || statusMap.Pending;
    return <Badge className={config.color}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAppointments}>
            <Calendar className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            All Appointments
          </CardTitle>
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
              <p className="text-sm mt-1">Your appointments will appear here</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{apt.patientName}</p>
                            <p className="text-xs text-muted-foreground">{apt.patientEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(apt.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">{apt.time}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {apt.consultationType === 'video' ? (
                            <>
                              <Video className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">Video</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Physical</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{apt.reason || 'General consultation'}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPatient(apt)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePrescribe(apt)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Prescribe
                          </Button>
                          {apt.status === 'Pending' || apt.status === 'Scheduled' ? (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteAppointment(apt._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Details
            </DialogTitle>
            <DialogDescription>
              View complete information about the patient and appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6 py-4">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedPatient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedPatient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Consultation Type</p>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedPatient.consultationType === 'video' ? (
                          <>
                            <Video className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-600">Video Consultation</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">Physical Consultation</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-600">Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedPatient.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-600">Time</p>
                      <p className="font-medium text-gray-900">{selectedPatient.appointmentTime}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium mb-2">Reason for Visit</p>
                  <p className="text-gray-900">{selectedPatient.reason}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsPatientModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointmentsPage;
