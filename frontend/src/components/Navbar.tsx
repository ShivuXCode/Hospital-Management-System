import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, Menu, X, User, LogOut } from 'lucide-react';
import BookAppointmentButton from '@/components/BookAppointmentButton';
import { useToast } from '@/hooks/use-toast';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location]); // Re-check on location change

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account',
    });
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Admin':
        return '/dashboard/admin';
      case 'Doctor':
        return '/dashboard/doctor';
      case 'Nurse':
        return '/dashboard/nurse';
      case 'Patient':
        return '/dashboard/patient';
      default:
        return '/';
    }
  };

  const userRoleLower = (user?.role || '').toLowerCase();

  // Role-based navigation items
  const navLinks = (() => {
    if (userRoleLower === 'doctor' || userRoleLower === 'nurse') {
      return [
        { path: '/', label: t('nav.home') },
        { path: '/about', label: t('nav.about') },
        { path: '/services', label: t('nav.services') },
      ];
    }
    if (userRoleLower === 'admin') {
      return [
        { path: '/', label: t('nav.home') },
        { path: '/about', label: t('nav.about') },
        { path: '/departments', label: t('nav.departments') },
        { path: '/doctors', label: t('nav.doctors') },
        { path: '/services', label: t('nav.services') },
      ];
    }
    // Default (Patient or guest): full menu
    return [
      { path: '/', label: t('nav.home') },
      { path: '/about', label: t('nav.about') },
      { path: '/departments', label: t('nav.departments') },
      { path: '/doctors', label: t('nav.doctors') },
      { path: '/services', label: t('nav.services') },
      { path: '/contact', label: t('nav.contact') },
    ];
  })();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-primary">MediCare</span>
            <span className="hidden sm:inline">Hospital</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
            )}
            {/* Show Book Appointment only for Patients (and optionally guests) */}
            {(!isLoggedIn || userRoleLower === 'patient') && (
              <BookAppointmentButton className="ml-2" size="sm">{t('hero.bookAppointment')}</BookAppointmentButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 px-4 pt-2 border-t">
              {isLoggedIn && user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(getDashboardRoute());
                      setIsOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard ({user.name})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    {t('nav.login')}
                  </Link>
                </Button>
              )}
              {(!isLoggedIn || userRoleLower === 'patient') && (
                <div className="w-full">
                  <BookAppointmentButton className="w-full" onClick={() => setIsOpen(false)}>
                    {t('hero.bookAppointment')}
                  </BookAppointmentButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
