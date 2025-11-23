import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { Search, Award, Calendar, Star, Filter, Loader2, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateDepartmentDoctors, getAllDepartments } from '@/utils/departmentDoctors';
import { maleImages, femaleImages, neutralImage } from '@/lib/doctorImages';

const pickFromPool = (pool: string[], seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
};

const getDoctorImage = (doctor: any) => {
  if (doctor?.image && !doctor.image.includes('photo-1559839734')) return doctor.image;
  const gender = (doctor?.gender || '').toString().toLowerCase();
  const seed = (doctor?.name || doctor?.email || doctor?.id || Math.random().toString()).toString();

  if (gender === 'male') return pickFromPool(maleImages, seed);
  if (gender === 'female') return pickFromPool(femaleImages, seed);
  return neutralImage;
};

const Doctors = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = ['all', ...new Set(doctors.map((d) => d.department))];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.qualification?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === 'all' || doctor.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const getDoctorsByDepartment = () => {
    const grouped = new Map();
    
    filteredDoctors.forEach((doctor) => {
      if (!grouped.has(doctor.department)) {
        grouped.set(doctor.department, doctor);
      }
    });

    return Array.from(grouped.values());
  };

  const displayDoctors = getDoctorsByDepartment();

  // Assign a unique image to every displayed doctor.
  // Strategy: group by gender and take the first N images from the matching pool.
  // This guarantees no reuse as long as the pool size >= number of doctors of that gender.
  // If there are more doctors than images, we fall back to the neutral image for the extras
  // to avoid re-using the same image.
  const imageAssignment = useMemo(() => {
    const map: Record<string, string> = {};

    const maleDocs = displayDoctors.filter((d) => (d.gender || '').toString().toLowerCase() === 'male');
    const femaleDocs = displayDoctors.filter((d) => (d.gender || '').toString().toLowerCase() === 'female');

    // Assign unique male images
    maleDocs.forEach((doc, idx) => {
      const key = doc.id ?? doc.name ?? String(idx);
      if (idx < maleImages.length) map[key] = maleImages[idx];
      else map[key] = neutralImage; // pool exhausted
    });

    // Assign unique female images
    femaleDocs.forEach((doc, idx) => {
      const key = doc.id ?? doc.name ?? `f-${idx}`;
      if (idx < femaleImages.length) map[key] = femaleImages[idx];
      else map[key] = neutralImage; // pool exhausted
    });

    // Any remaining doctors (unspecified gender) -> fallback using getDoctorImage
    displayDoctors.forEach((doc, idx) => {
      const key = doc.id ?? doc.name ?? `o-${idx}`;
      if (!map[key]) map[key] = getDoctorImage(doc);
    });

    return map;
  }, [displayDoctors]);

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  };

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        // Generate doctors based on department list
        const departmentDoctors = generateDepartmentDoctors();
        
        // Try to fetch from API first
        const res = await apiService.getDoctors();
        if (res && res.success && res.doctors && res.doctors.length > 0) {
          // Map backend doctors to departments
          const backendDoctorsByDept = new Map();
          res.doctors.forEach((doc: any) => {
            const dept = doc.specialization || doc.specialty || doc.department;
            if (dept && !backendDoctorsByDept.has(dept)) {
              backendDoctorsByDept.set(dept, {
                id: doc._id || doc.id,
                name: doc.name,
                department: dept,
                qualification: doc.qualification || 'MBBS, MD',
                experience: doc.experience || '5+ years',
                rating: doc.rating || '4.5',
                image: doc.photo || doc.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
                available: doc.availability !== 'Unavailable',
                email: doc.email || '',
                phone: doc.phone || '',
                bio: doc.bio || '',
                schedule: doc.availability || 'Mon-Fri: 9:00 AM - 5:00 PM',
                consultationFee: doc.consultationFee || '₹800',
              });
            }
          });

          // Merge: Use backend doctors where available, fill gaps with generated doctors
          const mergedDoctors = departmentDoctors.map((genDoc) => {
            const backendDoc = backendDoctorsByDept.get(genDoc.department);
            return backendDoc || genDoc;
          });
          
          setDoctors(mergedDoctors);
        } else {
          // No backend data, use generated doctors
          setDoctors(departmentDoctors);
        }
      } catch (err) {
        console.error('Failed to load doctors from API, using department-based doctors', err);
        // Fallback to generated doctors
        const departmentDoctors = generateDepartmentDoctors();
        setDoctors(departmentDoctors);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Expert Medical Team
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Meet our team of experienced and dedicated healthcare professionals across various specialties
          </p>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, or qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-[240px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.slice(1).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : displayDoctors.length > 0 ? (
            <>
              <div className="mb-8 text-center">
                <p className="text-muted-foreground">
                  Showing {displayDoctors.length} doctor{displayDoctors.length !== 1 ? 's' : ''} 
                  {selectedDepartment !== 'all' ? ` in ${selectedDepartment}` : ' across all departments'}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayDoctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    className="group hover:shadow-lg transition-all duration-300 border rounded-lg"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <img
                            src={getDoctorImage(doctor)}
                            alt={`${doctor.name} profile`}
                            onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.onerror = null; img.src = neutralImage; }}
                            className="h-20 w-20 rounded-full object-cover flex-shrink-0 shadow-sm"
                          />

                          <div className="text-center sm:text-left">
                            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                              {doctor.name}
                            </h3>
                            <p className="text-primary font-semibold text-base">{doctor.department}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                          <Award className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{doctor.qualification}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{doctor.experience}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span className="font-semibold text-foreground">{doctor.rating} Rating</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm" 
                          onClick={() => handleViewProfile(doctor.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No doctors available</h3>
              <p className="text-muted-foreground">
                {selectedDepartment !== 'all'
                  ? `No doctors available in ${selectedDepartment} department.`
                  : 'No doctors found matching your search.'}
              </p>
              {selectedDepartment !== 'all' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedDepartment('all')}
                >
                  View All Departments
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Doctors;
