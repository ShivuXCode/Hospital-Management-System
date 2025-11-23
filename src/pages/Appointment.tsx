import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Loader2 } from 'lucide-react';
import { generateDepartmentDoctors } from '@/utils/departmentDoctors';

interface Doctor {
  id: string;
  name: string;
  department: string;
  available: boolean;
  qualification?: string;
  experience?: string;
  rating?: string;
}

const Appointment = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    message: '',
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get unique departments from doctors list
  const departments = Array.from(new Set(doctors.map((d) => d.department))).sort();

  // Get available doctors filtered by department
  const getAvailableDoctors = () => {
    return doctors.filter((doc) => doc.available);
  };

  const getFilteredDoctors = () => {
    if (!formData.department) return [];
    return doctors.filter(
      (doc) => doc.available && doc.department === formData.department
    );
  };

  // Load doctors from API or generated data
  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        // Generate department-based doctors first
        const departmentDoctors = generateDepartmentDoctors();

        // Try to fetch from backend API
        const res = await apiService.getDoctors();
        if (res && res.success && res.doctors && res.doctors.length > 0) {
          // Map backend doctors
          const backendDoctorsByDept = new Map();
          res.doctors.forEach((doc: any) => {
            const dept = doc.specialization || doc.specialty || doc.department;
            if (dept && !backendDoctorsByDept.has(dept)) {
              backendDoctorsByDept.set(dept, {
                id: doc._id || doc.id,
                name: doc.name,
                department: dept,
                available: doc.availability !== 'Unavailable',
                qualification: doc.qualification || 'MBBS, MD',
                experience: doc.experience || '5+ years',
                rating: doc.rating || '4.5',
              });
            }
          });

          // Merge: Use backend doctors where available, fill gaps with generated
          const mergedDoctors = departmentDoctors.map((genDoc) => {
            const backendDoc = backendDoctorsByDept.get(genDoc.department);
            return backendDoc || {
              id: genDoc.id,
              name: genDoc.name,
              department: genDoc.department,
              available: genDoc.available,
              qualification: genDoc.qualification,
              experience: genDoc.experience,
              rating: genDoc.rating,
            };
          });

          setDoctors(mergedDoctors);
        } else {
          // Use generated doctors
          setDoctors(
            departmentDoctors.map((doc) => ({
              id: doc.id,
              name: doc.name,
              department: doc.department,
              available: doc.available,
              qualification: doc.qualification,
              experience: doc.experience,
              rating: doc.rating,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load doctors, using generated data', err);
        // Fallback to generated doctors
        const departmentDoctors = generateDepartmentDoctors();
        setDoctors(
          departmentDoctors.map((doc) => ({
            id: doc.id,
            name: doc.name,
            department: doc.department,
            available: doc.available,
            qualification: doc.qualification,
            experience: doc.experience,
            rating: doc.rating,
          }))
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If not logged in show login modal (do not submit)
    if (!apiService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    (async () => {
      const valid = await apiService.validateAuth();
      if (!valid) {
        // Treat invalid token as not logged in
        setShowLoginModal(true);
        return;
      }

      // Submit appointment to backend
      try {
        const payload = {
          doctorName: formData.doctor,
          patientName: formData.name,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          reason: formData.message,
        };
        const res = await apiService.createAppointment(payload);
        if (res && res.success) {
          toast({ title: 'Appointment booked', description: 'We will contact you shortly to confirm.' });
          setFormData({
            name: '',
            email: '',
            phone: '',
            department: '',
            doctor: '',
            date: '',
            time: '',
            message: '',
          });
          // navigate to a confirmation or dashboard if desired
        } else {
          toast({ title: 'Unable to book', description: res?.message || 'Please try again.' });
        }
      } catch (err) {
        console.error('Appointment submit error', err);
        toast({ title: 'Error', description: 'Failed to book appointment.' });
      }
    })();
  };

  // Prefill doctor if passed via query param or navigation state
  useEffect(() => {
    if (doctors.length === 0) return; // Wait for doctors to load

    const params = new URLSearchParams(location.search);
    const doctorParam = params.get('doctor');

    const state = (location && (location as any).state) || {};
    const selectedDoctor = doctorParam || state.doctor;

    if (selectedDoctor) {
      // Find the doctor in the loaded doctors list
      const foundDoctor = doctors.find((doc) => doc.name === selectedDoctor);
      if (foundDoctor) {
        setFormData((f) => ({
          ...f,
          doctor: foundDoctor.name,
          department: foundDoctor.department,
        }));
      }
    }
  }, [location, doctors]);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('appointment.title')}</h1>
          <p className="text-xl text-muted-foreground">
            Schedule your consultation with our expert doctors
          </p>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="text-2xl">{t('appointment.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.name')} *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.email')} *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('appointment.phone')} *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* Department & Doctor */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.doctor')} *
                    </label>
                    <Select
                      value={formData.doctor}
                      onValueChange={(value) => {
                        // Find the selected doctor and auto-fill department
                        const selectedDoc = doctors.find((doc) => doc.name === value);
                        if (selectedDoc) {
                          setFormData({
                            ...formData,
                            doctor: value,
                            department: selectedDoc.department,
                          });
                        }
                      }}
                      disabled={loadingDoctors}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingDoctors ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : getAvailableDoctors().length > 0 ? (
                          getAvailableDoctors().map((doc) => (
                            <SelectItem key={doc.id} value={doc.name}>
                              {doc.name} — {doc.department}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-2 px-2 text-sm text-muted-foreground">
                            No doctors available for booking at the moment
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.department')} *
                    </label>
                    <Input
                      value={formData.department}
                      readOnly
                      placeholder="Auto-filled based on doctor"
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.date')} *
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.time')} *
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('appointment.message')}
                  </label>
                  <Textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Any specific concerns or symptoms..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gradient-primary">
                  {t('appointment.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Login required modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Please login to continue</DialogTitle>
            <DialogDescription>
              You need to be logged in to book an appointment.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <div className="flex gap-2 justify-end w-full">
              <Button variant="ghost" onClick={() => setShowLoginModal(false)}>Cancel</Button>
              <Button className="gradient-primary" onClick={() => navigate('/login')}>Login Now</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointment;
