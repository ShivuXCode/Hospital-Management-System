import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
import { Calendar, Loader2, Video, Building2, Clock, Sun, Sunset } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience?: number;
  qualification?: string;
  consultationTypes?: string[];
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
  isBreak?: boolean;
}

const Appointment = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consultationType: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    message: '',
  });
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConsultationWarning, setShowConsultationWarning] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Generate time slots with 5-minute breaks after every 3 slots (breaks not visible)
  const generateTimeSlots = (): { morning: TimeSlot[], afternoon: TimeSlot[] } => {
    const morningSlots: TimeSlot[] = [];
    const afternoonSlots: TimeSlot[] = [];
    
    // Helper function to add slots with hidden breaks after every 3 slots
    const addSlotsWithBreaks = (
      slots: TimeSlot[], 
      startHour: number, 
      endHour: number, 
      endMinute: number = 60
    ) => {
      let slotCount = 0;
      let currentTime = startHour * 60; // Convert to minutes
      const endTime = endHour * 60 + (endHour === endHour ? endMinute : 0);
      
      while (currentTime < endTime) {
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;
        
        // Skip if we've reached the end condition
        if (hour === endHour && minute >= endMinute) break;
        
        // Determine AM/PM
        const isPM = hour >= 12;
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const period = isPM ? 'PM' : 'AM';
        const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        
        // Add appointment slot (booking status will be updated from backend)
        slots.push({ time, isBooked: bookedSlots.includes(time), isBreak: false });
        slotCount++;
        currentTime += 15; // Move to next 15-minute slot
        
        // Add 5-minute break after every 3 slots (but don't show it in UI)
        if (slotCount === 3) {
          slotCount = 0;
          currentTime += 5; // Add 5-minute break (hidden from UI)
        }
      }
    };
    
    // Generate morning slots: 9:00 AM - 12:45 PM
    addSlotsWithBreaks(morningSlots, 9, 13, 0); // 9:00 AM to 1:00 PM (will stop before 1:00)
    
    // Generate afternoon slots: 2:00 PM - 4:45 PM
    addSlotsWithBreaks(afternoonSlots, 14, 17, 0); // 2:00 PM to 5:00 PM (will stop before 5:00)
    
    return { morning: morningSlots, afternoon: afternoonSlots };
  };
  
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        // Redirect Admins away from Appointment page
        const role = (user?.role || '').toLowerCase();
        if (role === 'admin') {
          navigate('/');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || ''
        }));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!formData.consultationType) {
      setDoctors([]);
      return;
    }

    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        console.log(`🔄 Fetching doctors for ${formData.consultationType} consultation...`);
        
        const response = await fetch(
          `http://localhost:5002/api/doctors?consultationType=${formData.consultationType}`
        );
        
        const data = await response.json();
        
        if (data.success && data.doctors) {
          console.log(`✅ Loaded ${data.doctors.length} doctors`);
          setDoctors(data.doctors);
        } else {
          console.error('❌ Failed to load doctors');
          setDoctors([]);
        }
      } catch (err) {
        console.error('❌ Error fetching doctors:', err);
        toast({
          title: 'Error',
          description: 'Failed to load doctors. Please try again.',
          variant: 'destructive',
        });
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [formData.consultationType, toast]);

  const departments = Array.from(
    new Set(doctors.map((d) => d.specialization))
  ).sort();

  const getFilteredDoctors = () => {
    if (!formData.department) return doctors;
    return doctors.filter((doc) => doc.specialization === formData.department);
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
    setFormData({ ...formData, time });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consultationType) {
      setShowConsultationWarning(true);
      return;
    }
    
    if (!selectedTimeSlot) {
      toast({
        title: '⚠️ Select Time Slot',
        description: 'Please select a time slot for your appointment.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!apiService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    (async () => {
      const valid = await apiService.validateAuth();
      if (!valid) {
        setShowLoginModal(true);
        return;
      }

      try {
        const payload = {
          doctorName: formData.doctor,
          patientName: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          consultationType: formData.consultationType,
          date: formData.date,
          time: formData.time,
          reason: formData.message,
        };
        
        console.log('📤 Submitting appointment:', payload);
        
        const res = await apiService.createAppointment(payload);
        
        if (res && res.success) {
          toast({ 
            title: '✅ Appointment booked', 
            description: 'We will contact you shortly to confirm.' 
          });
          
          setFormData({
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            phone: '',
            consultationType: '',
            department: '',
            doctor: '',
            date: '',
            time: '',
            message: '',
          });
          setSelectedTimeSlot('');
        } else {
          toast({ 
            title: '❌ Unable to book', 
            description: res?.message || 'Please try again.',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('❌ Appointment submit error', err);
        toast({ 
          title: 'Error', 
          description: 'Failed to book appointment.',
          variant: 'destructive'
        });
      }
    })();
  };

  // Fetch booked slots when doctor and date are selected
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.doctor || !formData.date) {
        setBookedSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const response = await fetch(
          `http://localhost:5002/api/appointments/booked-slots/${encodeURIComponent(formData.doctor)}/${formData.date}`
        );
        
        const data = await response.json();
        
        if (data.success) {
          setBookedSlots(data.bookedSlots || []);
          console.log(`✅ Loaded ${data.bookedSlots?.length || 0} booked slots`);
        }
      } catch (error) {
        console.error('❌ Error fetching booked slots:', error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [formData.doctor, formData.date]);

  useEffect(() => {
    if (doctors.length === 0) return;

    const params = new URLSearchParams(location.search);
    const doctorParam = params.get('doctor');

    const state = (location && (location as any).state) || {};
    const selectedDoctor = doctorParam || state.doctor;

    if (selectedDoctor) {
      const foundDoctor = doctors.find((doc) => doc.name === selectedDoctor);
      if (foundDoctor) {
        setFormData((f) => ({
          ...f,
          doctor: foundDoctor.name,
          department: foundDoctor.specialization,
        }));
      }
    }
  }, [location, doctors]);

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('appointment.title')}</h1>
          <p className="text-xl text-muted-foreground">
            Schedule your consultation with our expert doctors
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="text-2xl">{t('appointment.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('appointment.name')} *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-muted"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground mt-1">Auto-filled from your profile</p>
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
                      className="bg-muted"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground mt-1">Auto-filled from your profile</p>
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
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium block">
                    Consultation Mode * 
                  </label>
                  <RadioGroup
                    value={formData.consultationType}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        consultationType: value,
                        doctor: '',
                        department: ''
                      });
                    }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="video"
                        id="video"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="video"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Video className="mb-3 h-6 w-6" />
                        <span className="font-medium">Video Consultation</span>
                        <span className="text-xs text-muted-foreground mt-1">Online meeting</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="physical"
                        id="physical"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="physical"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Building2 className="mb-3 h-6 w-6" />
                        <span className="font-medium">Physical Checkup</span>
                        <span className="text-xs text-muted-foreground mt-1">In-person visit</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.consultationType && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Department / Specialization *
                        </label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => {
                            setFormData({
                              ...formData,
                              department: value,
                              doctor: ''
                            });
                          }}
                          disabled={loadingDoctors || doctors.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('appointment.doctor')} *
                        </label>
                        <Select
                          value={formData.doctor}
                          onValueChange={(value) => {
                            setFormData({ ...formData, doctor: value });
                          }}
                          disabled={!formData.department || loadingDoctors}
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
                            ) : getFilteredDoctors().length > 0 ? (
                              getFilteredDoctors().map((doc) => (
                                <SelectItem key={doc._id} value={doc.name}>
                                  {doc.name}
                                  {doc.qualification && ` (${doc.qualification})`}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-2 px-2 text-sm text-muted-foreground">
                                {formData.department 
                                  ? 'No doctors available in this department'
                                  : 'Please select a department first'}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {loadingDoctors && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading doctors for {formData.consultationType} consultation...
                      </div>
                    )}

                    {!loadingDoctors && doctors.length === 0 && formData.consultationType && (
                      <div className="p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-md">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          ⚠️ No doctors available for {formData.consultationType} consultation at the moment.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Date Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('appointment.date')} *
                  </label>
                  <DateInput
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      setSelectedTimeSlot(''); // Reset time slot when date changes
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    placeholder="Select appointment date"
                  />
                </div>

                {/* Time Slot Selection */}
                {formData.date && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <label className="text-sm font-medium">
                        Select Time Slot * 
                      </label>
                    </div>

                    {/* Morning Slots */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Sun className="h-4 w-4" />
                        <span>Morning Slots (9:00 AM - 12:45 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {timeSlots.morning.map((slot, index) => (
                          <Button
                            key={`${slot.time}-${index}`}
                            type="button"
                            variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
                            size="sm"
                            disabled={slot.isBooked}
                            onClick={() => handleTimeSlotClick(slot.time)}
                            aria-label={`Book appointment at ${slot.time}`}
                            className={`
                              h-10 text-sm font-medium rounded-full
                              ${selectedTimeSlot === slot.time 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                              }
                              ${slot.isBooked
                                ? 'opacity-50 cursor-not-allowed bg-muted' 
                                : 'cursor-pointer'
                              }
                            `}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Afternoon Slots */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Sunset className="h-4 w-4" />
                        <span>Afternoon Slots (2:00 PM - 4:45 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {timeSlots.afternoon.map((slot, index) => (
                          <Button
                            key={`${slot.time}-${index}`}
                            type="button"
                            variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
                            size="sm"
                            disabled={slot.isBooked}
                            onClick={() => handleTimeSlotClick(slot.time)}
                            aria-label={`Book appointment at ${slot.time}`}
                            className={`
                              h-10 text-sm font-medium rounded-full
                              ${selectedTimeSlot === slot.time 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                              }
                              ${slot.isBooked
                                ? 'opacity-50 cursor-not-allowed bg-muted' 
                                : 'cursor-pointer'
                              }
                            `}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedTimeSlot && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                        <p className="text-sm text-primary font-medium">
                          ✓ Selected: {selectedTimeSlot} on {new Date(formData.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

      <Dialog open={showConsultationWarning} onOpenChange={setShowConsultationWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Select Consultation Mode</DialogTitle>
            <DialogDescription>
              Please select whether you need a video consultation or physical checkup before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              className="gradient-primary w-full" 
              onClick={() => setShowConsultationWarning(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔒 Please login to continue</DialogTitle>
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
