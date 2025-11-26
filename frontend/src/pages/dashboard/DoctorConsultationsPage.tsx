import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Video, Calendar, Clock, User, Search } from 'lucide-react';
import { apiService } from '@/services/api';

const DoctorConsultationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [hasVideoAccess, setHasVideoAccess] = useState<boolean>(true);

  useEffect(() => {
    checkAccessAndLoadConsultations();
  }, []);

  const checkAccessAndLoadConsultations = async () => {
    try {
      // Check if doctor has video consultation access
      const profileResponse = await apiService.getDoctorProfile();
      if (profileResponse.success && profileResponse.doctor) {
        const consultationTypes = profileResponse.doctor.consultationTypes || [];
        const canAccessVideo = consultationTypes.includes('video') || consultationTypes.includes('both');
        
        if (!canAccessVideo) {
          setHasVideoAccess(false);
          // Redirect physical-only doctors back to dashboard
          setTimeout(() => {
            navigate('/dashboard/doctor');
          }, 2000);
          return;
        }
      }
      
      // Load consultations if access granted
      await loadConsultations();
    } catch (error) {
      console.error('Failed to check access:', error);
      await loadConsultations();
    }
  };

  const loadConsultations = async () => {
    try {
      const data = await apiService.getAppointments();
      if (!data.success) throw new Error(data.message || 'Failed to fetch');
      // Map video-type appointments into consultations list with minimal fields
      const list = (data.appointments || [])
        .filter((a: any) => (a.consultationType || '').toLowerCase() === 'video')
        .map((a: any) => ({
          _id: a._id,
          patientName: a.patientName,
          reason: a.reason || 'Video consultation',
          date: a.date,
          time: a.time,
          status: a.status || 'Scheduled',
          meetingLink: a.meetingLink,
        }));
      setConsultations(list);
    } catch (e) {
      setConsultations([]);
    }
  };

  const filteredConsultations = consultations.filter((consultation) =>
    consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingConsultations = filteredConsultations.filter((c) => {
    const status = (c.status || '').toLowerCase();
    return status === 'scheduled' || status === 'pending';
  });
  const completedConsultations = filteredConsultations.filter((c) => {
    const status = (c.status || '').toLowerCase();
    return status === 'completed';
  });

  const handleJoinMeeting = (meetingLink?: string) => {
    if (!meetingLink) {
      // If no meeting link, open Google Meet homepage
      window.open('https://meet.google.com/', '_blank');
      return;
    }
    window.open(meetingLink, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge className="bg-purple-100 text-purple-700">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: timeStr || 'Not specified',
    };
  };

  // Show access denied message for physical-only doctors
  if (!hasVideoAccess) {
    return (
      <div className="space-y-6 pb-8">
        <Card className="shadow-sm">
          <CardContent className="pt-6 text-center py-12">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              Video Consultations are only available for doctors with Video Consultation privileges.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Consultations</h1>
          <p className="text-muted-foreground">Manage your online consultations</p>
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consultations by patient name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-soft hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Today
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Video className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingConsultations.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <Video className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedConsultations.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Consultations
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <Video className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Consultations */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Upcoming Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingConsultations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No upcoming consultations</p>
              <p className="text-sm mt-1">Your scheduled consultations will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingConsultations.map((consultation) => {
                const { date, time } = formatDateTime(consultation.date, consultation.time);
                return (
                  <div
                    key={consultation._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{consultation.patientName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {consultation.reason}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{time}</span>
                          </div>
                          <Badge variant="outline">{consultation.duration}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(consultation.status)}
                      <Button
                        onClick={() => handleJoinMeeting(consultation.meetingLink)}
                        className="ml-2"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Consultations */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-muted-foreground" />
            Completed Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedConsultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No completed consultations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedConsultations.map((consultation) => {
                const { date, time } = formatDateTime(consultation.date, consultation.time);
                return (
                  <div
                    key={consultation._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{consultation.patientName}</p>
                        <p className="text-xs text-muted-foreground">{consultation.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">{date}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default DoctorConsultationsPage;
