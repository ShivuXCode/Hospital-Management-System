import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Shield, Users, Target, Eye } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'We treat every patient with empathy, respect, and kindness',
    },
    {
      icon: Shield,
      title: 'Excellence',
      description: 'Committed to the highest standards of medical care',
    },
    {
      icon: Users,
      title: 'Patient-Centered',
      description: 'Your health and wellbeing are our top priorities',
    },
    {
      icon: Award,
      title: 'Professional',
      description: 'Expert medical team with years of experience',
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
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide accessible, affordable, and quality healthcare services to our community. 
                  We strive to promote wellness, prevent illness, and restore health through 
                  compassionate care and medical excellence.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-medium">
              <CardContent className="p-8">
                <Eye className="h-12 w-12 text-secondary mb-4" />
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading healthcare provider recognized for clinical excellence, 
                  innovative treatments, and patient satisfaction. We envision a healthier 
                  community where everyone has access to world-class medical care.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide everything we do
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Accreditation & Achievements</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { year: '1998', title: 'Hospital Established' },
              { year: '2005', title: 'NABH Accredited' },
              { year: '2010', title: 'ISO 9001:2015 Certified' },
              { year: '2015', title: 'Green Hospital Recognition' },
              { year: '2020', title: 'COVID Care Excellence Award' },
              { year: '2023', title: 'Best Multi-Specialty Hospital' },
            ].map((achievement, index) => (
              <Card key={index} className="shadow-soft text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{achievement.year}</div>
                  <p className="text-muted-foreground">{achievement.title}</p>
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
