import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Heart, Droplet, TrendingUp, Save, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';

interface HealthRecord {
  height: string;
  weight: string;
  bmi: string;
  bloodPressure: string;
  bloodSugar: string;
  heartRate: string;
  lastUpdated: string;
}

const defaultHealthRecord: HealthRecord = {
  height: '',
  weight: '',
  bmi: '',
  bloodPressure: '',
  bloodSugar: '',
  heartRate: '',
  lastUpdated: new Date().toISOString(),
};

const mapTrackerToState = (tracker?: {
  height?: number | null;
  weight?: number | null;
  bloodPressure?: string | null;
  sugarLevel?: number | null;
  bmi?: number | null;
  lastUpdated?: string | null;
}): HealthRecord => {
  const lastUpdated = tracker?.lastUpdated
    ? new Date(tracker.lastUpdated).toISOString()
    : new Date().toISOString();

  return {
    height: tracker?.height != null ? tracker.height.toString() : '',
    weight: tracker?.weight != null ? tracker.weight.toString() : '',
    bmi: tracker?.bmi != null ? tracker.bmi.toFixed(1) : '',
    bloodPressure: tracker?.bloodPressure ?? '',
    bloodSugar: tracker?.sugarLevel != null ? tracker.sugarLevel.toString() : '',
    heartRate: '',
    lastUpdated,
  };
};

const mergeRecords = (local: HealthRecord | null, remote: HealthRecord) => ({
  ...defaultHealthRecord,
  ...local,
  ...remote,
  heartRate: local?.heartRate ?? remote.heartRate,
});

const PatientHealthRecords = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthRecord>(defaultHealthRecord);

  const loadHealthRecords = useCallback(async () => {
    try {
      const user = apiService.getUser();
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      setLoading(true);

      const cached = storageService.getHealthRecords(user.id);
      if (cached) {
        setHealthData(cached);
      } else {
        setHealthData(defaultHealthRecord);
      }

      const response = await apiService.getPatientHealthTracker(user.id);
      if (response.success && response.healthTracker) {
        const mapped = mapTrackerToState(response.healthTracker);
        const merged = mergeRecords(cached, mapped);
        setHealthData(merged);
        storageService.saveHealthRecords(user.id, merged);
      }
    } catch (error) {
      console.error('Failed to load health records:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealthRecords();
  }, [loadHealthRecords]);

  const calculateBMI = (height: string, weight: string): string => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const bmi = w / (heightInMeters * heightInMeters);
      return bmi.toFixed(2);
    }
    return '';
  };

  const handleInputChange = (field: keyof HealthRecord, value: string) => {
    const updated = { ...healthData, [field]: value };
    if (field === 'height' || field === 'weight') {
      updated.bmi = calculateBMI(updated.height, updated.weight);
    }
    setHealthData(updated);
  };

  const handleSave = async () => {
    try {
      const user = apiService.getUser();
      if (!user) {
        toast({
          title: t('patientHealth.toast.errorTitle'),
          description: t('patientHealth.toast.errorDesc'),
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        height: healthData.height ? parseFloat(healthData.height) : undefined,
        weight: healthData.weight ? parseFloat(healthData.weight) : undefined,
        bloodPressure: healthData.bloodPressure || undefined,
        sugarLevel: healthData.bloodSugar ? parseFloat(healthData.bloodSugar) : undefined,
      };

      const response = await apiService.updatePatientHealthTracker(user.id, payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update health tracker');
      }

      const mapped = mapTrackerToState(response.healthTracker || undefined);
      const merged = mergeRecords(
        {
          ...healthData,
          lastUpdated: new Date().toISOString(),
        },
        mapped
      );

      storageService.saveHealthRecords(user.id, merged);
      setHealthData(merged);

      toast({
        title: t('patientHealth.toast.updatedTitle'),
        description: t('patientHealth.toast.updatedDesc'),
      });
      setEditing(false);

      window.dispatchEvent(new Event('patient-health-updated'));
    } catch (error) {
      toast({
        title: t('patientHealth.toast.errorTitle'),
        description: t('patientHealth.toast.errorDesc'),
        variant: 'destructive',
      });
    }
  };

  const healthStats = [
    {
      icon: TrendingUp,
      label: t('patientHealth.cards.height'),
      value: healthData.height ? `${healthData.height} cm` : t('patientHealth.notSet'),
      field: 'height' as keyof HealthRecord,
    },
    {
      icon: Activity,
      label: t('patientHealth.cards.weight'),
      value: healthData.weight ? `${healthData.weight} kg` : t('patientHealth.notSet'),
      field: 'weight' as keyof HealthRecord,
    },
    {
      icon: Heart,
      label: t('patientHealth.cards.bloodPressure'),
      value: healthData.bloodPressure || t('patientHealth.notSet'),
      field: 'bloodPressure' as keyof HealthRecord,
      placeholder: t('patientHealth.placeholder.bloodPressure'),
    },
    {
      icon: Droplet,
      label: t('patientHealth.cards.bloodSugar'),
      value: healthData.bloodSugar ? `${healthData.bloodSugar} mg/dL` : t('patientHealth.notSet'),
      field: 'bloodSugar' as keyof HealthRecord,
    },
    {
      icon: Heart,
      label: t('patientHealth.cards.heartRate'),
      value: healthData.heartRate ? `${healthData.heartRate} bpm` : t('patientHealth.notSet'),
      field: 'heartRate' as keyof HealthRecord,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('patientHealth.title')}</h1>
          <p className="text-muted-foreground">{t('patientHealth.subtitle')}</p>
        </div>
        <Button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="gradient-primary"
        >
          {editing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('patientHealth.button.save')}
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              {t('patientHealth.button.edit')}
            </>
          )}
        </Button>
      </div>

      {healthData.bmi && (
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('patientHealth.bmiLabel')}</p>
                  <p className="text-2xl font-bold">{healthData.bmi}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div>
                    <Input
                      type="text"
                      value={healthData[stat.field]}
                      onChange={(e) => handleInputChange(stat.field, e.target.value)}
                      placeholder={(() => {
                        if (stat.placeholder) return stat.placeholder;
                        if (stat.field === 'height') return t('patientHealth.placeholder.height');
                        if (stat.field === 'weight') return t('patientHealth.placeholder.weight');
                        if (stat.field === 'bloodSugar') return t('patientHealth.placeholder.bloodSugar');
                        if (stat.field === 'heartRate') return t('patientHealth.placeholder.heartRate');
                        return '';
                      })()}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {healthData.lastUpdated && (
        <p className="text-sm text-muted-foreground text-center">
          {t('patientHealth.lastUpdated')}{' '}
          {new Date(healthData.lastUpdated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
};

export default PatientHealthRecords;
