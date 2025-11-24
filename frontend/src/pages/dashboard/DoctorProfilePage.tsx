import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit, 
  Mail, 
  User, 
  Shield, 
  Calendar, 
  Loader2, 
  Phone, 
  Briefcase, 
  Stethoscope, 
  GraduationCap, 
  Clock,
  Award,
  Languages as LanguagesIcon
} from 'lucide-react';

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Error',
          description: 'User not found. Please login again.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        setDoctor(data.user);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    navigate('/dashboard/doctor/profile/edit');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">View your account information</p>
        </div>
        <Button onClick={handleEditClick}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details and account settings</CardDescription>
            </div>
            <Badge variant="secondary" className="capitalize">
              {doctor.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-lg font-semibold">{doctor.name}</p>
            </div>
          </div>

          <Separator />

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email Address</p>
              <p className="text-lg font-semibold">{doctor.email}</p>
            </div>
          </div>

          <Separator />

          {/* Role */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Account Type</p>
              <p className="text-lg font-semibold capitalize">{doctor.role}</p>
            </div>
          </div>

          {doctor.phone && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-lg font-semibold">{doctor.phone}</p>
                </div>
              </div>
            </>
          )}

          {doctor.department && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-lg font-semibold">{doctor.department}</p>
                </div>
              </div>
            </>
          )}

          {doctor.specialization && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                  <p className="text-lg font-semibold">{doctor.specialization}</p>
                </div>
              </div>
            </>
          )}

          {doctor.qualification && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                  <p className="text-lg font-semibold">{doctor.qualification}</p>
                </div>
              </div>
            </>
          )}

          {doctor.experience && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-lg font-semibold">{doctor.experience}</p>
                </div>
              </div>
            </>
          )}

          {doctor.shift && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Shift</p>
                  <p className="text-lg font-semibold">{doctor.shift}</p>
                </div>
              </div>
            </>
          )}

          {doctor.availableDays && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Available Days</p>
                  <p className="text-lg font-semibold">{doctor.availableDays}</p>
                </div>
              </div>
            </>
          )}

          {doctor.availableTimings && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Available Timings</p>
                  <p className="text-lg font-semibold">{doctor.availableTimings}</p>
                </div>
              </div>
            </>
          )}

          {doctor.languages && doctor.languages.length > 0 && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LanguagesIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Languages</p>
                  <p className="text-lg font-semibold">{doctor.languages.join(', ')}</p>
                </div>
              </div>
            </>
          )}

          {doctor.consultationTypes && doctor.consultationTypes.length > 0 && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Consultation Type</p>
                  <div className="flex gap-2 mt-1">
                    {doctor.consultationTypes.includes('video') && (
                      <Badge variant="default" className="bg-blue-600">
                        Video Consultation
                      </Badge>
                    )}
                    {doctor.consultationTypes.includes('physical') && (
                      <Badge variant="default" className="bg-green-600">
                        Physical Check-Up
                      </Badge>
                    )}
                    {doctor.consultationTypes.includes('both') && (
                      <Badge variant="default" className="bg-purple-600">
                        Video & Physical
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Account Created */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
