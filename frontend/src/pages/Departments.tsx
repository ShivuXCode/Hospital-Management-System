import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '@/services/api';
import { 
  Heart, 
  Bone, 
  Baby, 
  Brain, 
  Eye, 
  Syringe,
  Stethoscope,
  Activity,
  Pill,
  Users,
  Scan,
  Scissors
} from 'lucide-react';

const Departments = () => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultDepartments = [
    {
      icon: Heart,
      name: t('departments.cardiology'),
      description: t('departments.cardiologyDesc'),
      services: ['ECG', 'Echocardiography', 'Angiography', 'Cardiac Surgery'],
      doctors: 8,
      color: 'text-destructive',
    },
    {
      icon: Bone,
      name: t('departments.orthopedics'),
      description: t('departments.orthopedicsDesc'),
      services: ['Joint Replacement', 'Fracture Care', 'Sports Medicine', 'Spine Surgery'],
      doctors: 6,
      color: 'text-secondary',
    },
    {
      icon: Baby,
      name: t('departments.pediatrics'),
      description: t('departments.pediatricsDesc'),
      services: ['Vaccination', 'Child Development', 'Neonatal Care', 'Pediatric Surgery'],
      doctors: 5,
      color: 'text-primary',
    },
    {
      icon: Brain,
      name: t('departments.neurology'),
      description: t('departments.neurologyDesc'),
      services: ['Stroke Care', 'Epilepsy Treatment', 'Brain Surgery', 'Nerve Disorders'],
      doctors: 4,
      color: 'text-purple-600',
    },
    {
      icon: Eye,
      name: 'Ophthalmology',
      description: 'Eye care and vision specialists',
      services: ['Cataract Surgery', 'LASIK', 'Glaucoma Treatment', 'Retina Care'],
      doctors: 3,
      color: 'text-blue-600',
    },
    {
      icon: Syringe,
      name: 'Oncology',
      description: 'Cancer diagnosis and treatment',
      services: ['Chemotherapy', 'Radiation Therapy', 'Surgical Oncology', 'Palliative Care'],
      doctors: 5,
      color: 'text-orange-600',
    },
    {
      icon: Stethoscope,
      name: 'General Medicine',
      description: 'Primary care and internal medicine',
      services: ['Health Checkups', 'Chronic Disease Management', 'Preventive Care', 'Consultation'],
      doctors: 10,
      color: 'text-primary',
    },
    {
      icon: Activity,
      name: 'Emergency Medicine',
      description: '24/7 emergency care services',
      services: ['Trauma Care', 'Critical Care', 'Emergency Surgery', 'Ambulance Services'],
      doctors: 12,
      color: 'text-destructive',
    },
    {
      icon: Pill,
      name: 'Gastroenterology',
      description: 'Digestive system specialists',
      services: ['Endoscopy', 'Colonoscopy', 'Liver Care', 'IBD Treatment'],
      doctors: 4,
      color: 'text-green-600',
    },
    {
      icon: Users,
      name: 'Obstetrics & Gynecology',
      description: "Women's health specialists",
      services: ['Maternity Care', 'Gynecological Surgery', 'Fertility Treatment', 'Prenatal Care'],
      doctors: 6,
      color: 'text-pink-600',
    },
    {
      icon: Scan,
      name: 'Radiology',
      description: 'Advanced imaging and diagnostics',
      services: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound'],
      doctors: 5,
      color: 'text-indigo-600',
    },
    {
      icon: Scissors,
      name: 'General Surgery',
      description: 'Surgical procedures and operations',
      services: ['Laparoscopic Surgery', 'Hernia Repair', 'Appendectomy', 'Gallbladder Surgery'],
      doctors: 7,
      color: 'text-secondary',
    },
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/departments`);
        const data = await response.json();
        
        if (data.success && data.departments && data.departments.length > 0) {
          // Map API departments to match the UI format
          const mappedDepts = data.departments.map((dept: any) => {
            // Find matching icon from default departments or use default
            const defaultDept = defaultDepartments.find(
              d => d.name.toLowerCase() === dept.name.toLowerCase() || 
                   t(`departments.${dept.name.toLowerCase()}`).toLowerCase() === dept.name.toLowerCase()
            );
            
            return {
              icon: defaultDept?.icon || Stethoscope,
              name: dept.name,
              description: dept.description || `Specialized ${dept.name} services`,
              services: dept.services || ['Consultation', 'Treatment', 'Surgery', 'Follow-up'],
              doctors: dept.staff?.length || 0,
              color: defaultDept?.color || 'text-primary',
            };
          });
          setDepartments(mappedDepts);
        } else {
          // Use default departments if API fails or returns empty
          setDepartments(defaultDepartments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Use default departments as fallback
        setDepartments(defaultDepartments);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('departments.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive medical specialties under one roof
          </p>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className={`h-10 w-10 ${dept.color}`} />
                      <span className="text-sm text-muted-foreground">
                        {dept.doctors} {t('dashboard.doctors')}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {dept.description}
                    </p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Services:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {dept.services.map((service, idx) => (
                          <li key={idx}>• {service}</li>
                        ))}
                      </ul>
                    </div>
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link to="/doctors">{t('doctors.viewProfile')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Departments;
