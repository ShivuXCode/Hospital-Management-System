import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import BookAppointmentButton from '@/components/BookAppointmentButton';
import { 
  Activity, 
  Heart, 
  Stethoscope, 
  Shield, 
  Clock,
  Award,
  Users,
  Building2,
  ArrowRight,
  Phone
} from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: '50,000+', label: t('dashboard.patients') },
    { icon: Stethoscope, value: '150+', label: t('dashboard.doctors') },
    { icon: Building2, value: '30+', label: t('departments.title') },
    { icon: Award, value: '25+', label: 'Years Experience' },
  ];

  const services = [
    {
      icon: Clock,
      title: t('services.emergency'),
      description: t('services.emergencyDesc'),
      color: 'text-destructive',
    },
    {
      icon: Stethoscope,
      title: t('services.specialist'),
      description: t('services.specialistDesc'),
      color: 'text-primary',
    },
    {
      icon: Activity,
      title: t('services.diagnostic'),
      description: t('services.diagnosticDesc'),
      color: 'text-secondary',
    },
    {
      icon: Shield,
      title: t('services.pharmacy'),
      description: t('services.pharmacyDesc'),
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {t('hero.subtitle')}
            </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookAppointmentButton size="lg" className="gradient-primary text-base">
                {t('hero.bookAppointment')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </BookAppointmentButton>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('hero.emergency')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-10 w-10 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('about.title')}
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                {t('about.description')}
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                With state-of-the-art medical equipment, experienced healthcare professionals, 
                and a patient-first approach, we ensure the highest standards of medical care 
                for every individual who walks through our doors.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">
                  {t('about.learnMore')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 shadow-strong"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="h-32 w-32 text-primary opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('services.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive healthcare services designed to meet all your medical needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <Icon className={`h-12 w-12 mb-4 ${service.color}`} />
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="gradient-hero text-white shadow-strong">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Book your appointment today and experience quality healthcare
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <BookAppointmentButton size="lg" variant="secondary">
                  {t('hero.bookAppointment')}
                </BookAppointmentButton>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                  <Link to="/departments">
                    {t('hero.viewDepartments')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
