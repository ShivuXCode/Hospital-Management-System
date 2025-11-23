import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

const NursePatientsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAppointments();
      if (res.success) setAppointments(res.appointments || []);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load patients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uniquePatients = useMemo(() => {
    const map = new Map<string, any>();
    for (const apt of appointments) {
      const key = apt.user?._id || `${apt.patientEmail || apt.email}`;
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          id: apt.user?._id || key,
          name: apt.user?.name || apt.patientName,
          email: apt.user?.email || apt.patientEmail || apt.email,
          phone: apt.user?.phone || apt.phone || '-',
          lastAppointment: apt.date,
        });
      } else {
        const curr = map.get(key);
        const prev = new Date(curr.lastAppointment || 0).getTime();
        const now = new Date(apt.date).getTime();
        if (now > prev) curr.lastAppointment = apt.date;
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Patients</h1>
          <p className="text-muted-foreground">All patients from your assigned doctors</p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Patient List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : uniquePatients.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No patients found for your assigned doctors.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Appointment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniquePatients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.lastAppointment ? new Date(p.lastAppointment).toLocaleDateString() : '-'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NursePatientsPage;
