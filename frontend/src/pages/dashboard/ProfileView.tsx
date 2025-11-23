import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';
import { Edit, Mail, User, Shield, Calendar, Loader2, Phone, MapPin, UserCircle, Droplet } from 'lucide-react';

export default function ProfileView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [extendedProfile, setExtendedProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = apiService.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found. Please login again.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // For now, use the stored user data
      // In production, fetch from API: await apiService.getUserProfile(user.id)
      setProfile(user);

      // Load extended profile data from localStorage
      const savedProfile = storageService.getProfileData(user.id);
      setExtendedProfile(savedProfile);
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
    const user = apiService.getUser();
    if (user) {
      navigate(`/dashboard/${user.role.toLowerCase()}/profile/edit`);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      
      // Call API to change password
      const response = await apiService.changePassword(passwordData.newPassword);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      });

      // Reset form and close modal
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
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
              {profile.role}
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
              <p className="text-lg font-semibold">{profile.name}</p>
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
              <p className="text-lg font-semibold">{profile.email}</p>
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
              <p className="text-lg font-semibold capitalize">{profile.role}</p>
            </div>
          </div>

          {extendedProfile?.phone && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-lg font-semibold">{extendedProfile.phone}</p>
                </div>
              </div>
            </>
          )}

          {extendedProfile?.dateOfBirth && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-lg font-semibold">
                    {new Date(extendedProfile.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </>
          )}

          {extendedProfile?.gender && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="text-lg font-semibold">{extendedProfile.gender}</p>
                </div>
              </div>
            </>
          )}

          {extendedProfile?.address && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-lg font-semibold">{extendedProfile.address}</p>
                </div>
              </div>
            </>
          )}

          {extendedProfile?.emergencyContact && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                  <p className="text-lg font-semibold">{extendedProfile.emergencyContact}</p>
                </div>
              </div>
            </>
          )}

          {extendedProfile?.bloodGroup && (
            <>
              <Separator />
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Droplet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                  <p className="text-lg font-semibold">{extendedProfile.bloodGroup}</p>
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
