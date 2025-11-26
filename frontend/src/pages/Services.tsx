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
        'services.features.emergency.trauma',
        'services.features.emergency.critical',
        'services.features.emergency.surgery',
        'services.features.emergency.ambulance',
      ],
    },
    {
      icon: Stethoscope,
      title: t('services.specialist'),
      description: t('services.specialistDesc'),
      features: [
        'services.features.specialist.multi',
        'services.features.specialist.second',
        'services.features.specialist.followup',
        'services.features.specialist.telemedicine',
      ],
    },
    {
      icon: TestTube,
      title: t('services.diagnostic'),
      description: t('services.diagnosticDesc'),
      features: [
        'services.features.diagnostic.xray',
        'services.features.diagnostic.ct',
        'services.features.diagnostic.lab',
        'services.features.diagnostic.pathology',
      ],
    },
    {
      icon: Pill,
      title: t('services.pharmacy'),
      description: t('services.pharmacyDesc'),
      features: [
        'services.features.pharmacy.roundClock',
        'services.features.pharmacy.delivery',
        'services.features.pharmacy.generic',
        'services.features.pharmacy.counseling',
      ],
    },
    {
      icon: HeartPulse,
      title: t('services.packages.title'),
      description: t('services.packages.description'),
      features: [
        'services.features.packages.executive',
        'services.features.packages.cardiac',
        'services.features.packages.diabetes',
        'services.features.packages.cancer',
      ],
    },
    {
      icon: Shield,
      title: t('services.insurance.title'),
      description: t('services.insurance.description'),
      features: [
        'services.features.insurance.accepted',
        'services.features.insurance.cashless',
        'services.features.insurance.claims',
        'services.features.insurance.corporate',
      ],
    },
    {
      icon: Activity,
      title: t('services.preventive.title'),
      description: t('services.preventive.description'),
      features: [
        'services.features.preventive.vaccination',
        'services.features.preventive.education',
        'services.features.preventive.nutrition',
        'services.features.preventive.fitness',
      ],
    },
    {
      icon: Heart,
      title: t('services.maternity.title'),
      description: t('services.maternity.description'),
      features: [
        'services.features.maternity.antenatal',
        'services.features.maternity.labor',
        'services.features.maternity.postnatal',
        'services.features.maternity.lactation',
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
            {t('services.subtitle')}
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
                          <span>{t(feature)}</span>
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
              <h2 className="text-3xl font-bold mb-4">{t('services.cta.title')}</h2>
              <p className="text-lg mb-8 opacity-90">
                {t('services.cta.subtitle')}
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
