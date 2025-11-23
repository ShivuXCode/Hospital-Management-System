import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Props {
  doctor?: string;
  className?: string;
  size?: 'sm' | 'lg';
  variant?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const BookAppointmentButton = ({ doctor, className, size, children, onClick }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = () => {
    // Fast check: if not marked as authenticated locally, immediately prompt to login
    const locallyAuth = apiService.isAuthenticated();
    if (!locallyAuth) {
      toast({
        title: 'Please login to continue',
        description: 'You need to be logged in to book an appointment.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    (async () => {
      const valid = await apiService.validateAuth();
      if (!valid) {
        toast({
          title: 'Please login to continue',
          description: 'You need to be logged in to book an appointment.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      navigate('/appointment', { state: { doctor } });
    })();
  };

  return (
    <Button className={className} size={(size || 'sm') as any} onClick={() => { handleClick(); onClick && onClick(); }}>
      {children || 'Book Appointment'}
    </Button>
  );
};

export default BookAppointmentButton;
