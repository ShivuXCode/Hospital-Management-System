// Department configurations from Departments.tsx
export const hospitalDepartments = [
  {
    name: 'Cardiology',
    specialization: 'Heart and cardiovascular care',
    icon: 'Heart',
  },
  {
    name: 'Orthopedics',
    specialization: 'Bone and joint care',
    icon: 'Bone',
  },
  {
    name: 'Pediatrics',
    specialization: 'Child healthcare',
    icon: 'Baby',
  },
  {
    name: 'Neurology',
    specialization: 'Brain and nervous system',
    icon: 'Brain',
  },
  {
    name: 'Ophthalmology',
    specialization: 'Eye care and vision',
    icon: 'Eye',
  },
  {
    name: 'Oncology',
    specialization: 'Cancer treatment',
    icon: 'Syringe',
  },
  {
    name: 'General Medicine',
    specialization: 'Primary care',
    icon: 'Stethoscope',
  },
  {
    name: 'Emergency Medicine',
    specialization: '24/7 emergency care',
    icon: 'Activity',
  },
  {
    name: 'Gastroenterology',
    specialization: 'Digestive system',
    icon: 'Pill',
  },
  {
    name: 'Obstetrics & Gynecology',
    specialization: "Women's health",
    icon: 'Users',
  },
  {
    name: 'Radiology',
    specialization: 'Medical imaging',
    icon: 'Scan',
  },
  {
    name: 'General Surgery',
    specialization: 'Surgical procedures',
    icon: 'Scissors',
  },
];

// Doctor name templates for each department
const doctorNames = {
  'Cardiology': { firstName: 'Priya', lastName: 'Sharma', gender: 'female' },
  'Orthopedics': { firstName: 'Ananya', lastName: 'Reddy', gender: 'female' },
  'Pediatrics': { firstName: 'Vikram', lastName: 'Singh', gender: 'male' },
  'Neurology': { firstName: 'Rajesh', lastName: 'Kumar', gender: 'male' },
  'Ophthalmology': { firstName: 'Sanjay', lastName: 'Nair', gender: 'male' },
  'Oncology': { firstName: 'Deepa', lastName: 'Menon', gender: 'female' },
  'General Medicine': { firstName: 'Meera', lastName: 'Patel', gender: 'female' },
  'Emergency Medicine': { firstName: 'Arjun', lastName: 'Rao', gender: 'male' },
  'Gastroenterology': { firstName: 'Suresh', lastName: 'Iyer', gender: 'male' },
  'Obstetrics & Gynecology': { firstName: 'Kavitha', lastName: 'Desai', gender: 'female' },
  'Radiology': { firstName: 'Amit', lastName: 'Verma', gender: 'male' },
  'General Surgery': { firstName: 'Lakshmi', lastName: 'Krishnan', gender: 'female' },
};

// Qualification templates
const qualificationTemplates: Record<string, string> = {
  'Cardiology': 'MD, DM (Cardiology)',
  'Orthopedics': 'MS (Ortho), MCh (Ortho)',
  'Pediatrics': 'MD (Pediatrics), DCH',
  'Neurology': 'MD, DM (Neurology)',
  'Ophthalmology': 'MS (Ophthalmology), FRCS',
  'Oncology': 'MD (Oncology), DM',
  'General Medicine': 'MBBS, MD (General Medicine)',
  'Emergency Medicine': 'MBBS, MD (Emergency Medicine)',
  'Gastroenterology': 'MD, DM (Gastroenterology)',
  'Obstetrics & Gynecology': 'MD (OBG), MRCOG',
  'Radiology': 'MD (Radiology), FRCR',
  'General Surgery': 'MS (General Surgery), FICS',
};

// Experience range
const experienceTemplates: Record<string, string> = {
  'Cardiology': '8 years',
  'Orthopedics': '10 years',
  'Pediatrics': '15 years',
  'Neurology': '12 years',
  'Ophthalmology': '14 years',
  'Oncology': '9 years',
  'General Medicine': '7 years',
  'Emergency Medicine': '11 years',
  'Gastroenterology': '8 years',
  'Obstetrics & Gynecology': '13 years',
  'Radiology': '6 years',
  'General Surgery': '10 years',
};

// Bio templates
const bioTemplates: Record<string, string> = {
  'Cardiology': 'A highly experienced cardiologist specializing in interventional cardiology and heart failure management. Has performed over 500 successful cardiac procedures.',
  'Orthopedics': 'Specializes in sports medicine, joint replacement surgeries, and trauma management. Successfully treated athletes and performed complex orthopedic procedures.',
  'Pediatrics': 'A compassionate pediatrician with extensive experience in child healthcare, vaccinations, and developmental disorders. Parents trust for gentle approach with children.',
  'Neurology': 'A renowned neurologist with expertise in stroke management, epilepsy, and movement disorders. Has published numerous research papers in international journals.',
  'Ophthalmology': 'An accomplished ophthalmologist specializing in cataract surgery, corneal transplants, and retinal disorders. Has restored vision for thousands of patients.',
  'Oncology': 'Expert oncologist with specialization in chemotherapy, radiation therapy, and surgical oncology. Provides comprehensive cancer care with a patient-centered approach.',
  'General Medicine': 'Provides comprehensive primary care services including diagnosis and treatment of common medical conditions, preventive care, and chronic disease management.',
  'Emergency Medicine': 'Experienced emergency medicine specialist providing 24/7 critical care, trauma management, and emergency surgical interventions.',
  'Gastroenterology': 'Specialist in digestive system disorders with expertise in endoscopy, colonoscopy, liver care, and treatment of inflammatory bowel diseases.',
  'Obstetrics & Gynecology': 'Highly regarded gynecologist specializing in high-risk pregnancies, minimally invasive gynecological surgeries, and women\'s reproductive health.',
  'Radiology': 'Expert radiologist with proficiency in advanced medical imaging including MRI, CT scans, and interventional radiology procedures.',
  'General Surgery': 'Skilled general surgeon with expertise in laparoscopic surgery, hernia repair, and complex abdominal surgeries.',
};

// Image URLs (using Unsplash with medical professional images)
const imageUrls = {
  'Cardiology': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  'Orthopedics': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
  'Pediatrics': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
  'Neurology': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
  'Ophthalmology': 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=400&h=400&fit=crop',
  'Oncology': 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop',
  'General Medicine': 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop',
  'Emergency Medicine': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
  'Gastroenterology': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
  'Obstetrics & Gynecology': 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop',
  'Radiology': 'https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?w=400&h=400&fit=crop',
  'General Surgery': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop',
};

// Generate doctor for each department
export const generateDepartmentDoctors = () => {
  return hospitalDepartments.map((dept, index) => {
    const nameInfo = doctorNames[dept.name as keyof typeof doctorNames];
    const fullName = `Dr. ${nameInfo.firstName} ${nameInfo.lastName}`;
    
    return {
      id: `dept-${index + 1}`,
      name: fullName,
      department: dept.name,
      specialization: dept.specialization,
      qualification: qualificationTemplates[dept.name] || 'MD, MS',
      experience: experienceTemplates[dept.name] || '5+ years',
      rating: (4.6 + Math.random() * 0.4).toFixed(1), // Random rating between 4.6 and 5.0
      image: imageUrls[dept.name as keyof typeof imageUrls] || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      available: true,
      email: `${nameInfo.firstName.toLowerCase()}.${nameInfo.lastName.toLowerCase()}@mediflow.com`,
      phone: `+91 ${98765 + index}${43210 + index}`,
      bio: bioTemplates[dept.name] || 'Experienced medical professional dedicated to providing quality healthcare.',
      schedule: index % 2 === 0 ? 'Mon-Fri: 9:00 AM - 5:00 PM' : 'Mon-Sat: 10:00 AM - 6:00 PM',
      consultationFee: `₹${800 + index * 100}`,
      gender: nameInfo.gender,
    };
  });
};

// Get single doctor by department name
export const getDoctorByDepartment = (departmentName: string) => {
  const doctors = generateDepartmentDoctors();
  return doctors.find(doc => doc.department === departmentName);
};

// Get all unique departments
export const getAllDepartments = () => {
  return hospitalDepartments.map(dept => dept.name);
};
