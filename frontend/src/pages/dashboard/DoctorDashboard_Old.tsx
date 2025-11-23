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
  User
} from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Mock Data
  const stats = [
    {
      title: "Today's Appointments",
      value: '12',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Patients',
      value: '234',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Prescriptions',
      value: '8',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Video Consultations',
      value: '3',
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const appointments = [
    {
      id: 1,
      patient: 'Arjun Menon',
      time: '09:00 AM',
      reason: 'Regular Checkup',
      status: 'Scheduled',
      type: 'In-person',
    },
    {
      id: 2,
      patient: 'Deepa Iyer',
      time: '10:30 AM',
      reason: 'Follow-up - Hypertension',
      status: 'In Progress',
      type: 'In-person',
    },
    {
      id: 3,
      patient: 'Vikram Singh',
      time: '02:00 PM',
      reason: 'Video Consultation',
      status: 'Scheduled',
      type: 'Video',
    },
    {
      id: 4,
      patient: 'Priya Sharma',
      time: '03:30 PM',
      reason: 'Cardiac Consultation',
      status: 'Scheduled',
      type: 'In-person',
    },
  ];

  const patients = [
    {
      id: 1,
      name: 'Arjun Menon',
      age: 45,
      gender: 'Male',
      lastVisit: '2025-10-25',
      diagnosis: 'Hypertension',
      contact: '+91 98765 11111',
      bloodType: 'O+',
      allergies: 'Penicillin',
    },
    {
      id: 2,
      name: 'Deepa Iyer',
      age: 32,
      gender: 'Female',
      lastVisit: '2025-10-26',
      diagnosis: 'Diabetes Type 2',
      contact: '+91 98765 11112',
      bloodType: 'A+',
      allergies: 'None',
    },
    {
      id: 3,
      name: 'Vikram Singh',
      age: 28,
      gender: 'Male',
      lastVisit: '2025-10-20',
      diagnosis: 'Common Cold',
      contact: '+91 98765 11113',
      bloodType: 'B+',
      allergies: 'Aspirin',
    },
  ];

  const prescriptions = [
    {
      id: 1,
      patient: 'Arjun Menon',
      medication: 'Lisinopril 10mg',
      dosage: '1 tablet daily',
      duration: '30 days',
      date: '2025-10-25',
      status: 'Active',
    },
    {
      id: 2,
      patient: 'Deepa Iyer',
      medication: 'Metformin 500mg',
      dosage: '2 tablets daily',
      duration: '90 days',
      date: '2025-10-26',
      status: 'Active',
    },
    {
      id: 3,
      patient: 'Vikram Singh',
      medication: 'Amoxicillin 500mg',
      dosage: '3 times daily',
      duration: '7 days',
      date: '2025-10-20',
      status: 'Expired',
    },
  ];

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setIsViewPatientOpen(true);
  };

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
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
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
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{apt.patient}</p>
                        <p className="text-sm text-muted-foreground">{apt.reason}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={apt.status === 'In Progress' ? 'default' : 'secondary'}>
                          {apt.time}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{apt.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => setActiveTab('appointments')}>
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
                      <p className="font-medium">8 Prescriptions Pending</p>
                      <p className="text-sm text-muted-foreground">Review and sign prescriptions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">5 Patient Reports</p>
                      <p className="text-sm text-muted-foreground">Review lab test results</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-purple-50">
                    <Video className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium">3 Video Consultations</p>
                      <p className="text-sm text-muted-foreground">Scheduled for today</p>
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
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.patient}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>{apt.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{apt.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apt.status === 'In Progress' ? 'default' : 'secondary'}>
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewPatient(patients[0])}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="default">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.diagnosis}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleViewPatient(patient)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <DialogDescription>Detailed medical history and records</DialogDescription>
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
                      <p className="font-medium">{selectedPatient.age} / {selectedPatient.gender}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Blood Type</Label>
                      <p className="font-medium">{selectedPatient.bloodType}</p>
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
                      <p className="font-medium text-red-600">{selectedPatient.allergies}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Medical History</Label>
                    <div className="p-3 border rounded-lg text-sm text-muted-foreground">
                      <p>• Previous visits and treatments will be displayed here</p>
                      <p>• Lab results and diagnostic reports</p>
                      <p>• Prescription history</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsViewPatientOpen(false)}>Close</Button>
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
                    <div className="space-y-4">
                      <div>
                        <Label>Select Patient</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Medication Name</Label>
                        <Input placeholder="e.g., Amoxicillin" />
                      </div>
                      <div>
                        <Label>Dosage</Label>
                        <Input placeholder="e.g., 500mg twice daily" />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input placeholder="e.g., 7 days" />
                      </div>
                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea placeholder="Special instructions..." rows={3} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddPrescriptionOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsAddPrescriptionOpen(false)}>
                          <Pill className="h-4 w-4 mr-2" />
                          Create Prescription
                        </Button>
                      </div>
                    </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIDEO CONSULTATION TAB */}
        <TabsContent value="consultation" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Video className="h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Video Consultation Platform</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Conduct secure video consultations with your patients. Integration with video SDK coming soon.
                </p>
                <div className="flex gap-3">
                  <Button size="lg">
                    <Video className="h-5 w-5 mr-2" />
                    Start Consultation
                  </Button>
                  <Button size="lg" variant="outline">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Upcoming Video Consultations</h4>
                <div className="space-y-2">
                  {appointments
                    .filter((apt) => apt.type === 'Video')
                    .map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{apt.patient}</p>
                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge>{apt.time}</Badge>
                          <Button size="sm">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
