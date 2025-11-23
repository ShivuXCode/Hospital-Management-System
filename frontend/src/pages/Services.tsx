import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Ambulance, 
  Heart, 
  Shield, 
  Stethoscope,
  TestTube,
  Pill,
  Activity,
  HeartPulse,
  Phone
} from 'lucide-react';

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Ambulance,
      title: t('services.emergency'),
      description: t('services.emergencyDesc'),
      features: [
        'Trauma care unit',
        'Critical care services',
        'Emergency surgery',
        'Ambulance services',
      ],
    },
    {
      icon: Stethoscope,
      title: t('services.specialist'),
      description: t('services.specialistDesc'),
      features: [
        'Multi-specialty consultations',
        'Second opinion services',
        'Follow-up care',
        'Telemedicine available',
      ],
    },
    {
      icon: TestTube,
      title: t('services.diagnostic'),
      description: t('services.diagnosticDesc'),
      features: [
        'Digital X-Ray',
        'CT & MRI scans',
        'Laboratory services',
        'Pathology testing',
      ],
    },
    {
      icon: Pill,
      title: t('services.pharmacy'),
      description: t('services.pharmacyDesc'),
      features: [
        '24/7 pharmacy services',
        'Home delivery available',
        'Generic medicines',
        'Medicine counseling',
      ],
    },
    {
      icon: HeartPulse,
      title: 'Health Checkup Packages',
      description: 'Comprehensive health screening programs',
      features: [
        'Executive health checkup',
        'Cardiac screening',
        'Diabetes screening',
        'Cancer screening',
      ],
    },
    {
      icon: Shield,
      title: 'Insurance Services',
      description: 'Cashless treatment facility',
      features: [
        'All major insurance accepted',
        'Cashless facility',
        'Claim assistance',
        'Corporate tie-ups',
      ],
    },
    {
      icon: Activity,
      title: 'Preventive Care',
      description: 'Health education and wellness programs',
      features: [
        'Vaccination programs',
        'Health education',
        'Nutrition counseling',
        'Fitness programs',
      ],
    },
    {
      icon: Heart,
      title: 'Maternity Care',
      description: 'Complete care for mother and baby',
      features: [
        'Antenatal care',
        'Labor & delivery',
        'Postnatal care',
        'Lactation support',
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('services.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive healthcare services designed to meet all your medical needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section: render only for non-doctor, non-nurse, and non-admin users */}
      {(() => {
        const role = (JSON.parse(localStorage.getItem('user') || 'null')?.role || '').toLowerCase();
        const isStaff = role === 'doctor' || role === 'nurse' || role === 'admin';
        if (isStaff) return null;
        return (
          <section className="py-16 px-4 bg-primary text-primary-foreground">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Need Medical Assistance?</h2>
              <p className="text-lg mb-8 opacity-90">
                Our team is available 24/7 to help you
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/appointment">{t('hero.bookAppointment')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                  <Link to="/contact">
                    <Phone className="mr-2 h-5 w-5" />
                    {t('contact.title')}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default Services;
