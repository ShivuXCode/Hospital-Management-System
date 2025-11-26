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
      rawName: 'Cardiology',
      icon: Heart,
      name: t('departments.cardiology'),
      description: t('departments.cardiologyDesc'),
      services: [
        'departments.services.cardiology.ecg',
        'departments.services.cardiology.echo',
        'departments.services.cardiology.angiography',
        'departments.services.cardiology.surgery',
      ],
      doctors: 8,
      color: 'text-destructive',
    },
    {
      rawName: 'Orthopedics',
      icon: Bone,
      name: t('departments.orthopedics'),
      description: t('departments.orthopedicsDesc'),
      services: [
        'departments.services.orthopedics.joint',
        'departments.services.orthopedics.fracture',
        'departments.services.orthopedics.sports',
        'departments.services.orthopedics.spine',
      ],
      doctors: 6,
      color: 'text-secondary',
    },
    {
      rawName: 'Pediatrics',
      icon: Baby,
      name: t('departments.pediatrics'),
      description: t('departments.pediatricsDesc'),
      services: [
        'departments.services.pediatrics.vaccination',
        'departments.services.pediatrics.development',
        'departments.services.pediatrics.neonatal',
        'departments.services.pediatrics.surgery',
      ],
      doctors: 5,
      color: 'text-primary',
    },
    {
      rawName: 'Neurology',
      icon: Brain,
      name: t('departments.neurology'),
      description: t('departments.neurologyDesc'),
      services: [
        'departments.services.neurology.stroke',
        'departments.services.neurology.epilepsy',
        'departments.services.neurology.surgery',
        'departments.services.neurology.nerves',
      ],
      doctors: 4,
      color: 'text-purple-600',
    },
    {
      rawName: 'Ophthalmology',
      icon: Eye,
      name: t('departments.ophthalmology'),
      description: t('departments.ophthalmologyDesc'),
      services: [
        'departments.services.ophthalmology.cataract',
        'departments.services.ophthalmology.lasik',
        'departments.services.ophthalmology.glaucoma',
        'departments.services.ophthalmology.retina',
      ],
      doctors: 3,
      color: 'text-blue-600',
    },
    {
      rawName: 'Oncology',
      icon: Syringe,
      name: t('departments.oncology'),
      description: t('departments.oncologyDesc'),
      services: [
        'departments.services.oncology.chemo',
        'departments.services.oncology.radiation',
        'departments.services.oncology.surgery',
        'departments.services.oncology.palliative',
      ],
      doctors: 5,
      color: 'text-orange-600',
    },
    {
      rawName: 'General Medicine',
      icon: Stethoscope,
      name: t('departments.generalMedicine'),
      description: t('departments.generalMedicineDesc'),
      services: [
        'departments.services.generalMedicine.checkups',
        'departments.services.generalMedicine.chronic',
        'departments.services.generalMedicine.preventive',
        'departments.services.generalMedicine.consultation',
      ],
      doctors: 10,
      color: 'text-primary',
    },
    {
      rawName: 'Emergency Medicine',
      icon: Activity,
      name: t('departments.emergencyMedicine'),
      description: t('departments.emergencyMedicineDesc'),
      services: [
        'departments.services.emergency.trauma',
        'departments.services.emergency.critical',
        'departments.services.emergency.surgery',
        'departments.services.emergency.ambulance',
      ],
      doctors: 12,
      color: 'text-destructive',
    },
    {
      rawName: 'Gastroenterology',
      icon: Pill,
      name: t('departments.gastroenterology'),
      description: t('departments.gastroenterologyDesc'),
      services: [
        'departments.services.gastro.endoscopy',
        'departments.services.gastro.colonoscopy',
        'departments.services.gastro.liver',
        'departments.services.gastro.ibd',
      ],
      doctors: 4,
      color: 'text-green-600',
    },
    {
      rawName: 'Obstetrics & Gynecology',
      icon: Users,
      name: t('departments.obgyn'),
      description: t('departments.obgynDesc'),
      services: [
        'departments.services.obgyn.maternity',
        'departments.services.obgyn.surgery',
        'departments.services.obgyn.fertility',
        'departments.services.obgyn.prenatal',
      ],
      doctors: 6,
      color: 'text-pink-600',
    },
    {
      rawName: 'Radiology',
      icon: Scan,
      name: t('departments.radiology'),
      description: t('departments.radiologyDesc'),
      services: [
        'departments.services.radiology.xray',
        'departments.services.radiology.ct',
        'departments.services.radiology.mri',
        'departments.services.radiology.ultrasound',
      ],
      doctors: 5,
      color: 'text-indigo-600',
    },
    {
      rawName: 'General Surgery',
      icon: Scissors,
      name: t('departments.generalSurgery'),
      description: t('departments.generalSurgeryDesc'),
      services: [
        'departments.services.generalSurgery.laparoscopic',
        'departments.services.generalSurgery.hernia',
        'departments.services.generalSurgery.appendix',
        'departments.services.generalSurgery.gallbladder',
      ],
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
            const deptName = (dept.name || '').toString();
            const normalizedName = deptName.toLowerCase();

            // Find matching icon from default departments or use default
            const defaultDept = defaultDepartments.find(
              d => d.rawName?.toLowerCase() === normalizedName
            );

            return {
              icon: defaultDept?.icon || Stethoscope,
              name: deptName,
              description: dept.description || `Specialized ${deptName} services`,
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
            {t('departments.subtitle')}
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
                        {dept.doctors} {t('departments.doctorCount')}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {dept.description}
                    </p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">{t('departments.servicesLabel')}</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {dept.services.map((service, idx) => (
                          <li key={idx}>• {t(service)}</li>
                        ))}
                      </ul>
                    </div>
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link to="/doctors">{t('departments.button.viewDoctors')}</Link>
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
