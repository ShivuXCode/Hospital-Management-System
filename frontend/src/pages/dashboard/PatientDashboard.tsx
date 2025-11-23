import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Calendar, FileText, Activity, Receipt, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type DashboardActivityType = 'appointment' | 'prescription' | 'bill' | 'health';

interface DashboardActivityItem {
  id: string;
  type: DashboardActivityType;
  title: string;
  description?: string;
  status?: string;
  date?: string;
}

interface DashboardHealthRecord {
  lastUpdated: string | null;
  bloodPressure?: string | null;
  sugarLevel?: number | null;
  weight?: number | null;
  bmi?: number | null;
}

interface DashboardStats {
  upcomingAppointments: number;
  activePrescriptions: number;
  pendingBills: number;
  healthRecord: DashboardHealthRecord | null;
}

const activityIconMap: Record<DashboardActivityType, typeof Calendar> = {
  appointment: Calendar,
  prescription: FileText,
  bill: Receipt,
  health: Activity,
};

const allowedActivityTypes: DashboardActivityType[] = ['appointment', 'prescription', 'bill', 'health'];

const formatShortDate = (value?: string | null) => {
  if (!value) return 'No records';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const PatientDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    pendingBills: 0,
    healthRecord: null,
  });
  const [recentActivity, setRecentActivity] = useState<DashboardActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = apiService.getUser();
    if (!user || user.role !== 'Patient') {
      toast({
        title: 'Access denied',
        description: 'The patient dashboard is only available to patients.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    if (!user.id) {
      toast({
        title: 'Missing patient identifier',
        description: 'Please log out and sign in again to refresh your session.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.getPatientDashboard(user.id);

      if (response.success && response.dashboard) {
        const {
          upcomingAppointmentsCount,
          activePrescriptionsCount,
          pendingBillsCount,
          recentHealthRecord,
          recentActivity: activity,
        } = response.dashboard;

        setStats({
          upcomingAppointments: upcomingAppointmentsCount,
          activePrescriptions: activePrescriptionsCount,
          pendingBills: pendingBillsCount,
          healthRecord: recentHealthRecord,
        });
        const normalizedActivity: DashboardActivityItem[] = Array.isArray(activity)
          ? activity.map((item) => {
              const inferredType = allowedActivityTypes.includes(item.type as DashboardActivityType)
                ? (item.type as DashboardActivityType)
                : 'health';

              return {
                id: item.id?.toString() ?? `${inferredType}-${item.date ?? Date.now()}`,
                type: inferredType,
                title: item.title ?? 'Activity update',
                description: item.description,
                status: item.status,
                date: item.date,
              };
            })
          : [];

        setRecentActivity(normalizedActivity);
      } else {
        toast({
          title: 'Unable to load dashboard',
          description: response.message || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load patient dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    let isMounted = true;

    const guardedLoad = async () => {
      if (!isMounted) return;
      await loadDashboard();
    };

    guardedLoad();

    return () => {
      isMounted = false;
    };
  }, [loadDashboard]);

  useEffect(() => {
    const handleHealthUpdated = () => {
      loadDashboard();
    };

    window.addEventListener('patient-health-updated', handleHealthUpdated);
    window.addEventListener('focus', loadDashboard);

    return () => {
      window.removeEventListener('patient-health-updated', handleHealthUpdated);
      window.removeEventListener('focus', loadDashboard);
    };
  }, [loadDashboard]);

  const statsCards = [
    {
      title: 'Upcoming Appointments',
      value: loading ? '—' : stats.upcomingAppointments.toString(),
      icon: Calendar,
      path: '/dashboard/patient/appointments',
    },
    {
      title: 'Prescriptions',
      value: loading ? '—' : stats.activePrescriptions.toString(),
      icon: FileText,
      path: '/dashboard/patient/prescriptions',
    },
    {
      title: 'Pending Bills',
      value: loading ? '—' : stats.pendingBills.toString(),
      icon: Receipt,
      path: '/dashboard/patient/billing',
    },
    {
      title: 'Health Records',
      value: (() => {
        if (loading) return 'BMI: —';
        const bmi = stats.healthRecord?.bmi;
        if (bmi === null || bmi === undefined) return 'BMI: —';
        const numeric = Number(bmi);
        if (Number.isNaN(numeric)) return 'BMI: —';
        return `BMI: ${numeric.toFixed(1)}`;
      })(),
      supportingText:
        loading || !stats.healthRecord?.lastUpdated
          ? undefined
          : `Updated ${formatShortDate(stats.healthRecord.lastUpdated)}`,
      icon: Activity,
      path: '/dashboard/patient/records',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Patient Dashboard</h1>
          <p className="text-muted-foreground">Access your medical records and appointments</p>
        </div>
        <Button onClick={() => navigate('/dashboard/patient/profile')} className="gap-2 gradient-primary">
          <User className="h-4 w-4" />
          View My Profile
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(stat.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.supportingText && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.supportingText}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/book-appointment')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/patient/records')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Update Health Records
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/doctors')}
            >
              <User className="h-4 w-4 mr-2" />
              View All Doctors
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm text-center py-6">Loading activity…</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity found.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activityIconMap[activity.type] ?? Activity;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                          <span>{formatDateTime(activity.date)}</span>
                          {activity.status && (
                            <Badge variant="outline" className="uppercase tracking-wide">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
