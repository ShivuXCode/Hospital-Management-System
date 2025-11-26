import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  _id: string;
  doctorName: string;
  department?: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
}

const PatientAppointments = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const prevStatusRef = useRef<Record<string, string>>({});
  const pollIntervalRef = useRef<number | null>(null);

  const parseAppointmentDateTime = (appointment: Appointment) => {
    if (!appointment?.date) return null;

    if (appointment.time) {
      const match = appointment.time.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const seconds = match[3] ? parseInt(match[3], 10) : 0;
        const meridiem = match[4]?.toUpperCase();

        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;

        const composed = new Date(appointment.date);
        if (!Number.isNaN(composed.getTime())) {
          composed.setHours(hours, minutes, seconds, 0);
          return composed;
        }
      }
    }

    const fallback = new Date(`${appointment.date}T${appointment.time || '00:00'}`);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  };

  const isExpired = (appointment: Appointment) => {
    const dateTime = parseAppointmentDateTime(appointment);
    if (!dateTime) return false;
    return dateTime.getTime() < Date.now();
  };

  useEffect(() => {
    const loadAppointments = async (silent = false) => {
      try {
        const response = await apiService.getAppointments();
        if (response && response.success && response.appointments) {
          // Map backend appointment fields to local Appointment interface
          const mapped = response.appointments.map((apt: any) => ({
            _id: apt._id,
            doctorName: apt.doctorName,
            department: apt.department,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            reason: apt.reason || apt.notes || '',
          }));
          // Detect newly confirmed appointments
          if (silent) {
            mapped.forEach(m => {
              const prev = prevStatusRef.current[m._id];
              if (prev && prev !== 'Confirmed' && m.status === 'Confirmed') {
                const formattedDate = m.date ? new Date(m.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : '';
                toast({
                  title: t('patientAppointments.toast.confirmedTitle'),
                  description: `${t('patientAppointments.toast.confirmedWith')} ${m.doctorName} ${t('patientAppointments.toast.on')} ${formattedDate} ${t('patientAppointments.toast.at')} ${m.time} ${t('patientAppointments.toast.confirmedSuffix')}`,
                });
              }
            });
          }
          // Update current statuses
          const map: Record<string, string> = {};
          mapped.forEach(m => { map[m._id] = m.status; });
          prevStatusRef.current = map;
          setAppointments(mapped);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Failed to load appointments:', error);
        toast({
          title: t('patientBilling.toast.errorTitle'),
          description: t('patientAppointments.empty.noneDesc'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
  loadAppointments();
    // Start polling every 10s to detect confirmation by nurse
    pollIntervalRef.current = window.setInterval(() => loadAppointments(true), 10000);
    return () => {
      if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
    };
  }, [toast]);

  const expiredAppointments = useMemo(
    () => appointments.filter((appointment) => isExpired(appointment)),
    [appointments]
  );

  const activeAppointments = useMemo(
    () => appointments.filter((appointment) => !isExpired(appointment)),
    [appointments]
  );

  const filteredAppointments = useMemo(
    () => (showExpired ? expiredAppointments : activeAppointments),
    [activeAppointments, expiredAppointments, showExpired]
  );

  const translateStatus = (status: string) => {
    const normalized = status.toLowerCase();
    const key = `patientAppointments.status.${normalized}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('patientAppointments.title')}</h1>
          <p className="text-muted-foreground">{t('patientAppointments.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowExpired((prev) => !prev)}
            aria-pressed={showExpired}
          >
            {showExpired ? t('patientAppointments.toggle.showActive') : t('patientAppointments.toggle.showExpired')}
          </Button>
          <Button onClick={() => navigate('/book-appointment')} className="gradient-primary">
            <Calendar className="h-4 w-4 mr-2" />
            {t('patientAppointments.bookNew')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment._id}
              className={`shadow-soft ${
                isExpired(appointment) ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {appointment.doctorName}
                    </CardTitle>
                    {appointment.department && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {appointment.department}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {translateStatus(appointment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                {appointment.reason && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">{t('patientAppointments.reasonLabel')}</p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                  </div>
                )}
                {isExpired(appointment) && (
                  <div className="mt-4">
                    <Badge variant="secondary">{t('patientAppointments.expiredBadge')}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center space-y-6">
            <div>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {!showExpired && expiredAppointments.length === 0 ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">{t('patientAppointments.empty.none')}</h3>
                  <p className="text-muted-foreground">{t('patientAppointments.empty.noneDesc')}</p>
                </>
              ) : !showExpired && expiredAppointments.length > 0 ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">{t('patientAppointments.empty.noActive')}</h3>
                  <p className="text-muted-foreground">
                    {t('patientAppointments.empty.noActiveDesc')}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">{t('patientAppointments.empty.noExpired')}</h3>
                  <p className="text-muted-foreground">{t('patientAppointments.empty.noExpiredDesc')}</p>
                </>
              )}
            </div>
            {!showExpired && expiredAppointments.length === 0 && (
              <Button onClick={() => navigate('/book-appointment')} className="gradient-primary">
                {t('patientAppointments.empty.bookFirst')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientAppointments;
