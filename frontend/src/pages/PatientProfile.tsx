import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  User,
  Mail,
  Phone,
  MapPin,
  Droplet,
  AlertCircle,
  Pill,
  Calendar as CalendarIcon,
  Stethoscope,
  Activity,
  LogOut,
  Edit,
  FileText,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
  X,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper function to initialize sample data for testing (only if no data exists)
const initializeSampleData = (userId: string) => {
  // Initialize sample appointments if none exist
  const appointmentsKey = `patient_appointments_${userId}`;
  if (!localStorage.getItem(appointmentsKey)) {
    const sampleAppointments = [
      {
        id: 1,
        doctorName: 'Dr. Rajesh Kumar',
        department: 'Cardiology',
        date: '2025-11-05',
        time: '10:00 AM',
        status: 'completed',
        reason: 'Regular checkup',
      },
      {
        id: 2,
        doctorName: 'Dr. Priya Sharma',
        department: 'Pediatrics',
        date: '2025-10-15',
        time: '02:30 PM',
        status: 'completed',
        reason: 'Follow-up consultation',
      },
      {
        id: 3,
        doctorName: 'Dr. Ananya Singh',
        department: 'Dermatology',
        date: '2025-12-12',
        time: '11:15 AM',
        status: 'upcoming',
        reason: 'Skin allergy review',
      },
    ];
    localStorage.setItem(appointmentsKey, JSON.stringify(sampleAppointments));
  }

  // Initialize sample prescriptions if none exist
  const prescriptionsKey = `patient_prescriptions_${userId}`;
  if (!localStorage.getItem(prescriptionsKey)) {
    const samplePrescriptions = [
      {
        id: 1,
        doctorName: 'Dr. Rajesh Kumar',
        dateIssued: '2025-10-15',
        validUntil: '2025-11-15',
        medicines: [
          { name: 'Lisinopril', dosage: '10mg', duration: '30 days' },
          { name: 'Aspirin', dosage: '75mg', duration: '30 days' },
        ],
      },
      {
        id: 2,
        doctorName: 'Dr. Priya Sharma',
        dateIssued: '2025-09-10',
        validUntil: '2025-09-20',
        medicines: [{ name: 'Amoxicillin', dosage: '500mg', duration: '7 days' }],
      },
      {
        id: 3,
        doctorName: 'Dr. Arun Patel',
        dateIssued: '2025-10-20',
        validUntil: '2025-12-20',
        medicines: [{ name: 'Ibuprofen', dosage: '400mg', duration: '60 days' }],
      },
    ];
    localStorage.setItem(prescriptionsKey, JSON.stringify(samplePrescriptions));
  }

  // Initialize sample health data if none exists
  const healthKey = `patient_health_${userId}`;
  if (!localStorage.getItem(healthKey)) {
    const sampleHealth = {
      bloodPressure: '120/80',
      sugarLevel: '95',
      weight: '75',
      height: '175',
      bmi: '24.5',
      lastUpdated: '2025-10-20',
    };
    localStorage.setItem(healthKey, JSON.stringify(sampleHealth));
  }

  // Initialize sample profile if none exists
  const profileKey = `patient_profile_${userId}`;
  if (!localStorage.getItem(profileKey)) {
    const sampleProfile = {
      phone: '+1-555-0103',
      age: '35',
      gender: 'Male',
      address: '123 Medical Street, Healthcare City, HC 12345',
      bloodGroup: 'O+',
      emergencyContact: '+1-555-0199',
      allergies: 'Penicillin',
      ongoingTreatments: 'Hypertension Management',
    };
    localStorage.setItem(profileKey, JSON.stringify(sampleProfile));
  }
};

const parseAppointmentDateTime = (appointment: { date?: string; time?: string; dateTime?: string }) => {
  if (!appointment) return null;

  if (appointment.dateTime) {
    const explicit = new Date(appointment.dateTime);
    if (!Number.isNaN(explicit.getTime())) {
      return explicit;
    }
  }

  if (!appointment.date) return null;

  const baseDate = new Date(appointment.date);
  if (Number.isNaN(baseDate.getTime())) return null;

  if (!appointment.time) {
    return baseDate;
  }

  const match = appointment.time.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) {
    return baseDate;
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const meridiem = match[4]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (!meridiem && hours === 24) hours = 0;

  const dateWithTime = new Date(baseDate);
  dateWithTime.setHours(hours, minutes, seconds, 0);
  return dateWithTime;
};

const isAppointmentExpired = (appointment: { date?: string; time?: string; status?: string }) => {
  const appointmentDate = parseAppointmentDateTime(appointment);
  if (appointmentDate) {
    return appointmentDate.getTime() < Date.now();
  }

  const status = appointment?.status?.toString().toLowerCase();
  return status ? ['completed', 'cancelled', 'missed'].includes(status) : false;
};

const isPrescriptionExpired = (validUntil?: string) => {
  if (!validUntil) return false;

  const validDate = new Date(validUntil);
  if (Number.isNaN(validDate.getTime())) return false;

  const endOfDay = new Date(validDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < Date.now();
};

const filterByExpiry = <T,>(items: T[], expiredFlag: boolean, predicate: (item: T) => boolean) => {
  if (!Array.isArray(items)) return [] as T[];
  return items.filter((item) => {
    const expired = predicate(item);
    return expiredFlag ? expired : !expired;
  });
};

const readLocalAppointments = (userId: string) => {
  const key = `patient_appointments_${userId}`;
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  return stored ? JSON.parse(stored) : [];
};

const readLocalPrescriptions = (userId: string) => {
  const key = `patient_prescriptions_${userId}`;
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  return stored ? JSON.parse(stored) : [];
};

const getRecordId = (record: { id?: string | number; _id?: string | number } | null | undefined) => {
  if (!record) return null;
  if (record.id !== undefined) return record.id;
  if (record._id !== undefined) return record._id;
  return null;
};

const getDoctorIdFromAppointment = (appointment: any) => {
  if (!appointment) return null;
  if (typeof appointment.doctor === 'string') return appointment.doctor;
  if (appointment.doctor?._id) return appointment.doctor._id;
  if (appointment.doctorId) return appointment.doctorId;
  return null;
};

const getDoctorNameFromAppointment = (appointment: any) => {
  if (!appointment) return '';
  return appointment.doctorName || appointment.doctor?.name || '';
};

const canReviewAppointment = (appointment: any) => {
  if (!appointment) return false;
  const status = appointment.status?.toString().toLowerCase();
  if (status === 'completed') return true;
  if (status === 'cancelled') return false;
  return isAppointmentExpired(appointment);
};

const renderStaticStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
  const dimension = size === 'lg' ? 'h-8 w-8' : 'h-4 w-4';
  const gap = size === 'lg' ? 'gap-2' : 'gap-1';

  return (
    <div className={`flex ${gap}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const active = rating >= index + 1;
        return (
          <Star
            key={index}
            className={`${dimension} ${
              active ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
            }`}
          />
        );
      })}
    </div>
  );
};

const PatientProfile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [savingDetails, setSavingDetails] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useState<any>(null);
  const canvasRef = useState<any>(null);

  // Current user from localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Patient profile data (editable manually)
  const [profileData, setProfileData] = useState({
    phone: '',
    age: '',
    gender: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    allergies: '',
    ongoingTreatments: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({ ...profileData });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    reason: '',
  });

  // Appointments data
  const [allAppointments, setAllAppointments] = useState<any[]>([]);

  // Prescriptions data (filtered by validity)
  const [allPrescriptions, setAllPrescriptions] = useState<any[]>([]);
  const [showExpired, setShowExpired] = useState(false);

  // Health stats (editable)
  const [healthStats, setHealthStats] = useState({
    bloodPressure: '',
    sugarLevel: '',
    weight: '',
    height: '',
    bmi: '',
    lastUpdated: '',
  });

  // Health tracker edit state
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [healthForm, setHealthForm] = useState({ ...healthStats });
  const [savingHealth, setSavingHealth] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [appointmentReviews, setAppointmentReviews] = useState<Record<string, { id: string; rating: number; comment?: string }>>({});
  const [reviewForm, setReviewForm] = useState({
    appointmentId: '',
    doctorId: '',
    doctorName: '',
    rating: 0,
    comment: '',
  });

  const resetReviewForm = () => {
    setReviewForm({
      appointmentId: '',
      doctorId: '',
      doctorName: '',
      rating: 0,
      comment: '',
    });
  };

  const handleReviewModalChange = (open: boolean) => {
    if (!open) {
      setReviewModalOpen(false);
      setLoadingReview(false);
      setSubmittingReview(false);
      resetReviewForm();
      return;
    }

    setReviewModalOpen(true);
  };

  const hydrateAppointmentReviews = async (appointments: any[]) => {
    if (!currentUser?.id || !Array.isArray(appointments) || appointments.length === 0) {
      return;
    }

    const reviewEntries = await Promise.all(
      appointments.map(async (appointment) => {
        const appointmentId = getRecordId(appointment);
        const doctorId = getDoctorIdFromAppointment(appointment);

        if (!appointmentId || !doctorId) {
          return null;
        }

        try {
          const response = await apiService.getDoctorReviewForAppointment(
            String(doctorId),
            String(appointmentId)
          );

          if (response.success && response.review) {
            return [
              String(appointmentId),
              {
                id: response.review._id ?? response.review.id ?? String(appointmentId),
                rating: response.review.rating,
                comment: response.review.comment ?? '',
              },
            ] as const;
          }
        } catch (error) {
          console.error('Failed to load review for appointment', appointmentId, error);
        }

        return null;
      })
    );

    const entries = reviewEntries.filter(Boolean) as Array<[string, { id: string; rating: number; comment?: string }]>;
    if (entries.length === 0) {
      return;
    }

    setAppointmentReviews((prev) => {
      const next = { ...prev };
      for (const [appointmentId, review] of entries) {
        next[appointmentId] = review;
      }
      return next;
    });
  };

  const openReviewModal = async (appointment: any) => {
    const appointmentId = getRecordId(appointment);
    const doctorId = getDoctorIdFromAppointment(appointment);
    const doctorName = getDoctorNameFromAppointment(appointment);

    if (!appointmentId || !doctorId) {
      toast({
        title: 'Review unavailable',
        description: 'We could not determine the doctor for this appointment.',
        variant: 'destructive',
      });
      return;
    }

    const existing = appointmentReviews[String(appointmentId)];

    setReviewForm({
      appointmentId: String(appointmentId),
      doctorId: String(doctorId),
      doctorName,
      rating: existing?.rating ?? 0,
      comment: existing?.comment ?? '',
    });
    handleReviewModalChange(true);
    setLoadingReview(true);

    try {
      const response = await apiService.getDoctorReviewForAppointment(
        String(doctorId),
        String(appointmentId)
      );

      if (response.success && response.review) {
        const existingReview = {
          id: response.review._id ?? response.review.id ?? String(appointmentId),
          rating: response.review.rating,
          comment: response.review.comment ?? '',
        };

        setReviewForm((prev) => ({
          ...prev,
          rating: existingReview.rating,
          comment: existingReview.comment,
        }));

        setAppointmentReviews((prev) => ({
          ...prev,
          [String(appointmentId)]: existingReview,
        }));
      } else {
        setReviewForm((prev) => ({ ...prev, rating: 0, comment: '' }));
      }
    } catch (error) {
      console.error('Failed to load existing review', error);
      toast({
        title: 'Unable to load review',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.doctorId || !reviewForm.appointmentId) {
      toast({
        title: 'Review incomplete',
        description: 'Missing doctor or appointment information.',
        variant: 'destructive',
      });
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast({
        title: 'Add a rating',
        description: 'Please provide a rating between 1 and 5 stars.',
        variant: 'destructive',
      });
      return;
    }

    const doctorName = reviewForm.doctorName;

    setSubmittingReview(true);
    try {
      const response = await apiService.submitDoctorReview(reviewForm.doctorId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        appointmentId: reviewForm.appointmentId,
      });

      if (!response.success || !response.review) {
        throw new Error(response.message || 'Failed to save review.');
      }

      setAppointmentReviews((prev) => ({
        ...prev,
        [reviewForm.appointmentId]: {
          id: response.review._id ?? response.review.id ?? reviewForm.appointmentId,
          rating: response.review.rating,
          comment: response.review.comment ?? '',
        },
      }));

      toast({
        title: response.operation === 'updated' ? 'Review updated' : 'Review submitted',
        description: `Your feedback for ${doctorName || 'this doctor'} has been saved.`,
      });

      handleReviewModalChange(false);
    } catch (error: any) {
      console.error('Submit review failed', error);
      toast({
        title: 'Unable to save review',
        description: error?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };
  useEffect(() => {
    // Check authentication
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadPatientData = async () => {
      setLoading(true);
      try {
        const user = apiService.getUser();
        if (!user || user.role !== 'Patient') {
          toast({
            title: 'Access Denied',
            description: 'This page is only accessible to patients.',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }

        setCurrentUser(user);

        // Initialize sample data for testing (only if no data exists)
        initializeSampleData(user.id);

        // Fetch profile data from backend
        try {
          // TODO: Replace with actual API call when backend is ready
          // const profileRes = await fetch(`http://localhost:5001/api/patients/${user.id}/details`, {
          //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          // });
          // const profileData = await profileRes.json();
          
          // For now, load from localStorage or use empty defaults
          const savedProfile = localStorage.getItem(`patient_profile_${user.id}`);
          const profile = savedProfile ? JSON.parse(savedProfile) : {
            phone: '',
            age: '',
            gender: '',
            address: '',
            bloodGroup: '',
            emergencyContact: '',
            allergies: '',
            ongoingTreatments: '',
          };

          setProfileData(profile);
          setEditForm(profile);
        } catch (err) {
          console.error('Failed to load profile data', err);
        }

        // Fetch doctors for booking
        try {
          const doctorsRes = await apiService.getDoctors();
          if (doctorsRes.success) {
            setDoctors(doctorsRes.doctors || []);
          }
        } catch (err) {
          console.error('Failed to load doctors', err);
        }

        // Fetch health tracker data
        try {
          // TODO: Replace with actual API call
          // const healthRes = await fetch(`http://localhost:5001/api/patients/${user.id}/health-tracker`, {
          //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          // });
          // const healthData = await healthRes.json();

          // For now, load from localStorage or use empty defaults
          const savedHealth = localStorage.getItem(`patient_health_${user.id}`);
          const health = savedHealth ? JSON.parse(savedHealth) : {
            bloodPressure: '',
            sugarLevel: '',
            weight: '',
            bmi: '',
            lastUpdated: '',
          };

          setHealthStats(health);
          setHealthForm(health);
        } catch (err) {
          console.error('Failed to load health data', err);
        }

        // Load profile photo
        const savedPhoto = localStorage.getItem(`patient_photo_${user.id}`);
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        }
      } catch (err) {
        console.error('Failed to load patient data', err);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [navigate, toast]);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    let isCancelled = false;

    const loadAppointments = async () => {
      try {
        const response = await apiService.getAppointments();
        if (!isCancelled && response.success && Array.isArray(response.appointments)) {
          setAllAppointments(response.appointments);
          await hydrateAppointmentReviews(response.appointments);
          return;
        }
      } catch (error) {
        console.error('Failed to load appointments', error);
      }

      if (isCancelled) return;
      const localAppointments = readLocalAppointments(currentUser.id);
      setAllAppointments(localAppointments);
      await hydrateAppointmentReviews(localAppointments);
    };

    const loadPrescriptions = async () => {
      try {
        const response = await apiService.getPatientPrescriptions(currentUser.id);
        if (!isCancelled && response.success && Array.isArray(response.prescriptions)) {
          setAllPrescriptions(response.prescriptions);
          return;
        }
      } catch (error) {
        console.error('Failed to load prescriptions', error);
      }

      if (isCancelled) return;
      const localPrescriptions = readLocalPrescriptions(currentUser.id);
      setAllPrescriptions(localPrescriptions);
    };

    loadAppointments();
    loadPrescriptions();

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.id]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setProfilePhoto(imageData);
      saveProfilePhoto(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef[0]) {
        videoRef[0].srcObject = stream;
        videoRef[0].play();
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to take a photo.',
        variant: 'destructive',
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef[0] && videoRef[0].srcObject) {
      const stream = videoRef[0].srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef[0].srcObject = null;
    }
    setShowCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef[0] || !canvasRef[0]) return;

    const canvas = canvasRef[0];
    const video = videoRef[0];
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setProfilePhoto(imageData);
    saveProfilePhoto(imageData);
    stopCamera();
    setPhotoModalOpen(false);
  };

  // Save profile photo
  const saveProfilePhoto = async (photoData: string) => {
    if (!currentUser?.id) return;

    setUploadingPhoto(true);
    try {
      // TODO: Replace with actual API call to upload photo
      // const response = await fetch(`http://localhost:5001/api/patients/${currentUser.id}/photo`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ photo: photoData })
      // });

      // For now, save to localStorage
      localStorage.setItem(`patient_photo_${currentUser.id}`, photoData);
      
      toast({
        title: '✅ Profile photo updated',
        description: 'Your profile photo has been saved successfully.',
      });
      setPhotoModalOpen(false);
    } catch (err) {
      console.error('Photo upload error:', err);
      toast({
        title: 'Error',
        description: 'Failed to save profile photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Remove profile photo
  const removeProfilePhoto = () => {
    if (!currentUser?.id) return;
    
    localStorage.removeItem(`patient_photo_${currentUser.id}`);
    setProfilePhoto('');
    toast({
      title: 'Photo removed',
      description: 'Your profile photo has been removed.',
    });
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;
    
    setSavingDetails(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`http://localhost:5001/api/patients/${currentUser.id}/details`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(editForm)
      // });
      // const data = await response.json();

      // For now, save to localStorage
      localStorage.setItem(`patient_profile_${currentUser.id}`, JSON.stringify(editForm));
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update local state immediately
      setProfileData({ ...editForm });
      
      toast({ 
        title: 'Profile updated successfully', 
        description: 'Your changes have been saved.',
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to save profile. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveHealth = async () => {
    if (!currentUser?.id) return;

    // Validate numeric inputs
    const { bloodPressure, sugarLevel, weight, height } = healthForm;
    
    // Validate weight (30-250 kg)
    if (weight) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 30 || weightNum > 250) {
        toast({ 
          title: 'Invalid input', 
          description: 'Weight must be between 30 and 250 kg.', 
          variant: 'destructive' 
        });
        return;
      }
    }

    // Validate height (100-250 cm)
    if (height) {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        toast({ 
          title: 'Invalid input', 
          description: 'Height must be between 100 and 250 cm.', 
          variant: 'destructive' 
        });
        return;
      }
    }

    if (sugarLevel && isNaN(parseFloat(sugarLevel))) {
      toast({ 
        title: 'Invalid input', 
        description: 'Sugar level must be a valid number.', 
        variant: 'destructive' 
      });
      return;
    }

    setSavingHealth(true);
    try {
      // Calculate BMI if both height and weight are provided
      let calculatedBMI = '';
      if (weight && height) {
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        if (weightNum > 0 && heightNum > 0) {
          const heightInMeters = heightNum / 100;
          calculatedBMI = (weightNum / (heightInMeters * heightInMeters)).toFixed(1);
        }
      }

      const updatedHealth = {
        ...healthForm,
        bmi: calculatedBMI,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      // TODO: Replace with actual API call
      // const response = await fetch(`http://localhost:5001/api/patients/${currentUser.id}/health-tracker`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(updatedHealth)
      // });
      // const data = await response.json();

      // Save to localStorage
      localStorage.setItem(`patient_health_${currentUser.id}`, JSON.stringify(updatedHealth));
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update local state immediately
      setHealthStats(updatedHealth);
      
      toast({ 
        title: '✅ Health tracker updated successfully', 
        description: 'Your health data has been saved.',
      });
      setHealthModalOpen(false);
    } catch (err) {
      console.error('Save health error:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to save health data. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setSavingHealth(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!apiService.isAuthenticated()) {
      toast({
        title: 'Please login to continue',
        description: 'You need to be logged in to book appointments.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!bookingForm.doctorId || !bookingForm.date || !bookingForm.time || !bookingForm.reason) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        doctorName: bookingForm.doctorName,
        patientName: currentUser?.name || 'Patient',
        email: currentUser?.email || '',
        date: bookingForm.date,
        time: bookingForm.time,
        reason: bookingForm.reason,
      };

      const res = await apiService.createAppointment(payload);
      if (res && res.success) {
        toast({ title: 'Appointment booked', description: 'Your appointment has been scheduled.' });
        
        // Save appointment locally
        if (currentUser?.id) {
          const savedAppointments = localStorage.getItem(`patient_appointments_${currentUser.id}`);
          const existingAppointments = savedAppointments ? JSON.parse(savedAppointments) : [];
          const newAppointment = {
            id: Date.now(),
            doctorName: bookingForm.doctorName,
            department: bookingForm.department,
            date: bookingForm.date,
            time: bookingForm.time,
            status: 'upcoming',
            reason: bookingForm.reason,
          };
          existingAppointments.push(newAppointment);
          localStorage.setItem(`patient_appointments_${currentUser.id}`, JSON.stringify(existingAppointments));
          
          // Update state immediately for responsiveness
          setAllAppointments(existingAppointments);
        }
        
        setBookingModalOpen(false);
        setBookingForm({
          doctorId: '',
          doctorName: '',
          department: '',
          date: '',
          time: '',
          reason: '',
        });
      } else {
        toast({ title: 'Booking failed', description: res?.message || 'Please try again.' });
      }
    } catch (err) {
      console.error('Booking error', err);
      toast({ title: 'Error', description: 'Failed to book appointment.' });
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d._id === doctorId);
    if (doctor) {
      setBookingForm({
        ...bookingForm,
        doctorId,
        doctorName: doctor.name,
        department: doctor.specialization || '',
      });
    }
  };

  const handleLogout = () => {
    apiService.logout();
    toast({ title: t('dashboard.logout'), description: 'You have been logged out successfully.' });
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
      upcoming: { variant: 'default', icon: Clock },
      completed: { variant: 'secondary', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle },
    };
    const { variant, icon: Icon } = config[status] || config.upcoming;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {t(`profile.${status}`)}
      </Badge>
    );
  };

  const displayAppointments = useMemo(
    () => filterByExpiry(allAppointments, showExpired, isAppointmentExpired),
    [allAppointments, showExpired]
  );

  const displayPrescriptions = useMemo(
    () =>
      filterByExpiry(
        allPrescriptions,
        showExpired,
        (item) => isPrescriptionExpired((item as { validUntil?: string }).validUntil)
      ),
    [allPrescriptions, showExpired]
  );

  const activeAppointmentForReview = useMemo(() => {
    if (!reviewForm.appointmentId) return null;

    return (
      allAppointments.find((appointment) => {
        const identifier = getRecordId(appointment as { id?: string | number; _id?: string | number });
        return String(identifier) === reviewForm.appointmentId;
      }) || null
    );
  }, [allAppointments, reviewForm.appointmentId]);

  const cachedReviewForModal = reviewForm.appointmentId
    ? appointmentReviews[reviewForm.appointmentId]
    : undefined;

  useEffect(() => {
    if (!selectedAppointment) return;

    const isStillVisible = displayAppointments.some((apt) => {
      const candidateId = getRecordId(apt as { id?: string | number; _id?: string | number });
      const selectedId = getRecordId(selectedAppointment as { id?: string | number; _id?: string | number });
      return candidateId === selectedId;
    });

    if (!isStillVisible) {
      setSelectedAppointment(null);
    }
  }, [displayAppointments, selectedAppointment]);

  useEffect(() => {
    if (!selectedPrescription) return;

    const isStillVisible = displayPrescriptions.some((prescription) => {
      const candidateId = getRecordId(prescription as { id?: string | number; _id?: string | number });
      const selectedId = getRecordId(selectedPrescription as { id?: string | number; _id?: string | number });
      return candidateId === selectedId;
    });

    if (!isStillVisible) {
      setSelectedPrescription(null);
    }
  }, [displayPrescriptions, selectedPrescription]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <Card className="shadow-strong mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex gap-6 items-center">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-primary/10">
                    {profilePhoto ? (
                      <AvatarImage src={profilePhoto} alt={currentUser?.name || 'Patient'} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    onClick={() => setPhotoModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary/90 transition-all"
                    title="Change photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {t('profile.welcome')}, {currentUser?.name || 'Patient'} 👋
                  </h1>
                  <p className="text-muted-foreground mb-2">
                    {profileData.age && `${profileData.age} ${t('profile.age')}`}
                    {profileData.age && profileData.gender && ' • '}
                    {profileData.gender && t(`profile.${profileData.gender.toLowerCase()}`)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {currentUser?.email}
                    </Badge>
                    {profileData.phone && (
                      <Badge variant="outline" className="gap-1">
                        <Phone className="h-3 w-3" />
                        {profileData.phone}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditModalOpen(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  {t('profile.editProfile')}
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('dashboard.logout')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('profile.personalDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.email')}</p>
                  <p className="font-medium">{currentUser?.email || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.phone')}</p>
                  <p className="font-medium">{profileData.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.address')}</p>
                  <p className="font-medium">{profileData.address || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplet className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.bloodGroup')}</p>
                  <p className="font-medium">{profileData.bloodGroup || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.emergencyContact')}</p>
                  <p className="font-medium">{profileData.emergencyContact || 'Not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Details */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              {t('profile.medicalDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.allergies')}</p>
                  <p className="font-medium">{profileData.allergies || t('profile.noData')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Pill className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.ongoingTreatments')}</p>
                  <p className="font-medium">{profileData.ongoingTreatments || t('profile.noData')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Tracker */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t('profile.healthTracker')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Calculate BMI when opening modal if height and weight exist
                  const formData = { ...healthStats };
                  if (formData.height && formData.weight) {
                    const h = parseFloat(formData.height);
                    const w = parseFloat(formData.weight);
                    if (h > 0 && w > 0) {
                      const heightInM = h / 100;
                      formData.bmi = (w / (heightInM * heightInM)).toFixed(1);
                    }
                  }
                  setHealthForm(formData);
                  setHealthModalOpen(true);
                }}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Update Health Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {healthStats.bloodPressure || healthStats.sugarLevel || healthStats.weight || healthStats.height || healthStats.bmi ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {healthStats.height && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        <p className="text-sm font-medium text-orange-900">Height</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">{healthStats.height} cm</p>
                    </div>
                  )}
                  {healthStats.weight && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium text-green-900">Weight</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{healthStats.weight} kg</p>
                      {healthStats.bmi && (
                        <p className="text-sm text-green-600 mt-2 font-medium">BMI: {healthStats.bmi}</p>
                      )}
                    </div>
                  )}
                  {healthStats.bloodPressure && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-medium text-red-900">Blood Pressure</p>
                      </div>
                      <p className="text-2xl font-bold text-red-700">{healthStats.bloodPressure}</p>
                    </div>
                  )}
                  {healthStats.sugarLevel && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Sugar Level</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{healthStats.sugarLevel} mg/dL</p>
                    </div>
                  )}
                </div>
                {healthStats.lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Last updated: {healthStats.lastUpdated}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-3">No health data available</p>
                <Button
                  onClick={() => {
                    setHealthForm({ bloodPressure: '', sugarLevel: '', weight: '', height: '', bmi: '', lastUpdated: '' });
                    setHealthModalOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Health Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Appointment Section */}
        <Card className="shadow-soft mb-6 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Book an Appointment
              </CardTitle>
              <Button onClick={() => setBookingModalOpen(true)} className="gap-2 gradient-primary">
                <Plus className="h-4 w-4" />
                New Appointment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Schedule a consultation with any of our specialist doctors. Choose your preferred doctor,
              date, and time.
            </p>
          </CardContent>
        </Card>

        {/* Appointment History */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {t('profile.appointmentHistory')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpired(!showExpired)}
                aria-pressed={showExpired}
              >
                {showExpired ? 'Show Active' : 'Show Expired'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('profile.doctorName')}</TableHead>
                    <TableHead>{t('profile.department')}</TableHead>
                    <TableHead>{t('profile.date')}</TableHead>
                    <TableHead>{t('profile.time')}</TableHead>
                    <TableHead>{t('profile.status')}</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        {showExpired ? 'No expired records found.' : 'No active records found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayAppointments.map((apt, index) => {
                      const expired = isAppointmentExpired(apt);
                      const rawId = getRecordId(apt as { id?: string | number; _id?: string | number });
                      const appointmentId = rawId ?? `appointment-${index}`;
                      const appointmentKey = String(appointmentId);
                      const existingReview = appointmentReviews[appointmentKey];
                      const reviewable = canReviewAppointment(apt);

                      return (
                        <TableRow key={appointmentId} className={expired ? 'opacity-70' : ''}>
                          <TableCell className="font-medium">{apt.doctorName}</TableCell>
                          <TableCell>{apt.department}</TableCell>
                          <TableCell>{apt.date}</TableCell>
                          <TableCell>{apt.time}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(apt.status)}
                              {expired && (
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {existingReview ? (
                              <div className="flex items-center gap-2">
                                {renderStaticStars(existingReview.rating)}
                                <span className="text-sm text-muted-foreground">
                                  {existingReview.rating}/5
                                </span>
                              </div>
                            ) : reviewable ? (
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                Pending review
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAppointment(apt)}
                              >
                                {t('profile.viewDetails')}
                              </Button>
                              {reviewable && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openReviewModal(apt)}
                                >
                                  {existingReview ? 'Edit Review' : 'Leave Review'}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Prescription History */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t('profile.prescriptionHistory')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpired(!showExpired)}
                aria-pressed={showExpired}
              >
                {showExpired ? 'Show Active' : 'Show Expired'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {displayPrescriptions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {showExpired ? 'No expired records found.' : 'No active records found.'}
              </p>
            ) : (
              <div className="space-y-4">
                {displayPrescriptions.map((prescription: any, index: number) => {
                  const expired = isPrescriptionExpired(prescription.validUntil);
                  const cardId = getRecordId(prescription as { id?: string | number; _id?: string | number }) ?? `prescription-${index}`;
                  return (
                    <div
                      key={cardId}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        expired ? 'bg-gray-50 opacity-60' : ''
                      }`}
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{prescription.doctorName}</p>
                          <p className="text-sm text-muted-foreground">
                            Issued: {prescription.dateIssued}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Valid until: {prescription.validUntil}
                          </p>
                          {expired && (
                            <Badge variant="destructive" className="mt-1">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          {t('profile.viewDetails')}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {prescription.medicines.slice(0, 2).map((med: any, idx: number) => (
                          <div key={idx} className="text-sm flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary" />
                            <span className="font-medium">{med.name}</span>
                            <span className="text-muted-foreground">
                              {med.dosage} - {med.duration}
                            </span>
                          </div>
                        ))}
                        {prescription.medicines.length > 2 && (
                          <p className="text-sm text-muted-foreground pl-6">
                            +{prescription.medicines.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        <Dialog open={reviewModalOpen} onOpenChange={handleReviewModalChange}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {cachedReviewForModal ? 'Update your review' : 'Share your experience'}
              </DialogTitle>
              <DialogDescription>
                {reviewForm.doctorName
                  ? `Let us know how your visit with ${reviewForm.doctorName} went.`
                  : 'Let us know about your consultation experience.'}
              </DialogDescription>
            </DialogHeader>
            {loadingReview ? (
              <div className="py-6 text-center text-muted-foreground">Loading review…</div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  {activeAppointmentForReview && (
                    <div className="rounded-md border border-muted bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Appointment on {activeAppointmentForReview.date || '—'} at{' '}
                      {activeAppointmentForReview.time || '—'}
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">How would you rate your experience?</p>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const active = reviewForm.rating >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-105 disabled:hover:scale-100"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                            disabled={submittingReview}
                            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`h-8 w-8 ${
                                active ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    </label>
                    <Textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      placeholder="Share any additional feedback about your consultation."
                      disabled={submittingReview}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => handleReviewModalChange(false)}
                    disabled={submittingReview}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSubmitReview} disabled={submittingReview} className="gap-2">
                    {submittingReview ? 'Saving…' : cachedReviewForModal ? 'Update Review' : 'Submit Review'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Profile Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('profile.editProfile')}</DialogTitle>
              <DialogDescription>
                Update your personal and medical information manually. These details are not auto-filled
                from signup.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('profile.phone')}</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+1-555-0000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('profile.age')}</label>
                  <Input
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    placeholder="25"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('profile.gender')}</label>
                <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('profile.address')}</label>
                <Textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter your full address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('profile.bloodGroup')}</label>
                  <Select
                    value={editForm.bloodGroup}
                    onValueChange={(v) => setEditForm({ ...editForm, bloodGroup: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('profile.emergencyContact')}
                  </label>
                  <Input
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    placeholder="+1-555-0000"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('profile.allergies')}</label>
                <Textarea
                  value={editForm.allergies}
                  onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                  placeholder="List any allergies (e.g., Penicillin, Pollen)"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('profile.ongoingTreatments')}
                </label>
                <Textarea
                  value={editForm.ongoingTreatments}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ongoingTreatments: e.target.value })
                  }
                  placeholder="Describe ongoing treatments or conditions"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleSaveProfile}
                disabled={savingDetails}
              >
                {savingDetails ? 'Saving...' : t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Book Appointment Modal */}
        <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Choose a doctor and schedule your appointment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Doctor *</label>
                <Select value={bookingForm.doctorId} onValueChange={handleDoctorSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc._id} value={doc._id}>
                        {doc.name} - {doc.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {bookingForm.department && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Input value={bookingForm.department} disabled />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date *</label>
                  <DateInput
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Select appointment date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Time *</label>
                  <Input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Reason for Visit *</label>
                <Textarea
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  placeholder="Describe your symptoms or reason for visit"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setBookingModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button className="gradient-primary" onClick={handleBookAppointment}>
                Book Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Appointment Details Modal */}
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.doctorName')}</p>
                  <p className="font-medium">{selectedAppointment.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.department')}</p>
                  <p className="font-medium">{selectedAppointment.department}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('profile.date')}</p>
                    <p className="font-medium">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('profile.time')}</p>
                    <p className="font-medium">{selectedAppointment.time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium">{selectedAppointment.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.status')}</p>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setSelectedAppointment(null)}>{t('common.close')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Prescription Details Modal */}
        <Dialog
          open={!!selectedPrescription}
          onOpenChange={() => setSelectedPrescription(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.doctorName')}</p>
                  <p className="font-medium">{selectedPrescription.doctorName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Issued</p>
                    <p className="font-medium">{selectedPrescription.dateIssued}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-medium">{selectedPrescription.validUntil}</p>
                    {isPrescriptionExpired(selectedPrescription.validUntil) && (
                      <Badge variant="destructive" className="mt-1">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Medicines:</p>
                  <div className="space-y-2">
                    {selectedPrescription.medicines.map((med: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <p className="font-medium">{med.name}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">{t('profile.dosage')}</p>
                            <p>{med.dosage}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t('profile.duration')}</p>
                            <p>{med.duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setSelectedPrescription(null)}>{t('common.close')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Health Tracker Edit Modal */}
        <Dialog open={healthModalOpen} onOpenChange={setHealthModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Health Tracker</DialogTitle>
              <DialogDescription>
                Enter your latest health measurements. BMI will be automatically calculated from height and weight.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Height (cm) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="100"
                    max="250"
                    value={healthForm.height}
                    onChange={(e) => {
                      const newHeight = e.target.value;
                      const weight = parseFloat(healthForm.weight);
                      let newBMI = '';
                      
                      console.log('Height changed:', newHeight, 'Weight:', weight);
                      
                      if (weight && newHeight && parseFloat(newHeight) > 0) {
                        const h = parseFloat(newHeight);
                        const heightInM = h / 100; // Convert cm to meters
                        newBMI = (weight / (heightInM * heightInM)).toFixed(1);
                        console.log('Calculated BMI from height:', newBMI);
                      }
                      
                      setHealthForm({ ...healthForm, height: newHeight, bmi: newBMI });
                    }}
                    placeholder="172"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Range: 100-250 cm</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Weight (kg) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={healthForm.weight}
                    onChange={(e) => {
                      const newWeight = e.target.value;
                      const height = parseFloat(healthForm.height);
                      let newBMI = '';
                      
                      console.log('Weight changed:', newWeight, 'Height:', height);
                      
                      if (newWeight && height && height > 0) {
                        const w = parseFloat(newWeight);
                        const heightInM = height / 100; // Convert cm to meters
                        newBMI = (w / (heightInM * heightInM)).toFixed(1);
                        console.log('Calculated BMI from weight:', newBMI);
                      }
                      
                      setHealthForm({ ...healthForm, weight: newWeight, bmi: newBMI });
                    }}
                    placeholder="68"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Range: 30-250 kg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Blood Pressure
                  </label>
                  <Input
                    value={healthForm.bloodPressure}
                    onChange={(e) => setHealthForm({ ...healthForm, bloodPressure: e.target.value })}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sugar Level (mg/dL)
                  </label>
                  <Input
                    type="number"
                    value={healthForm.sugarLevel}
                    onChange={(e) => setHealthForm({ ...healthForm, sugarLevel: e.target.value })}
                    placeholder="95"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  BMI (Auto-calculated)
                </label>
                <Input
                  type="text"
                  value={healthForm.bmi}
                  disabled
                  placeholder="Calculated automatically from height and weight"
                  className="bg-gray-50 text-lg font-semibold"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> BMI is automatically calculated using the formula: 
                  Weight (kg) ÷ [Height (m)]². Enter height in centimeters (e.g., 172 cm) and weight in kilograms.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setHealthModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleSaveHealth}
                disabled={savingHealth}
              >
                {savingHealth ? 'Saving...' : t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Photo Upload Modal */}
        <Dialog open={photoModalOpen} onOpenChange={(open) => {
          setPhotoModalOpen(open);
          if (!open) stopCamera();
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Photo</DialogTitle>
              <DialogDescription>
                Upload a photo or take one using your camera
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Current Photo Preview */}
              {profilePhoto && !showCamera && (
                <div className="relative">
                  <Avatar className="h-48 w-48 mx-auto border-4 border-primary/10">
                    <AvatarImage src={profilePhoto} alt="Profile" />
                  </Avatar>
                  <button
                    onClick={removeProfilePhoto}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
                    title="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Camera View */}
              {showCamera && (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={(el) => (videoRef[0] = el)}
                      className="w-full h-64 object-cover"
                      autoPlay
                      playsInline
                    />
                    <canvas ref={(el) => (canvasRef[0] = el)} className="hidden" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={capturePhoto} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Options */}
              {!showCamera && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </Button>
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={startCamera}
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              )}

              {uploadingPhoto && (
                <div className="text-center text-sm text-muted-foreground">
                  Uploading photo...
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => {
                setPhotoModalOpen(false);
                stopCamera();
              }}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientProfile;
