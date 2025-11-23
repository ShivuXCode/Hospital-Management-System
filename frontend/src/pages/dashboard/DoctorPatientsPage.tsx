import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Users, Search, Eye, Loader2, User, Phone, Mail, Calendar } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const DoctorPatientsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAppointments();
      if (!data.success) throw new Error(data.message || 'Failed to fetch');

      // Derive unique patients from the doctor's appointments
      const map = new Map<string, any>();
      (data.appointments || []).forEach((apt: any) => {
        const id = apt.user?._id || apt.patientEmail || apt.email;
        if (!id) return;
        const existing = map.get(id);
        const visitDate = apt.date ? new Date(apt.date) : null;
        const lastVisit = visitDate ? visitDate.toISOString() : existing?.lastVisit || null;
        const totalVisits = (existing?.totalVisits || 0) + 1;
        map.set(id, {
          _id: id,
          name: apt.user?.name || apt.patientName || 'Patient',
          email: apt.user?.email || apt.patientEmail || apt.email || '',
          phone: apt.phone || existing?.phone || '',
          age: existing?.age || null,
          gender: existing?.gender || null,
          bloodGroup: existing?.bloodGroup || null,
          lastVisit,
          totalVisits,
        });
      });
      setPatients(Array.from(map.values()));
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setIsViewPatientOpen(true);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Patient Records</h1>
          <p className="text-muted-foreground">View and manage your patient records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPatients}>
            <Users className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Patients
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No patients found' : 'No patient records'}
              </p>
              <p className="text-sm mt-1">
                {searchTerm ? 'Try a different search term' : 'Patient records will appear here'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Total Visits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{patient.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{patient.age ? `${patient.age} years` : '-'}</p>
                        <p className="text-xs text-muted-foreground">{patient.gender || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.bloodGroup || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge>{patient.totalVisits}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewPatientOpen} onOpenChange={setIsViewPatientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete patient information and medical history</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base font-semibold">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-base font-semibold">{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="text-base font-semibold">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                  <p className="text-base font-semibold">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
                  <p className="text-base">
                    {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                  <p className="text-base font-semibold">{selectedPatient.totalVisits}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatientsPage;
