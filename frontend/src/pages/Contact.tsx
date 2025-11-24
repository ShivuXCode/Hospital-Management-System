import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    // Fetch user profile data if logged in
    const fetchUserProfile = async () => {
      if (apiService.isAuthenticated()) {
        const user = apiService.getUser();
        if (user?.role === 'Patient') {
          setFetchingProfile(true);
          try {
            // Fetch basic user data
            const userResponse = await fetch('/api/user', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            const userData = await userResponse.json();

            if (userData.success && userData.user) {
              let phoneNumber = userData.user.phone || '';

              // If phone not in User model, try fetching from PatientProfile
              if (!phoneNumber && userData.user._id) {
                try {
                  const profileResponse = await fetch(`/api/patients/${userData.user._id}/profile`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                  });

                  const profileData = await profileResponse.json();
                  
                  if (profileData.success && profileData.profile?.phone) {
                    phoneNumber = profileData.profile.phone;
                  }
                } catch (profileError) {
                  console.error('Error fetching patient profile:', profileError);
                }
              }

              setFormData(prev => ({
                ...prev,
                name: userData.user.name || '',
                email: userData.user.email || '',
                phone: phoneNumber,
              }));
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          } finally {
            setFetchingProfile(false);
          }
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!apiService.isAuthenticated()) {
      toast({
        title: 'Login Required',
        description: 'Please log in to send a message.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Check if user is a patient
    const user = apiService.getUser();
    if (user?.role !== 'Patient') {
      toast({
        title: 'Access Denied',
        description: 'Only patients can send contact messages.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Message Sent!',
          description: 'We will get back to you soon.',
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-muted-foreground">
            We're here to help. Reach out to us anytime.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <MapPin className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t('contact.address')}</h3>
                  <p className="text-muted-foreground text-sm">
                    123 Healthcare Street,<br />
                    Medical City, Tamil Nadu<br />
                    600001, India
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <Phone className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t('contact.phone')}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    +91 44 1234 5678
                  </p>
                  <h3 className="font-semibold mb-2 mt-4">{t('contact.emergency')}</h3>
                  <p className="text-destructive font-semibold text-lg">
                    +91 44 9999 0000
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <Mail className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t('contact.email')}</h3>
                  <p className="text-muted-foreground text-sm">
                    info@medicare.hospital
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <Clock className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{t('contact.hours')}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t('contact.hoursValue')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('contact.sendMessage')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('contact.yourName')}
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('contact.yourEmail')}
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
                        {t('appointment.phone')}
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('contact.yourMessage')}
                      </label>
                      <Textarea
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full gradient-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        t('contact.sendMessage')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="shadow-soft mt-6">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8420041102117!2d80.23705731482135!3d13.044489290807837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267b0ba4aa9cb%3A0x1c7d0b4e6e2a6e5e!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1621234567890!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
