import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calendar, User, FileText, Lock, CheckCircle2, Edit2, UserPlus } from 'lucide-react';
import { API_URL } from '@/services/api';

const DoctorBillingPage = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [consultationFee, setConsultationFee] = useState('');
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createBillDialogOpen, setCreateBillDialogOpen] = useState(false);
  
  // Create Bill State
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newConsultationFee, setNewConsultationFee] = useState('');
  const [newBillNotes, setNewBillNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/doctor/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load appointments',
          variant: 'destructive',
        });
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

  const handleOpenDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setConsultationFee(appointment.consultationFee ? appointment.consultationFee.toString() : '');
    setNotes(appointment.consultationFeeNotes || '');
    setDialogOpen(true);
  };

  const handleSubmitFee = async () => {
    if (!selectedAppointment || !consultationFee || Number(consultationFee) < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid consultation fee',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/consultation-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          amount: Number(consultationFee),
          notes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: selectedAppointment?.consultationFeeAdded 
            ? 'Consultation fee updated successfully. Admin and patient can now see the updated fee.' 
            : 'Consultation fee added successfully. Admin and patient can now see this fee.',
        });
        setDialogOpen(false);
        fetchAppointments();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to save consultation fee',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving consultation fee:', error);
      toast({
        title: 'Error',
        description: 'Failed to save consultation fee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      none: { label: 'No Bill', variant: 'secondary' },
      draft: { label: 'Draft', variant: 'secondary' },
      pending: { label: 'Pending', variant: 'default' },
      finalized: { label: 'Finalized', variant: 'default' },
      paid: { label: 'Paid', variant: 'default' }
    };

    const config = statusConfig[status] || statusConfig.none;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fetchAvailablePatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/available-patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailablePatients(data.patients || []);
      } else {
        setAvailablePatients([]);
        toast({
          title: 'Error',
          description: data.message || 'Unable to load patients',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setAvailablePatients([]);
      toast({
        title: 'Error',
        description: 'Unable to load patients',
        variant: 'destructive'
      });
    }
  };

  const handleOpenCreateBillDialog = async () => {
    await fetchAvailablePatients();
    setSelectedPatientId('');
    setNewConsultationFee('');
    setNewBillNotes('');
    setCreateBillDialogOpen(true);
  };

  const handleCreateBill = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'Error',
        description: 'Please select a patient',
        variant: 'destructive',
      });
      return;
    }

    const selectedPatient = availablePatients.find(p => p._id === selectedPatientId);
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/create-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          consultationFee: Number(newConsultationFee) || 0,
          notes: newBillNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Bill created successfully',
        });
        setCreateBillDialogOpen(false);
        fetchAppointments();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create bill',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bill',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground mt-2">
            Add consultation fees for completed appointments
          </p>
        </div>
        <Button onClick={handleOpenCreateBillDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Added</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.consultationFeeAdded).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => !a.consultationFeeAdded).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Appointments</CardTitle>
          <CardDescription>
            Add or update consultation fees for your completed appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No completed appointments found
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{apt.patientName}</p>
                      {getStatusBadge(apt.billStatus)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(apt.date)} at {apt.time}</span>
                    </div>
                    {apt.reason && (
                      <p className="text-sm text-muted-foreground ml-7">
                        Reason: {apt.reason}
                      </p>
                    )}
                    {apt.consultationFeeAdded && (
                      <div className="flex items-center gap-2 ml-7 mt-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          Consultation Fee: ${apt.consultationFee}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.canEdit ? (
                      <Button
                        onClick={() => handleOpenDialog(apt)}
                        size="sm"
                        variant={apt.consultationFeeAdded ? 'outline' : 'default'}
                      >
                        {apt.consultationFeeAdded ? (
                          <>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Update Fee
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Add Fee
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Consultation Fee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment?.consultationFeeAdded ? 'Update' : 'Add'} Consultation Fee
            </DialogTitle>
            <DialogDescription>
              Set the consultation fee for this appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <p className="text-sm text-muted-foreground">{selectedAppointment?.patientName}</p>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <p className="text-sm text-muted-foreground">
                {selectedAppointment && formatDate(selectedAppointment.date)} at {selectedAppointment?.time}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Consultation Fee ($) *</Label>
              <Input
                id="fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this consultation"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFee} disabled={loading || !consultationFee}>
              {loading ? 'Saving...' : 'Save Fee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Bill Dialog */}
      <Dialog open={createBillDialogOpen} onOpenChange={setCreateBillDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>
              Create a manual bill for a patient you have already treated
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
                disabled={availablePatients.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={availablePatients.length === 0 ? 'No eligible patients found' : 'Select a patient'} />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availablePatients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  You can only create bills for patients you have treated. Complete an appointment to see it here.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor-consultation-fee">Consultation Fee ($)</Label>
              <Input
                id="doctor-consultation-fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount (optional)"
                value={newConsultationFee}
                onChange={(e) => setNewConsultationFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor-bill-notes">Notes (Optional)</Label>
              <Textarea
                id="doctor-bill-notes"
                placeholder="Add any notes about this bill"
                value={newBillNotes}
                onChange={(e) => setNewBillNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBill} disabled={loading || !selectedPatientId}>
              {loading ? 'Creating...' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorBillingPage;
