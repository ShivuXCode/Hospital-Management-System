import { ReactNode } from 'react';
import { DoctorTopNav } from './DoctorTopNav';

interface DoctorLayoutProps {
  children: ReactNode;
}

const DoctorLayout = ({ children }: DoctorLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DoctorTopNav />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default DoctorLayout;
