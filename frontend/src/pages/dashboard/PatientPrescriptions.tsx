import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Pill, Clock, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface Prescription {
  id: string;
  doctorName?: string;
  dateIssued?: string | null;
  validUntil?: string | null;
  medicines: Array<{
    name: string;
    dosage?: string;
    duration?: string;
    instructions?: string;
  }>;
  diagnosis?: string;
  notes?: string;
}

const PatientPrescriptions = () => {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) {
        throw new Error('Unable to identify patient. Please sign in again.');
      }

      const response = await apiService.getPatientPrescriptions(user.id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to load prescriptions');
      }

      const normalized: Prescription[] = (response.prescriptions || []).map((pres: any) => ({
        id: pres.id || pres._id,
        doctorName: pres.doctorName,
        dateIssued: pres.dateIssued || pres.createdAt || null,
        validUntil: pres.validUntil || null,
        medicines: Array.isArray(pres.medicines) ? pres.medicines : [],
        diagnosis: pres.diagnosis,
        notes: pres.notes,
      }));

      setPrescriptions(normalized);
    } catch (error: any) {
      console.error('Failed to load prescriptions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load prescriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (validUntil?: string | null) => {
    if (!validUntil) return false;
    const expiry = new Date(validUntil);
    return !Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now();
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((pres) => (showExpired ? true : !isExpired(pres.validUntil)));
  }, [prescriptions, showExpired]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Prescriptions</h1>
          <p className="text-muted-foreground">View prescriptions issued by your doctors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowExpired((prev) => !prev)}>
            {showExpired ? 'Hide Expired' : 'Show Expired'}
          </Button>
          <Button variant="outline" onClick={loadPrescriptions} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredPrescriptions.length > 0 ? (
        <div className="grid gap-4">
          {filteredPrescriptions.map((prescription) => (
            <Card
              key={prescription.id}
              className={`shadow-soft ${
                isExpired(prescription.validUntil) ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Prescription
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Dr. {prescription.doctorName}</span>
                    </div>
                  </div>
                  {isExpired(prescription.validUntil) ? (
                    <Badge variant="secondary">Expired</Badge>
                  ) : (
                    <Badge className="bg-green-500">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Issued:{' '}
                      {prescription.dateIssued
                        ? new Date(prescription.dateIssued).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      Valid Until:{' '}
                      {prescription.validUntil
                        ? new Date(prescription.validUntil).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>

                {prescription.diagnosis && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Diagnosis:</p>
                    <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Medications
                  </h4>
                  <div className="space-y-2">
                    {prescription.medicines.map((med, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg bg-background"
                      >
                        <p className="font-medium text-sm">{med.name}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Dosage:</span> {med.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {med.duration || '-'}
                          </div>
                          <div>
                            <span className="font-medium">Instructions:</span> {med.instructions || '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.notes && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium mb-1">Doctor's Notes:</p>
                    <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Prescriptions Found</h3>
            <p className="text-muted-foreground">
              {showExpired
                ? 'You have no prescriptions yet.'
                : 'You have no active prescriptions.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientPrescriptions;
