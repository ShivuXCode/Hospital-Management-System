import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', ta: 'முகப்பு' },
  'nav.about': { en: 'About Us', ta: 'எங்களை பற்றி' },
  'nav.departments': { en: 'Departments', ta: 'துறைகள்' },
  'nav.doctors': { en: 'Doctors', ta: 'மருத்துவர்கள்' },
  'nav.services': { en: 'Services', ta: 'சேவைகள்' },
  'nav.contact': { en: 'Contact', ta: 'தொடர்பு' },
  'nav.login': { en: 'Login', ta: 'உள்நுழை' },
  'nav.dashboard': { en: 'Dashboard', ta: 'கட்டுப்பாட்டு பலகை' },

  // Home Page
  'hero.title': { en: 'Excellence in Healthcare', ta: 'சிறந்த மருத்துவ சேவை' },
  'hero.subtitle': { en: 'Providing compassionate, quality healthcare for you and your family', ta: 'உங்களுக்கும் உங்கள் குடும்பத்திற்கும் கருணையான, தரமான மருத்துவ சேவை வழங்குகிறோம்' },
  'hero.bookAppointment': { en: 'Book Appointment', ta: 'சந்திப்பு பதிவு செய்' },
  'hero.emergency': { en: 'Emergency', ta: 'அவசரம்' },
  'hero.viewDepartments': { en: 'View Departments', ta: 'துறைகளை பார்க்க' },

  // About Section
  'about.title': { en: 'About Our Hospital', ta: 'எங்கள் மருத்துவமனை பற்றி' },
  'about.description': { en: 'Dedicated to providing exceptional healthcare services with state-of-the-art facilities and experienced medical professionals.', ta: 'நவீன வசதிகள் மற்றும் அனுபவமிக்க மருத்துவ நிபுணர்களுடன் சிறந்த மருத்துவ சேவைகளை வழங்குவதில் அர்ப்பணிப்பு.' },
  'about.learnMore': { en: 'Learn More', ta: 'மேலும் அறிய' },

  // Services
  'services.title': { en: 'Our Services', ta: 'எங்கள் சேவைகள்' },
  'services.emergency': { en: '24/7 Emergency Care', ta: '24/7 அவசர சேவை' },
  'services.emergencyDesc': { en: 'Round-the-clock emergency medical services', ta: 'நாள் முழுவதும் அவசர மருத்துவ சேவைகள்' },
  'services.specialist': { en: 'Specialist Consultations', ta: 'சிறப்பு ஆலோசனை' },
  'services.specialistDesc': { en: 'Expert doctors across multiple specialties', ta: 'பல சிறப்புகளில் நிபுணர் மருத்துவர்கள்' },
  'services.diagnostic': { en: 'Advanced Diagnostics', ta: 'மேம்பட்ட கண்டறிதல்' },
  'services.diagnosticDesc': { en: 'State-of-the-art diagnostic facilities', ta: 'நவீன கண்டறிதல் வசதிகள்' },
  'services.pharmacy': { en: 'Pharmacy Services', ta: 'மருந்தக சேவைகள்' },
  'services.pharmacyDesc': { en: 'In-house pharmacy with quality medicines', ta: 'தரமான மருந்துகளுடன் உள் மருந்தகம்' },

  // Departments
  'departments.title': { en: 'Our Departments', ta: 'எங்கள் துறைகள்' },
  'departments.cardiology': { en: 'Cardiology', ta: 'இருதய மருத்துவம்' },
  'departments.cardiologyDesc': { en: 'Heart and cardiovascular care', ta: 'இதய மற்றும் இதய நாள மருத்துவம்' },
  'departments.orthopedics': { en: 'Orthopedics', ta: 'எலும்பியல்' },
  'departments.orthopedicsDesc': { en: 'Bone and joint specialists', ta: 'எலும்பு மற்றும் மூட்டு நிபுணர்கள்' },
  'departments.pediatrics': { en: 'Pediatrics', ta: 'குழந்தை மருத்துவம்' },
  'departments.pediatricsDesc': { en: 'Specialized care for children', ta: 'குழந்தைகளுக்கான சிறப்பு பராமரிப்பு' },
  'departments.neurology': { en: 'Neurology', ta: 'நரம்பியல்' },
  'departments.neurologyDesc': { en: 'Brain and nervous system care', ta: 'மூளை மற்றும் நரம்பு மண்டல மருத்துவம்' },

  // Doctors
  'doctors.title': { en: 'Our Doctors', ta: 'எங்கள் மருத்துவர்கள்' },
  'doctors.search': { en: 'Search doctors...', ta: 'மருத்துவர்களை தேடு...' },
  'doctors.viewProfile': { en: 'View Profile', ta: 'சுயவிவரம் பார்க்க' },
  'doctors.bookAppointment': { en: 'Book Appointment', ta: 'சந்திப்பு பதிவு செய்' },
  'doctors.experience': { en: 'years experience', ta: 'வருட அனுபவம்' },

  // Appointment
  'appointment.title': { en: 'Book an Appointment', ta: 'சந்திப்பு பதிவு செய்யுங்கள்' },
  'appointment.name': { en: 'Full Name', ta: 'முழு பெயர்' },
  'appointment.email': { en: 'Email', ta: 'மின்னஞ்சல்' },
  'appointment.phone': { en: 'Phone Number', ta: 'தொலைபேசி எண்' },
  'appointment.department': { en: 'Select Department', ta: 'துறையை தேர்வு செய்' },
  'appointment.doctor': { en: 'Select Doctor', ta: 'மருத்துவரை தேர்வு செய்' },
  'appointment.date': { en: 'Appointment Date', ta: 'சந்திப்பு தேதி' },
  'appointment.time': { en: 'Appointment Time', ta: 'சந்திப்பு நேரம்' },
  'appointment.message': { en: 'Message (Optional)', ta: 'செய்தி (விருப்பமானது)' },
  'appointment.submit': { en: 'Book Appointment', ta: 'சந்திப்பை பதிவு செய்' },
  'appointment.success': { en: 'Appointment booked successfully!', ta: 'சந்திப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது!' },

  // Contact
  'contact.title': { en: 'Contact Us', ta: 'எங்களை தொடர்பு கொள்ளுங்கள்' },
  'contact.address': { en: 'Address', ta: 'முகவரி' },
  'contact.phone': { en: 'Phone', ta: 'தொலைபேசி' },
  'contact.emergency': { en: 'Emergency', ta: 'அவசரம்' },
  'contact.email': { en: 'Email', ta: 'மின்னஞ்சல்' },
  'contact.hours': { en: 'Working Hours', ta: 'பணி நேரம்' },
  'contact.hoursValue': { en: '24/7 Emergency Services Available', ta: '24/7 அவசர சேவைகள் கிடைக்கும்' },
  'contact.sendMessage': { en: 'Send Message', ta: 'செய்தி அனுப்பு' },
  'contact.yourName': { en: 'Your Name', ta: 'உங்கள் பெயர்' },
  'contact.yourEmail': { en: 'Your Email', ta: 'உங்கள் மின்னஞ்சல்' },
  'contact.yourMessage': { en: 'Your Message', ta: 'உங்கள் செய்தி' },

  // Login
  'login.title': { en: 'Login to Dashboard', ta: 'கட்டுப்பாட்டு பலகையில் உள்நுழை' },
  'login.email': { en: 'Email Address', ta: 'மின்னஞ்சல் முகவரி' },
  'login.password': { en: 'Password', ta: 'கடவுச்சொல்' },
  'login.role': { en: 'Select Your Role', ta: 'உங்கள் பங்கை தேர்வு செய்' },
  'login.admin': { en: 'Admin', ta: 'நிர்வாகி' },
  'login.doctor': { en: 'Doctor', ta: 'மருத்துவர்' },
  'login.nurse': { en: 'Nurse', ta: 'செவிலியர்' },
  'login.patient': { en: 'Patient', ta: 'நோயாளி' },
  'login.submit': { en: 'Sign In', ta: 'உள்நுழை' },
  'login.forgotPassword': { en: 'Forgot Password?', ta: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' },

  // Dashboard
  'dashboard.overview': { en: 'Dashboard Overview', ta: 'பலகை கண்ணோட்டம்' },
  'dashboard.patients': { en: 'Total Patients', ta: 'மொத்த நோயாளிகள்' },
  'dashboard.doctors': { en: 'Total Doctors', ta: 'மொத்த மருத்துவர்கள்' },
  'dashboard.appointments': { en: 'Appointments Today', ta: 'இன்றைய சந்திப்புகள்' },
  'dashboard.billing': { en: 'Billing Overview', ta: 'கட்டண கண்ணோட்டம்' },
  'dashboard.logout': { en: 'Logout', ta: 'வெளியேறு' },

  // Common
  'common.readMore': { en: 'Read More', ta: 'மேலும் வாசிக்க' },
  'common.close': { en: 'Close', ta: 'மூடு' },
  'common.save': { en: 'Save', ta: 'சேமி' },
  'common.cancel': { en: 'Cancel', ta: 'ரத்து' },
  'common.submit': { en: 'Submit', ta: 'சமர்ப்பி' },
  'common.loading': { en: 'Loading...', ta: 'ஏற்றுகிறது...' },

  // Patient Profile
  'profile.title': { en: 'Patient Profile', ta: 'நோயாளி சுயவிவரம்' },
  'profile.welcome': { en: 'Welcome back', ta: 'மீண்டும் வருக' },
  'profile.editProfile': { en: 'Edit Profile', ta: 'சுயவிவரத்தை திருத்து' },
  'profile.personalDetails': { en: 'Personal Details', ta: 'தனிப்பட்ட விவரங்கள்' },
  'profile.medicalDetails': { en: 'Medical Details', ta: 'மருத்துவ விவரங்கள்' },
  'profile.appointmentHistory': { en: 'Appointment History', ta: 'சந்திப்பு வரலாறு' },
  'profile.prescriptionHistory': { en: 'Prescription History', ta: 'மருந்து வரலாறு' },
  'profile.fullName': { en: 'Full Name', ta: 'முழு பெயர்' },
  'profile.age': { en: 'Age', ta: 'வயது' },
  'profile.gender': { en: 'Gender', ta: 'பாலினம்' },
  'profile.email': { en: 'Email', ta: 'மின்னஞ்சல்' },
  'profile.phone': { en: 'Phone', ta: 'தொலைபேசி' },
  'profile.address': { en: 'Address', ta: 'முகவரி' },
  'profile.bloodGroup': { en: 'Blood Group', ta: 'இரத்த வகை' },
  'profile.emergencyContact': { en: 'Emergency Contact', ta: 'அவசர தொடர்பு' },
  'profile.allergies': { en: 'Allergies', ta: 'ஒவ்வாமை' },
  'profile.ongoingTreatments': { en: 'Ongoing Treatments', ta: 'தற்போதைய சிகிச்சைகள்' },
  'profile.lastAppointment': { en: 'Last Appointment', ta: 'கடைசி சந்திப்பு' },
  'profile.assignedDoctor': { en: 'Assigned Doctor', ta: 'நியமிக்கப்பட்ட மருத்துவர்' },
  'profile.viewDetails': { en: 'View Details', ta: 'விவரங்களை பார்க்க' },
  'profile.doctorName': { en: 'Doctor', ta: 'மருத்துவர்' },
  'profile.department': { en: 'Department', ta: 'துறை' },
  'profile.date': { en: 'Date', ta: 'தேதி' },
  'profile.time': { en: 'Time', ta: 'நேரம்' },
  'profile.status': { en: 'Status', ta: 'நிலை' },
  'profile.completed': { en: 'Completed', ta: 'முடிந்தது' },
  'profile.upcoming': { en: 'Upcoming', ta: 'வரவிருக்கும்' },
  'profile.cancelled': { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது' },
  'profile.medicine': { en: 'Medicine', ta: 'மருந்து' },
  'profile.dosage': { en: 'Dosage', ta: 'அளவு' },
  'profile.duration': { en: 'Duration', ta: 'காலம்' },
  'profile.bloodPressure': { en: 'Blood Pressure', ta: 'இரத்த அழுத்தம்' },
  'profile.sugarLevel': { en: 'Sugar Level', ta: 'சர்க்கரை அளவு' },
  'profile.weight': { en: 'Weight', ta: 'எடை' },
  'profile.height': { en: 'Height', ta: 'உயரம்' },
  'profile.bmi': { en: 'BMI', ta: 'பிஎம்ஐ' },
  'profile.healthTracker': { en: 'Health Tracker', ta: 'சுகாதார கண்காணிப்பு' },
  'profile.noData': { en: 'No data available', ta: 'தரவு இல்லை' },
  'profile.male': { en: 'Male', ta: 'ஆண்' },
  'profile.female': { en: 'Female', ta: 'பெண்' },
  'profile.other': { en: 'Other', ta: 'மற்றவை' },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
