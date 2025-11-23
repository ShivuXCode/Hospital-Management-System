import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { ArrowLeft, Loader2, Mail, Phone, Stethoscope, Star } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  department?: string;
  qualification?: string;
  experience?: number | null;
  image?: string;
  availability?: string;
  email?: string;
  phone?: string;
  languages?: string[];
  about?: string;
}

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const loadReviews = async (doctorId: string) => {
    setReviewsLoading(true);
    try {
      const res = await apiService.getDoctorReviews(doctorId);
      if (res.success) {
        setReviews(res.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to load doctor reviews', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);

        // Try to fetch from API (public)
        try {
          const response = await apiService.getDoctorById(id || '');
          if (response && response.success && response.doctor) {
            // Map backend doctor data
            const mappedDoctor: Doctor = {
              id: response.doctor._id || response.doctor.id,
              name: response.doctor.name,
              department: response.doctor.specialization || response.doctor.specialty || response.doctor.department,
              qualification: response.doctor.qualification || '',
              experience: response.doctor.experience ?? null,
              image: response.doctor.photo || response.doctor.image || '',
              availability: response.doctor.availability || '',
              email: response.doctor.email || '',
              phone: response.doctor.phone || '',
              languages: Array.isArray(response.doctor.languages) ? response.doctor.languages : [],
              about: response.doctor.about || '',
            };
            setDoctor(mappedDoctor);
            // Load real reviews (no sample data)
            if (mappedDoctor.id) {
              loadReviews(mappedDoctor.id);
            }
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed');
        }
        toast({
          title: 'Doctor Not Found',
          description: 'The requested doctor profile could not be found.',
          variant: 'destructive',
        });
        navigate('/doctors');
      } catch (error) {
        console.error('Error fetching doctor:', error);
        toast({
          title: 'Error',
          description: 'Failed to load doctor profile.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Doctor Not Found</h2>
          <Button onClick={() => navigate('/doctors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctors')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Doctors
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="h-32 w-32 rounded-xl object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Stethoscope className="h-10 w-10" />
                  </div>
                )}
                <h1 className="text-2xl font-bold mt-4">Dr. {doctor.name.replace(/^Dr\.?\s*/i, '')}</h1>
                {doctor.department && (
                  <p className="text-primary font-medium mt-1">{doctor.department}</p>
                )}
                {doctor.qualification && (
                  <p className="text-sm text-muted-foreground mt-1">{doctor.qualification}</p>
                )}
                {typeof doctor.experience === 'number' && (
                  <p className="text-sm text-muted-foreground mt-1">{doctor.experience}+ years experience</p>
                )}

                {/* Languages */}
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {doctor.languages.map((lang, idx) => (
                      <Badge key={`${lang}-${idx}`} variant="secondary" className="px-2 py-0.5">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}

                {typeof doctor.averageRating === 'number' && doctor.reviewCount !== undefined && (
                  <div className="mt-4 inline-flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span className="text-sm font-medium">{doctor.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/ 5 · {doctor.reviewCount} review{doctor.reviewCount === 1 ? '' : 's'}</span>
                  </div>
                )}

                {/* Contact */}
                <div className="mt-6 w-full space-y-2 text-left">
                  {doctor.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <CardTitle>About Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {doctor.about || 'Profile information will be updated soon.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {doctor.department && (
                    <div className="flex items-center justify-between">
                      <span>Department</span>
                      <span className="font-medium text-foreground">{doctor.department}</span>
                    </div>
                  )}
                  {doctor.qualification && (
                    <div className="flex items-center justify-between">
                      <span>Qualification</span>
                      <span className="font-medium text-foreground">{doctor.qualification}</span>
                    </div>
                  )}
                  {typeof doctor.experience === 'number' && (
                    <div className="flex items-center justify-between">
                      <span>Experience</span>
                      <span className="font-medium text-foreground">{doctor.experience}+ years</span>
                    </div>
                  )}
                  {doctor.availability && (
                    <div className="flex items-start justify-between">
                      <span>Availability</span>
                      <span className="font-medium text-foreground text-right max-w-[60%]">{doctor.availability}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Awards & Highlights removed (sample data). If real awards become available, render them here. */}
            </div>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev: any) => (
                      <div key={rev._id || rev.id} className="border rounded-md p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-amber-400" />
                            <span className="font-medium">{rev.rating?.toFixed ? rev.rating.toFixed(1) : rev.rating}</span>
                            <span className="text-xs text-muted-foreground">/ 5</span>
                          </div>
                          {rev.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {rev.comment && (
                          <p className="text-muted-foreground mb-2">{rev.comment}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {rev.patient?.name && <span>Patient: {rev.patient.name}</span>}
                          {rev.appointment && rev.appointment.date && (
                            <span>
                              Appointment: {rev.appointment.date}{rev.appointment.time ? ` ${rev.appointment.time}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
