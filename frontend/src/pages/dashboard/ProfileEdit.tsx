import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';
import { Save, X, Loader2, User, Mail, Lock, Phone, Calendar as CalendarIcon, MapPin, UserCircle, Droplet, Video, Stethoscope } from 'lucide-react';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    consultationTypes: [] as string[],
  });

  useEffect(() => {
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

    // Load saved profile data from localStorage
    const savedProfile = storageService.getProfileData(user.id);

    // Fetch user profile from backend to get consultation types
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5002/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success && data.user) {
          return data.user;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      return null;
    };

    fetchUserProfile().then((userProfile) => {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: savedProfile?.phone || userProfile?.phone || '',
        dateOfBirth: savedProfile?.dateOfBirth || '',
        gender: savedProfile?.gender || '',
        address: savedProfile?.address || '',
        emergencyContact: savedProfile?.emergencyContact || '',
        bloodGroup: savedProfile?.bloodGroup || '',
        consultationTypes: userProfile?.consultationTypes || ['physical'],
      }));
    });
    setLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const user = apiService.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update profile via API
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          consultationTypes: user.role === 'Doctor' ? formData.consultationTypes : undefined,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update localStorage with new data
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        consultationTypes: formData.consultationTypes,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Save extended profile data (phone, address, etc.)
      storageService.saveProfileData(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodGroup: formData.bloodGroup,
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully and will persist across sessions.',
      });

      // Navigate back to profile view
      navigate(`/dashboard/${user.role.toLowerCase()}/profile`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const user = apiService.getUser();
    if (user) {
      navigate(`/dashboard/${user.role.toLowerCase()}/profile`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = apiService.getUser();

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your account information</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {user?.role}
        </Badge>
      </div>

      <form onSubmit={handleSave}>
        {/* Basic Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                <CalendarIcon className="h-4 w-4 inline mr-2" />
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                <UserCircle className="h-4 w-4 inline mr-2" />
                Gender
              </Label>
              <Input
                id="gender"
                name="gender"
                type="text"
                value={formData.gender}
                onChange={handleInputChange}
                placeholder="e.g., Male, Female, Other"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="h-4 w-4 inline mr-2" />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">
                <Phone className="h-4 w-4 inline mr-2" />
                Emergency Contact
              </Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact number"
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">
                <Droplet className="h-4 w-4 inline mr-2" />
                Blood Group
              </Label>
              <Input
                id="bloodGroup"
                name="bloodGroup"
                type="text"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                placeholder="e.g., A+, B+, O+, AB+"
              />
            </div>
          </CardContent>
        </Card>

        {/* Consultation Type Card - Only for Doctors */}
        {user?.role === 'Doctor' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Consultation Type</CardTitle>
              <CardDescription>Select the type of consultations you provide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Available Consultation Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      id="consultation-video"
                      checked={formData.consultationTypes.includes('video')}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.consultationTypes.filter(t => t !== 'both'), 'video']
                          : formData.consultationTypes.filter(t => t !== 'video');
                        
                        // If both video and physical are selected, set to 'both'
                        if (newTypes.includes('video') && newTypes.includes('physical')) {
                          setFormData({ ...formData, consultationTypes: ['both'] });
                        } else if (newTypes.length === 0) {
                          setFormData({ ...formData, consultationTypes: ['physical'] });
                        } else {
                          setFormData({ ...formData, consultationTypes: newTypes });
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor="consultation-video" className="flex items-center flex-1 cursor-pointer">
                      <Video className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="font-medium">Video Consultation</p>
                        <p className="text-sm text-muted-foreground">Provide remote consultations via video calls</p>
                      </div>
                    </label>
                    {formData.consultationTypes.includes('video') && (
                      <Badge variant="default" className="bg-blue-600">Active</Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      id="consultation-physical"
                      checked={formData.consultationTypes.includes('physical')}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.consultationTypes.filter(t => t !== 'both'), 'physical']
                          : formData.consultationTypes.filter(t => t !== 'physical');
                        
                        // If both video and physical are selected, set to 'both'
                        if (newTypes.includes('video') && newTypes.includes('physical')) {
                          setFormData({ ...formData, consultationTypes: ['both'] });
                        } else if (newTypes.length === 0) {
                          setFormData({ ...formData, consultationTypes: ['video'] });
                        } else {
                          setFormData({ ...formData, consultationTypes: newTypes });
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor="consultation-physical" className="flex items-center flex-1 cursor-pointer">
                      <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                      <div>
                        <p className="font-medium">Physical Check-Up</p>
                        <p className="text-sm text-muted-foreground">Provide in-person consultations at the clinic</p>
                      </div>
                    </label>
                    {formData.consultationTypes.includes('physical') && (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Current Selection:</p>
                  <div className="flex gap-2">
                    {formData.consultationTypes.includes('both') && (
                      <Badge variant="default" className="bg-purple-600">
                        Video & Physical Consultations
                      </Badge>
                    )}
                    {formData.consultationTypes.includes('video') && !formData.consultationTypes.includes('both') && (
                      <Badge variant="default" className="bg-blue-600">
                        Video Consultation Only
                      </Badge>
                    )}
                    {formData.consultationTypes.includes('physical') && !formData.consultationTypes.includes('both') && (
                      <Badge variant="default" className="bg-green-600">
                        Physical Check-Up Only
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your consultation type selection will affect:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                    <li>Which patients can book appointments with you</li>
                    <li>Visibility in doctor listings for specific consultation types</li>
                    <li>Dashboard sections available to you (e.g., Video Consultations section)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
