import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Activity, Receipt, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: '0',
      icon: Calendar,
      path: '/dashboard/patient/appointments',
    },
    {
      title: 'Prescriptions',
      value: '0',
      icon: FileText,
      path: '/dashboard/patient/prescriptions',
    },
    {
      title: 'Health Records',
      value: 'View',
      icon: Activity,
      path: '/dashboard/patient/records',
    },
    {
      title: 'Pending Bills',
      value: '0',
      icon: Receipt,
      path: '/dashboard/patient/billing',
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
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
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
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
