import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Shield, Users, Target, Eye } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: t('about.values.compassion.title'),
      description: t('about.values.compassion.desc'),
    },
    {
      icon: Shield,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.desc'),
    },
    {
      icon: Users,
      title: t('about.values.patient.title'),
      description: t('about.values.patient.desc'),
    },
    {
      icon: Award,
      title: t('about.values.professional.title'),
      description: t('about.values.professional.desc'),
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('about.description')}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-medium">
              <CardContent className="p-8">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.mission.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-medium">
              <CardContent className="p-8">
                <Eye className="h-12 w-12 text-secondary mb-4" />
                <h2 className="text-2xl font-bold mb-4">{t('about.vision.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.vision.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about.values.sectionTitle')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('about.values.sectionSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about.achievements.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { year: '1998', titleKey: 'about.achievements.established' },
              { year: '2005', titleKey: 'about.achievements.nabh' },
              { year: '2010', titleKey: 'about.achievements.iso' },
              { year: '2015', titleKey: 'about.achievements.green' },
              { year: '2020', titleKey: 'about.achievements.covid' },
              { year: '2023', titleKey: 'about.achievements.multiSpecialty' },
            ].map((achievement, index) => (
              <Card key={index} className="shadow-soft text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{achievement.year}</div>
                  <p className="text-muted-foreground">{t(achievement.titleKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
