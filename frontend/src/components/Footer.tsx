import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();
  // Read user role from localStorage to conditionally render quick links
  let userRoleLower = '';
  try {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    userRoleLower = (user?.role || '').toLowerCase();
  } catch (_) {
    userRoleLower = '';
  }

  return (
    <footer className="bg-muted mt-20 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">MediCare Hospital</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('about.description')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              {userRoleLower !== 'doctor' && userRoleLower !== 'nurse' && (
                <>
                  <li>
                    <Link to="/doctors" className="text-muted-foreground hover:text-primary transition-colors">
                      {t('nav.doctors')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/departments" className="text-muted-foreground hover:text-primary transition-colors">
                      {t('nav.departments')}
                    </Link>
                  </li>
                  {userRoleLower !== 'admin' && (
                    <li>
                      <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                        {t('nav.contact')}
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">{t('nav.services')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">{t('services.emergency')}</li>
              <li className="text-muted-foreground">{t('services.specialist')}</li>
              <li className="text-muted-foreground">{t('services.diagnostic')}</li>
              <li className="text-muted-foreground">{t('services.pharmacy')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('contact.title')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">123 Healthcare Street, Medical City, 600001</span>
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">+91 44 1234 5678</span>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">info@medicare.hospital</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MediCare Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
